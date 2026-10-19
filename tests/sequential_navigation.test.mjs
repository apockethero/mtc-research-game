import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('1. Secuencia y numeración de etapas en NavigationTabs (01 a 07)', () => {
  const navTabsPath = path.join(projectRoot, 'src/components/layout/NavigationTabs.tsx');
  assert.ok(fs.existsSync(navTabsPath), 'NavigationTabs.tsx debe existir');

  const content = fs.readFileSync(navTabsPath, 'utf-8');

  // Verificar que existen los 7 identificadores en orden estricto
  const expectedOrder = ['deck', 'timeline', 'matrix', 'gaphunter', 'combat', 'evaluation', 'synthesis'];
  const tabIdMatches = [...content.matchAll(/id:\s*'([a-z0-9_-]+)'/g)].map(m => m[1]);

  assert.strictEqual(tabIdMatches.length, 7, 'Debe haber exactamente 7 etapas en la ruta');
  assert.deepStrictEqual(tabIdMatches, expectedOrder, 'El orden de las etapas debe coincidir con la secuencia metodológica');

  // Verificar que existen las numeraciones '01' a '07'
  for (let i = 1; i <= 7; i++) {
    const stepNum = i.toString().padStart(2, '0');
    assert.ok(content.includes(`stepNumber: '${stepNum}'`), `Debe existir la numeración ${stepNum}`);
  }

  // Verificar etiquetas y subtítulos explicativos de propósito
  assert.ok(content.includes('Exploración inicial'), 'Debe incluir subtítulo para etapa 01');
  assert.ok(content.includes('Secuencia temporal'), 'Debe incluir subtítulo para etapa 02');
  assert.ok(content.includes('Clasificación teórica'), 'Debe incluir subtítulo para etapa 03');
  assert.ok(content.includes('Detección de brechas'), 'Debe incluir subtítulo para etapa 04');
  assert.ok(content.includes('Contraste cruzado'), 'Debe incluir subtítulo para etapa 05');
  assert.ok(content.includes('Validación empírica'), 'Debe incluir subtítulo para etapa 06');
  assert.ok(content.includes('Síntesis y exportación'), 'Debe incluir subtítulo para etapa 07');
});

test('2. Detección de inicio sin avances y orientación compacta hacia etapa 01', () => {
  const navTabsPath = path.join(projectRoot, 'src/components/layout/NavigationTabs.tsx');
  const content = fs.readFileSync(navTabsPath, 'utf-8');

  // Verificar lógica de detección de estado inicial
  assert.ok(content.includes('isInitialState'), 'Debe computar isInitialState');
  assert.ok(content.includes('start-hint'), 'Debe incluir clase start-hint para el paso inicial');
  assert.ok(content.includes('initial-target'), 'Debe incluir clase initial-target para el paso inicial');
});

test('3. Simplificación visual: eliminación de banners redundantes y conservación de barra de progreso sutil', () => {
  const navTabsPath = path.join(projectRoot, 'src/components/layout/NavigationTabs.tsx');
  const content = fs.readFileSync(navTabsPath, 'utf-8');

  // No debe incluir los bloques de texto redundantes eliminados
  assert.ok(!content.includes('nav-route-banner'), 'nav-route-banner debe haber sido eliminado');
  assert.ok(!content.includes('Ruta Metodológica MTC · Etapa'), 'El banner de texto redundante debe eliminarse');
  assert.ok(!content.includes('Punto de partida: 01 Mazo Completo · 0/7 completadas'), 'El contador de texto redundante debe eliminarse');

  // Debe conservar la barra de progreso discreta
  assert.ok(content.includes('nav-route-progress-bar'), 'Debe incluir barra de progreso sutil');
  assert.ok(content.includes('nav-route-progress-fill'), 'Debe incluir relleno proporcional de progreso');
  assert.ok(content.includes('completedCount'), 'Debe computar el contador de etapas completadas');
});

