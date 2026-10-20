import { EvaluationSessionData } from '../types/evaluation';
import {
  CloudEvaluationPayload,
  CloudSubmissionResponse,
  CloudSubmissionStatus
} from '../types/cloudSubmission';

/**
 * Verifica si las variables de entorno para el backend central de Supabase están configuradas.
 */
export const isCloudConfigured = (): boolean => {
  const url = import.meta.env.VITE_INGESTION_FUNCTION_URL || import.meta.env.VITE_SUPABASE_URL;
  if (!url || typeof url !== 'string') return false;
  // Comprobar que no contenga valores de ejemplo
  if (url.includes('your-project-ref') || url.includes('placeholder') || url.trim() === '') {
    return false;
  }
  return true;
};

/**
 * Obtiene la URL completa del endpoint de ingesta.
 */
export const getIngestionEndpoint = (): string => {
  if (import.meta.env.VITE_INGESTION_FUNCTION_URL) {
    return import.meta.env.VITE_INGESTION_FUNCTION_URL;
  }
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('your-project-ref')) {
    return `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/submit-evaluation`;
  }
  return '';
};

/**
 * Genera un token único de idempotencia para la transmisión.
 * Si el usuario pulsa "Reintentar", este mismo token se conserva para evitar duplicados en la base de datos.
 */
export const getOrCreateClientSubmissionId = (session: EvaluationSessionData): string => {
  if (session.clientSubmissionId && session.clientSubmissionId.trim().length >= 8) {
    return session.clientSubmissionId;
  }
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timePart = Date.now().toString(36);
  return `sub_${session.sessionId.replace(/[^a-zA-Z0-9]/g, '_')}_${timePart}_${randomPart}`;
};

/**
 * Construye el payload tipado y validado para la función de ingesta.
 */
export const buildCloudPayload = (session: EvaluationSessionData): CloudEvaluationPayload => {
  const clientSubmissionId = getOrCreateClientSubmissionId(session);
  const completedAt = session.completedAt || new Date().toISOString();
  const consentTimestamp = session.startedAt || new Date().toISOString();

  return {
    clientSubmissionId,
    sessionId: session.sessionId,
    instrumentVersion: session.instrumentVersion || '1.1.0-multimodal-exp',
    evaluationMode: session.evaluationMode,
    startedAt: session.startedAt,
    completedAt,
    clientSentAt: new Date().toISOString(),
    consentGiven: Boolean(session.consentGiven),
    consentTimestamp,
    profile: session.profile,
    k1Responses: session.k1Responses,
    k2Responses: session.k2Responses,
    k3Responses: session.k3Responses,
    k4Responses: session.k4Responses,
    k5k6Responses: session.k5k6Responses,
    qualitativeComments: session.qualitativeComments,
    objectiveScores: session.objectiveScores,
    telemetry: {
      cardsConsulted: session.cardsConsultedDuringSession || [],
      hintsUsed: session.hintsUsed || [],
      wasAssistedByQuestion: session.wasAssistedByQuestion || {},
      deviceType: session.profile?.deviceType
    },
    isComplete: Boolean(session.isComplete)
  };
};

export interface SubmissionResult {
  success: boolean;
  status: CloudSubmissionStatus;
  message: string;
  serverReceivedAt?: string;
  error?: string;
  clientSubmissionId: string;
}

/**
 * Envía la evaluación completada al servidor central de Supabase.
 * - Si no hay credenciales configuradas, devuelve 'unconfigured' sin fallar.
 * - Si hay fallo de red, devuelve 'failed' con mensaje descriptivo para permitir reintento.
 * - Si el servidor confirma la recepción, devuelve 'synced'.
 */
export const submitEvaluationToCloud = async (
  session: EvaluationSessionData
): Promise<SubmissionResult> => {
  const clientSubmissionId = getOrCreateClientSubmissionId(session);

  // 1. Verificar si el backend está configurado
  if (!isCloudConfigured()) {
    return {
      success: false,
      status: 'unconfigured',
      message: 'El servidor central de investigación no está configurado en este entorno. Tus respuestas están guardadas localmente en este dispositivo.',
      clientSubmissionId
    };
  }

  const endpoint = getIngestionEndpoint();
  if (!endpoint) {
    return {
      success: false,
      status: 'unconfigured',
      message: 'URL de endpoint de ingesta no disponible.',
      clientSubmissionId
    };
  }

  // 2. Construir payload validado
  const payload = buildCloudPayload({
    ...session,
    clientSubmissionId
  });

  if (!payload.consentGiven) {
    return {
      success: false,
      status: 'failed',
      error: 'Consentimiento no acreditado.',
      message: 'No es posible enviar los datos sin haber otorgado el consentimiento informado.',
      clientSubmissionId
    };
  }

  // 3. Envío HTTP con timeout de 15 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (anonKey && !anonKey.includes('your-anon-key')) {
    headers['apikey'] = anonKey;
    headers['Authorization'] = `Bearer ${anonKey}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data: CloudSubmissionResponse = await response.json();

    if (!response.ok) {
      const errorMsg = (data as unknown as { error?: string })?.error || `Error HTTP ${response.status}`;
      return {
        success: false,
        status: 'failed',
        error: errorMsg,
        message: `El servidor rechazó el envío (${response.status}): ${errorMsg}`,
        clientSubmissionId
      };
    }

    return {
      success: true,
      status: 'synced',
      serverReceivedAt: data.serverReceivedAt,
      message: data.status === 'already_received'
        ? 'La evaluación ya había sido recibida previamente por el servidor central.'
        : 'Evaluación recibida y confirmada exitosamente por el servidor central de investigación.',
      clientSubmissionId
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    let errorMsg = 'Error de conexión con el servidor central.';
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        errorMsg = 'Tiempo de espera agotado al conectar con el servidor central (15s).';
      } else {
        errorMsg = err.message;
      }
    }

    return {
      success: false,
      status: 'failed',
      error: errorMsg,
      message: `No se pudo transmitir la evaluación al servidor central: ${errorMsg}. Tus datos están seguros en este equipo y puedes reintentar el envío.`,
      clientSubmissionId
    };
  }
};

