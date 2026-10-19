import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

// Load MTC Cards dataset
const tsPath = path.join(projectRoot, 'src/data/cards/mtcCardsData.ts');
const tsContent = fs.readFileSync(tsPath, 'utf-8');
const tsMatch = tsContent.match(/export const MTC_CARDS_DATA:\s*Card\[\]\s*=\s*(\[[\s\S]*?\]);/);
assert.ok(tsMatch, 'Dataset must be extractable from mtcCardsData.ts');
const cards = JSON.parse(tsMatch[1]);

// Load Default Topics
const topicsPath = path.join(projectRoot, 'src/data/topics/defaultTopics.ts');
const topicsContent = fs.readFileSync(topicsPath, 'utf-8');
const topicsMatch = topicsContent.match(/export const DEFAULT_TOPICS:\s*TopicConfig\[\]\s*=\s*(\[[\s\S]*?\]);/);
assert.ok(topicsMatch, 'Topics must be extractable from defaultTopics.ts');
const topicsJson = topicsMatch[1].replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
const topics = JSON.parse(topicsJson);

test('1. Puente de Cronología: Algoritmo de Validación y Detección de Anacronismos', () => {
  // Test case A: Correct chronological sequence
  const sortedSample = [
    cards.find(c => c.id === 'MTC03'), // 2012
    cards.find(c => c.id === 'MTC02'), // 2016
    cards.find(c => c.id === 'MTC01'), // 2020
    cards.find(c => c.id === 'MTC09'), // 2021
    cards.find(c => c.id === 'MTC18'), // 2023
    cards.find(c => c.id === 'MTC04')  // 2024
  ].filter(Boolean);

  let isSorted = true;
  for (let i = 0; i < sortedSample.length - 1; i++) {
    if (sortedSample[i].year > sortedSample[i + 1].year) {
      isSorted = false;
      break;
    }
  }
  assert.strictEqual(isSorted, true, 'Sequence ordered by year must pass validation');

  // Test case B: Anachronism (inverted order)
  const invertedSample = [...sortedSample].reverse();
  let isInvertedSorted = true;
  for (let i = 0; i < invertedSample.length - 1; i++) {
    if (invertedSample[i].year > invertedSample[i + 1].year) {
      isInvertedSorted = false;
      break;
    }
  }
  assert.strictEqual(isInvertedSorted, false, 'Inverted sequence must detect anachronism and fail validation');

  // Test case C: Auto-sort pedagogical behavior
  const scrambled = [...sortedSample].sort(() => 0.5 - Math.random());
  const autoSorted = [...scrambled].sort((a, b) => a.year - b.year);
  for (let i = 0; i < autoSorted.length - 1; i++) {
    assert.ok(autoSorted[i].year <= autoSorted[i + 1].year, 'Auto-sort must yield non-decreasing years');
  }
});

test('2. La Matriz de Enfoques: Reglas de Clasificación y Puntuación Epistemológica', () => {
  const getCorrectCategoryId = (card, criteria) => {
    if (criteria === 'methodology') {
      return card.methodClass || 'Simulación y Modelado';
    }
    if (criteria === 'quality') {
      if (card.quality === 'Q1' || card.quality === 'Q2') return 'Q1-Q2';
      if (card.quality === 'Q3' || card.quality === 'Q4') return 'Q3-Q4';
      return 'Apoyo-NQ';
    }
    return card.categoryEs || card.category;
  };

  const sampleCard = cards.find(c => c.id === 'MTC06'); // Proceedings, Simulation, Estructura
  assert.ok(sampleCard, 'MTC06 must exist');
  const q1Card = cards.find(c => c.quality === 'Q1');
  assert.ok(q1Card, 'At least one Q1 card must exist');

  // Test category criterion
  assert.strictEqual(
    getCorrectCategoryId(sampleCard, 'category'),
    'Estructura, ergonomía y seguridad'
  );

  // Test methodology criterion
  assert.strictEqual(
    getCorrectCategoryId(sampleCard, 'methodology'),
    'Simulación y Modelado'
  );

  // Test quality criterion: Proceedings -> Apoyo-NQ, Q1 -> Q1-Q2
  assert.strictEqual(
    getCorrectCategoryId(sampleCard, 'quality'),
    'Apoyo-NQ'
  );
  assert.strictEqual(
    getCorrectCategoryId(q1Card, 'quality'),
    'Q1-Q2'
  );

  // Test point accumulation (+100 pts per correct match)
  let score = 0;
  const mockClassify = (card, targetQuadrant, criteria) => {
    const isCorrect = getCorrectCategoryId(card, criteria) === targetQuadrant;
    if (isCorrect) score += 100;
    return isCorrect;
  };

  assert.strictEqual(mockClassify(sampleCard, 'Simulación y Modelado', 'methodology'), true);
  assert.strictEqual(score, 100);
  assert.strictEqual(mockClassify(sampleCard, 'Diseño y Prototipado', 'methodology'), false);
  assert.strictEqual(score, 100, 'Score must not increment on wrong classification');
});

