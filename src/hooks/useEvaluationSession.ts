import { useState, useEffect, useCallback, useRef } from 'react';
import {
  EvaluationSessionData,
  EvaluationStage,
  EvaluationMode,
  ParticipantProfile,
  K1Responses,
  K2Responses,
  K3Responses,
  K4Responses,
  K5K6LikertResponses,
  QualitativeComments
} from '../types/evaluation';
import {
  generateSessionId,
  INSTRUMENT_VERSION,
  calculateObjectiveScores
} from '../services/evaluationScoring';
import {
  submitEvaluationToCloud,
  getOrCreateClientSubmissionId,
  isCloudConfigured
} from '../services/cloudSubmissionService';

const EVAL_STORAGE_KEY = 'mtc_scientific_evaluation_session_v1';

const createInitialSession = (defaultMode: EvaluationMode = 'guiado'): EvaluationSessionData => ({
  sessionId: generateSessionId(),
  instrumentVersion: INSTRUMENT_VERSION,
  evaluationMode: defaultMode,
  startedAt: new Date().toISOString(),
  consentGiven: false,
  currentStage: 'stage_0_consent',
  profile: {
    priorFamiliarityStateOfArt: 3,
    priorFamiliarityElectricTricycles: 3,
    deviceType: 'escritorio_laptop'
  },
  k1Responses: {
    q2EvidenceTypes: {
      mtc01Type: '',
      mtc18Type: '',
      mtc22Type: ''
    }
  },
  k2Responses: {
    q1LocateMetadata: {
      doi: '',
      year: '',
      docType: ''
    }
  },
  k3Responses: {
    selectedCardIds: ['MTC06', 'MTC09'],
    comparisonCriterion: 'metodologia',
    differencesText: '',
    similaritiesText: '',
    confidenceLevel: 3
  },
  k4Responses: {
    selectedCardIds: ['MTC01', 'MTC06', 'MTC43'],
    synthesisSentenceStarter: 'Estos estudios se relacionan porque...',
    synthesisText: '',
    transferSentenceStarter: 'Si tuviera que explicar este problema a otra persona, le diría que...',
    transferExplanationText: '',
    identifiedRelationshipsText: ''
  },
  k5k6Responses: {
    cardsClarity: 4,
    navigationEase: 4,
    comparisonEase: 4,
    utilityStateOfArt: 4,
    utilityTeaching: 4,
    utilityResearch: 4,
    confidenceExplaining: 4,
    perceivedMentalEffort: 3,
    synthesisDifficulty: 3,
    intentionToReuse: 4
  },
  qualitativeComments: {},
  cardsConsultedDuringSession: [],
  hintsUsed: [],
  wasAssistedByQuestion: {},
  isComplete: false,
  omittedOptionalFields: [],
  cloudSubmissionStatus: 'idle',
  cloudRetryCount: 0
});

