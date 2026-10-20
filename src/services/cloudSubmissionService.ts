import { EvaluationSessionData } from '../types/evaluation';
import {
  CloudEvaluationPayload,
  CloudSubmissionResponse,
  CloudSubmissionStatus,
  ResearcherEvaluationRecord,
  ResearcherMetricsSummary
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

/**
 * Consulta de registros para el panel de investigación privado.
 * Requiere autenticación con Supabase (Bearer token de investigador o Service Key de backend).
 */
export const fetchCloudEvaluations = async (
  authToken: string
): Promise<{ success: boolean; data?: ResearcherEvaluationRecord[]; error?: string }> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('your-project-ref')) {
    return { success: false, error: 'Servidor Supabase no configurado.' };
  }

  const endpoint = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/scientific_evaluations?select=*&order=server_received_at.desc`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Error HTTP ${res.status}: ${err}` };
    }

    const data: ResearcherEvaluationRecord[] = await res.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
};

/**
 * Calcula métricas estadísticas consolidadas para el panel de investigador.
 */
export const calculateResearcherMetrics = (
  records: ResearcherEvaluationRecord[]
): ResearcherMetricsSummary => {
  const total = records.length;
  if (total === 0) {
    return {
      totalEvaluations: 0,
      guidedCount: 0,
      researchCount: 0,
      completedCount: 0,
      averageTotalScore: 0,
      averagePercentage: 0,
      evaluationsByDay: {}
    };
  }

  let guidedCount = 0;
  let researchCount = 0;
  let completedCount = 0;
  let sumScore = 0;
  let sumPercentage = 0;
  let scoreCount = 0;
  const byDay: Record<string, number> = {};

  for (const r of records) {
    if (r.evaluation_mode === 'guiado') guidedCount++;
    else researchCount++;

    if (r.is_complete) completedCount++;

    if (typeof r.total_objective_score === 'number') {
      sumScore += r.total_objective_score;
      sumPercentage += (r.percentage || 0);
      scoreCount++;
    }

    const dateKey = r.server_received_at ? r.server_received_at.slice(0, 10) : 'Desconocida';
    byDay[dateKey] = (byDay[dateKey] || 0) + 1;
  }

  return {
    totalEvaluations: total,
    guidedCount,
    researchCount,
    completedCount,
    averageTotalScore: scoreCount > 0 ? Math.round((sumScore / scoreCount) * 10) / 10 : 0,
    averagePercentage: scoreCount > 0 ? Math.round((sumPercentage / scoreCount) * 10) / 10 : 0,
    firstReceivedAt: records[records.length - 1]?.server_received_at,
    lastReceivedAt: records[0]?.server_received_at,
    evaluationsByDay: byDay
  };
};

/**
 * Exporta todas las evaluaciones consolidadas a un archivo CSV estructurado.
 */
export const exportConsolidatedCloudCSV = (records: ResearcherEvaluationRecord[]): void => {
  const headers = [
    'id',
    'session_id',
    'client_submission_id',
    'instrument_version',
    'evaluation_mode',
    'started_at',
    'completed_at',
    'server_received_at',
    'consent_given',
    'academic_role',
    'education_level',
    'disciplinary_area',
    'prior_state_of_art',
    'prior_electric_tricycles',
    'device_type',
    'k1_score',
    'k2_score',
    'total_objective_score',
    'percentage',
    'hints_used_count',
    'cards_consulted_count',
    'k3_comparison_cards',
    'k3_criterion',
    'k3_confidence',
    'k3_differences',
    'k3_similarities',
    'k4_synthesis_cards',
    'k4_synthesis_text',
    'k4_transfer_text',
    'k5_cards_clarity',
    'k5_navigation_ease',
    'k5_comparison_ease',
    'k5_utility_state_of_art',
    'k5_utility_teaching',
    'k5_utility_research',
    'k5_confidence_explaining',
    'k6_perceived_mental_effort',
    'k6_synthesis_difficulty',
    'k6_intention_to_reuse',
    'comments_what_helped',
    'comments_what_confusing',
    'comments_missing_info',
    'notification_sent'
  ];

  const escapeCSV = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map(r => {
    const prof = r.participant_profile || {};
    const k3 = r.k3_responses || {};
    const k4 = r.k4_responses || {};
    const k5k6 = r.k5k6_responses || {};
    const comm = r.qualitative_comments || {};
    const telem = r.telemetry || {};

    return [
      escapeCSV(r.id),
      escapeCSV(r.session_id),
      escapeCSV(r.client_submission_id),
      escapeCSV(r.instrument_version),
      escapeCSV(r.evaluation_mode),
      escapeCSV(r.started_at),
      escapeCSV(r.completed_at),
      escapeCSV(r.server_received_at),
      escapeCSV(r.consent_given ? '1' : '0'),
      escapeCSV(prof.academicRole),
      escapeCSV(prof.educationLevel),
      escapeCSV(prof.disciplinaryArea),
      escapeCSV(prof.priorFamiliarityStateOfArt),
      escapeCSV(prof.priorFamiliarityElectricTricycles),
      escapeCSV(prof.deviceType),
      escapeCSV(r.k1_score),
      escapeCSV(r.k2_score),
      escapeCSV(r.total_objective_score),
      escapeCSV(r.percentage),
      escapeCSV(telem.hintsUsed?.length || 0),
      escapeCSV(telem.cardsConsulted?.length || 0),
      escapeCSV((k3.selectedCardIds || []).join(';')),
      escapeCSV(k3.comparisonCriterion),
      escapeCSV(k3.confidenceLevel),
      escapeCSV(k3.differencesText),
      escapeCSV(k3.similaritiesText),
      escapeCSV((k4.selectedCardIds || []).join(';')),
      escapeCSV(k4.synthesisText),
      escapeCSV(k4.transferExplanationText),
      escapeCSV(k5k6.cardsClarity),
      escapeCSV(k5k6.navigationEase),
      escapeCSV(k5k6.comparisonEase),
      escapeCSV(k5k6.utilityStateOfArt),
      escapeCSV(k5k6.utilityTeaching),
      escapeCSV(k5k6.utilityResearch),
      escapeCSV(k5k6.confidenceExplaining),
      escapeCSV(k5k6.perceivedMentalEffort),
      escapeCSV(k5k6.synthesisDifficulty),
      escapeCSV(k5k6.intentionToReuse),
      escapeCSV(comm.whatHelpedMost),
      escapeCSV(comm.whatWasConfusing),
      escapeCSV(comm.missingInformationInCards),
      escapeCSV(r.notification_sent ? '1' : '0')
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MTC_EVALUACIONES_CONSOLIDADAS_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Exporta todas las evaluaciones consolidadas a un archivo JSON con metadatos.
 */
export const exportConsolidatedCloudJSON = (records: ResearcherEvaluationRecord[]): void => {
  const payload = {
    metadata: {
      exportedAt: new Date().toISOString(),
      totalRecords: records.length,
      datasetTitle: 'MTC Research Game - Evaluaciones Científicas Centralizadas',
      purpose: 'Validación empírica exploratoria del modelo conceptual y mazo MTC01-MTC49'
    },
    evaluations: records
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MTC_EVALUACIONES_CONSOLIDADAS_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
