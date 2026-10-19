import { Card } from '../types/card';
import { SynthesisReport } from '../types/session';

/**
 * Export Service - Maneja descargas directas en Blob sin dependencias de servidor
 * Soporta Markdown (.md), BibTeX (.bib), JSON (.json), CSV (.csv) e impresión PDF.
 */

function triggerBlobDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportMarkdown(report: SynthesisReport, cards: Card[]) {
  const md = `# Estado del Arte: ${report.topic.name}

> **Línea / Disciplina:** ${report.topic.field}  
> **Pregunta de Investigación Central:** ${report.topic.question}  
> **Fecha de Generación:** ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}  
> **Generado mediante:** MTC Traceable Review Cards & Gamified Research Assistant (React + TypeScript)

---

## 1. Introducción y Problema de Investigación
El presente marco de antecedentes examina el estado del arte en torno a **${report.topic.name}**, orientado a dar respuesta rigurosa y justificada a la interrogante:
*"${report.topic.question}"*.

---

## 2. Evolución Cronológica de la Evidencia (Antecedentes Históricos)
${report.historicalNarrative}

---

## 3. Matriz Comparativa de Investigaciones Previas
${report.comparativeTableMd}

---

## 4. Identificación de Vacíos Críticos de Investigación (Research Gaps)
${report.gapsNarrative}

---

## 5. Conclusiones Metodológicas y Justificación de la Propuesta
${report.conclusions}

---

### Referencias Bibliográficas Analizadas
${cards.map(c => `- ${c.citation || `${c.authors} (${c.year}). ${c.title}. ${c.venue}. ${c.doi || ''}`}`).join('\n')}
`;

  const safeTitle = report.topic.name.replace(/\s+/g, '_').slice(0, 30);
  triggerBlobDownload(md, `Estado_del_Arte_${safeTitle}.md`, 'text/markdown');
}

export function exportBibTeX(cards: Card[]) {
  if (cards.length === 0) {
    alert("Aún no has incorporado cartas al estado del arte para exportar en BibTeX.");
    return;
  }

  let bib = "% Archivo BibTeX generado automáticamente por MTC Research Game\n\n";
  cards.forEach(c => {
    const key = `${c.firstAuthor.replace(/\W/g, '')}${c.year}`;
    bib += `@article{${key},\n`;
    bib += `  author = {${c.authors}},\n`;
    bib += `  title = {${c.title}},\n`;
    bib += `  journal = {${c.venue || 'Journal Review'}},\n`;
    bib += `  year = {${c.year}},\n`;
    if (c.doi) bib += `  doi = {${c.doi.replace('https://doi.org/', '')}},\n`;
    bib += `  note = {Categoría: ${c.categoryEs || c.category}; Evidencia: ${c.methodology}; Calidad: ${c.quality || 'Verificada'}}\n`;
    bib += `}\n\n`;
  });

  triggerBlobDownload(bib, 'referencias_estado_del_arte.bib', 'text/plain');
}

export function exportJSON(sessionData: unknown) {
  const jsonStr = JSON.stringify(sessionData, null, 2);
  triggerBlobDownload(jsonStr, 'sesion_investigacion_mtc.json', 'application/json');
}

export function exportCSV(cards: Card[]) {
  if (cards.length === 0) {
    alert("No hay cartas registradas para exportar a CSV.");
    return;
  }

  const headers = [
    'ID',
    'Titulo',
    'Autores',
    'Año',
    'Categoria',
    'Metodologia',
    'Aporte_Principal',
    'Limitacion_Vacio',
    'Cuartil',
    'Citas',
    'SJR',
    'CiteScore',
    'DOI'
  ];

  const escapeCSV = (field: string | number | undefined | null) => {
    if (field === undefined || field === null) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = cards.map(c => [
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
  triggerBlobDownload(csvContent, 'matriz_antecedentes_mtc.csv', 'text/csv');
}

export function printThesisPDF() {
  window.print();
}
