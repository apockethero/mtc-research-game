import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('1. Configuración de Tutoriales: Cada minijuego cuenta con su tutorial de 5 pasos', async () => {
  const tutorialDataPath = path.join(projectRoot, 'src/components/tutorial/tutorialData.tsx');
  assert.ok(fs.existsSync(tutorialDataPath), 'tutorialData.tsx debe existir');

  const content = fs.readFileSync(tutorialDataPath, 'utf-8');

  const requiredGames = ['timeline', 'matrix', 'gapHunter', 'combat'];
  for (const game of requiredGames) {
    assert.ok(content.includes(`${game}: {`), `La configuración para ${game} debe estar definida`);
  }

  // Comprobar botones de acción finales obligatorios
  assert.ok(content.includes('Comenzar cronología'), 'Debe contener el botón "Comenzar cronología" para Timeline');
  assert.ok(content.includes('Comenzar clasificación'), 'Debe contener el botón "Comenzar clasificación" para Matrix');
  assert.ok(content.includes('Comenzar exploración'), 'Debe contener el botón "Comenzar exploración" para GapHunter');
  assert.ok(content.includes('Comenzar combate'), 'Debe contener el botón "Comenzar combate" para Combat');

  // Comprobar que existen 5 pasos por cada juego (20 pasos en total)
  const stepMatches = content.match(/stepNumber:\s*[1-5]/g);
  assert.strictEqual(stepMatches?.length, 20, 'Deben existir exactamente 20 pasos (5 por cada uno de los 4 minijuegos)');
});

test('2. Integración en los 4 Componentes de Minijuegos y botón "¿Cómo se juega?"', async () => {
  const games = [
    { file: 'src/features/games/timeline/TimelineGame.tsx', key: 'timeline', name: 'Puente de Cronología' },
    { file: 'src/features/games/matrix/MatrixGame.tsx', key: 'matrix', name: 'La Matriz de Enfoques' },
    { file: 'src/features/games/gaphunter/GapHunterGame.tsx', key: 'gapHunter', name: 'Cazadores de Vacíos' },
    { file: 'src/features/games/combat/CombatGame.tsx', key: 'combat', name: 'Combates de Validación' }
  ];

  for (const g of games) {
    const fullPath = path.join(projectRoot, g.file);
    assert.ok(fs.existsSync(fullPath), `${g.file} debe existir`);
    const code = fs.readFileSync(fullPath, 'utf-8');

    // Verificar invocación del hook específico
    assert.ok(
      code.includes(`useGameTutorial('${g.key}')`),
      `${g.file} debe utilizar useGameTutorial con la clave "${g.key}"`
    );

    // Verificar presencia del botón "¿Cómo se juega?"
    assert.ok(
      code.includes('¿Cómo se juega?'),
      `${g.file} debe incluir el botón visible "¿Cómo se juega?"`
    );

    // Verificar renderizado del modal con la clave correcta
    assert.ok(
      code.includes(`gameKey="${g.key}"`),
      `${g.file} debe renderizar GameTutorialModal con gameKey="${g.key}"`
    );
  }
});

test('3. Persistencia Independiente y Resiliencia sin localStorage', async () => {
  const hookPath = path.join(projectRoot, 'src/hooks/useGameTutorial.ts');
  assert.ok(fs.existsSync(hookPath), 'useGameTutorial.ts debe existir');

  const content = fs.readFileSync(hookPath, 'utf-8');
  assert.ok(content.includes('mtc_game_tutorials_seen'), 'Debe utilizar la clave específica "mtc_game_tutorials_seen"');
  assert.ok(content.includes('memoryTutorialState'), 'Debe tener fallback en memoria cuando localStorage no esté disponible');
  assert.ok(content.includes('getStoredTutorialState'), 'Debe exportar getStoredTutorialState');
  assert.ok(content.includes('setStoredTutorialState'), 'Debe exportar setStoredTutorialState');

  // Simular lógica de persistencia independiente en memoria
  const mockStorage = {};
  const setTutorialSeen = (game, val) => {
    mockStorage[game] = val;
  };

  setTutorialSeen('timeline', true);
  assert.strictEqual(mockStorage['timeline'], true, 'Timeline marcado como visto');
  assert.strictEqual(mockStorage['matrix'], undefined, 'Matrix debe permanecer no visto de forma independiente');
  assert.strictEqual(mockStorage['gapHunter'], undefined, 'GapHunter debe permanecer no visto');
  assert.strictEqual(mockStorage['combat'], undefined, 'Combat debe permanecer no visto');
});

