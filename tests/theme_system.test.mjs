import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('1. Contexto de tema (ThemeContext): Proveedor, hook y persistencia local', () => {
  const contextPath = path.join(projectRoot, 'src/context/ThemeContext.tsx');
  assert.ok(fs.existsSync(contextPath), 'ThemeContext.tsx debe existir');

  const content = fs.readFileSync(contextPath, 'utf-8');

  // Exportaciones requeridas
  assert.ok(
    content.includes('export function ThemeProvider') || content.includes('export const ThemeProvider'),
    'Debe exportar ThemeProvider'
  );
  assert.ok(
    content.includes('export function useTheme') || content.includes('export const useTheme'),
    'Debe exportar useTheme'
  );
  assert.ok(content.includes('type Theme'), 'Debe definir el tipo Theme');

  // Clave de almacenamiento y valor por defecto oscuro
  assert.ok(content.includes("'mtc-theme-preference'"), 'Debe usar la clave mtc-theme-preference');
  assert.ok(content.includes("'dark'"), 'El modo oscuro debe estar contemplado');
  assert.ok(content.includes("'light'"), 'El modo claro debe estar contemplado');

  // Vinculación en el DOM
  assert.ok(
    content.includes("document.documentElement.setAttribute('data-theme'") ||
    content.includes('setAttribute("data-theme"'),
    'Debe sincronizar el atributo data-theme en el elemento raíz'
  );
});

test('2. Interruptor de tema (ThemeToggle): Semántica accesible, roles y dimensiones', () => {
  const togglePath = path.join(projectRoot, 'src/components/layout/ThemeToggle.tsx');
  assert.ok(fs.existsSync(togglePath), 'ThemeToggle.tsx debe existir');

  const content = fs.readFileSync(togglePath, 'utf-8');

  // Accesibilidad
  assert.ok(content.includes('role="switch"'), 'Debe usar role="switch"');
  assert.ok(content.includes('aria-checked='), 'Debe indicar aria-checked');
  assert.ok(content.includes('aria-label='), 'Debe contar con aria-label descriptivo');
  assert.ok(content.includes('toggleTheme'), 'Debe invocar la alternancia de tema');

  // Simbología visual (sol y luna)
  assert.ok(
    content.includes('theme-toggle-icon') ||
    content.includes('svg') ||
    content.includes('theme-toggle-slider'),
    'Debe contener elementos gráficos/iconos para representar sol y luna'
  );
});

test('3. Integración en HeaderHUD y Main: Montaje del proveedor y ubicación superior derecha', () => {
  // Verificación de envoltura en main.tsx
  const mainPath = path.join(projectRoot, 'src/main.tsx');
  const mainContent = fs.readFileSync(mainPath, 'utf-8');
  assert.ok(mainContent.includes('<ThemeProvider>'), 'main.tsx debe envolver la app con ThemeProvider');

  // Verificación de ubicación en HeaderHUD.tsx
  const headerPath = path.join(projectRoot, 'src/components/layout/HeaderHUD.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf-8');
  assert.ok(headerContent.includes('ThemeToggle'), 'HeaderHUD debe importar y renderizar ThemeToggle');
  assert.ok(
    headerContent.includes('hud-theme-toggle-wrapper') ||
    headerContent.includes('<ThemeToggle'),
    'ThemeToggle debe estar ubicado dentro del encabezado'
  );
});

test('4. Variables Semánticas y Paleta Oficial en CSS', () => {
  const cssPath = path.join(projectRoot, 'src/styles/styles.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // Variables requeridas por la especificación
  const requiredVariables = [
    '--app-bg',
    '--surface-primary',
    '--surface-secondary',
    '--text-primary',
    '--text-secondary',
    '--border-color',
    '--accent-primary',
    '--accent-secondary',
    '--focus-ring',
    '--button-primary-bg',
    '--button-primary-text',
    '--input-bg'
  ];

  for (const v of requiredVariables) {
    assert.ok(css.includes(v), `El CSS debe definir la variable semántica ${v}`);
  }

  // Paleta oficial MTC
  assert.ok(css.includes('#B82C39') || css.includes('#b82c39'), 'Debe incluir Carmesí (#B82C39)');
  assert.ok(css.includes('#D4783D') || css.includes('#d4783d'), 'Debe incluir Cobre (#D4783D)');
  assert.ok(css.includes('#FD995C') || css.includes('#fd995c'), 'Debe incluir Melocotón (#FD995C)');
  assert.ok(css.includes('#D29884') || css.includes('#d29884'), 'Debe incluir Rosa arena (#D29884)');
  assert.ok(css.includes('#6C3745') || css.includes('#6c3745'), 'Debe incluir Ciruela (#6C3745)');

  // Reglas de modo claro y oscuro
  assert.ok(css.includes('[data-theme="light"]'), 'Debe definir el bloque selector [data-theme="light"]');
  assert.ok(
    css.includes(':root, [data-theme="dark"]') ||
    css.includes('[data-theme="dark"]'),
    'Debe definir el selector para el tema oscuro'
  );

  // Prohibición de filtro global de inversión en imágenes
  assert.ok(
    !css.includes('img { filter: invert(') && !css.includes('.card-img-container img { filter: invert('),
    'No se debe aplicar filter: invert() indiscriminado a las imágenes'
  );
});

test('5. Prevención de parpadeo (Anti-flash) y persistencia inmediata en index.html', () => {
  const htmlPath = path.join(projectRoot, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');

  // Script inline antes de la carga de scripts de la app
  assert.ok(html.includes('mtc-theme-preference'), 'index.html debe consultar mtc-theme-preference antes de montar React');
  assert.ok(
    html.includes('document.documentElement.setAttribute(\'data-theme\'') ||
    html.includes('document.documentElement.setAttribute("data-theme"'),
    'index.html debe asignar data-theme de manera sincrónica'
  );
});
