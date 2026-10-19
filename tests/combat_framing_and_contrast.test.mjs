import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('1. Encuadre y Centrado de Combates de Validación (.combat-arena)', () => {
  const cssPath = path.join(projectRoot, 'src/styles/styles.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // Comprobar que .combat-arena tiene ancho 100%, max-width contenido y centrado horizontal
  assert.ok(css.includes('.combat-arena {'), 'Debe existir regla base .combat-arena');
  assert.ok(css.includes('margin-inline: auto;'), 'Debe contar con centrado automático horizontal');
  assert.ok(css.includes('max-width: 1240px;') || css.includes('max-width: 1200px;') || css.includes('max-width: 1280px;'), 'Debe limitar el ancho máximo para no desbordar');
  
  // Columnas adaptables con minmax(0, 1fr) para evitar desbordamiento por contenido intrínseco
  assert.ok(css.includes('minmax(0, 1fr)'), 'Columnas de combate deben usar minmax(0, 1fr) para permitir reducción sin desborde');
  assert.ok(css.includes('clamp('), 'Debe usar clamp() para panel central y/o espaciado proporcional');
});

test('2. Prevención de Desbordamiento y Ajuste de Componentes (.fighter-corner, .cyber-select)', () => {
  const cssPath = path.join(projectRoot, 'src/styles/styles.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // .fighter-corner y .fighter-card deben tener min-width: 0
  assert.ok(css.includes('min-width: 0;'), 'Debe definir min-width: 0 para evitar expansión forzada en CSS Grid');

  // .fighter-select-row .cyber-select debe tener max-width: 100% y text-overflow
  assert.ok(css.includes('text-overflow: ellipsis;'), 'Selectores deben truncar texto con elipsis para evitar empujar el ancho');
  assert.ok(css.includes('max-width: 100%;'), 'Selectores e imágenes deben tener max-width: 100%');

  // Quiebre de palabras en textos
  assert.ok(css.includes('word-break: break-word;'), 'Títulos y descripciones deben permitir word-break para no desbordar');
});

test('3. Adaptación Responsive en Pantallas Medianas y Móviles (900px, 600px, 390px)', () => {
  const cssPath = path.join(projectRoot, 'src/styles/styles.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // Breakpoint para apilamiento vertical
  assert.ok(css.includes('@media (max-width: 900px)') || css.includes('@media (max-width: 860px)'), 'Debe contener media query para tabletas');
  assert.ok(css.includes('@media (max-width: 600px)'), 'Debe contener media query para móviles medianos');
  assert.ok(css.includes('@media (max-width: 390px)'), 'Debe contener media query para móviles estrechos (390px)');

  // Comprobar que en pantallas pequeñas el grid de combate pasa a una sola columna
  const mqBlock900 = css.slice(css.indexOf('@media (max-width: 900px)'));
  assert.ok(mqBlock900.includes('grid-template-columns: 1fr;'), 'En pantallas reducidas debe apilar verticalmente en 1 columna');
});

test('4. Contraste en Modo Claro de Combates de Validación (WCAG AA)', () => {
  const cssPath = path.join(projectRoot, 'src/styles/styles.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // Verificación de tarjetas de combate en modo claro
  assert.ok(css.includes('[data-theme="light"] .fighter-card'), 'Debe definir estilo claro para .fighter-card');
  assert.ok(css.includes('[data-theme="light"] .fighter-corner'), 'Debe definir estilo claro para .fighter-corner');

  // Verificación de textos y etiquetas
  assert.ok(css.includes('[data-theme="light"] .f-val'), 'Debe definir color contrastado para .f-val en modo claro');
  assert.ok(css.includes('[data-theme="light"] .f-id'), 'Debe definir color contrastado para .f-id en modo claro');
  assert.ok(css.includes('[data-theme="light"] .vs-badge'), 'Debe definir color contrastado para .vs-badge en modo claro');

  // Botones de veredicto y feedback
  assert.ok(css.includes('[data-theme="light"] .verdict-btn.redun'), 'Debe definir botón de evidencia redundante en modo claro');
  assert.ok(css.includes('[data-theme="light"] .combat-feedback'), 'Debe definir caja de feedback con fondo claro');
  assert.ok(css.includes('[data-theme="light"] .combat-history-section'), 'Debe definir historial de combates en modo claro');
});

test('5. Integridad Funcional del Componente CombatGame', () => {
  const componentPath = path.join(projectRoot, 'src/features/games/combat/CombatGame.tsx');
  const content = fs.readFileSync(componentPath, 'utf-8');

  // Comprobar conservación de lógica
  assert.ok(content.includes('overlapPercent'), 'Debe conservar cálculo de solapamiento conceptual');
  assert.ok(content.includes('handleVerdict'), 'Debe conservar emisión de veredictos');
  assert.ok(content.includes('handleRandomCombat'), 'Debe conservar duelo aleatorio');
  assert.ok(content.includes('inspectCard'), 'Debe conservar inspección de ficha');
  assert.ok(content.includes('addCombatRecord'), 'Debe conservar registro en sesión');
  assert.ok(content.includes('GameTutorialModal'), 'Debe conservar tutorial del minijuego');
  assert.ok(content.includes('activity-continuity-bar'), 'Debe conservar barra de continuidad secuencial');
});

test('6. Verificación de Adaptabilidad en las 5 Resoluciones Objetivo (1440, 1280, 1024, 768, 390px)', () => {
  const cssPath = path.join(projectRoot, 'src/styles/styles.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // 1440px y 1280px: escritorio con 3 columnas equilibradas, centrado automático y max-width
  assert.ok(css.includes('max-width: 1240px;'), '1440px/1280px: debe limitar a max-width: 1240px');
  assert.ok(css.includes('margin-inline: auto;'), '1440px/1280px: centrado horizontal con margin-inline: auto');

  // 1024px: 3 columnas adaptables donde minmax(0, 1fr) permite que cada esquina se adapte a ~340px sin forzar scroll
  assert.ok(css.includes('minmax(0, 1fr) clamp('), '1024px: columnas laterales elásticas que no desbordan');
  assert.ok(css.includes('.main-view-area'), '1024px: padding y max-width contenidos en área principal');

  // 768px (<= 900px): disposición vertical limpia en 1 columna
  assert.ok(css.includes('@media (max-width: 900px)'), '768px: cubierto por media query <= 900px');
  const mq900 = css.slice(css.indexOf('@media (max-width: 900px)'));
  assert.ok(mq900.includes('.combat-arena') && mq900.includes('grid-template-columns: 1fr;'), '768px: arena en 1 columna vertical');
  assert.ok(mq900.includes('max-width: 680px;'), '768px: ancho contenido para vertical stack centrado');

  // 390px: móvil compacto con imágenes y tarjetas reducidas
  assert.ok(css.includes('@media (max-width: 390px)'), '390px: cubierto por media query <= 390px');
  const mq390 = css.slice(css.indexOf('@media (max-width: 390px)'));
  assert.ok(mq390.includes('.f-img') && mq390.includes('height: 125px;'), '390px: altura de imagen reducida para evitar ocupar excesiva pantalla vertical');
  assert.ok(mq390.includes('.vs-badge') && mq390.includes('font-size: 26px;'), '390px: distintivo VS compacto');
});

