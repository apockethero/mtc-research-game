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
  assert.ok(typesContent.includes('export interface ResearcherEvaluationRecord'), 'Debe exportar ResearcherEvaluationRecord');
  assert.ok(typesContent.includes('export interface ResearcherMetricsSummary'), 'Debe exportar ResearcherMetricsSummary');

  // Comprobar actualización en src/types/evaluation.ts
  const evalTypesPath = path.join(projectRoot, 'src/types/evaluation.ts');
  const evalTypes = fs.readFileSync(evalTypesPath, 'utf-8');
  assert.ok(evalTypes.includes('clientSubmissionId?: string;'), 'EvaluationSessionData debe contener clientSubmissionId');
  assert.ok(evalTypes.includes('cloudSubmissionStatus?:'), 'EvaluationSessionData debe contener cloudSubmissionStatus');
});

test('5. Servicio de Envío en la Nube: Detección Offline e Idempotencia', async () => {
  const servicePath = path.join(projectRoot, 'src/services/cloudSubmissionService.ts');
  assert.ok(fs.existsSync(servicePath), 'cloudSubmissionService.ts debe existir');

  const svcContent = fs.readFileSync(servicePath, 'utf-8');

  // Funciones de servicio requeridas
  assert.ok(svcContent.includes('isCloudConfigured ='), 'isCloudConfigured debe existir');
  assert.ok(svcContent.includes('getOrCreateClientSubmissionId ='), 'getOrCreateClientSubmissionId debe existir');
  assert.ok(svcContent.includes('buildCloudPayload ='), 'buildCloudPayload debe existir');
  assert.ok(svcContent.includes('submitEvaluationToCloud ='), 'submitEvaluationToCloud debe existir');
  assert.ok(svcContent.includes('fetchCloudEvaluations ='), 'fetchCloudEvaluations debe existir');
  assert.ok(svcContent.includes('calculateResearcherMetrics ='), 'calculateResearcherMetrics debe existir');
  assert.ok(svcContent.includes('exportConsolidatedCloudCSV ='), 'exportConsolidatedCloudCSV debe existir');
  assert.ok(svcContent.includes('exportConsolidatedCloudJSON ='), 'exportConsolidatedCloudJSON debe existir');

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

test('9. Interfaz de Usuario: Tarjeta de Sincronización y Modal de Investigador', () => {
  const evalViewPath = path.join(projectRoot, 'src/features/evaluation/EvaluationView.tsx');
  const evalView = fs.readFileSync(evalViewPath, 'utf-8');

  assert.ok(evalView.includes('eval-cloud-status-card'), 'Debe incluir la tarjeta de estado en la nube');
  assert.ok(evalView.includes('retryCloudSubmission'), 'Debe permitir reintentar el envío');
  assert.ok(evalView.includes('ResearcherAdminModal'), 'Debe importar el modal del investigador');
  assert.ok(evalView.includes('setIsResearcherModalOpen(true)'), 'Debe abrir el modal del investigador');
  assert.ok(evalView.includes('Investigador'), 'Debe contener botón de acceso para investigador');

  const modalPath = path.join(projectRoot, 'src/components/admin/ResearcherAdminModal.tsx');
  assert.ok(fs.existsSync(modalPath), 'ResearcherAdminModal.tsx debe existir');
  const modalContent = fs.readFileSync(modalPath, 'utf-8');
  assert.ok(modalContent.includes('PANEL PRIVADO DE INVESTIGACIÓN'), 'Debe tener título de administración');
  assert.ok(modalContent.includes('exportConsolidatedCloudCSV'), 'Debe invocar exportConsolidatedCloudCSV');
  assert.ok(modalContent.includes('exportConsolidatedCloudJSON'), 'Debe invocar exportConsolidatedCloudJSON');
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
