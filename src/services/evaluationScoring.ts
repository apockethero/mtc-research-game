import {
  EvaluationSessionData,
  EvaluationMode,
  K1Responses,
  K2Responses,
  ObjectiveScoresSummary
} from '../types/evaluation';

export const INSTRUMENT_VERSION = '1.1.0-multimodal-exp';

export const generateSessionId = (): string => {
  const chars = '0123456789ABCDEF';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MTC-EVAL-${rand}`;
};

// =========================================================================
// BANCO DE PREGUNTAS K1: COMPRENDER LAS IDEAS (CON SOPORTE VISUAL Y MODALIDADES)
// =========================================================================

export const K1_QUESTIONS = {
  q1CoreContribution: {
    id: 'k1_q1',
    targetCardId: 'MTC09',
    visualAlt: 'Ilustración técnica esquemática de un vehículo de tres ruedas con diagrama de fuerzas y mecanismo de inclinación activa.',
    promptGuided:
      'Observa el dibujo técnico de la investigación MTC09: ¿Cuál es el objetivo principal del mecanismo mostrado para el vehículo?',
    promptResearch:
      'Aporte Principal (MTC09 - Kumar & Singh, 2018): A partir del modelo esquemático, ¿cuál es la contribución técnica central de esta investigación en el corpus?',
    hintId: 'hint_k1_q1',
    hintText:
      'Un mecanismo antivuelco o de inclinación ayuda a que el vehículo no pierda estabilidad ni se vuelque hacia los lados al doblar una esquina con velocidad.',
    optionsGuided: [
      {
        id: 'opt_a',
        text: 'Diseñar un sistema que ayude a que el vehículo no se vuelque ni pierda estabilidad al doblar curvas cerradas.',
        isCorrect: true
      },
      {
        id: 'opt_b',
        text: 'Probar una batería química para que el vehículo funcione en temperaturas bajo cero.',
        isCorrect: false
      },
      {
        id: 'opt_c',
        text: 'Calcular cuánto dinero deben cobrar los conductores de mototaxis por cada viaje.',
        isCorrect: false
      },
      {
        id: 'opt_d',
        text: 'Instalar cámaras con inteligencia artificial para que el vehículo maneje completamente solo.',
        isCorrect: false
      },
      {
        id: 'no_estoy_seguro',
        text: 'No estoy seguro/a.',
        isCorrect: false
      }
    ],
    optionsResearch: [
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
      },
      {
        id: 'no_estoy_seguro',
        text: 'No estoy seguro/a.',
        isCorrect: false
      }
    ]
  },

  q2EvidenceTypes: {
    id: 'k1_q2',
    promptGuided:
      '¿Cómo se hizo cada estudio? Relaciona cada investigación con la forma en que los investigadores obtuvieron sus datos:',
    promptResearch:
      'Distinción de Tipos de Evidencia: Clasifica la naturaleza metodológica predominante de los siguientes antecedentes del corpus:',
    hintId: 'hint_k1_q2',
    hintText:
      'Simulación significa probar con fórmulas o modelos en la computadora; prototipo es construir la pieza real en el taller; y pruebas en ruta es salir a manejar el vehículo para medir su desempeño.',
    items: [
      {
        cardId: 'MTC01',
        authorYear: 'MTC01 (Pantoja et al.)',
        visualAlt: 'Diagrama de computadora con mallas tridimensionales y gráficas de cálculo numérico.',
        correctType: 'simulacion_modelado',
        optionsGuided: [
          { id: 'simulacion_modelado', text: 'Simulación y cálculos en computadora' },
          { id: 'prototipo_fisico', text: 'Construcción de prototipo físico en taller' },
          { id: 'pruebas_experimentales', text: 'Pruebas de manejo reales en la calle' },
          { id: 'no_estoy_seguro', text: 'No estoy seguro/a' }
        ],
        optionsResearch: [
          { id: 'simulacion_modelado', text: 'Simulación y Modelado Numérico' },
          { id: 'prototipo_fisico', text: 'Diseño y Prototipado Físico' },
          { id: 'pruebas_experimentales', text: 'Pruebas Experimentales en Ruta' },
          { id: 'no_estoy_seguro', text: 'No estoy seguro/a' }
        ]
      },
      {
        cardId: 'MTC18',
        authorYear: 'MTC18 (Silva et al.)',
        visualAlt: 'Fotografía de banco de pruebas de motor con sensores de torque y dinamómetro de laboratorio.',
        correctType: 'pruebas_experimentales',
        optionsGuided: [
          { id: 'simulacion_modelado', text: 'Simulación y cálculos en computadora' },
          { id: 'prototipo_fisico', text: 'Construcción de prototipo físico en taller' },
          { id: 'pruebas_experimentales', text: 'Pruebas y mediciones con instrumentos de laboratorio / ruta' },
          { id: 'no_estoy_seguro', text: 'No estoy seguro/a' }
        ],
        optionsResearch: [
          { id: 'simulacion_modelado', text: 'Simulación y Modelado Numérico' },
          { id: 'prototipo_fisico', text: 'Diseño y Prototipado Físico' },
          { id: 'pruebas_experimentales', text: 'Pruebas Experimentales en Banco / Ruta' },
          { id: 'no_estoy_seguro', text: 'No estoy seguro/a' }
        ]
      },
      {
        cardId: 'MTC22',
        authorYear: 'MTC22 (García et al.)',
        visualAlt: 'Esquema de ensamble mecánico del chasis con motor acoplado y componentes físicos de transmisión.',
        correctType: 'prototipo_fisico',
        optionsGuided: [
          { id: 'simulacion_modelado', text: 'Simulación y cálculos en computadora' },
          { id: 'prototipo_fisico', text: 'Diseño y fabricación física del mecanismo' },
          { id: 'pruebas_experimentales', text: 'Pruebas y mediciones en laboratorio' },
          { id: 'no_estoy_seguro', text: 'No estoy seguro/a' }
        ],
        optionsResearch: [
          { id: 'simulacion_modelado', text: 'Simulación y Modelado Numérico' },
          { id: 'prototipo_fisico', text: 'Diseño y Prototipado Físico' },
          { id: 'pruebas_experimentales', text: 'Pruebas Experimentales en Ruta' },
          { id: 'no_estoy_seguro', text: 'No estoy seguro/a' }
        ]
      }
    ]
  },

  q3MethodologicalLimitation: {
    id: 'k1_q3',
    targetCardId: 'MTC06',
    visualAlt: 'Estructura tubular soldada de acero para el chasis de un triciclo con flechas de carga estática.',
    promptGuided:
      'Límites del estudio (MTC06 - Chasis Tubular): Los propios autores explican qué le faltó probar a su chasis. ¿Cuál es ese límite?',
    promptResearch:
      'Reconocimiento de Limitaciones Metodológicas (MTC06 - Chasis Tubular Ligero): ¿Qué limitación explícita reportan los autores en su validación estructural?',
    hintId: 'hint_k1_q3',
    hintText:
      'Una limitación es un aspecto que el experimento no alcanzó a probar; por ejemplo, si el chasis aguantó quieto pero no se probó pasando por baches reales a alta velocidad.',
    optionsGuided: [
      {
        id: 'opt_a',
        text: 'Solo se probó con el vehículo quieto (cargas estáticas), pero no se probó cómo resiste los baches, vibraciones y huecos de calles reales.',
        isCorrect: true
      },
      {
        id: 'opt_b',
        text: 'El motor eléctrico no tenía botón para dar marcha atrás.',
        isCorrect: false
      },
      {
        id: 'opt_c',
        text: 'Las llantas se recalentaron cuando llovió.',
        isCorrect: false
      },
      {
        id: 'opt_d',
        text: 'El GPS del celular no funcionó dentro de túneles.',
        isCorrect: false
      },
      {
        id: 'no_estoy_seguro',
        text: 'No estoy seguro/a.',
        isCorrect: false
      }
    ],
    optionsResearch: [
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
      },
      {
        id: 'no_estoy_seguro',
        text: 'No estoy seguro/a.',
        isCorrect: false
      }
    ]
  },

  q4TechnicalResultVsHypothesis: {
    id: 'k1_q4',
    promptGuided:
      'Dato medido vs Opinión o Suposición: ¿Cuál de las siguientes frases es un dato real comprobado con instrumentos y no una simple suposición?',
    promptResearch:
      'Diferenciación Epistemológica: ¿Cuál de las siguientes afirmaciones constituye un resultado técnico demostrado frente a una hipótesis o extrapolación?',
    hintId: 'hint_k1_q4',
    hintText:
      'Un resultado técnico comprobado tiene números exactos y mediciones claras (por ejemplo, reducir el consumo un 14.2% medido en laboratorio). Una suposición usa palabras como "siempre", "eliminará por completo" o "todos preferirán".',
    optionsGuided: [
      {
        id: 'opt_a',
        text: 'En el banco de pruebas, el motor gastó un 14.2% menos de energía durante el recorrido de prueba medido.',
        isCorrect: true
      },
      {
        id: 'opt_b',
        text: 'Usar triciclos eléctricos hará que desaparezcan todos los accidentes de tránsito en las ciudades.',
        isCorrect: false
      },
      {
        id: 'opt_c',
        text: 'Todos los choferes del país van a preferir pasarse a vehículos eléctricos sin dudarlo.',
        isCorrect: false
      },
      {
        id: 'opt_d',
        text: 'Cualquier vehículo de tres ruedas con chasis de aluminio nunca se va a volcar a ninguna velocidad.',
        isCorrect: false
      },
      {
        id: 'no_estoy_seguro',
        text: 'No estoy seguro/a.',
        isCorrect: false
      }
    ],
    optionsResearch: [
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
      },
      {
        id: 'no_estoy_seguro',
        text: 'No estoy seguro/a.',
        isCorrect: false
      }
    ]
  }
};

// =========================================================================
// BANCO DE PREGUNTAS K2: COMPROBAR LA INFORMACIÓN (TRAZABILIDAD)
// =========================================================================

export const K2_QUESTIONS = {
  q1LocateMetadata: {
    id: 'k2_q1',
    targetCardId: 'MTC43',
    visualAlt: 'Ficha bibliográfica y técnica de MTC43 mostrando metadatos de publicación y celdas LiFePO4.',
    promptGuided:
      'Comprobación de la fuente (MTC43): En la ficha de esta investigación sobre baterías de litio, encuentra los datos que demuestran de dónde proviene el estudio:',
    promptResearch:
      'Localización de Metadatos de Fuente Primaria: Para la tarjeta MTC43 (Batería LiFePO4 y Gestión Térmica), identifica sus metadatos verificables:',
    hintId: 'hint_k2_q1',
    hintText:
      'El DOI es como el número de documento de identidad del artículo científico en internet (suele empezar con 10.1016...). El año indica cuándo se publicó.',
    correctAnswers: {
      doiMatch: '10.1016/j.est.2023.107892',
      year: '2023',
      docType: 'articulo_revista'
    }
  },

  q2MissingOrPendingIndicatorInterpretation: {
    id: 'k2_q2',
    promptGuided:
      '¿Qué significa si falta un dato de calidad? Si una tarjeta tiene su indicador de calidad como "NQ" (Sin Cuartil) o dice "Pendiente de comprobación", ¿cómo debemos interpretarlo correctamente?',
    promptResearch:
      'Interpretación de Indicadores Pendientes o Ausentes: Si una tarjeta de investigación presenta su indicador de cuartil Scopus / Scimago como "NQ" (No Cuartil) o figura en estado "Pendiente de homologación", ¿cómo debe interpretarse científicamente?',
    hintId: 'hint_k2_q2',
    hintText:
      'Que un dato no esté confirmado no significa automáticamente que sea bueno ni que sea falso; significa que no tenemos la prueba todavía y debemos ser prudentes.',
    optionsGuided: [
      {
        id: 'opt_a',
        text: 'Significa que todavía no se ha confirmado su categoría oficial en la base de datos; por tanto, no podemos asegurar que sea de alta calidad hasta comprobarlo.',
        isCorrect: true
      },
      {
        id: 'opt_b',
        text: 'Significa que de seguro es de la más alta calidad mundial porque está en internet.',
        isCorrect: false
      },
      {
        id: 'opt_c',
        text: 'Significa que el estudio es falso y debemos tirarlo a la basura de inmediato.',
        isCorrect: false
      },
      {
        id: 'opt_d',
        text: 'Significa que todos los artículos de congresos son iguales sin importar la revista.',
        isCorrect: false
      },
      {
        id: 'no_estoy_seguro',
        text: 'No estoy seguro/a.',
        isCorrect: false
      }
    ],
    optionsResearch: [
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
      },
      {
        id: 'no_estoy_seguro',
        text: 'No estoy seguro/a.',
        isCorrect: false
      }
    ]
  },

  q3TraceabilityVsSecondaryCitation: {
    id: 'k2_q3',
    promptGuided:
      '¿Por qué es importante tener el enlace directo (DOI) a la fuente original en lugar de confiar en rumores o citas de segunda mano?',
    promptResearch:
      'Ruta de Acceso y Auditabilidad: ¿Por qué el modelo de tarjetas MTC exige asociar DOI directo e identificadores persistentes en lugar de aceptar citas secundarias?',
    hintId: 'hint_k2_q3',
    hintText:
      'Ir a la fuente directa permite comprobar con tus propios ojos lo que realmente escribieron los autores, evitando el "teléfono descompuesto" de internet.',
    optionsGuided: [
      {
        id: 'opt_a',
        text: 'Porque permite ir directo al documento original, comprobar que los datos no fueron cambiados y evitar rumores o errores copiados de otros.',
        isCorrect: true
      },
      {
        id: 'opt_b',
        text: 'Porque la ley de tránsito exige tener enlaces DOI en todos los carros eléctricos.',
        isCorrect: false
      },
      {
        id: 'opt_c',
        text: 'Para obligar a que todo el mundo hable solo en inglés.',
        isCorrect: false
      },
      {
        id: 'opt_d',
        text: 'Porque las computadoras no saben leer si no hay un enlace.',
        isCorrect: false
      },
      {
        id: 'no_estoy_seguro',
        text: 'No estoy seguro/a.',
        isCorrect: false
      }
    ],
    optionsResearch: [
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
      },
      {
        id: 'no_estoy_seguro',
        text: 'No estoy seguro/a.',
        isCorrect: false
      }
    ]
  }
};

// =========================================================================
// RÚBRICA CONFIGURABLE DE 7 CRITERIOS AUDITABLES PARA K4
// =========================================================================

export const K4_EVALUATION_RUBRIC = [
  {
    criterionId: 'evidenceRelevance',
    name: '1. Relevancia de la Evidencia',
    description: 'Pertinencia de las tarjetas seleccionadas para responder al problema técnico planteado.',
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
    description: 'Mención adecuada de autores, años e identificación de la tarjeta.',
    weight: 0.10
  },
  {
    criterionId: 'limitationsRecognition',
    name: '4. Reconocimiento de Limitaciones',
    description: 'Identificación honesta de vacíos, restricciones técnicas y aspectos no resueltos.',
    weight: 0.15
  },
  {
    criterionId: 'conceptIntegration',
    name: '5. Integración de Conceptos y Tarjetas',
    description: 'Construcción de una narrativa coherente que conecte antecedentes en lugar de listarlos aisladamente.',
    weight: 0.20
  },
  {
    criterionId: 'unsupportedClaimsAbsence',
    name: '6. Ausencia de Afirmaciones no Respaldadas',
    description: 'Rigor al evitar generalizaciones o conclusiones exageradas que exceden los datos de las tarjetas.',
    weight: 0.15
  },
  {
    criterionId: 'explanationClarity',
    name: '7. Claridad de la Explicación (Transferencia)',
    description: 'Habilidad para explicar la idea central a un público no especializado sin perder rigor conceptual.',
    weight: 0.10
  }
];

// Frases incompletas guía para K4 (Sentence Starters)
export const K4_GUIDED_SENTENCE_STARTERS = {
  synthesis: [
    'Estos estudios se relacionan porque...',
    'Al comparar estas investigaciones, nos dimos cuenta de que...',
    'Lo que a un estudio le falta en pruebas es completado por el otro porque...'
  ],
  transfer: [
    'Si tuviera que explicar este problema a una persona de mi barrio o familia, le diría que...',
    'Para que un transportista entienda por qué es importante este estudio, le explicaría que...',
    'El problema técnico más importante que estos ingenieros quieren resolver es...'
  ]
};

// =========================================================================
// CÁLCULO DE PUNTUACIONES OBJETIVAS (K1 Y K2)
// =========================================================================

export const calculateObjectiveScores = (
  k1: Partial<K1Responses>,
  k2: Partial<K2Responses>,
  mode: EvaluationMode = 'investigacion'
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

  // K2.1 (DOI o año)
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
    percentage,
    modeScored: mode
  };
};

// =========================================================================
// DICCIONARIO DE VARIABLES (CODEBOOK)
// =========================================================================

export const EVALUATION_CODEBOOK = {
  instrumentVersion: INSTRUMENT_VERSION,
  pilotDomain: 'Electric motor-tricycles and light electric utility vehicles (MTC01-MTC49)',
  modalities: {
    guiado: 'Modalidad guiada con lenguaje cotidiano, ayudas visuales y pistas opcionales para público general, niños y adolescentes.',
    investigacion: 'Modalidad de investigación con rigor metodológico, metadatos bibliométricos y redacción académica para investigadores y docentes.'
  },
  dimensions: {
    K1: 'K1: Comprender las ideas (Comprensión conceptual: aportes, tipos de evidencia, limitaciones y resultado vs hipótesis)',
    K2: 'K2: Comprobar la información (Trazabilidad y verificación: metadatos primarios, DOI y tratamiento de indicadores ausentes/pendientes)',
    K3: 'K3: Comparar dos estudios (Comparación crítica: contraste de métodos y diferencias entre dos tarjetas)',
    K4: 'K4: Conectar las ideas (Síntesis y transferencia: integración de tres tarjetas y divulgación hacia público no especializado)',
    K5: 'K5: Facilidad de uso (Usabilidad percibida: claridad, navegación y utilidad en docencia/investigación)',
    K6: 'K6: Esfuerzo y dificultad (Demanda cognitiva: carga mental y dificultad percibida de síntesis)'
  },
  likertScale: {
    0: 'No puedo valorar este aspecto / No sé',
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
    scoringNote: 'Las opciones "No estoy seguro/a" se registran explícitamente y no se tratan como datos perdidos. Las respuestas abiertas de K3 y K4 se evalúan mediante la rúbrica auditable de 7 criterios.'
  },
  ethicalSafeguard: 'La aplicación formal de este instrumento con niños o adolescentes requiere autorización de comités de ética institucionales y consentimiento informado de padres/tutores legales.'
};

// =========================================================================
// EXPORTADORES A JSON Y CSV
// =========================================================================

export const exportEvaluationJSON = (session: EvaluationSessionData): void => {
  const exportPayload = {
    metadata: {
      instrumentVersion: session.instrumentVersion,
      evaluationMode: session.evaluationMode,
      exportedAt: new Date().toISOString(),
      disclaimer:
        'Datos recolectados con fines exploratorios para la validación del sistema de tarjetas MTC. Instrumento experimental multimodal.'
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
  link.download = `mtc_eval_${session.evaluationMode}_${session.sessionId}_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportEvaluationCSV = (session: EvaluationSessionData): void => {
  const headers = [
    'session_id',
    'instrument_version',
    'evaluation_mode',
    'started_at',
    'completed_at',
    'consent_given',
    'academic_role',
    'education_level',
    'disciplinary_area',
    'prior_familiarity_state_of_art',
    'prior_familiarity_electric_tricycles',
    'device_type',
    'hints_count',
    'hints_used',
    'k1_q1_choice',
    'k1_q1_assisted',
    'k1_q2_mtc01',
    'k1_q2_mtc18',
    'k1_q2_mtc22',
    'k1_q2_assisted',
    'k1_q3_choice',
    'k1_q3_assisted',
    'k1_q4_choice',
    'k1_q4_assisted',
    'k1_score',
    'k2_q1_doi',
    'k2_q1_year',
    'k2_q1_doctype',
    'k2_q1_assisted',
    'k2_q2_choice',
    'k2_q2_assisted',
    'k2_q3_choice',
    'k2_q3_assisted',
    'k2_score',
    'total_objective_score',
    'total_objective_max',
    'k3_card_ids',
    'k3_criterion',
    'k3_confidence',
    'k4_card_ids',
    'k4_synthesis_starter',
    'k4_transfer_starter',
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

  const scores =
    session.objectiveScores ||
    calculateObjectiveScores(session.k1Responses, session.k2Responses, session.evaluationMode);

  const row = [
    escapeCsv(session.sessionId),
    escapeCsv(session.instrumentVersion),
    escapeCsv(session.evaluationMode),
    escapeCsv(session.startedAt),
    escapeCsv(session.completedAt || ''),
    escapeCsv(session.consentGiven),
    escapeCsv(session.profile.academicRole || ''),
    escapeCsv(session.profile.educationLevel || ''),
    escapeCsv(session.profile.disciplinaryArea || ''),
    escapeCsv(session.profile.priorFamiliarityStateOfArt || ''),
    escapeCsv(session.profile.priorFamiliarityElectricTricycles || ''),
    escapeCsv(session.profile.deviceType || ''),
    escapeCsv(session.hintsUsed?.length || 0),
    escapeCsv((session.hintsUsed || []).join(';')),
    escapeCsv(session.k1Responses.q1CoreContribution || ''),
    escapeCsv(Boolean(session.wasAssistedByQuestion?.['k1_q1'])),
    escapeCsv(session.k1Responses.q2EvidenceTypes?.mtc01Type || ''),
    escapeCsv(session.k1Responses.q2EvidenceTypes?.mtc18Type || ''),
    escapeCsv(session.k1Responses.q2EvidenceTypes?.mtc22Type || ''),
    escapeCsv(Boolean(session.wasAssistedByQuestion?.['k1_q2'])),
    escapeCsv(session.k1Responses.q3MethodologicalLimitation || ''),
    escapeCsv(Boolean(session.wasAssistedByQuestion?.['k1_q3'])),
    escapeCsv(session.k1Responses.q4TechnicalResultVsHypothesis || ''),
    escapeCsv(Boolean(session.wasAssistedByQuestion?.['k1_q4'])),
    escapeCsv(scores.k1Score),
    escapeCsv(session.k2Responses.q1LocateMetadata?.doi || ''),
    escapeCsv(session.k2Responses.q1LocateMetadata?.year || ''),
    escapeCsv(session.k2Responses.q1LocateMetadata?.docType || ''),
    escapeCsv(Boolean(session.wasAssistedByQuestion?.['k2_q1'])),
    escapeCsv(session.k2Responses.q2MissingOrPendingIndicatorInterpretation || ''),
    escapeCsv(Boolean(session.wasAssistedByQuestion?.['k2_q2'])),
    escapeCsv(session.k2Responses.q3TraceabilityVsSecondaryCitation || ''),
    escapeCsv(Boolean(session.wasAssistedByQuestion?.['k2_q3'])),
    escapeCsv(scores.k2Score),
    escapeCsv(scores.totalObjectiveScore),
    escapeCsv(scores.totalObjectiveMax),
    escapeCsv((session.k3Responses.selectedCardIds || []).join(';')),
    escapeCsv(session.k3Responses.comparisonCriterion || ''),
    escapeCsv(session.k3Responses.confidenceLevel || ''),
    escapeCsv((session.k4Responses.selectedCardIds || []).join(';')),
    escapeCsv(session.k4Responses.synthesisSentenceStarter || ''),
    escapeCsv(session.k4Responses.transferSentenceStarter || ''),
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
  link.download = `mtc_eval_${session.evaluationMode}_matrix_${session.sessionId}_${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
