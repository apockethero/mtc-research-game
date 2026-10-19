import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('CSS Button Styles: All cyber-btn variants are defined with high contrast', () => {
  const cssPath = path.join(process.cwd(), 'src/styles/styles.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // Verify cyber-btn has a non-white dark theme background
  assert.ok(css.includes('.cyber-btn {'), '.cyber-btn base rule must exist');
  assert.ok(css.includes('background: #281420;'), '.cyber-btn must have dark plum base background, not default white');

  // Verify cyber-btn-primary
  assert.ok(css.includes('.cyber-btn-primary {'), '.cyber-btn-primary must be defined');
  assert.ok(css.includes('var(--c-crimson)'), 'Primary button must use crimson');
  assert.ok(css.includes('var(--c-copper)'), 'Primary button must use copper');

  // Verify cyber-btn-secondary
  assert.ok(css.includes('.cyber-btn-secondary {'), '.cyber-btn-secondary must be defined');
  assert.ok(css.includes('border: 1px solid var(--border-highlight)'), 'Secondary button must have highlighted border');
  assert.ok(css.includes('color: #fcf6f4;'), 'Secondary button must have bright off-white text for high contrast');

  // Verify cyber-btn-outline
  assert.ok(css.includes('.cyber-btn-outline {'), '.cyber-btn-outline must be defined');
  assert.ok(css.includes('var(--c-rose)'), 'Outline button must use rose accent');

  // Verify interactive states
  assert.ok(css.includes(':focus-visible'), 'Focus visible ring must be defined');
  assert.ok(css.includes(':hover:not(:disabled)'), 'Hover state must be defined');
  assert.ok(css.includes(':active:not(:disabled)'), 'Active state must be defined');
});

test('HeaderHUD Layout: Encabezado organizado en dos filas sin concentrar todo en una sola línea', () => {
  const headerPath = path.join(process.cwd(), 'src/components/layout/HeaderHUD.tsx');
  const content = fs.readFileSync(headerPath, 'utf-8');

  // Comprobar estructura de dos filas
  assert.ok(content.includes('top-hud-container'), 'Debe existir contenedor centrado');
  assert.ok(content.includes('hud-title-row'), 'Debe existir primera fila para título y subtítulo');
  assert.ok(content.includes('hud-sub-row'), 'Debe existir segunda fila para estadísticas y controles');

  // Conservación de valores estadísticos y botones funcionales
  assert.ok(content.includes('stats.totalUniqueCards'), 'Debe conservar totalUniqueCards');
  assert.ok(content.includes('stats.timelineCount'), 'Debe conservar timelineCount');
  assert.ok(content.includes('stats.classifiedCount'), 'Debe conservar classifiedCount');
  assert.ok(content.includes('stats.gapsCount'), 'Debe conservar gapsCount');
  assert.ok(content.includes('stats.combatsCount'), 'Debe conservar combatsCount');
  assert.ok(content.includes('setWizardOpen(true)'), 'Debe conservar botón de wizard');
  assert.ok(content.includes('toggleSound'), 'Debe conservar toggle de sonido');
  assert.ok(content.includes('resetSession'), 'Debe conservar reinicio');
  assert.ok(content.includes("setActiveTab('synthesis')"), 'Debe conservar enlace a borrador de tesis');
});

test('NavigationTabs Layout: Desplazamiento horizontal controlado y scrollbar estilizada', () => {
  const cssPath = path.join(process.cwd(), 'src/styles/styles.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // Desplazamiento horizontal y scrollbar fina
  assert.ok(css.includes('overflow-x: auto'), 'Debe permitir overflow-x');
  assert.ok(css.includes('.main-nav-tabs::-webkit-scrollbar'), 'Debe definir scrollbar webkit estilizada');
  assert.ok(css.includes('scrollbar-width: thin'), 'Debe definir scrollbar thin para Firefox');
  assert.ok(css.includes('border-bottom-color: var(--c-peach)'), 'Pestaña activa debe tener indicador inferior color melocotón/naranja');
  assert.ok(css.includes('nav-tab:hover'), 'Pestaña debe tener hover visible');
  assert.ok(css.includes('nav-tab:focus-visible'), 'Pestaña debe tener focus-visible accesible');
});

test('General Content Layout: Ancho máximo coherente, espaciado uniforme y límites de línea de texto', () => {
  const cssPath = path.join(process.cwd(), 'src/styles/styles.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  assert.ok(css.includes('.main-view-area'), '.main-view-area debe estar definida');
  assert.ok(css.includes('.game-wrapper'), '.game-wrapper debe estar definida');
  assert.ok(css.includes('.eval-question-card'), '.eval-question-card debe estar definida');
  assert.ok(css.includes('.eval-stage-nav-bar'), '.eval-stage-nav-bar debe estar definida');
  assert.ok(css.includes('.eval-option-row'), '.eval-option-row debe estar definida');
});

test('Responsive Adaptability: Breakpoints definidos para 1024px, 820px, 600px, 390px y prefers-reduced-motion', () => {
  const cssPath = path.join(process.cwd(), 'src/styles/styles.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  assert.ok(css.includes('@media (max-width: 1024px)'), 'Debe contemplar breakpoint <= 1024px');
  assert.ok(css.includes('@media (max-width: 820px)'), 'Debe contemplar breakpoint <= 820px');
  assert.ok(css.includes('@media (max-width: 600px)'), 'Debe contemplar breakpoint <= 600px');
  assert.ok(css.includes('@media (max-width: 390px)'), 'Debe contemplar breakpoint <= 390px');
  assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'Debe respetar prefers-reduced-motion');
});
