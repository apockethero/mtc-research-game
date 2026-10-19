import {
  EvaluationSessionData,
  K1Responses,
  K2Responses,
  ObjectiveScoresSummary
} from '../types/evaluation';

export const INSTRUMENT_VERSION = '1.0.0-experimental';

export const generateSessionId = (): string => {
  const chars = '0123456789ABCDEF';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MTC-EVAL-${rand}`;
};

// =========================================================================
// BANCO DE PREGUNTAS Y CLAVE DE RESPUESTAS K1 (COMPRENSIÓN CONCEPTUAL)
// =========================================================================

export const K1_QUESTIONS = {
  q1CoreContribution: {
    id: 'q1CoreContribution',
    targetCardId: 'MTC09',
    prompt:
      'Aporte Principal (MTC09 - Kumar & Singh, 2018): ¿Cuál es la contribución técnica central de esta investigación en el corpus?',
    options: [
      {
        id: 'opt_a',
        text: 'Diseño mecánico y simulación dinámica multicuerpo de un mecanismo antivuelco para mitigar el riesgo de vuelco en curvas pronunciadas.',
        isCorrect: true
      },
      {
        id: 'opt_b',
        text: 'Dimensionamiento electroquímico de celdas LiFePO4 para maximizar la autonomía urbana en frío.',
        isCorrect: false
      },
      {
        id: 'opt_c',
        text: 'Estudio de mercado y análisis tarifario para mototaxis en metrópolis asiáticas.',
        isCorrect: false
      },
      {
        id: 'opt_d',
        text: 'Algoritmo de visión artificial para detección de obstáculos en conducción autónoma nivel 4.',
        isCorrect: false
      }
    ],
    explanation:
      'MTC09 se centra en el modelo multicuerpo y estabilidad dinámica de triciclos ante maniobras de giro, analizando el comportamiento antivuelco.'
  },

  q2EvidenceTypes: {
    id: 'q2EvidenceTypes',
    prompt:
      'Distinción de Tipos de Evidencia: Clasifica la naturaleza metodológica predominante de los siguientes antecedentes del corpus:',
    items: [
      {
        cardId: 'MTC01',
        authorYear: 'Pantoja et al. (2012)',
        correctType: 'simulacion_modelado',
        options: [
          { id: 'simulacion_modelado', text: 'Simulación y Modelado Numérico' },
          { id: 'prototipo_fisico', text: 'Diseño y Prototipado Físico' },
          { id: 'pruebas_experimentales', text: 'Pruebas Experimentales en Ruta' },
          { id: 'estudio_politicas', text: 'Estudio Normativo / Políticas' }
        ]
      },
      {
        cardId: 'MTC18',
        authorYear: 'Silva et al. (2021)',
        correctType: 'pruebas_experimentales',
        options: [
          { id: 'simulacion_modelado', text: 'Simulación y Modelado Numérico' },
          { id: 'prototipo_fisico', text: 'Diseño y Prototipado Físico' },
          { id: 'pruebas_experimentales', text: 'Pruebas Experimentales en Banco / Ruta' },
          { id: 'estudio_politicas', text: 'Estudio Normativo / Políticas' }
        ]
      },
      {
        cardId: 'MTC22',
        authorYear: 'García et al. (2022)',
        correctType: 'prototipo_fisico',
        options: [
          { id: 'simulacion_modelado', text: 'Simulación y Modelado Numérico' },
          { id: 'prototipo_fisico', text: 'Diseño y Prototipado Físico' },
          { id: 'pruebas_experimentales', text: 'Pruebas Experimentales en Ruta' },
          { id: 'estudio_politicas', text: 'Estudio Normativo / Políticas' }
        ]
      }
    ]
  },

  q3MethodologicalLimitation: {
    id: 'q3MethodologicalLimitation',
    targetCardId: 'MTC06',
    prompt:
      'Reconocimiento de Limitaciones Metodológicas (MTC06 - Chasis Tubular Ligero): ¿Qué limitación explícita reportan los autores?',
    options: [
      {
        id: 'opt_a',
        text: 'El análisis estructural se limitó a cargas estáticas y carece de validación experimental ante fatiga mecánica por vibraciones y baches en rutas reales.',
        isCorrect: true
      },
      {
        id: 'opt_b',
        text: 'El motor eléctrico seleccionado no admite inversión de marcha por comando electrónico.',
        isCorrect: false
      },
      {
        id: 'opt_c',
        text: 'La temperatura de los neumáticos superó el límite térmico admisible en asfalto húmedo.',
        isCorrect: false
      },
      {
        id: 'opt_d',
        text: 'El software de telemetría GPS no registró las coordenadas en túneles subterráneos.',
        isCorrect: false
      }
    ],
    explanation:
      'MTC06 advierte expresamente la ausencia de telemetría de fatiga y cargas dinámicas de baches en pavimentos irregulares.'
  },

  q4TechnicalResultVsHypothesis: {
    id: 'q4TechnicalResultVsHypothesis',
    prompt:
      'Diferenciación Epistemológica: ¿Cuál de las siguientes afirmaciones constituye un resultado técnico demostrado frente a una hipótesis o extrapolación?',
    options: [
      {
        id: 'opt_a',
        text: 'El banco dinamométrico registró una reducción del 14.2% en el consumo energético específico durante el ciclo de conducción urbano probado.',
        isCorrect: true
      },
      {
        id: 'opt_b',
        text: 'La adopción generalizada de triciclos eléctricos eliminará por completo los accidentes de tráfico en zonas periféricas.',
        isCorrect: false
      },
      {
        id: 'opt_c',
        text: 'Cualquier operador urbano preferirá un vehículo eléctrico sin importar las condiciones de financiamiento o recarga local.',
        isCorrect: false
      },
      {
        id: 'opt_d',
        text: 'Un chasis de tres ruedas construido en aluminio será intrínsecamente inmune al vuelco a cualquier velocidad.',
        isCorrect: false
      }
    ],
    explanation:
      'La opción A describe una medición cuantitativa empírica bajo condiciones delimitadas, a diferencia de las generalizaciones o hipótesis.'
  }
};

// =========================================================================
// BANCO DE PREGUNTAS Y CLAVE DE RESPUESTAS K2 (TRAZABILIDAD BIBLIOMÉTRICA)
// =========================================================================

export const K2_QUESTIONS = {
  q1LocateMetadata: {
    id: 'q1LocateMetadata',
    targetCardId: 'MTC43',
    prompt:
      'Localización de Metadatos de Fuente Primaria: Para la tarjeta MTC43 (Batería LiFePO4 y Gestión Térmica), identifica sus metadatos verificables:',
    correctAnswers: {
      doiMatch: '10.1016/j.est.2023.107892',
      year: '2023',
      docType: 'articulo_revista'
    }
  },

  q2MissingOrPendingIndicatorInterpretation: {
    id: 'q2MissingOrPendingIndicatorInterpretation',
    prompt:
      'Interpretación de Indicadores Pendientes o Ausentes: Si una tarjeta de investigación presenta su indicador de cuartil Scopus / Scimago como "NQ" (No Cuartil) o figura en estado "Pendiente de homologación", ¿cómo debe interpretarse científicamente?',
    options: [
      {
        id: 'opt_a',
        text: 'Indica que la fuente no cuenta con cuartil verificado en el índice o su homologación está pendiente; un indicador ausente o pendiente NO equivale a un cuartil confirmado y debe reportarse con cautela.',
        isCorrect: true
      },
      {
        id: 'opt_b',
        text: 'Equivale automáticamente a cuartil Q1 porque la fuente ya ha sido publicada en formato digital.',
        isCorrect: false
      },
      {
        id: 'opt_c',
        text: 'Significa con certeza que el documento contiene datos no válidos y debe ser suprimido de inmediato del estado del arte.',
        isCorrect: false
      },
      {
        id: 'opt_d',
        text: 'Demuestra que la revista tiene exactamente el mismo impacto que los proceedings de congresos internacionales.',
        isCorrect: false
      }
    ],
    explanation:
      'En rigor bibliométrico, la ausencia o estado pendiente de un indicador no puede presumirse como favorable ni equivalente a una indexación comprobada.'
  },

  q3TraceabilityVsSecondaryCitation: {
    id: 'q3TraceabilityVsSecondaryCitation',
    prompt:
      'Ruta de Acceso y Auditabilidad: ¿Por qué el modelo de tarjetas MTC exige asociar DOI directo e identificadores persistentes en lugar de aceptar citas secundarias?',
    options: [
      {
        id: 'opt_a',
        text: 'Garantiza la auditabilidad de las afirmaciones, permite acceder al texto fuente primario y previene la propagación de errores o citas circulares.',
        isCorrect: true
      },
      {
        id: 'opt_b',
        text: 'Porque el DOI es un requisito administrativo legal exigido en todas las páginas web de internet.',
        isCorrect: false
      },
      {
        id: 'opt_c',
        text: 'Para asegurar que únicamente se revisen artículos redactados en idioma inglés.',
        isCorrect: false
      },
      {
        id: 'opt_d',
        text: 'Porque los documentos sin DOI carecen de autores humanos comprobables.',
        isCorrect: false
      }
    ],
    explanation:
      'La trazabilidad científica requiere que cualquier afirmación en el estado del arte pueda ser contrastada con el documento original primario.'
  }
};

// =========================================================================
// RÚBRICA CONFIGURABLE PARA K4 (SÍNTESIS Y TRANSFERENCIA)
// =========================================================================

export const K4_EVALUATION_RUBRIC = [
  {
    criterionId: 'evidenceRelevance',
    name: '1. Relevancia de la Evidencia',
    description: 'Pertinencia de las tarjetas seleccionadas para responder a la pregunta central de investigación.',
    weight: 0.15
  },
  {
    criterionId: 'crossComparison',
    name: '2. Comparación entre Fuentes',
    description: 'Capacidad para contrastar métodos, contextos y hallazgos entre los artículos elegidos.',
    weight: 0.15
  },
  {
    criterionId: 'correctMetadataUsage',
    name: '3. Uso Correcto de Metadatos',
    description: 'Cita adecuada de autores, años, tipo de documento e indicadores bibliométricos.',
    weight: 0.10
  },
  {
    criterionId: 'limitationsRecognition',
    name: '4. Reconocimiento de Limitaciones',
    description: 'Identificación honesta de vacíos, lagunas metodológicas y restricciones de los estudios.',
    weight: 0.15
  },
  {
    criterionId: 'conceptIntegration',
    name: '5. Integración de Conceptos y Tarjetas',
    description: 'Construcción de una narrativa coherente que conecte antecedentes en lugar de resumirlos en listas aisladas.',
    weight: 0.20
  },
  {
    criterionId: 'unsupportedClaimsAbsence',
    name: '6. Ausencia de Afirmaciones no Respaldadas',
    description: 'Rigor al evitar generalizaciones o conclusiones que exceden la evidencia de las tarjetas.',
    weight: 0.15
  },
  {
    criterionId: 'explanationClarity',
    name: '7. Claridad de la Explicación (Transferencia)',
    description: 'Habilidad para explicar el estado del arte a un público no especializado sin perder precisión conceptual.',
    weight: 0.10
  }
];

// =========================================================================
// CÁLCULO REPRODUCIBLE DE PUNTUACIONES OBJETIVAS (K1 y K2)
// =========================================================================

export const calculateObjectiveScores = (
  k1: Partial<K1Responses>,
  k2: Partial<K2Responses>
): ObjectiveScoresSummary => {
  let k1Score = 0;
  const k1Max = 4;

  // K1.1
  if (k1.q1CoreContribution === 'opt_a') k1Score += 1;

  // K1.2 (Requiere que las 3 asociaciones sean correctas)
  if (
    k1.q2EvidenceTypes?.mtc01Type === 'simulacion_modelado' &&
    k1.q2EvidenceTypes?.mtc18Type === 'pruebas_experimentales' &&
    k1.q2EvidenceTypes?.mtc22Type === 'prototipo_fisico'
  ) {
    k1Score += 1;
  }

  // K1.3
  if (k1.q3MethodologicalLimitation === 'opt_a') k1Score += 1;

  // K1.4
  if (k1.q4TechnicalResultVsHypothesis === 'opt_a') k1Score += 1;

  // K2 Scores
  let k2Score = 0;
  const k2Max = 3;

  // K2.1 (DOI o año acertado)
  const meta = k2.q1LocateMetadata;
  if (
    meta &&
    (meta.doi?.includes('10.1016') || meta.doi?.includes('107892')) &&
    meta.year === '2023'
  ) {
    k2Score += 1;
  }

  // K2.2
  if (k2.q2MissingOrPendingIndicatorInterpretation === 'opt_a') k2Score += 1;

  // K2.3
  if (k2.q3TraceabilityVsSecondaryCitation === 'opt_a') k2Score += 1;

  const totalObjectiveScore = k1Score + k2Score;
  const totalObjectiveMax = k1Max + k2Max;
  const percentage = Math.round((totalObjectiveScore / totalObjectiveMax) * 100);

  return {
    k1Score,
    k1Max,
    k2Score,
    k2Max,
    totalObjectiveScore,
    totalObjectiveMax,
    percentage
  };
};

// =========================================================================
// DICCIONARIO DE VARIABLES (CODEBOOK)
// =========================================================================

export const EVALUATION_CODEBOOK = {
  instrumentVersion: INSTRUMENT_VERSION,
  pilotDomain: 'Electric motor-tricycles and light electric utility vehicles (MTC01-MTC49)',
  dimensions: {
    K1: 'Comprensión conceptual (temas centrales, evidencia, limitaciones, resultado vs hipótesis)',
    K2: 'Trazabilidad (metadatos primarios, DOI, interpretación de indicadores ausentes/pendientes)',
    K3: 'Comparación (contraste de métodos, aportes y justificación entre al menos dos tarjetas)',
    K4: 'Síntesis y transferencia (integración de al menos tres tarjetas y divulgación a no especialistas)',
    K5: 'Usabilidad percibida y utilidad (claridad, navegación, utilidad para docencia e investigación)',
    K6: 'Demanda cognitiva (esfuerzo mental percibido y dificultad de síntesis)'
  },
  likertScale: {
    0: 'No puedo valorar este aspecto',
    1: 'Totalmente en desacuerdo / Muy bajo',
    2: 'En desacuerdo / Bajo',
    3: 'Neutro / Moderado',
    4: 'De acuerdo / Alto',
    5: 'Totalmente de acuerdo / Muy alto'
  },
  scoringRules: {
    K1_max: 4,
    K2_max: 3,
    total_objective_max: 7,
    scoringNote: 'Las respuestas abiertas de K3 y K4 no se puntúan automáticamente y quedan sujetas a revisión con la rúbrica auditable de 7 criterios.'
  }
};

// =========================================================================
// EXPORTADORES A JSON Y CSV
// =========================================================================

export const exportEvaluationJSON = (session: EvaluationSessionData): void => {
  const exportPayload = {
    metadata: {
      instrumentVersion: session.instrumentVersion,
      exportedAt: new Date().toISOString(),
      disclaimer:
        'Datos recolectados con fines exploratorios para la validación del sistema de tarjetas MTC. Instrumento experimental.'
    },
    codebook: EVALUATION_CODEBOOK,
    sessionData: session
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const link = document.createElement('a');
  link.href = url;
  link.download = `mtc_eval_session_${session.sessionId}_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportEvaluationCSV = (session: EvaluationSessionData): void => {
  const headers = [
    'session_id',
    'instrument_version',
    'started_at',
    'completed_at',
    'consent_given',
    'academic_role',
    'education_level',
    'disciplinary_area',
    'prior_familiarity_state_of_art',
    'prior_familiarity_electric_tricycles',
    'device_type',
    'k1_q1_choice',
    'k1_q2_mtc01',
    'k1_q2_mtc18',
    'k1_q2_mtc22',
    'k1_q3_choice',
    'k1_q4_choice',
    'k1_score',
    'k2_q1_doi',
    'k2_q1_year',
    'k2_q1_doctype',
    'k2_q2_choice',
    'k2_q3_choice',
    'k2_score',
    'total_objective_score',
    'total_objective_max',
    'k3_card_ids',
    'k3_criterion',
    'k3_confidence',
    'k4_card_ids',
    'k5_cards_clarity',
    'k5_navigation_ease',
    'k5_comparison_ease',
    'k5_utility_state_of_art',
    'k5_utility_teaching',
    'k5_utility_research',
    'k5_confidence_explaining',
    'k6_perceived_mental_effort',
    'k6_synthesis_difficulty',
    'k5_intention_to_reuse',
    'k3_differences_len',
    'k4_synthesis_len',
    'k4_transfer_len'
  ];

  const escapeCsv = (val: string | number | boolean | undefined): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const scores = session.objectiveScores || calculateObjectiveScores(session.k1Responses, session.k2Responses);

  const row = [
    escapeCsv(session.sessionId),
    escapeCsv(session.instrumentVersion),
    escapeCsv(session.startedAt),
    escapeCsv(session.completedAt || ''),
    escapeCsv(session.consentGiven),
    escapeCsv(session.profile.academicRole || ''),
    escapeCsv(session.profile.educationLevel || ''),
    escapeCsv(session.profile.disciplinaryArea || ''),
    escapeCsv(session.profile.priorFamiliarityStateOfArt || ''),
    escapeCsv(session.profile.priorFamiliarityElectricTricycles || ''),
    escapeCsv(session.profile.deviceType || ''),
    escapeCsv(session.k1Responses.q1CoreContribution || ''),
    escapeCsv(session.k1Responses.q2EvidenceTypes?.mtc01Type || ''),
    escapeCsv(session.k1Responses.q2EvidenceTypes?.mtc18Type || ''),
    escapeCsv(session.k1Responses.q2EvidenceTypes?.mtc22Type || ''),
    escapeCsv(session.k1Responses.q3MethodologicalLimitation || ''),
    escapeCsv(session.k1Responses.q4TechnicalResultVsHypothesis || ''),
    escapeCsv(scores.k1Score),
    escapeCsv(session.k2Responses.q1LocateMetadata?.doi || ''),
    escapeCsv(session.k2Responses.q1LocateMetadata?.year || ''),
    escapeCsv(session.k2Responses.q1LocateMetadata?.docType || ''),
    escapeCsv(session.k2Responses.q2MissingOrPendingIndicatorInterpretation || ''),
    escapeCsv(session.k2Responses.q3TraceabilityVsSecondaryCitation || ''),
    escapeCsv(scores.k2Score),
    escapeCsv(scores.totalObjectiveScore),
    escapeCsv(scores.totalObjectiveMax),
    escapeCsv((session.k3Responses.selectedCardIds || []).join(';')),
    escapeCsv(session.k3Responses.comparisonCriterion || ''),
    escapeCsv(session.k3Responses.confidenceLevel || ''),
    escapeCsv((session.k4Responses.selectedCardIds || []).join(';')),
    escapeCsv(session.k5k6Responses.cardsClarity || 0),
    escapeCsv(session.k5k6Responses.navigationEase || 0),
    escapeCsv(session.k5k6Responses.comparisonEase || 0),
    escapeCsv(session.k5k6Responses.utilityStateOfArt || 0),
    escapeCsv(session.k5k6Responses.utilityTeaching || 0),
    escapeCsv(session.k5k6Responses.utilityResearch || 0),
    escapeCsv(session.k5k6Responses.confidenceExplaining || 0),
    escapeCsv(session.k5k6Responses.perceivedMentalEffort || 0),
    escapeCsv(session.k5k6Responses.synthesisDifficulty || 0),
    escapeCsv(session.k5k6Responses.intentionToReuse || 0),
    escapeCsv((session.k3Responses.differencesText || '').length),
    escapeCsv((session.k4Responses.synthesisText || '').length),
    escapeCsv((session.k4Responses.transferExplanationText || '').length)
  ];

  const csvContent = '\uFEFF' + headers.join(',') + '\n' + row.join(',') + '\n';
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const link = document.createElement('a');
  link.href = url;
  link.download = `mtc_eval_matrix_${session.sessionId}_${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