test('4. Botones de continuidad secuencial ("Siguiente paso") en todas las actividades', () => {
  // 01 Deck -> Timeline
  const deckPath = path.join(projectRoot, 'src/features/deck/DeckGallery.tsx');
  const deckContent = fs.readFileSync(deckPath, 'utf-8');
  assert.ok(deckContent.includes("setActiveTab('timeline')"), 'DeckGallery debe orientar hacia El Puente de Cronología');
  assert.ok(deckContent.includes('activity-continuity-bar'), 'DeckGallery debe contener barra de continuidad');

  // 02 Timeline -> Matrix
  const timelinePath = path.join(projectRoot, 'src/features/games/timeline/TimelineGame.tsx');
  const timelineContent = fs.readFileSync(timelinePath, 'utf-8');
  assert.ok(timelineContent.includes("setActiveTab('matrix')"), 'TimelineGame debe orientar hacia La Matriz de Enfoques');
  assert.ok(timelineContent.includes('activity-continuity-bar'), 'TimelineGame debe contener barra de continuidad');

  // 03 Matrix -> GapHunter
  const matrixPath = path.join(projectRoot, 'src/features/games/matrix/MatrixGame.tsx');
  const matrixContent = fs.readFileSync(matrixPath, 'utf-8');
  assert.ok(matrixContent.includes("setActiveTab('gaphunter')"), 'MatrixGame debe orientar hacia Cazadores de Vacíos');
  assert.ok(matrixContent.includes('activity-continuity-bar'), 'MatrixGame debe contener barra de continuidad');

  // 04 GapHunter -> Combat
  const gapHunterPath = path.join(projectRoot, 'src/features/games/gaphunter/GapHunterGame.tsx');
  const gapHunterContent = fs.readFileSync(gapHunterPath, 'utf-8');
  assert.ok(gapHunterContent.includes("setActiveTab('combat')"), 'GapHunterGame debe orientar hacia Combates de Validación');
  assert.ok(gapHunterContent.includes('activity-continuity-bar'), 'GapHunterGame debe contener barra de continuidad');

  // 05 Combat -> Evaluation
  const combatPath = path.join(projectRoot, 'src/features/games/combat/CombatGame.tsx');
  const combatContent = fs.readFileSync(combatPath, 'utf-8');
  assert.ok(combatContent.includes("setActiveTab('evaluation')"), 'CombatGame debe orientar hacia Evaluación científica');
  assert.ok(combatContent.includes('activity-continuity-bar'), 'CombatGame debe contener barra de continuidad');

  // 06 Evaluation -> Synthesis
  const evalPath = path.join(projectRoot, 'src/features/evaluation/EvaluationView.tsx');
  const evalContent = fs.readFileSync(evalPath, 'utf-8');
  assert.ok(evalContent.includes("setActiveTab('synthesis')"), 'EvaluationView debe orientar hacia Estado del Arte Vivo');
  assert.ok(evalContent.includes('activity-continuity-bar'), 'EvaluationView debe contener barra de continuidad');
});

test('5. Adaptabilidad móvil en HeaderHUD y NavigationTabs', () => {
  const headerPath = path.join(projectRoot, 'src/components/layout/HeaderHUD.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf-8');
  assert.ok(headerContent.includes('hud-stats-toggle-btn'), 'HeaderHUD debe tener botón de toggle para estadísticas');
  assert.ok(headerContent.includes('hud-tools-toggle-btn'), 'HeaderHUD debe tener botón de toggle para Herramientas en móvil');
  assert.ok(headerContent.includes('tools-panel-open'), 'HeaderHUD debe manejar clase tools-panel-open');

  const navPath = path.join(projectRoot, 'src/components/layout/NavigationTabs.tsx');
  const navContent = fs.readFileSync(navPath, 'utf-8');
  assert.ok(navContent.includes('nav-mobile-bar'), 'NavigationTabs debe tener barra móvil compacta');
  assert.ok(navContent.includes('nav-mobile-toggle-btn'), 'NavigationTabs debe tener botón de toggle de ruta en móvil');
  assert.ok(navContent.includes('mobile-expanded'), 'NavigationTabs debe manejar clase mobile-expanded');

  const cssPath = path.join(projectRoot, 'src/styles/styles.css');
  const css = fs.readFileSync(cssPath, 'utf-8');
  assert.ok(css.includes('.nav-mobile-bar'), '.nav-mobile-bar debe estar definido en CSS');
  assert.ok(css.includes('.hud-tools-toggle-btn'), '.hud-tools-toggle-btn debe estar definido en CSS');
  assert.ok(css.includes('.hud-stats-toggle-btn'), '.hud-stats-toggle-btn debe estar definido en CSS');
});
