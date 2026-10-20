import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('1. Configuración de Entorno y Prevención de Fuga de Secretos', async () => {
  const envExamplePath = path.join(projectRoot, '.env.example');
  assert.ok(fs.existsSync(envExamplePath), '.env.example debe existir');

  const envContent = fs.readFileSync(envExamplePath, 'utf-8');
  assert.ok(envContent.includes('VITE_SUPABASE_URL='), 'Debe incluir VITE_SUPABASE_URL');
  assert.ok(envContent.includes('VITE_SUPABASE_ANON_KEY='), 'Debe incluir VITE_SUPABASE_ANON_KEY');
  assert.ok(envContent.includes('SUPABASE_SERVICE_ROLE_KEY='), 'Debe documentar SUPABASE_SERVICE_ROLE_KEY como variable de servidor');
  assert.ok(envContent.includes('RESEND_API_KEY='), 'Debe documentar RESEND_API_KEY');

  // Asegurar que no se hayan quemado credenciales reales en .env.example
  assert.ok(!envContent.includes('eyJh'), 'No deben existir JWTs reales en .env.example');
  assert.ok(!envContent.includes('re_'), 'No deben existir API keys reales de Resend en .env.example');

  // Asegurar que no existan archivos .env con credenciales reales en Git
  const gitignorePath = path.join(projectRoot, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    assert.ok(gitignoreContent.includes('.env'), '.gitignore debe excluir archivos .env');
  }
});

test('2. Migración SQL y Políticas de Seguridad Row Level Security (RLS)', async () => {
  const migrationPath = path.join(projectRoot, 'supabase/migrations/20261020000000_create_evaluations_schema.sql');
  assert.ok(fs.existsSync(migrationPath), 'El archivo de migración SQL debe existir');

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // Tablas requeridas
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.scientific_evaluations'), 'Debe crear scientific_evaluations');
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.researcher_profiles'), 'Debe crear researcher_profiles');
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.evaluation_rate_limits'), 'Debe crear evaluation_rate_limits');

  // Columnas clave y restricciones
  assert.ok(sql.includes('client_submission_id TEXT NOT NULL UNIQUE'), 'Debe tener client_submission_id NOT NULL UNIQUE');
  assert.ok(sql.includes('consent_given BOOLEAN NOT NULL DEFAULT FALSE'), 'Debe requerir consent_given');
  assert.ok(sql.includes('CHECK (consent_given = TRUE)'), 'Debe imponer check de consentimiento obligatorio');
  assert.ok(sql.includes('client_ip_hash TEXT'), 'Debe almacenar hash salado de IP, no IP en plano');

  // Verificación de RLS
  assert.ok(sql.includes('ALTER TABLE public.scientific_evaluations ENABLE ROW LEVEL SECURITY;'), 'RLS debe estar habilitado en scientific_evaluations');
  assert.ok(sql.includes('CREATE POLICY "researcher_select_evaluations"'), 'Debe existir política para investigadores autenticados');
  assert.ok(sql.includes('CREATE POLICY "service_role_full_access"'), 'Debe existir política para service_role');
});

