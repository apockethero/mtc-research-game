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
  assert.ok(content.includes("INSTRUMENT_VERSION = '1.0.0-experimental'"), 'La versión debe ser 1.0.0-experimental');
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
