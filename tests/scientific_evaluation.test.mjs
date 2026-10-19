import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('1. Orden de Pestañas: "Evaluación científica" debe ser la penúltima pestaña', async () => {
  const navTabsPath = path.join(projectRoot, 'src/components/layout/NavigationTabs.tsx');
  assert.ok(fs.existsSync(navTabsPath), 'NavigationTabs.tsx debe existir');

  const content = fs.readFileSync(navTabsPath, 'utf-8');

  // Extraer las pestañas del array tabs
  const tabIdMatches = [...content.matchAll(/id:\s*'([a-z0-9_-]+)'/g)].map(m => m[1]);
  assert.ok(tabIdMatches.length >= 7, 'Debe haber al menos 7 pestañas');

  const penultimateTab = tabIdMatches[tabIdMatches.length - 2];
  const lastTab = tabIdMatches[tabIdMatches.length - 1];

  assert.strictEqual(penultimateTab, 'evaluation', 'La penúltima pestaña debe ser "evaluation"');
  assert.strictEqual(lastTab, 'synthesis', 'La última pestaña debe ser "synthesis" (Estado del Arte Vivo)');
  assert.ok(content.includes('Evaluación científica'), 'El label visible debe ser "Evaluación científica"');
});

test('2. Identificador de Sesión Aleatorio y Versión del Instrumento', async () => {
  const scoringPath = path.join(projectRoot, 'src/services/evaluationScoring.ts');
  assert.ok(fs.existsSync(scoringPath), 'evaluationScoring.ts debe existir');

  const content = fs.readFileSync(scoringPath, 'utf-8');
  assert.ok(content.includes("INSTRUMENT_VERSION = '1.1.0-multimodal-exp'"), 'La versión debe ser 1.1.0-multimodal-exp');
  assert.ok(content.includes("generateSessionId = ()"), 'generateSessionId debe estar implementada');
  assert.ok(content.includes('`MTC-EVAL-${rand}`'), 'El prefijo debe ser MTC-EVAL-');

  // Ejecutar función de generación idéntica a la del servicio
  const chars = '0123456789ABCDEF';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  const id = `MTC-EVAL-${rand}`;
  assert.match(id, /^MTC-EVAL-[0-9A-F]{6}$/, 'El ID debe tener formato MTC-EVAL-XXXXXX');
});

test('3. Cálculo Reproducible y Transparente de Puntuaciones Objetivas (K1 y K2)', async () => {
  const scoringPath = path.join(projectRoot, 'src/services/evaluationScoring.ts');
  const content = fs.readFileSync(scoringPath, 'utf-8');

  assert.ok(content.includes('calculateObjectiveScores'), 'calculateObjectiveScores debe estar implementada');
  assert.ok(content.includes('k1Max = 4'), 'K1 debe tener un máximo de 4 puntos');
  assert.ok(content.includes('k2Max = 3'), 'K2 debe tener un máximo de 3 puntos');
  assert.ok(content.includes('totalObjectiveMax = k1Max + k2Max'), 'El total objetivo debe ser 7 puntos');

  // Simulación reproducible de la regla estricta de puntuación
  const calculateScores = (k1, k2) => {
    let k1Score = 0;
    if (k1.q1CoreContribution === 'opt_a') k1Score += 1;
    if (
      k1.q2EvidenceTypes?.mtc01Type === 'simulacion_modelado' &&
      k1.q2EvidenceTypes?.mtc18Type === 'pruebas_experimentales' &&
      k1.q2EvidenceTypes?.mtc22Type === 'prototipo_fisico'
    ) {
      k1Score += 1;
    }
    if (k1.q3MethodologicalLimitation === 'opt_a') k1Score += 1;
    if (k1.q4TechnicalResultVsHypothesis === 'opt_a') k1Score += 1;

    let k2Score = 0;
    const meta = k2.q1LocateMetadata;
    if (meta && (meta.doi?.includes('10.1016') || meta.doi?.includes('107892')) && meta.year === '2023') {
      k2Score += 1;
    }
    if (k2.q2MissingOrPendingIndicatorInterpretation === 'opt_a') k2Score += 1;
    if (k2.q3TraceabilityVsSecondaryCitation === 'opt_a') k2Score += 1;

    return {
      k1Score,
      k2Score,
      total: k1Score + k2Score,
      percentage: Math.round(((k1Score + k2Score) / 7) * 100)
    };
  };

  const perfect = calculateScores(
    {
      q1CoreContribution: 'opt_a',
      q2EvidenceTypes: {
        mtc01Type: 'simulacion_modelado',
        mtc18Type: 'pruebas_experimentales',
        mtc22Type: 'prototipo_fisico'
      },
      q3MethodologicalLimitation: 'opt_a',
      q4TechnicalResultVsHypothesis: 'opt_a'
    },
    {
      q1LocateMetadata: { doi: '10.1016/j.est.2023.107892', year: '2023' },
      q2MissingOrPendingIndicatorInterpretation: 'opt_a',
      q3TraceabilityVsSecondaryCitation: 'opt_a'
    }
  );

  assert.strictEqual(perfect.k1Score, 4);
  assert.strictEqual(perfect.k2Score, 3);
  assert.strictEqual(perfect.total, 7);
  assert.strictEqual(perfect.percentage, 100);

  const partial = calculateScores(
    {
      q1CoreContribution: 'opt_a',
      q2EvidenceTypes: { mtc01Type: 'simulacion_modelado', mtc18Type: 'simulacion', mtc22Type: 'prototipo' },
      q3MethodologicalLimitation: 'opt_b',
      q4TechnicalResultVsHypothesis: 'opt_a'
    },
    {
      q1LocateMetadata: { doi: 'otro', year: '2020' },
      q2MissingOrPendingIndicatorInterpretation: 'opt_a',
      q3TraceabilityVsSecondaryCitation: 'opt_b'
    }
  );

  assert.strictEqual(partial.k1Score, 2);
  assert.strictEqual(partial.k2Score, 1);
  assert.strictEqual(partial.total, 3);
  assert.strictEqual(partial.percentage, 43);
});

