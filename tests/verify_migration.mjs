import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('Dataset Verification: All 49 MTC Cards are intact and valid', async () => {
  const cardsFile = path.join(projectRoot, 'src/data/cards/mtcCardsData.ts');
  assert.ok(fs.existsSync(cardsFile), 'mtcCardsData.ts must exist');

  const content = fs.readFileSync(cardsFile, 'utf-8');
  
  // Verify that all 49 IDs from MTC01 to MTC49 are present
  for (let i = 1; i <= 49; i++) {
    const id = `MTC${String(i).padStart(2, '0')}`;
    assert.ok(content.includes(`"id":  "${id}"`) || content.includes(`"id": "${id}"`), `Card ${id} must exist in dataset`);
  }

  // Count total occurrences of "id":
  const idMatches = content.match(/"id":\s*"MTC\d\d"/g);
  assert.strictEqual(idMatches?.length, 49, 'Exactly 49 MTC cards must be defined');
});

test('Public Assets: High-resolution PNG illustrations exist for all cards', async () => {
  for (let i = 1; i <= 49; i++) {
    const id = `MTC${String(i).padStart(2, '0')}`;
    const visualPath = path.join(projectRoot, `public/card_redesign/generated_visuals/${id}_visual_final.png`);
    assert.ok(fs.existsSync(visualPath), `Visual image for ${id} must exist in public/card_redesign`);
  }
});

test('Default Topics: Research topics and questions integrity', async () => {
  const topicsFile = path.join(projectRoot, 'src/data/topics/defaultTopics.ts');
  assert.ok(fs.existsSync(topicsFile), 'defaultTopics.ts must exist');

  const content = fs.readFileSync(topicsFile, 'utf-8');
  assert.ok(content.includes('mtc-electric'), 'MTC Electric topic must be configured');
  assert.ok(content.includes('ai-inventory'), 'AI Inventory topic must be configured');
  assert.ok(content.includes('telemedicine'), 'Telemedicine topic must be configured');
});

test('Export Service: CSV, Markdown, BibTeX, JSON, and PDF functions exported', async () => {
  const exportFile = path.join(projectRoot, 'src/services/exportService.ts');
  assert.ok(fs.existsSync(exportFile), 'exportService.ts must exist');

  const content = fs.readFileSync(exportFile, 'utf-8');
  assert.ok(content.includes('exportMarkdown'), 'exportMarkdown must be exported');
  assert.ok(content.includes('exportBibTeX'), 'exportBibTeX must be exported');
  assert.ok(content.includes('exportJSON'), 'exportJSON must be exported');
  assert.ok(content.includes('exportCSV'), 'exportCSV must be exported (Required addition)');
  assert.ok(content.includes('printThesisPDF'), 'printThesisPDF must be exported');
});

test('Audio Engine: Procedural Web Audio API Singleton', async () => {
  const soundFile = path.join(projectRoot, 'src/services/soundEngine.ts');
  assert.ok(fs.existsSync(soundFile), 'soundEngine.ts must exist');

  const content = fs.readFileSync(soundFile, 'utf-8');
  assert.ok(content.includes('playFlip'), 'playFlip must be implemented');
  assert.ok(content.includes('playDrop'), 'playDrop must be implemented');
  assert.ok(content.includes('playSuccess'), 'playSuccess must be implemented');
  assert.ok(content.includes('playError'), 'playError must be implemented');
  assert.ok(content.includes('playBeamHum'), 'playBeamHum must be implemented');
  assert.ok(content.includes('playGapDiscovered'), 'playGapDiscovered must be implemented');
  assert.ok(content.includes('playVictory'), 'playVictory must be implemented');
  assert.ok(content.includes('export const soundEngine = new SoundEngine()'), 'soundEngine must be singleton');
});

test('Games Components: All 4 games and views exist and are typed', async () => {
  const deckGallery = path.join(projectRoot, 'src/features/deck/DeckGallery.tsx');
  const timelineGame = path.join(projectRoot, 'src/features/games/timeline/TimelineGame.tsx');
  const matrixGame = path.join(projectRoot, 'src/features/games/matrix/MatrixGame.tsx');
  const gapHunterGame = path.join(projectRoot, 'src/features/games/gaphunter/GapHunterGame.tsx');
  const beamCanvas = path.join(projectRoot, 'src/features/games/gaphunter/BeamCanvas.tsx');
  const combatGame = path.join(projectRoot, 'src/features/games/combat/CombatGame.tsx');
  const synthesisView = path.join(projectRoot, 'src/features/synthesis/SynthesisView.tsx');
  const wizardModal = path.join(projectRoot, 'src/features/wizard/WizardModal.tsx');
  const cardInspector = path.join(projectRoot, 'src/components/cards/CardInspectorModal.tsx');
  const card3D = path.join(projectRoot, 'src/components/cards/Card3D.tsx');

  assert.ok(fs.existsSync(deckGallery), 'DeckGallery.tsx must exist');
  assert.ok(fs.existsSync(timelineGame), 'TimelineGame.tsx must exist');
  assert.ok(fs.existsSync(matrixGame), 'MatrixGame.tsx must exist');
  assert.ok(fs.existsSync(gapHunterGame), 'GapHunterGame.tsx must exist');
  assert.ok(fs.existsSync(beamCanvas), 'BeamCanvas.tsx must exist');
  assert.ok(fs.existsSync(combatGame), 'CombatGame.tsx must exist');
  assert.ok(fs.existsSync(synthesisView), 'SynthesisView.tsx must exist');
  assert.ok(fs.existsSync(wizardModal), 'WizardModal.tsx must exist');
  assert.ok(fs.existsSync(cardInspector), 'CardInspectorModal.tsx must exist');
  assert.ok(fs.existsSync(card3D), 'Card3D.tsx must exist');
});

test('Production Build Artifacts: Vite dist bundles exist and are non-empty', async () => {
  const distIndex = path.join(projectRoot, 'dist/index.html');
  assert.ok(fs.existsSync(distIndex), 'dist/index.html must exist');
  const htmlContent = fs.readFileSync(distIndex, 'utf-8');
  assert.ok(htmlContent.includes('<div id="root"></div>'), 'dist/index.html must contain root element');
  assert.ok(htmlContent.includes('/assets/index-'), 'dist/index.html must reference bundled JS & CSS');

  const assetsDir = path.join(projectRoot, 'dist/assets');
  assert.ok(fs.existsSync(assetsDir), 'dist/assets must exist');
  const files = fs.readdirSync(assetsDir);
  const jsBundle = files.find(f => f.endsWith('.js'));
  const cssBundle = files.find(f => f.endsWith('.css'));
  assert.ok(jsBundle, 'Compiled JS bundle must exist');
  assert.ok(cssBundle, 'Compiled CSS bundle must exist');

  const jsSize = fs.statSync(path.join(assetsDir, jsBundle)).size;
  const cssSize = fs.statSync(path.join(assetsDir, cssBundle)).size;
  assert.ok(jsSize > 100000, 'JS bundle size must be substantial (>100KB, includes all 49 cards & games)');
  assert.ok(cssSize > 15000, 'CSS bundle size must be substantial (>15KB, includes full warm color palette)');
});
