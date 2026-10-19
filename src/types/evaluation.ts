/**
 * Definiciones de tipos para el instrumento de validación científica de MTC Research Game
 * Basado en las secciones 8, 8.3-8.7 y Tablas 9 y 10 del estudio piloto MTC.
 */

export type AcademicRole =
  | 'estudiante_pregrado'
  | 'estudiante_posgrado'
  | 'docente_investigador'
  | 'profesional_industria'
  | 'otro'
  | 'prefiero_no_responder';

export type EducationLevel =
  | 'tecnico_tecnologo'
  | 'pregrado'
  | 'maestria'
  | 'doctorado'
  | 'otro'
  | 'prefiero_no_responder';

export type DisciplinaryArea =
  | 'mecanica_automotriz'
  | 'electrica_electronica'
  | 'sistemas_computacion_ia'
  | 'transporte_logistica'
  | 'ciencias_ambientales_sostenibilidad'
  | 'otra'
  | 'prefiero_no_responder';

export type DeviceType =
  | 'escritorio_laptop'
  | 'tablet'
  | 'movil'
  | 'otro';

export interface ParticipantProfile {
  academicRole: AcademicRole;
  academicRoleOther?: string;
  educationLevel: EducationLevel;
  educationLevelOther?: string;
  disciplinaryArea: DisciplinaryArea;
  disciplinaryAreaOther?: string;
  priorFamiliarityStateOfArt: number; // 1 a 5
  priorFamiliarityElectricTricycles: number; // 1 a 5
  deviceType: DeviceType;
}

// Criterio K1: Comprensión conceptual
export interface K1Responses {
  q1CoreContribution: string; // ID de opción elegida
  q2EvidenceTypes: {
    mtc01Type: string;
    mtc18Type: string;
    mtc22Type: string;
  };
  q3MethodologicalLimitation: string;
  q4TechnicalResultVsHypothesis: string;
}

// Criterio K2: Trazabilidad bibliométrica y de verificación
export interface K2Responses {
  q1LocateMetadata: {
    doi: string;
    year: string;
    docType: string;
  };
  q2MissingOrPendingIndicatorInterpretation: string;
  q3TraceabilityVsSecondaryCitation: string;
}

// Criterio K3: Comparación entre investigaciones
export interface K3Responses {
  selectedCardIds: [string, string] | [string, string, ...string[]];
  comparisonCriterion: 'metodologia' | 'contribucion' | 'alcance_aplicacion' | 'limitaciones' | 'otro';
  comparisonCriterionOther?: string;
  differencesText: string;
  similaritiesText: string;
  confidenceLevel: number; // 1 a 5
}

// Criterio K4: Síntesis y transferencia
export interface K4Responses {
  selectedCardIds: [string, string, string] | string[];
  synthesisText: string;
  transferExplanationText: string; // Explicación para no especialista
  identifiedRelationshipsText: string;
}

// Rúbrica de evaluación para K4 (Revisión por expertos/pares)
export interface K4RubricScore {
  evidenceRelevance: number; // 1 a 5
  crossComparison: number; // 1 a 5
  correctMetadataUsage: number; // 1 a 5
  limitationsRecognition: number; // 1 a 5
  conceptIntegration: number; // 1 a 5
  unsupportedClaimsAbsence: number; // 1 a 5
  explanationClarity: number; // 1 a 5
  reviewerNotes?: string;
}

// Criterios K5 (Usabilidad/Utilidad) y K6 (Demanda cognitiva) - Escala Likert 1 a 5 (0 = No puedo valorar)
export interface K5K6LikertResponses {
  cardsClarity: number; // K5: Claridad de tarjetas
  navigationEase: number; // K5: Facilidad de navegación
  comparisonEase: number; // K5: Facilidad para comparar fuentes
  utilityStateOfArt: number; // Utilidad para comprender estado del arte
  utilityTeaching: number; // Utilidad para docencia
  utilityResearch: number; // Utilidad para investigación
  confidenceExplaining: number; // Confianza al explicar el tema
  perceivedMentalEffort: number; // K6: Esfuerzo mental percibido
  synthesisDifficulty: number; // K6: Dificultad para sintetizar información
  intentionToReuse: number; // Intención de volver a usar
}

// Etapa G: Comentarios abiertos
export interface QualitativeComments {
  whatHelpedMost?: string;
  whatWasConfusing?: string;
  missingInformationInCards?: string;
  traceabilityIssuesObserved?: string;
  graphOrRouteChangesSuggested?: string;
  professionalUtilityContext?: string;
}

export type EvaluationStage =
  | 'stage_0_consent'
  | 'stage_a_profile'
  | 'stage_b_k1'
  | 'stage_c_k2'
  | 'stage_d_k3'
  | 'stage_e_k4'
  | 'stage_f_k5_k6'
  | 'stage_g_comments'
  | 'stage_review'
  | 'stage_complete';

export interface ObjectiveScoresSummary {
  k1Score: number;
  k1Max: number;
  k2Score: number;
  k2Max: number;
  totalObjectiveScore: number;
  totalObjectiveMax: number;
  percentage: number;
}

export interface EvaluationSessionData {
  sessionId: string; // Identificador aleatorio (ej. MTC-EVAL-XXXXXX)
  instrumentVersion: string; // ej. "1.0.0-experimental"
  startedAt: string; // ISO 8601
  completedAt?: string; // ISO 8601
  consentGiven: boolean;
  currentStage: EvaluationStage;
  profile: Partial<ParticipantProfile>;
  k1Responses: Partial<K1Responses>;
  k2Responses: Partial<K2Responses>;
  k3Responses: Partial<K3Responses>;
  k4Responses: Partial<K4Responses>;
  k5k6Responses: Partial<K5K6LikertResponses>;
  qualitativeComments: Partial<QualitativeComments>;
  objectiveScores?: ObjectiveScoresSummary;
  cardsConsultedDuringSession: string[]; // IDs de tarjetas consultadas
  isComplete: boolean;
  omittedOptionalFields: string[];
}
