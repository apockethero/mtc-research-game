import { useState, useEffect, useCallback } from 'react';
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
  omittedOptionalFields: []
});

export const useEvaluationSession = () => {
  const [session, setSession] = useState<EvaluationSessionData>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(EVAL_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.sessionId) {
            return {
              ...createInitialSession(parsed.evaluationMode || 'guiado'),
              ...parsed
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

  const completeEvaluation = useCallback(() => {
    setSession(prev => {
      const scores = calculateObjectiveScores(prev.k1Responses, prev.k2Responses, prev.evaluationMode);
      return {
        ...prev,
        isComplete: true,
        completedAt: new Date().toISOString(),
        currentStage: 'stage_complete',
        objectiveScores: scores
      };
    });
  }, []);

  const resetEvaluation = useCallback(() => {
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
    resetEvaluation
  };
};