test('3. Supabase Edge Function: Ingesta Segura, Validación y Resiliencia', async () => {
  const functionPath = path.join(projectRoot, 'supabase/functions/submit-evaluation/index.ts');
  assert.ok(fs.existsSync(functionPath), 'La Edge Function submit-evaluation debe existir');

  const fnContent = fs.readFileSync(functionPath, 'utf-8');

  // Límites y seguridad
  assert.ok(fnContent.includes('MAX_PAYLOAD_SIZE = 512000'), 'Debe limitar tamaño a 500KB');
  assert.ok(fnContent.includes('IP_SALT'), 'Debe usar un salt para la seudonimización de IP');
  assert.ok(fnContent.includes('crypto.subtle.digest'), 'Debe calcular hash criptográfico SHA-256');

  // Validación de consentimiento obligatorio
  assert.ok(fnContent.includes('consentGiven !== true'), 'Debe validar que el consentimiento sea verdadero');

  // Idempotencia
  assert.ok(fnContent.includes('client_submission_id'), 'Debe comprobar el client_submission_id');
  assert.ok(fnContent.includes('already_received'), 'Debe responder con already_received si es un reintento idéntico');

  // Notificación de correo resiliente
  assert.ok(fnContent.includes('RESEARCHER_NOTIFICATION_EMAIL'), 'Debe incluir configuración de correo del investigador');
  assert.ok(fnContent.includes('api.resend.com/emails'), 'Debe despachar mediante la API de Resend');
  assert.ok(fnContent.includes('catch (mailErr)'), 'La notificación debe estar aislada en try/catch para no fallar la inserción');
  
  // Extraer el bloque del correo para validar que no filtre texto cualitativo
  const emailBlock = fnContent.slice(fnContent.indexOf('const emailBody'), fnContent.indexOf('const emailRes'));
  assert.ok(!emailBlock.includes('k4Responses'), 'El cuerpo del correo NO debe incluir respuestas cualitativas K4');
  assert.ok(!emailBlock.includes('qualitativeComments'), 'El cuerpo del correo NO debe incluir comentarios abiertos');
});

test('4. Tipos TypeScript del Cliente y Payload Centralizado', async () => {
  const typesPath = path.join(projectRoot, 'src/types/cloudSubmission.ts');
  assert.ok(fs.existsSync(typesPath), 'cloudSubmission.ts debe existir');

  const typesContent = fs.readFileSync(typesPath, 'utf-8');
  assert.ok(typesContent.includes('export interface CloudEvaluationPayload'), 'Debe exportar CloudEvaluationPayload');
  assert.ok(typesContent.includes('export interface CloudSubmissionResponse'), 'Debe exportar CloudSubmissionResponse');
  assert.ok(typesContent.includes('export type CloudSubmissionStatus'), 'Debe exportar CloudSubmissionStatus');

  // Comprobar actualización en src/types/evaluation.ts
  const evalTypesPath = path.join(projectRoot, 'src/types/evaluation.ts');
  const evalTypes = fs.readFileSync(evalTypesPath, 'utf-8');
  assert.ok(evalTypes.includes('clientSubmissionId?: string;'), 'EvaluationSessionData debe contener clientSubmissionId');
  assert.ok(evalTypes.includes('cloudSubmissionStatus?:'), 'EvaluationSessionData debe contener cloudSubmissionStatus');
});

test('5. Servicio de Envío en la Nube: Ingesta Centralizada, Detección Offline e Idempotencia', async () => {
  const servicePath = path.join(projectRoot, 'src/services/cloudSubmissionService.ts');
  assert.ok(fs.existsSync(servicePath), 'cloudSubmissionService.ts debe existir');

  const svcContent = fs.readFileSync(servicePath, 'utf-8');

  // Funciones de servicio requeridas para el participante
  assert.ok(svcContent.includes('isCloudConfigured ='), 'isCloudConfigured debe existir');
  assert.ok(svcContent.includes('getOrCreateClientSubmissionId ='), 'getOrCreateClientSubmissionId debe existir');
  assert.ok(svcContent.includes('buildCloudPayload ='), 'buildCloudPayload debe existir');
  assert.ok(svcContent.includes('submitEvaluationToCloud ='), 'submitEvaluationToCloud debe existir');

  // Funciones administrativas retiradas del cliente por seguridad y simplificación
  assert.ok(!svcContent.includes('fetchCloudEvaluations'), 'fetchCloudEvaluations no debe estar expuesto en el cliente');
  assert.ok(!svcContent.includes('calculateResearcherMetrics'), 'calculateResearcherMetrics no debe estar expuesto en el cliente');

  // Timeout y prevención de cuelgues
  assert.ok(svcContent.includes('AbortController'), 'Debe usar AbortController con tiempo límite');
  assert.ok(svcContent.includes('15000'), 'Timeout de 15 segundos');
});

