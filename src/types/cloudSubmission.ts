import { EvaluationSessionData } from './evaluation';

export type CloudSubmissionStatus =
  | 'idle'
  | 'submitting'
  | 'synced'
  | 'failed'
  | 'offline_saved'
  | 'unconfigured';

/**
 * Payload estructurado para la función de ingesta centralizada de evaluaciones.
 * Se transmite a la Supabase Edge Function mediante POST seguro.
 */
export interface CloudEvaluationPayload {
  clientSubmissionId: string; // Token de idempotencia único para prevenir duplicados
  sessionId: string; // Identificador de sesión aleatorio (ej. MTC-EVAL-XXXXXX)
  instrumentVersion: string; // Versión del instrumento científico
  evaluationMode: 'guiado' | 'investigacion';
  startedAt: string; // ISO 8601
  completedAt: string; // ISO 8601
  clientSentAt: string; // ISO 8601 del momento de transmisión
  consentGiven: boolean; // Obligatorio: debe ser true
  consentTimestamp: string; // Momento en que el participante otorgó el consentimiento
  profile: EvaluationSessionData['profile'];
  k1Responses: EvaluationSessionData['k1Responses'];
  k2Responses: EvaluationSessionData['k2Responses'];
  k3Responses: EvaluationSessionData['k3Responses'];
  k4Responses: EvaluationSessionData['k4Responses'];
  k5k6Responses: EvaluationSessionData['k5k6Responses'];
  qualitativeComments: EvaluationSessionData['qualitativeComments'];
  objectiveScores?: EvaluationSessionData['objectiveScores'];
  telemetry: {
    cardsConsulted: string[];
    hintsUsed: string[];
    wasAssistedByQuestion: Record<string, boolean>;
    deviceType?: string;
    durationSeconds?: number;
  };
  isComplete: boolean;
}

/**
 * Respuesta devuelta por la función de servidor al registrar la evaluación.
 */
export interface CloudSubmissionResponse {
  success: boolean;
  sessionId: string;
  clientSubmissionId: string;
  serverReceivedAt: string;
  status: 'received' | 'already_received';
  message: string;
}

/**
 * Registro de evaluación almacenado en PostgreSQL para el panel del investigador.
 */
export interface ResearcherEvaluationRecord {
  id: string;
  session_id: string;
  client_submission_id: string;
  instrument_version: string;
  evaluation_mode: 'guiado' | 'investigacion';
  started_at: string;
  completed_at: string;
  server_received_at: string;
  consent_given: boolean;
  consent_timestamp: string;
  participant_profile: EvaluationSessionData['profile'];
  k1_responses: EvaluationSessionData['k1Responses'];
  k2_responses: EvaluationSessionData['k2Responses'];
  k3_responses: EvaluationSessionData['k3Responses'];
  k4_responses: EvaluationSessionData['k4Responses'];
  k5k6_responses: EvaluationSessionData['k5k6Responses'];
  qualitative_comments: EvaluationSessionData['qualitativeComments'];
  objective_scores: EvaluationSessionData['objectiveScores'];
  k1_score: number | null;
  k2_score: number | null;
  total_objective_score: number | null;
  percentage: number | null;
  telemetry: {
    cardsConsulted?: string[];
    hintsUsed?: string[];
    wasAssistedByQuestion?: Record<string, boolean>;
    deviceType?: string;
    durationSeconds?: number;
  };
  is_complete: boolean;
  submission_status: 'received' | 'processed' | 'flagged';
  notification_sent: boolean;
  notification_sent_at?: string | null;
}

/**
 * Métricas agregadas para el panel del investigador.
 */
export interface ResearcherMetricsSummary {
  totalEvaluations: number;
  guidedCount: number;
  researchCount: number;
  completedCount: number;
  averageTotalScore: number;
  averagePercentage: number;
  firstReceivedAt?: string;
  lastReceivedAt?: string;
  evaluationsByDay: Record<string, number>;
}
