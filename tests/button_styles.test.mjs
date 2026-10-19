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