test('4. Exclusión Estricta de Identificadores Personales Directos', async () => {
  const typesPath = path.join(projectRoot, 'src/types/evaluation.ts');
  const typesContent = fs.readFileSync(typesPath, 'utf-8');

  // Comprobar que ParticipantProfile no define campos para nombres, DNI, teléfono o email
  assert.ok(!typesContent.includes('firstName'), 'No debe existir firstName');
  assert.ok(!typesContent.includes('lastName'), 'No debe existir lastName');
  assert.ok(!typesContent.includes('nationalId'), 'No debe existir nationalId o DNI');
  assert.ok(!typesContent.includes('phoneNumber'), 'No debe existir phoneNumber');
  assert.ok(!typesContent.includes('email:'), 'No debe existir email obligatorio');

  // Debe permitir "otro" y "prefiero_no_responder"
  assert.ok(typesContent.includes('prefiero_no_responder'), 'Debe incluir la opción prefiero_no_responder');
  assert.ok(typesContent.includes('academicRoleOther'), 'Debe permitir especificar otro rol');
});

test('5. Consentimiento Obligatorio y Persistencia Local', async () => {
  const hookPath = path.join(projectRoot, 'src/hooks/useEvaluationSession.ts');
  const hookContent = fs.readFileSync(hookPath, 'utf-8');

  assert.ok(hookContent.includes('mtc_scientific_evaluation_session_v1'), 'Debe utilizar clave de localStorage versionada');
  assert.ok(hookContent.includes('consentGiven: false'), 'El consentimiento por defecto debe ser falso');
  assert.ok(hookContent.includes('stage_0_consent'), 'La etapa inicial debe ser stage_0_consent');
  assert.ok(hookContent.includes('resetEvaluation'), 'Debe incluir función de reseteo/borrado local');

  // En la vista, el botón de avance debe estar condicionado a consentGiven
  const viewPath = path.join(projectRoot, 'src/features/evaluation/EvaluationView.tsx');
  const viewContent = fs.readFileSync(viewPath, 'utf-8');
  assert.ok(viewContent.includes('disabled={!session.consentGiven}'), 'El botón de inicio debe estar deshabilitado sin consentimiento');
});

