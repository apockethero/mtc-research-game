import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

// 1. Cargar critical dataset JSON
const criticalJsonPath = path.join(projectRoot, 'card_redesign/final_cards/mtc_cards_critical_dataset.json');
const criticalCards = JSON.parse(fs.readFileSync(criticalJsonPath, 'utf-8'));

// 2. Cargar cards_dataset.js original
const vanillaJsPath = path.join(projectRoot, '../mtc_game_prototype_backup_vanilla/js/cards_dataset.js');
const vanillaJsContent = fs.readFileSync(vanillaJsPath, 'utf-8');
const vanillaMatch = vanillaJsContent.match(/window\.MTC_CARDS_DATA\s*=\s*(\[[\s\S]*?\]);/);
let vanillaCards = [];
if (vanillaMatch) {
  vanillaCards = JSON.parse(vanillaMatch[1]);
}

// 3. Cargar mtcCardsData.ts migrado
const tsPath = path.join(projectRoot, 'src/data/cards/mtcCardsData.ts');
const tsContent = fs.readFileSync(tsPath, 'utf-8');
const tsMatch = tsContent.match(/export const MTC_CARDS_DATA:\s*Card\[\]\s*=\s*(\[[\s\S]*?\]);/);
let tsCards = [];
if (tsMatch) {
  tsCards = JSON.parse(tsMatch[1]);
}

console.log('=== COMPARATIVA DE DATASETS MTC ===');
console.log(`- critical_dataset.json count: ${criticalCards.length}`);
console.log(`- vanilla cards_dataset.js count: ${vanillaCards.length}`);
console.log(`- migrated mtcCardsData.ts count: ${tsCards.length}`);

// Validar IDs
const criticalIds = new Set(criticalCards.map(c => c.id));
const vanillaIds = new Set(vanillaCards.map(c => c.id));
const tsIds = new Set(tsCards.map(c => c.id));

console.log(`- IDs únicos en critical: ${criticalIds.size}`);
console.log(`- IDs únicos en vanilla: ${vanillaIds.size}`);
console.log(`- IDs únicos en TypeScript: ${tsIds.size}`);

// Verificar correspondencia 1:1 entre vanilla y TypeScript
let differencesVanillaTs = [];
for (const vCard of vanillaCards) {
  const tCard = tsCards.find(c => c.id === vCard.id);
  if (!tCard) {
    differencesVanillaTs.push(`[FALTA] ${vCard.id} está en vanilla pero no en TypeScript`);
    continue;
  }

  // Comparar campos clave
  const fieldsToCompare = [
    'title', 'authors', 'firstAuthor', 'year', 'category', 'categoryEs',
    'methodology', 'methodClass', 'coreIdea', 'contribution', 'limitation',
    'quality', 'doi', 'venue', 'citation', 'citationCount', 'sjr', 'sjrQuartile',
    'citeScore', 'image', 'keyword'
  ];

  for (const f of fieldsToCompare) {
    if (vCard[f] !== tCard[f]) {
      differencesVanillaTs.push(`[DIFERENCIA] ${vCard.id}.${f}: vanilla="${vCard[f]}" vs ts="${tCard[f]}"`);
    }
  }
}

console.log(`\n=== DIFERENCIAS ENTRE VANILLA Y TYPESCRIPT ===`);
if (differencesVanillaTs.length === 0) {
  console.log('✓ 100% DE COINCIDENCIA EXACTA entre vanilla y TypeScript en todos los campos evaluados.');
} else {
  console.log(`Se encontraron ${differencesVanillaTs.length} diferencias:`);
  differencesVanillaTs.forEach(d => console.log('  ' + d));
}

// Comparar con critical_dataset.json
console.log(`\n=== COMPARATIVA CON CRITICAL DATASET JSON ===`);
let differencesCriticalVanilla = [];
for (const cCard of criticalCards) {
  const vCard = vanillaCards.find(c => c.id === cCard.id);
  if (!vCard) {
    differencesCriticalVanilla.push(`[FALTA] ${cCard.id} no existe en vanilla`);
    continue;
  }
  // Verificar campos
  if (cCard.title !== vCard.title) {
    differencesCriticalVanilla.push(`[TITULO] ${cCard.id}: critical="${cCard.title}" vs vanilla="${vCard.title}"`);
  }
  if (cCard.doi !== vCard.doi) {
    differencesCriticalVanilla.push(`[DOI] ${cCard.id}: critical="${cCard.doi}" vs vanilla="${vCard.doi}"`);
  }
  if (Number(cCard.year) !== Number(vCard.year)) {
    differencesCriticalVanilla.push(`[AÑO] ${cCard.id}: critical="${cCard.year}" vs vanilla="${vCard.year}"`);
  }
}
console.log(`Diferencias con critical_dataset.json: ${differencesCriticalVanilla.length}`);
if (differencesCriticalVanilla.length > 0) {
  differencesCriticalVanilla.slice(0, 10).forEach(d => console.log('  ' + d));
} else {
  console.log('✓ Títulos, DOIs y Años coinciden exactamente con la fuente crítica original.');
}