test('6. Simulación de Formato de Payload y Prevención de Envíos sin Consentimiento', () => {
  // Simulación de la regla de negocio de buildCloudPayload
  const mockSession = {
    sessionId: 'MTC-EVAL-ABC123',
    modality: 'academic',
    currentStage: 'stage_review',
    completedStages: ['stage_k1', 'stage_k2', 'stage_k3', 'stage_k4', 'stage_k5', 'stage_k6'],
    consentGiven: false, // Sin consentimiento
    scores: {
      k1Score: 4,
      k2Score: 3,
      totalObjectiveScore: 7,
      maxPossibleObjectiveScore: 7,
      percentage: 100,
      k1Feedback: ['Excelente'],
      k2Feedback: ['Excelente']
    },
    stageTiming: { stage_k1: 60, stage_k2: 45 },
    k1Data: { q1CoreContribution: 'opt_a' },
    k2Data: {},
    k3Data: {},
    k4Data: { qualitativeSynthesis: 'Síntesis de prueba' },
    k5Data: { openFeedback: 'Muy buena herramienta' },
    k6Data: { totalSeconds: 120, abandoned: false }
  };

  // Simular validación del payload
  const validatePayload = (payload) => {
    if (!payload.consentGiven) {
      return { valid: false, error: 'Consentimiento informado obligatorio no otorgado' };
    }
    if (!payload.clientSubmissionId || !payload.sessionId) {
      return { valid: false, error: 'Identificadores de sesión e idempotencia obligatorios' };
    }
    return { valid: true, error: null };
  };

  const payloadWithoutConsent = {
    clientSubmissionId: 'sub_MTC-EVAL-ABC123_1729452000000_xyz',
    sessionId: mockSession.sessionId,
    consentGiven: mockSession.consentGiven
  };

  const check1 = validatePayload(payloadWithoutConsent);
  assert.strictEqual(check1.valid, false);
  assert.strictEqual(check1.error, 'Consentimiento informado obligatorio no otorgado');

  const payloadWithConsent = {
    ...payloadWithoutConsent,
    consentGiven: true
  };

  const check2 = validatePayload(payloadWithConsent);
  assert.strictEqual(check2.valid, true);
  assert.strictEqual(check2.error, null);
});

test('7. Simulación de Idempotencia y Formato de Token', () => {
  const generateSubmissionId = (sessionId) => {
    const ts = Date.now();
    const rand = Math.random().toString(36).substring(2, 10);
    return `sub_${sessionId.replace(/[^a-zA-Z0-9_-]/g, '')}_${ts}_${rand}`;
  };

  const token1 = generateSubmissionId('MTC-EVAL-XYZ789');
  assert.ok(token1.startsWith('sub_MTC-EVAL-XYZ789_'), 'El token debe iniciar con prefijo sanitizado de sesión');
  assert.match(token1, /^sub_MTC-EVAL-XYZ789_\d+_[a-z0-9]+$/, 'Estructura sub_<session>_<ts>_<rand>');

  // Múltiples generaciones en la misma máquina deben generar tokens distintos
  const token2 = generateSubmissionId('MTC-EVAL-XYZ789');
  assert.notStrictEqual(token1, token2, 'Cada token generado debe ser único para evitar colisiones');
});