test('3. Cazadores de Vacíos: Síntesis Relacional y Extracción de Brechas', () => {
  const computeResearchGap = (selectedCards, question) => {
    const authors = selectedCards.map(c => `${c.firstAuthor} (${c.year})`).join(' y ');

    const hasStructure = selectedCards.some(c => c.category.includes('Structure') || (c.categoryEs && c.categoryEs.includes('Estructura')));
    const hasPropulsion = selectedCards.some(c => c.category.includes('Propulsion') || (c.categoryEs && c.categoryEs.includes('Propulsión')));
    const hasLogistics = selectedCards.some(c => c.category.includes('Logistics') || (c.categoryEs && c.categoryEs.includes('Logística')));
    const hasAccessibility = selectedCards.some(c => c.category.includes('Accessibility') || c.category.includes('Public') || (c.categoryEs && c.categoryEs.includes('Accesibilidad')));

    let title = 'Brecha de Integración Multidisciplinar y Validación Empírica';
    let desc = `Al contrastar las investigaciones de ${authors}...`;
    let just = `El proyecto del investigador aporta novedad al cerrar la brecha...`;

    if (hasStructure && hasLogistics) {
      title = 'Falta de Validación Estructural ante Cargas Dinámicas de Reparto en Última Milla';
      desc = 'Los estudios de chasis se limitan a cargas estáticas teóricas, mientras que los estudios de logística de carga no incorporan telemetría de fatiga mecánica en pavimentos irregulares.';
      just = 'Justifica la necesidad de diseñar estructuras ligeras optimizadas con pruebas de esfuerzo bajo ciclos de entrega reales.';
    } else if (hasStructure && hasPropulsion) {
      title = 'Desacoplamiento entre Control Dinámico Antivuelco y Eficiencia del Tren Motriz';
      desc = 'Los algoritmos de estabilidad asumen torque infinito sin considerar la caída de tensión en baterías de baja capacidad, mientras que los diseños de batería ignoran las demandas bruscas de frenado diferencial.';
      just = 'Abre la oportunidad para un sistema integrado de gestión energética y control de estabilidad dinámica de bajo costo.';
    } else if (hasAccessibility && hasPropulsion) {
      title = 'Incompatibilidad entre Asistencia Motriz Adaptativa y Restricciones de Autonomía Urbana';
      desc = 'Las interfaces ergonómicas para personas mayores o con discapacidad incrementan el peso y consumo motriz, sin contar con optimizaciones de carga solar o recuperación regenerativa compacta.';
      just = 'Demuestra la urgencia de desarrollar soluciones de movilidad inclusiva energéticamente autosuficientes para ciudades emergentes.';
    }

    return { id: `GAP-${Date.now()}`, title, cards: selectedCards, description: desc, justification: just };
  };

  const cardStruct = cards.find(c => c.category.includes('Structure') || (c.categoryEs && c.categoryEs.includes('Estructura')));
  const cardProp = cards.find(c => c.category.includes('Propulsion') || (c.categoryEs && c.categoryEs.includes('Propulsión')));
  const cardLog = cards.find(c => c.category.includes('Logistics') || (c.categoryEs && c.categoryEs.includes('Logística')));
  assert.ok(cardStruct && cardProp && cardLog, 'Must find representative cards for Structure, Propulsion, and Logistics');

  // Test Structure + Propulsion
  const gapSP = computeResearchGap([cardStruct, cardProp], topics[0].question);
  assert.strictEqual(gapSP.title, 'Desacoplamiento entre Control Dinámico Antivuelco y Eficiencia del Tren Motriz');
  assert.ok(gapSP.justification.includes('control de estabilidad dinámica'));

  // Test Structure + Logistics
  const gapSL = computeResearchGap([cardStruct, cardLog], topics[0].question);
  assert.strictEqual(gapSL.title, 'Falta de Validación Estructural ante Cargas Dinámicas de Reparto en Última Milla');
  assert.ok(gapSL.justification.includes('pruebas de esfuerzo bajo ciclos de entrega reales'));
});