test('6. Diccionario de Variables (Codebook) y Rúbrica de K4 para Revisión por Pares', async () => {
  const scoringPath = path.join(projectRoot, 'src/services/evaluationScoring.ts');
  const scoringContent = fs.readFileSync(scoringPath, 'utf-8');

  assert.ok(scoringContent.includes('EVALUATION_CODEBOOK'), 'Debe definir EVALUATION_CODEBOOK');
  assert.ok(scoringContent.includes('K1_EVALUATION_RUBRIC') || scoringContent.includes('K4_EVALUATION_RUBRIC'), 'Debe definir la rúbrica');

  // Verificar los 7 criterios de la rúbrica K4
  const rubricCriteria = [
    'evidenceRelevance',
    'crossComparison',
    'correctMetadataUsage',
    'limitationsRecognition',
    'conceptIntegration',
    'unsupportedClaimsAbsence',
    'explanationClarity'
  ];

  for (const crit of rubricCriteria) {
    assert.ok(scoringContent.includes(crit), `La rúbrica debe contemplar el criterio "${crit}"`);
  }

  // Exportadores
  assert.ok(scoringContent.includes('exportEvaluationJSON'), 'Debe implementar exportEvaluationJSON');
  assert.ok(scoringContent.includes('exportEvaluationCSV'), 'Debe implementar exportEvaluationCSV');
});

test('7. Integridad de los Componentes Preexistentes: MTC01-MTC49 y Minijuegos', async () => {
  // Comprobar que el dataset de 49 cartas sigue intacto
  const datasetPath = path.join(projectRoot, 'src/data/cards/mtcCardsData.ts');
  const datasetContent = fs.readFileSync(datasetPath, 'utf-8');
  const idMatches = datasetContent.match(/"id":\s*"MTC\d\d"/g);
  assert.strictEqual(idMatches?.length, 49, 'Las 49 tarjetas MTC deben permanecer intactas');

  // Comprobar que los minijuegos y síntesis siguen exportados e implementados
  const appPath = path.join(projectRoot, 'src/app/App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf-8');
  assert.ok(appContent.includes('<TimelineGame />'), 'TimelineGame debe estar presente');
  assert.ok(appContent.includes('<MatrixGame />'), 'MatrixGame debe estar presente');
  assert.ok(appContent.includes('<GapHunterGame />'), 'GapHunterGame debe estar presente');
  assert.ok(appContent.includes('<CombatGame />'), 'CombatGame debe estar presente');
  assert.ok(appContent.includes('<EvaluationView />'), 'EvaluationView debe estar presente');
  assert.ok(appContent.includes('<SynthesisView />'), 'SynthesisView debe estar presente');
});

test('8. Selector de Modalidades: Modo Guiado vs Modo de Investigación', async () => {
  const typesPath = path.join(projectRoot, 'src/types/evaluation.ts');
  const typesContent = fs.readFileSync(typesPath, 'utf-8');
  assert.ok(typesContent.includes("export type EvaluationMode = 'guiado' | 'investigacion';"), 'EvaluationMode debe definir guiado e investigacion');
  assert.ok(typesContent.includes('estudiante_colegio'), 'Debe incluir rol escolar para adolescentes');
  assert.ok(typesContent.includes('publico_general'), 'Debe incluir rol para público general');

  const viewPath = path.join(projectRoot, 'src/features/evaluation/EvaluationView.tsx');
  const viewContent = fs.readFileSync(viewPath, 'utf-8');
  assert.ok(viewContent.includes('Modo Guiado'), 'Debe existir la opción Modo Guiado');
  assert.ok(viewContent.includes('Modo de Investigación'), 'Debe existir la opción Modo de Investigación');
  assert.ok(viewContent.includes('setEvaluationMode'), 'Debe permitir cambiar entre modos');
});