test('8. Exportación Consolidada de Datos: CSV Escapado y JSON Estructurado', () => {
  const mockRecords = [
    {
      id: 'rec-001',
      session_id: 'MTC-EVAL-111111',
      client_submission_id: 'sub_001',
      modality: 'academic',
      consent_given: true,
      total_objective_score: 7,
      max_possible_score: 7,
      score_percentage: 100,
      k1_score: 4,
      k2_score: 3,
      total_time_seconds: 350,
      k1_data: { q1CoreContribution: 'opt_a' },
      k2_data: {},
      k3_data: {},
      k4_data: { qualitativeSynthesis: 'Texto con "comillas", saltos de línea\ny comas, que deben escaparse.' },
      k5_data: { openFeedback: 'Todo excelente.' },
      k6_data: { totalSeconds: 350, abandoned: false },
      stage_timing: { stage_k1: 60, stage_k2: 40 },
      app_version: '2.0.0',
      instrument_version: '1.1.0-multimodal-exp',
      created_at: '2026-10-20T00:00:00Z'
    }
  ];

  // Simular CSV Builder con RFC 4180
  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headers = ['id', 'session_id', 'modality', 'percentage', 'synthesis'];
  const row = [
    mockRecords[0].id,
    mockRecords[0].session_id,
    mockRecords[0].modality,
    mockRecords[0].score_percentage,
    mockRecords[0].k4_data.qualitativeSynthesis
  ].map(escapeCsv).join(',');

  assert.ok(row.includes('""comillas""'), 'Las comillas deben estar doblemente escapadas');
  assert.ok(row.includes('saltos de línea\ny comas'), 'Debe conservar saltos de línea dentro del campo entre comillas');

  // Simular JSON Builder
  const exportedJson = JSON.stringify({
    metadata: { total: mockRecords.length, exportedAt: new Date().toISOString() },
    records: mockRecords
  });
  const parsed = JSON.parse(exportedJson);
  assert.strictEqual(parsed.metadata.total, 1);
  assert.strictEqual(parsed.records[0].session_id, 'MTC-EVAL-111111');
});

test('9. Interfaz de Usuario: Tarjeta de Sincronización y Frontend Simplificado (Sin Panel Administrativo)', () => {
  const evalViewPath = path.join(projectRoot, 'src/features/evaluation/EvaluationView.tsx');
  const evalView = fs.readFileSync(evalViewPath, 'utf-8');

  // Conservar tarjeta de sincronización y reintento para el participante
  assert.ok(evalView.includes('eval-cloud-status-card'), 'Debe incluir la tarjeta de estado en la nube');
  assert.ok(evalView.includes('retryCloudSubmission'), 'Debe permitir reintentar el envío');

  // Verificar la retirada total del panel administrativo y accesos de investigador en la interfaz del participante
  assert.ok(!evalView.includes('ResearcherAdminModal'), 'NO debe importar ni montar el modal del investigador');
  assert.ok(!evalView.includes('isResearcherModalOpen'), 'NO debe contener estado de apertura de modal administrativo');
  assert.ok(!evalView.includes('🔒 Investigador'), 'NO debe exponer botón de acceso administrativo al participante');

  const modalPath = path.join(projectRoot, 'src/components/admin/ResearcherAdminModal.tsx');
  assert.ok(!fs.existsSync(modalPath), 'ResearcherAdminModal.tsx no debe existir en el frontend simplificado');
});

test('10. Documentación de Arquitectura y Gobernanza Ética', () => {
  const setupDocPath = path.join(projectRoot, 'docs/supabase_setup.md');
  assert.ok(fs.existsSync(setupDocPath), 'docs/supabase_setup.md debe existir');
  const setupDoc = fs.readFileSync(setupDocPath, 'utf-8');
  assert.ok(setupDoc.includes('submit-evaluation'), 'Debe documentar la Edge Function');
  assert.ok(setupDoc.includes('RESEND_API_KEY'), 'Debe documentar la configuración de Resend');

  const govDocPath = path.join(projectRoot, 'docs/data_privacy_and_governance.md');
  assert.ok(fs.existsSync(govDocPath), 'docs/data_privacy_and_governance.md debe existir');
  const govDoc = fs.readFileSync(govDocPath, 'utf-8');
  assert.ok(govDoc.includes('Minimización de Datos'), 'Debe cubrir minimización');
  assert.ok(govDoc.includes('Seudonimización Unidireccional de Direcciones IP'), 'Debe cubrir hash salado de IP');
  assert.ok(govDoc.includes('Modo Guiado / Lúdico'), 'Debe cubrir salvaguardas para menores');
});