export const useEvaluationSession = () => {
  const [session, setSession] = useState<EvaluationSessionData>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(EVAL_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.sessionId) {
            // 1. REINICIO AUTOMÁTICO PARA NUEVO PARTICIPANTE:
            // Si la evaluación anterior ya quedó completada Y confirmada en Supabase (status: 'synced'),
            // el refresco de página indica que se inicia una nueva sesión limpia para el siguiente participante.
            // Se inicializa una sesión fresca con nuevo sessionId, sin respuestas ni puntuaciones heredadas.
            if (parsed.isComplete === true && parsed.cloudSubmissionStatus === 'synced') {
              // Limpiar la sesión antigua de evaluación de localStorage
              window.localStorage.removeItem(EVAL_STORAGE_KEY);
              // También limpiar el estado de minijuegos para que el nuevo participante comience limpio
              window.localStorage.removeItem('mtc_research_game_state_v2');

              const initialMode = parsed.evaluationMode || 'guiado';
              const freshSession = createInitialSession(initialMode);
              window.localStorage.setItem(EVAL_STORAGE_KEY, JSON.stringify(freshSession));
              return freshSession;
            }

            // 2. Si la sesión guardada quedó en 'submitting' (interrupción previa),
            // recuperar a 'failed' para permitir reintento sin quedar congelada
            const safeStatus = parsed.cloudSubmissionStatus === 'submitting'
              ? 'failed'
              : (parsed.cloudSubmissionStatus || 'idle');

            // 3. Si la evaluación está pendiente de completar o falló el envío a la nube,
            // conservar intactas todas las respuestas, puntuaciones y estado del participante actual
            return {
              ...createInitialSession(parsed.evaluationMode || 'guiado'),
              ...parsed,
              cloudSubmissionStatus: safeStatus
            };
          }
        }
      }
    } catch (e) {
      console.warn('No se pudo cargar la sesión de evaluación de localStorage:', e);
    }
    return createInitialSession('guiado');
  });

  // Guardar en localStorage cada vez que la sesión cambie
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(EVAL_STORAGE_KEY, JSON.stringify(session));
      }
    } catch (e) {
      console.warn('No se pudo guardar la sesión de evaluación en localStorage:', e);
    }
  }, [session]);

  // Guardia de envío en curso para evitar dobles pulsaciones o envíos concurrentes
  const isSubmittingRef = useRef<boolean>(false);

  const setEvaluationMode = useCallback((mode: EvaluationMode) => {
    setSession(prev => ({
      ...prev,
      evaluationMode: mode
    }));
  }, []);

  const updateConsent = useCallback((consent: boolean) => {
    setSession(prev => ({
      ...prev,
      consentGiven: consent
    }));
  }, []);

  const updateProfile = useCallback((profileUpdate: Partial<ParticipantProfile>) => {
    setSession(prev => ({
      ...prev,
      profile: { ...prev.profile, ...profileUpdate }
    }));
  }, []);

  const updateK1 = useCallback((k1Update: Partial<K1Responses>) => {
    setSession(prev => ({
      ...prev,
      k1Responses: { ...prev.k1Responses, ...k1Update }
    }));
  }, []);

  const updateK2 = useCallback((k2Update: Partial<K2Responses>) => {
    setSession(prev => ({
      ...prev,
      k2Responses: { ...prev.k2Responses, ...k2Update }
    }));
  }, []);

  const updateK3 = useCallback((k3Update: Partial<K3Responses>) => {
    setSession(prev => ({
      ...prev,
      k3Responses: { ...prev.k3Responses, ...k3Update }
    }));
  }, []);

  const updateK4 = useCallback((k4Update: Partial<K4Responses>) => {
    setSession(prev => ({
      ...prev,
      k4Responses: { ...prev.k4Responses, ...k4Update }
    }));
  }, []);

  const updateK5K6 = useCallback((k5k6Update: Partial<K5K6LikertResponses>) => {
    setSession(prev => ({
      ...prev,
      k5k6Responses: { ...prev.k5k6Responses, ...k5k6Update }
    }));
  }, []);

  const updateComments = useCallback((commentsUpdate: Partial<QualitativeComments>) => {
    setSession(prev => ({
      ...prev,
      qualitativeComments: { ...prev.qualitativeComments, ...commentsUpdate }
    }));
  }, []);

  const recordHintUsed = useCallback((hintId: string, questionId: string) => {
    setSession(prev => {
      const alreadyUsed = prev.hintsUsed.includes(hintId);
      const nextHints = alreadyUsed ? prev.hintsUsed : [...prev.hintsUsed, hintId];
      return {
        ...prev,
        hintsUsed: nextHints,
        wasAssistedByQuestion: {
          ...prev.wasAssistedByQuestion,
          [questionId]: true
        }
      };
    });
  }, []);

  const setStage = useCallback((stage: EvaluationStage) => {
    setSession(prev => ({
      ...prev,
      currentStage: stage
    }));
  }, []);

  const completeEvaluation = useCallback(async () => {
    // Evitar envíos duplicados o doble pulsación mientras se transmite
    if (isSubmittingRef.current || session.cloudSubmissionStatus === 'submitting') {
      return;
    }

    // 1. Construir explícitamente el objeto de sesión completada antes del envío
    const scores = calculateObjectiveScores(session.k1Responses, session.k2Responses, session.evaluationMode);
    const subId = getOrCreateClientSubmissionId(session);
    const isConfigured = isCloudConfigured();

    const completedSession: EvaluationSessionData = {
      ...session,
      isComplete: true,
      completedAt: session.completedAt || new Date().toISOString(),
      currentStage: 'stage_complete',
      objectiveScores: scores,
      clientSubmissionId: subId,
      cloudSubmissionStatus: isConfigured ? 'submitting' : 'unconfigured'
    };

    // 2. Actualizar el estado en React (lo que dispara la persistencia en localStorage vía useEffect)
    setSession(completedSession);

    // Si la nube no está configurada, finaliza en modo local seguro
    if (!isConfigured) {
      return;
    }

    // 3. Pasar ese mismo objeto a submitEvaluationToCloud de forma garantizada
    isSubmittingRef.current = true;
    try {
      const result = await submitEvaluationToCloud(completedSession);
      setSession(prev => ({
        ...prev,
        cloudSubmissionStatus: result.status,
        cloudSubmissionTimestamp: result.serverReceivedAt || prev.cloudSubmissionTimestamp,
        cloudSubmissionError: result.error
      }));
    } catch (err) {
      setSession(prev => ({
        ...prev,
        cloudSubmissionStatus: 'failed',
        cloudSubmissionError: err instanceof Error ? err.message : String(err)
      }));
    } finally {
      isSubmittingRef.current = false;
    }
  }, [session]);

  const retryCloudSubmission = useCallback(async () => {
    // Evitar reintentos concurrentes mientras ya se está transmitiendo
    if (isSubmittingRef.current || session.cloudSubmissionStatus === 'submitting') {
      return;
    }

    // Conservar clientSubmissionId existente para garantizar estricta idempotencia
    const subId = session.clientSubmissionId && session.clientSubmissionId.trim().length >= 8
      ? session.clientSubmissionId
      : getOrCreateClientSubmissionId(session);

    const isConfigured = isCloudConfigured();

    const retryingSession: EvaluationSessionData = {
      ...session,
      clientSubmissionId: subId,
      cloudSubmissionStatus: isConfigured ? 'submitting' : 'unconfigured',
      cloudRetryCount: (session.cloudRetryCount || 0) + 1,
      cloudSubmissionError: undefined
    };

    // 1. Actualizar estado antes de enviar
    setSession(retryingSession);

    if (!isConfigured) {
      return;
    }

    // 2. Pasar el objeto explícito al servicio de envío
    isSubmittingRef.current = true;
    try {
      const result = await submitEvaluationToCloud(retryingSession);
      setSession(prev => ({
        ...prev,
        cloudSubmissionStatus: result.status,
        cloudSubmissionTimestamp: result.serverReceivedAt || prev.cloudSubmissionTimestamp,
        cloudSubmissionError: result.error
      }));
    } catch (err) {
      setSession(prev => ({
        ...prev,
        cloudSubmissionStatus: 'failed',
        cloudSubmissionError: err instanceof Error ? err.message : String(err)
      }));
    } finally {
      isSubmittingRef.current = false;
    }
  }, [session]);

  const resetEvaluation = useCallback(() => {
    isSubmittingRef.current = false;
    const fresh = createInitialSession('guiado');
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(EVAL_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Error al limpiar localStorage de evaluación:', e);
    }
    setSession(fresh);
  }, []);

  return {
    session,
    setEvaluationMode,
    updateConsent,
    updateProfile,
    updateK1,
    updateK2,
    updateK3,
    updateK4,
    updateK5K6,
    updateComments,
    recordHintUsed,
    setStage,
    completeEvaluation,
    retryCloudSubmission,
    resetEvaluation
  };
};