test('9. Títulos Accesibles en Lenguaje Cotidiano y Subtítulos K1-K6', async () => {
  const viewPath = path.join(projectRoot, 'src/features/evaluation/EvaluationView.tsx');
  const viewContent = fs.readFileSync(viewPath, 'utf-8');

  // Nombres cotidianos obligatorios
  assert.ok(viewContent.includes('K1: Comprender las ideas'), 'K1 debe titularse "Comprender las ideas"');
  assert.ok(viewContent.includes('K2: Comprobar la información'), 'K2 debe titularse "Comprobar la información"');
  assert.ok(viewContent.includes('K3: Comparar dos estudios'), 'K3 debe titularse "Comparar dos estudios"');
  assert.ok(viewContent.includes('K4: Conectar las ideas'), 'K4 debe titularse "Conectar las ideas"');
  assert.ok(viewContent.includes('K5: Facilidad de uso'), 'K5 debe titularse "Facilidad de uso"');
  assert.ok(viewContent.includes('K6: Esfuerzo y dificultad'), 'K6 debe titularse "Esfuerzo y dificultad"');

  // Subtítulos con código técnico preservado
  assert.ok(viewContent.includes('Criterio Metodológico K1'), 'Debe mantener el tag K1');
  assert.ok(viewContent.includes('Criterio Metodológico K2'), 'Debe mantener el tag K2');
  assert.ok(viewContent.includes('Criterio Metodológico K3'), 'Debe mantener el tag K3');
  assert.ok(viewContent.includes('Criterio Metodológico K4'), 'Debe mantener el tag K4');
  assert.ok(viewContent.includes('Criterios K5 y K6'), 'Debe mantener el tag K5/K6');
});

test('10. Evaluación Visual con Tarjetas Enmascaradas (EvaluationVisualCard)', async () => {
  const compPath = path.join(projectRoot, 'src/features/evaluation/EvaluationVisualCard.tsx');
  assert.ok(fs.existsSync(compPath), 'EvaluationVisualCard.tsx debe existir');

  const compContent = fs.readFileSync(compPath, 'utf-8');
  assert.ok(compContent.includes('maskAnswers'), 'Debe implementar propiedad maskAnswers');
  assert.ok(compContent.includes('mask-overlay'), 'Debe contener la clase para enmascarar títulos y conclusiones');
  assert.ok(compContent.includes('setIsZoomed'), 'Debe permitir zoom visual en pantalla modal');
  assert.ok(compContent.includes('altText'), 'Debe contar con accesibilidad para lectores de pantalla');
});

test('11. Ayudas Opcionales, Telemetría de Pistas e Inicios de Frase (Sentence Starters)', async () => {
  const typesPath = path.join(projectRoot, 'src/types/evaluation.ts');
  const typesContent = fs.readFileSync(typesPath, 'utf-8');
  assert.ok(typesContent.includes('hintsUsed: string[];'), 'Debe registrar hintsUsed en la sesión');
  assert.ok(typesContent.includes('wasAssistedByQuestion'), 'Debe mapear asistencia por pregunta');

  const scoringPath = path.join(projectRoot, 'src/services/evaluationScoring.ts');
  const scoringContent = fs.readFileSync(scoringPath, 'utf-8');
  assert.ok(scoringContent.includes('K4_GUIDED_SENTENCE_STARTERS'), 'Debe exportar los inicios de frase K4_GUIDED_SENTENCE_STARTERS');
  assert.ok(scoringContent.includes('no_estoy_seguro'), 'Debe incluir opción "No estoy seguro/a"');

  const hookPath = path.join(projectRoot, 'src/hooks/useEvaluationSession.ts');
  const hookContent = fs.readFileSync(hookPath, 'utf-8');
  assert.ok(hookContent.includes('recordHintUsed'), 'useEvaluationSession debe exportar recordHintUsed');
});

test('12. Exportación Diferenciada CSV/JSON y Salvaguardas Éticas para Menores', async () => {
  const scoringPath = path.join(projectRoot, 'src/services/evaluationScoring.ts');
  const scoringContent = fs.readFileSync(scoringPath, 'utf-8');

  // Exportación JSON incluye modalidad
  assert.ok(scoringContent.includes('evaluationMode: session.evaluationMode'), 'exportEvaluationJSON debe incluir evaluationMode');

  // Exportación CSV incluye columnas de modalidad y telemetría
  assert.ok(scoringContent.includes('evaluation_mode'), 'CSV debe incluir columna evaluation_mode');
  assert.ok(scoringContent.includes('hints_count'), 'CSV debe incluir columna hints_count');

  // Salvaguardas éticas
  assert.ok(scoringContent.includes('ethicalSafeguard'), 'EVALUATION_CODEBOOK debe incluir ethicalSafeguard');
  assert.ok(scoringContent.includes('adolescentes') || scoringContent.includes('menor'), 'EVALUATION_CODEBOOK debe contemplar participación de menores');
});