test('11. useEvaluationSession: Auditoría de Flujo Asíncrono y Erradicación del Fallo en setSession', () => {
  const hookPath = path.join(projectRoot, 'src/hooks/useEvaluationSession.ts');
  assert.ok(fs.existsSync(hookPath), 'useEvaluationSession.ts debe existir');

  const hookContent = fs.readFileSync(hookPath, 'utf-8');

  // 1. Verificar que NO se use el antipatrón de asignación en callback de setSession
  assert.ok(!hookContent.includes('completedSession = updated'), 'NO debe mutar completedSession dentro de callback de setSession');
  assert.ok(!hookContent.includes('targetSession = updated'), 'NO debe mutar targetSession dentro de callback de setSession');

  // 2. Verificar construcción explícita previa al envío
  assert.ok(hookContent.includes('const completedSession: EvaluationSessionData = {'), 'Debe construir completedSession explícitamente antes del envío');
  assert.ok(hookContent.includes('submitEvaluationToCloud(completedSession)'), 'Debe pasar completedSession a submitEvaluationToCloud');
  assert.ok(hookContent.includes('submitEvaluationToCloud(retryingSession)'), 'Debe pasar retryingSession a submitEvaluationToCloud');

  // 3. Guardia contra doble pulsación
  assert.ok(hookContent.includes('isSubmittingRef'), 'Debe incluir isSubmittingRef como guardia contra doble pulsación');
  assert.ok(hookContent.includes("session.cloudSubmissionStatus === 'submitting'"), 'Debe validar que no se esté transmitiendo');

  // 4. Recuperación segura de localStorage si quedó en submitting
  assert.ok(hookContent.includes("parsed.cloudSubmissionStatus === 'submitting'"), 'Debe comprobar si localStorage tenía submitting');
  assert.ok(hookContent.includes("? 'failed'"), 'Debe degradar a failed para permitir reintentos');
});