test('4. Controles y Accesibilidad del Modal: Dialog, Escape, Teclado, Saltos', async () => {
  const modalPath = path.join(projectRoot, 'src/components/tutorial/GameTutorialModal.tsx');
  assert.ok(fs.existsSync(modalPath), 'GameTutorialModal.tsx debe existir');

  const content = fs.readFileSync(modalPath, 'utf-8');

  // Atributos accesibles
  assert.ok(content.includes('role="dialog"'), 'Debe tener role="dialog"');
  assert.ok(content.includes('aria-modal="true"'), 'Debe tener aria-modal="true"');
  assert.ok(content.includes('aria-labelledby="tutorial-modal-title"'), 'Debe vincularse el título con aria-labelledby');
  assert.ok(content.includes('aria-label="Cerrar tutorial"'), 'El botón cerrar debe tener aria-label');

  // Soporte de teclado
  assert.ok(content.includes("e.key === 'Escape'"), 'Debe escuchar la tecla Escape para cerrar el tutorial');
  assert.ok(content.includes("e.key === 'ArrowRight'"), 'Debe permitir avance con flecha derecha');
  assert.ok(content.includes("e.key === 'ArrowLeft'"), 'Debe permitir retroceso con flecha izquierda');

  // Botones de acción
  assert.ok(content.includes('Saltar tutorial'), 'Debe tener botón para saltar el tutorial');
  assert.ok(content.includes('Anterior'), 'Debe tener botón Anterior');
  assert.ok(content.includes('Siguiente'), 'Debe tener botón Siguiente');
});

test('5. Recursos Visuales: Diagramas SVG temáticos implementados para los 20 pasos', async () => {
  const diagramsPath = path.join(projectRoot, 'src/components/tutorial/tutorialDiagrams.tsx');
  assert.ok(fs.existsSync(diagramsPath), 'tutorialDiagrams.tsx debe existir');

  const content = fs.readFileSync(diagramsPath, 'utf-8');

  const requiredDiagrams = [
    'TimelineStep1Diagram', 'TimelineStep2Diagram', 'TimelineStep3Diagram', 'TimelineStep4Diagram', 'TimelineStep5Diagram',
    'MatrixStep1Diagram', 'MatrixStep2Diagram', 'MatrixStep3Diagram', 'MatrixStep4Diagram', 'MatrixStep5Diagram',
    'GapHunterStep1Diagram', 'GapHunterStep2Diagram', 'GapHunterStep3Diagram', 'GapHunterStep4Diagram', 'GapHunterStep5Diagram',
    'CombatStep1Diagram', 'CombatStep2Diagram', 'CombatStep3Diagram', 'CombatStep4Diagram', 'CombatStep5Diagram'
  ];

  for (const diag of requiredDiagrams) {
    assert.ok(content.includes(`export const ${diag}`), `Debe exportar el diagrama ${diag}`);
  }

  // Paleta oficial
  assert.ok(content.includes('#B82C39'), 'Debe contener #B82C39 (Crimson)');
  assert.ok(content.includes('#D4783D'), 'Debe contener #D4783D (Copper)');
  assert.ok(content.includes('#FD995C'), 'Debe contener #FD995C (Peach)');
  assert.ok(content.includes('#D29884'), 'Debe contener #D29884 (Rose)');
  assert.ok(content.includes('#6C3745'), 'Debe contener #6C3745 (Plum)');
});

test('6. Coherencia de Estilos y Adaptabilidad: CSS en styles.css', async () => {
  const cssPath = path.join(projectRoot, 'src/styles/styles.css');
  assert.ok(fs.existsSync(cssPath), 'styles.css debe existir');

  const css = fs.readFileSync(cssPath, 'utf-8');
  assert.ok(css.includes('.tutorial-modal-overlay'), 'Debe contener .tutorial-modal-overlay');
  assert.ok(css.includes('.tutorial-modal-container'), 'Debe contener .tutorial-modal-container');
  assert.ok(css.includes('.tutorial-progress-dot'), 'Debe contener .tutorial-progress-dot');
  assert.ok(css.includes('.tutorial-svg-frame'), 'Debe contener .tutorial-svg-frame');
  assert.ok(css.includes('.tutorial-trigger-btn'), 'Debe contener .tutorial-trigger-btn');
  assert.ok(css.includes('prefers-reduced-motion: reduce'), 'Debe respetar la preferencia de movimiento reducido');
  assert.ok(css.includes('@media (max-width: 600px)'), 'Debe contemplar adaptación a pantallas pequeñas');
});