test('4. Combates de Validación: Medición de Solapamiento y Emisión de Veredictos', () => {
  const computeOverlap = (cardA, cardB) => {
    let overlap = 30;
    if (cardA.category === cardB.category || cardA.categoryEs === cardB.categoryEs) overlap += 40;
    if (cardA.methodClass === cardB.methodClass) overlap += 20;
    return Math.min(overlap, 95);
  };

  const card1 = cards.find(c => c.id === 'MTC06'); // Structure, Simulation
  const card2 = cards.find(c => c.id === 'MTC43'); // Structure, Simulation
  const card3 = cards.find(c => c.id === 'MTC02'); // Propulsion, Design

  // Same category and same method: 30 + 40 + 20 = 90%
  assert.strictEqual(computeOverlap(card1, card2), 90);

  // Different category and different method: 30% base
  assert.strictEqual(computeOverlap(card1, card3), 30);
});

test('5. Redactor del Estado del Arte y Deduplicación de Antecedentes en Sesión', () => {
  const c1 = cards[0];
  const c2 = cards[1];
  const c3 = cards[2];

  // Map tracking: cards placed in multiple games must be deduplicated
  const timelineCards = [c1, c2];
  const matrixGroups = { 'CatA': [c2, c3] };
  const discoveredGaps = [{ id: 'GAP-1', cards: [c1, c3] }];

  const map = new Map();
  timelineCards.forEach(c => map.set(c.id, c));
  Object.values(matrixGroups).forEach(list => list.forEach(c => map.set(c.id, c)));
  discoveredGaps.forEach(g => g.cards.forEach(c => map.set(c.id, c)));

  const unique = Array.from(map.values());
  assert.strictEqual(unique.length, 3, 'Deduplication must yield exactly 3 unique cards');
  assert.ok(map.has(c1.id) && map.has(c2.id) && map.has(c3.id));
});

test('6. Verificación de Contenido Exportado: CSV, Markdown, BibTeX y JSON', () => {
  const tracked = [cards[0], cards[5], cards[10]];

  // CSV Generator test
  const escapeCSV = (field) => {
    if (field === undefined || field === null) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = ['ID', 'Titulo', 'Autores', 'Año', 'Categoria', 'Metodologia', 'Aporte_Principal', 'Limitacion_Vacio', 'Cuartil', 'Citas', 'SJR', 'CiteScore', 'DOI'];
  const rows = tracked.map(c => [
    escapeCSV(c.id),
    escapeCSV(c.title),
    escapeCSV(c.authors),
    c.year,
    escapeCSV(c.categoryEs || c.category),
    escapeCSV(c.methodology),
    escapeCSV(c.contribution),
    escapeCSV(c.limitation),
    escapeCSV(c.quality),
    c.citationCount || 0,
    escapeCSV(c.sjr),
    escapeCSV(c.citeScore),
    escapeCSV(c.doi)
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\r\n');

  assert.ok(csvContent.startsWith('ID,Titulo,Autores,Año,Categoria'), 'CSV must have correct header structure');
  assert.ok(csvContent.includes('MTC01'), 'CSV must contain card MTC01');
  assert.strictEqual(csvContent.split('\r\n').length, 4, 'CSV must have 1 header line and 3 data lines');

  // BibTeX generator test
  let bib = "";
  tracked.forEach(c => {
    const key = `${c.firstAuthor.replace(/\W/g, '')}${c.year}`;
    bib += `@article{${key},\n  author = {${c.authors}},\n  title = {${c.title}},\n  year = {${c.year}}\n}\n`;
  });
  assert.ok(bib.includes('@article{'), 'BibTeX must contain @article entries');
  assert.ok(bib.includes(tracked[0].year.toString()), 'BibTeX must contain correct publication year');
});