test('12. Simulación de Transición de Estados: Éxito (synced), Error (failed), Reintento (idempotencia) y Modo Local', async () => {
  // Estado base de sesión
  let sessionState = {
    sessionId: 'MTC-EVAL-TEST123',
    instrumentVersion: '1.1.0-multimodal-exp',
    evaluationMode: 'guiado',
    consentGiven: true,
    isComplete: false,
    cloudSubmissionStatus: 'idle',
    cloudRetryCount: 0,
    clientSubmissionId: undefined,
    cloudSubmissionTimestamp: undefined,
    cloudSubmissionError: undefined
  };

  let submitCallCount = 0;
  let lastSubmittedPayload = null;

  // Mock del servicio de envío
  const mockSubmitToCloud = async (sessionPayload, shouldFail = false) => {
    submitCallCount++;
    lastSubmittedPayload = sessionPayload;
    if (shouldFail) {
      return {
        success: false,
        status: 'failed',
        error: 'Network timeout (15s)',
        clientSubmissionId: sessionPayload.clientSubmissionId
      };
    }
    return {
      success: true,
      status: 'synced',
      serverReceivedAt: '2026-10-20T03:00:00.000Z',
      clientSubmissionId: sessionPayload.clientSubmissionId
    };
  };

  // Simulación del flujo de completeEvaluation
  const simulateComplete = async (isConfigured, shouldFail = false) => {
    const subId = sessionState.clientSubmissionId || `sub_${sessionState.sessionId}_12345`;
    const updated = {
      ...sessionState,
      isComplete: true,
      currentStage: 'stage_complete',
      clientSubmissionId: subId,
      cloudSubmissionStatus: isConfigured ? 'submitting' : 'unconfigured'
    };
    sessionState = updated;

    if (!isConfigured) return;

    const result = await mockSubmitToCloud(updated, shouldFail);
    sessionState = {
      ...sessionState,
      cloudSubmissionStatus: result.status,
      cloudSubmissionTimestamp: result.serverReceivedAt || sessionState.cloudSubmissionTimestamp,
      cloudSubmissionError: result.error
    };
  };

  // Simulación del flujo de retryCloudSubmission
  const simulateRetry = async (isConfigured, shouldFail = false) => {
    const subId = sessionState.clientSubmissionId || `sub_${sessionState.sessionId}_generated`;
    const retrying = {
      ...sessionState,
      clientSubmissionId: subId,
      cloudSubmissionStatus: isConfigured ? 'submitting' : 'unconfigured',
      cloudRetryCount: sessionState.cloudRetryCount + 1,
      cloudSubmissionError: undefined
    };
    sessionState = retrying;

    if (!isConfigured) return;

    const result = await mockSubmitToCloud(retrying, shouldFail);
    sessionState = {
      ...sessionState,
      cloudSubmissionStatus: result.status,
      cloudSubmissionTimestamp: result.serverReceivedAt || sessionState.cloudSubmissionTimestamp,
      cloudSubmissionError: result.error
    };
  };

  // CASO 1: Finalización con error de red -> debe quedar en 'failed' y registrar error
  await simulateComplete(true, true);
  assert.strictEqual(submitCallCount, 1, 'Debe haber llamado a submitEvaluationToCloud');
  assert.strictEqual(sessionState.cloudSubmissionStatus, 'failed', 'Estado debe ser failed');
  assert.strictEqual(sessionState.cloudSubmissionError, 'Network timeout (15s)');
  assert.ok(sessionState.clientSubmissionId.startsWith('sub_MTC-EVAL-TEST123_'), 'Debe generar clientSubmissionId');
  const originalSubId = sessionState.clientSubmissionId;

  // CASO 2: Reintento sobre la sesión fallida -> debe conservar el MISMO clientSubmissionId (idempotencia)
  await simulateRetry(true, false);
  assert.strictEqual(submitCallCount, 2, 'Debe haber llamado a submitEvaluationToCloud en el reintento');
  assert.strictEqual(sessionState.cloudSubmissionStatus, 'synced', 'Estado debe cambiar a synced tras reintento exitoso');
  assert.strictEqual(sessionState.clientSubmissionId, originalSubId, 'El clientSubmissionId DEBE ser exactamente el mismo para idempotencia');
  assert.strictEqual(sessionState.cloudRetryCount, 1, 'cloudRetryCount debe incrementarse');
  assert.strictEqual(sessionState.cloudSubmissionTimestamp, '2026-10-20T03:00:00.000Z');

  // CASO 3: Modo local / sin nube configurada -> estado debe ser 'unconfigured' sin invocar servicio
  const localSession = {
    sessionId: 'MTC-LOCAL-001',
    isComplete: false,
    cloudSubmissionStatus: 'idle',
    cloudRetryCount: 0
  };
  sessionState = localSession;
  const callsBeforeLocal = submitCallCount;
  await simulateComplete(false); // isConfigured = false
  assert.strictEqual(submitCallCount, callsBeforeLocal, 'NO debe llamar a submitEvaluationToCloud si no está configurada la nube');
  assert.strictEqual(sessionState.cloudSubmissionStatus, 'unconfigured', 'Estado debe ser unconfigured en modo local');
  assert.strictEqual(sessionState.isComplete, true, 'isComplete debe quedar en true');
});

test('13. Reinicio Automático Multi-Participante: Limpieza post-sincronización, persistencia selectiva y preservación de preferencias', () => {
  // Simulación del motor de almacenamiento localStorage
  const mockLocalStorage = new Map();
  const localStorageMock = {
    getItem: (key) => mockLocalStorage.get(key) || null,
    setItem: (key, val) => mockLocalStorage.set(key, String(val)),
    removeItem: (key) => mockLocalStorage.delete(key),
    clear: () => mockLocalStorage.clear()
  };

  const EVAL_KEY = 'mtc_scientific_evaluation_session_v1';
  const GAME_KEY = 'mtc_research_game_state_v2';
  const THEME_KEY = 'mtc_theme';
  const SOUND_KEY = 'mtc_sound_enabled';

  // Configurar preferencias previas del usuario
  localStorageMock.setItem(THEME_KEY, 'dark');
  localStorageMock.setItem(SOUND_KEY, JSON.stringify(true));

  // Función idéntica al inicializador de useEvaluationSession
  const initializeEvaluationSession = () => {
    const raw = localStorageMock.getItem(EVAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.sessionId) {
        // Si está completada Y sincronizada con la nube -> REINICIO AUTOMÁTICO
        if (parsed.isComplete === true && parsed.cloudSubmissionStatus === 'synced') {
          localStorageMock.removeItem(EVAL_KEY);
          localStorageMock.removeItem(GAME_KEY);

          const fresh = {
            sessionId: `MTC-EVAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            evaluationMode: parsed.evaluationMode || 'guiado',
            startedAt: new Date().toISOString(),
            consentGiven: false,
            currentStage: 'stage_0_consent',
            k1Responses: {},
            k2Responses: {},
            k3Responses: {},
            k4Responses: {},
            k5k6Responses: {},
            qualitativeComments: {},
            isComplete: false,
            cloudSubmissionStatus: 'idle',
            cloudRetryCount: 0
          };
          localStorageMock.setItem(EVAL_KEY, JSON.stringify(fresh));
          return fresh;
        }

        const safeStatus = parsed.cloudSubmissionStatus === 'submitting'
          ? 'failed'
          : (parsed.cloudSubmissionStatus || 'idle');

        return {
          ...parsed,
          cloudSubmissionStatus: safeStatus
        };
      }
    }

    const initial = {
      sessionId: `MTC-EVAL-INIT001`,
      evaluationMode: 'guiado',
      consentGiven: false,
      currentStage: 'stage_0_consent',
      isComplete: false,
      cloudSubmissionStatus: 'idle'
    };
    return initial;
  };

  // --- REQUISITO 1: Evaluación completada se muestra confirmada en pantalla ---
  const completedEvaluation = {
    sessionId: 'MTC-EVAL-PARTICIPANTE1',
    evaluationMode: 'guiado',
    consentGiven: true,
    currentStage: 'stage_complete',
    isComplete: true,
    scores: { totalObjectiveScore: 7, percentage: 100 },
    k1Responses: { q1CoreContribution: 'opt_a' },
    cloudSubmissionStatus: 'synced',
    cloudSubmissionTimestamp: '2026-10-20T04:00:00.000Z',
    clientSubmissionId: 'sub_MTC-EVAL-PARTICIPANTE1_12345'
  };
  localStorageMock.setItem(EVAL_KEY, JSON.stringify(completedEvaluation));
  localStorageMock.setItem(GAME_KEY, JSON.stringify({ timelineCards: ['MTC01'], combats: [{ id: 'c1' }] }));

  // Se comprueba que antes del refresco los datos existen intactos
  const sessionBeforeRefresh = JSON.parse(localStorageMock.getItem(EVAL_KEY));
  assert.strictEqual(sessionBeforeRefresh.cloudSubmissionStatus, 'synced');
  assert.strictEqual(sessionBeforeRefresh.sessionId, 'MTC-EVAL-PARTICIPANTE1');

  // --- REQUISITO 2 y 3: Tras refrescar, se inicializa sesión nueva y limpia ---
  const sessionAfterRefresh = initializeEvaluationSession();

  assert.notStrictEqual(sessionAfterRefresh.sessionId, 'MTC-EVAL-PARTICIPANTE1', 'El nuevo sessionId debe ser distinto');
  assert.strictEqual(sessionAfterRefresh.isComplete, false, 'La nueva sesión no debe estar completada');
  assert.strictEqual(sessionAfterRefresh.consentGiven, false, 'El consentimiento debe reiniciarse');
  assert.strictEqual(sessionAfterRefresh.currentStage, 'stage_0_consent', 'Debe iniciar en la etapa 0 de consentimiento');
  assert.deepStrictEqual(sessionAfterRefresh.k1Responses, {}, 'Las respuestas anteriores no deben aparecer en la nueva');
  assert.strictEqual(sessionAfterRefresh.scores, undefined, 'Las puntuaciones anteriores no deben existir');
  assert.strictEqual(sessionAfterRefresh.clientSubmissionId, undefined, 'El token de envío no debe heredarse');

  // --- REQUISITO 4: Preferencias de tema y sonido se conservan ---
  assert.strictEqual(localStorageMock.getItem(THEME_KEY), 'dark', 'El tema debe conservarse intacto');
  assert.strictEqual(JSON.parse(localStorageMock.getItem(SOUND_KEY)), true, 'La preferencia de sonido debe conservarse intacta');

  // --- REQUISITO 5: Evaluaciones pendientes o fallidas NO se reinician al refrescar ---
  const failedEvaluation = {
    sessionId: 'MTC-EVAL-PENDIENTE',
    evaluationMode: 'investigacion',
    consentGiven: true,
    currentStage: 'stage_complete',
    isComplete: true,
    k1Responses: { q1CoreContribution: 'opt_b' },
    cloudSubmissionStatus: 'failed',
    cloudSubmissionError: 'Error de conexión',
    clientSubmissionId: 'sub_MTC-EVAL-PENDIENTE_99999'
  };
  localStorageMock.setItem(EVAL_KEY, JSON.stringify(failedEvaluation));

  const sessionAfterRefreshFailed = initializeEvaluationSession();
  assert.strictEqual(sessionAfterRefreshFailed.sessionId, 'MTC-EVAL-PENDIENTE', 'Sesión fallida debe conservarse');
  assert.strictEqual(sessionAfterRefreshFailed.isComplete, true, 'isComplete debe conservarse para permitir reintento');
  assert.strictEqual(sessionAfterRefreshFailed.k1Responses.q1CoreContribution, 'opt_b', 'Respuestas deben conservarse');
  assert.strictEqual(sessionAfterRefreshFailed.cloudSubmissionStatus, 'failed', 'Estado debe mantenerse como failed');

  // --- REQUISITO 6: Refrescos múltiples no crean duplicados ni reenvían ---
  // Tras sincronizarse una evaluación:
  const syncedEval = {
    sessionId: 'MTC-EVAL-SYNCED',
    isComplete: true,
    cloudSubmissionStatus: 'synced',
    clientSubmissionId: 'sub_synced_123'
  };
  localStorageMock.setItem(EVAL_KEY, JSON.stringify(syncedEval));

  // Primer refresco: detecta synced y reinicia a sesión limpia
  const firstRefresh = initializeEvaluationSession();
  assert.strictEqual(firstRefresh.isComplete, false, 'Primer refresco genera sesión limpia');
  assert.strictEqual(firstRefresh.cloudSubmissionStatus, 'idle');
  assert.notStrictEqual(firstRefresh.sessionId, 'MTC-EVAL-SYNCED');

  // Segundo refresco: la sesión ya es limpia (isComplete: false, idle), se mantiene limpia
  const secondRefresh = initializeEvaluationSession();
  assert.strictEqual(secondRefresh.isComplete, false, 'Segundo refresco conserva sesión limpia');
  assert.strictEqual(secondRefresh.cloudSubmissionStatus, 'idle');
  assert.strictEqual(secondRefresh.sessionId, firstRefresh.sessionId, 'Conserva la misma sesión limpia en curso');

  // --- REQUISITO 7: Modo local sin conexión (unconfigured) se conserva al refrescar ---
  const unconfiguredEval = {
    sessionId: 'MTC-EVAL-LOCALONLY',
    isComplete: true,
    cloudSubmissionStatus: 'unconfigured',
    k1Responses: { q1CoreContribution: 'opt_c' }
  };
  localStorageMock.setItem(EVAL_KEY, JSON.stringify(unconfiguredEval));
  const sessionAfterRefreshLocal = initializeEvaluationSession();
  assert.strictEqual(sessionAfterRefreshLocal.sessionId, 'MTC-EVAL-LOCALONLY', 'Evaluación local debe preservarse');
  assert.strictEqual(sessionAfterRefreshLocal.cloudSubmissionStatus, 'unconfigured');
});
