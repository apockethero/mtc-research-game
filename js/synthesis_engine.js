/**
 * Synthesis Engine - Redactor Universal en Tiempo Real del Estado del Arte
 * Recopila las interacciones del jugador (cronología, clasificación, vacíos detectados y combates)
 * y genera automáticamente el borrador académico del marco teórico / estado del arte para tesis.
 */
class SynthesisEngine {
  constructor() {
    this.topicInfo = {
      name: "Mototriciclos Eléctricos y Movilidad Ligera (MTC)",
      question: "¿Cómo optimizar la estabilidad, la propulsión eficiente y la accesibilidad ergonómica en vehículos eléctricos de 3 ruedas para el transporte urbano y periurbano en el Sur Global?",
      field: "Ingeniería de Transporte & Electromovilidad"
    };
    this.timelineCards = []; // Cartas ordenadas en el Puente de Cronología
    this.matrixGroups = {};  // Agrupaciones por categoría o metodología
    this.discoveredGaps = []; // Vacíos identificados en Cazadores de Vacíos
    this.combats = []; // Enfrentamientos de novedad vs redundancia
    this.listeners = [];
  }

  setTopic(topic) {
    this.topicInfo = { ...this.topicInfo, ...topic };
    this.notifyUpdate();
  }

  recordTimelineOrder(cards) {
    this.timelineCards = [...cards];
    this.notifyUpdate();
  }

  recordMatrixClassification(groups) {
    this.matrixGroups = { ...groups };
    this.notifyUpdate();
  }

  recordDiscoveredGap(gap) {
    // Evitar duplicados por par de cartas
    const exists = this.discoveredGaps.some(g => g.id === gap.id);
    if (!exists) {
      this.discoveredGaps.push(gap);
      this.notifyUpdate();
    }
  }

  recordCombat(combatRecord) {
    this.combats.push(combatRecord);
    this.notifyUpdate();
  }

  onUpdate(callback) {
    this.listeners.push(callback);
  }

  notifyUpdate() {
    const report = this.generateFullReport();
    this.listeners.forEach(cb => cb(report));
  }

  /**
   * Redacta la sección de antecedentes históricos a partir del orden temporal de las cartas
   */
  generateHistoricalNarrative() {
    if (!this.timelineCards || this.timelineCards.length === 0) {
      return "*(Aún no se han ordenado hitos en el Puente de Cronología. A medida que ordenes las cartas en la línea de tiempo, este acápite se redactará automáticamente hilando la evolución tecnológica con citas académicas).*";
    }

    const sorted = [...this.timelineCards].sort((a, b) => a.year - b.year);
    const minYear = sorted[0].year;
    const maxYear = sorted[sorted.length - 1].year;

    let narrative = `El estudio de ${this.topicInfo.name.toLowerCase()} ha transitado por una notable trayectoria evolutiva entre los años ${minYear} y ${maxYear}. `;
    
    // Agrupar cartas tempranas, intermedias y contemporáneas
    const early = sorted.filter(c => c.year <= minYear + 3);
    const mid = sorted.filter(c => c.year > minYear + 3 && c.year < maxYear - 1);
    const recent = sorted.filter(c => c.year >= maxYear - 1);

    if (early.length > 0) {
      const earlyCitations = early.map(c => `${c.firstAuthor} et al. (${c.year})`).join("; ");
      narrative += `En una etapa inicial, los esfuerzos pioneros se concentraron en el modelado conceptual y diseño preliminar. Investigaciones como las desarrolladas por ${earlyCitations} sentaron las bases al abordar ${early[0].coreIdea.toLowerCase()} Sin embargo, estas propuestas primarias presentaron limitaciones asociadas a ${early[0].limitation.toLowerCase()} `;
    }

    if (mid.length > 0) {
      narrative += `Con el avance de la madurez tecnológica, autores como ${mid.map(c => `${c.firstAuthor} et al. (${c.year})`).join(", ")} expandieron el espectro analítico mediante ${mid[0].methodology.toLowerCase()}, demostrando que ${mid[0].contribution.toLowerCase()} `;
    }

    if (recent.length > 0) {
      const recentCit = recent.map(c => `${c.firstAuthor} et al. (${c.year})`).join("; ");
      narrative += `Más recientemente, los trabajos de frontera documentados por ${recentCit} enfatizan la necesidad de validaciones experimentales en condiciones operativas reales y modelos dinámicos avanzados. A pesar de estos avances significativos, persiste la necesidad imperiosa de integrar variables de operación específicas para resolver la problemática planteada: "${this.topicInfo.question}".`;
    }

    return narrative;
  }

  /**
   * Genera la tabla comparativa matricial de autores
   */
  generateComparativeTableMarkdown() {
    let rows = [];
    const allCards = this.getAllTrackedCards();

    if (allCards.length === 0) {
      return "| Autor(es) y Año | Enfoque / Categoría | Metodología / Tipo Evidencia | Hallazgo / Aporte Principal | Vacío / Limitación Declarada | Trazabilidad (DOI/Índice) |\n|---|---|---|---|---|---|\n| *(Juega en la Matriz o Cronología para poblar la tabla)* | - | - | - | - | - |";
    }

    let md = "| Autor(es) y Año | Enfoque / Categoría | Metodología / Tipo Evidencia | Hallazgo / Aporte Principal | Vacío / Limitación Declarada | Trazabilidad (DOI/Índice) |\n";
    md += "|---|---|---|---|---|---|\n";

    allCards.forEach(c => {
      const doiLink = c.doi ? `[${c.quality || 'DOI'}](${c.doi})` : (c.quality || "N/A");
      md += `| **${c.firstAuthor} et al. (${c.year})** | ${c.categoryEs || c.category} | ${c.methodology} | ${c.contribution} | *${c.limitation}* | ${doiLink} |\n`;
    });

    return md;
  }

  /**
   * Redacta la sección de Vacíos Críticos de Investigación (Research Gaps)
   */
  generateGapsNarrative() {
    if (!this.discoveredGaps || this.discoveredGaps.length === 0) {
      return "*(Aún no se han sintetizado haces en 'Cazadores de Vacíos'. Conecta 2 o más cartas en la constelación para que el algoritmo extraiga los vacíos de investigación complementarios que justifican tu tesis).*";
    }

    let text = `A partir del análisis de constelaciones y cruce de limitaciones metodológicas, se han identificado ${this.discoveredGaps.length} vacíos de investigación esenciales que justifican la necesidad del presente estudio:\n\n`;

    this.discoveredGaps.forEach((gap, idx) => {
      text += `#### Vacío de Investigación ${idx + 1}: ${gap.title}\n`;
      text += `- **Artículos en tensión:** ${gap.cards.map(c => `**${c.firstAuthor} et al. (${c.year})** [${c.id}]`).join(" y ")}.\n`;
      text += `- **Brecha identificada:** ${gap.description}\n`;
      text += `- **Justificación para el proyecto:** ${gap.justification}\n\n`;
    });

    return text;
  }

  /**
   * Genera conclusiones preliminares y recomendaciones
   */
  generateConclusions() {
    const totalCards = this.getAllTrackedCards().length;
    const totalGaps = this.discoveredGaps.length;

    let text = `La sistematización interactiva de ${totalCards > 0 ? totalCards : 'múltiples'} antecedentes especializados ha permitido corroborar que, si bien la literatura provee soluciones aisladas de diseño y simulación, existe una fragmentación crítica entre el modelado teórico y su validación contextual. `;
    
    if (totalGaps > 0) {
      text += `Específicamente, los ${totalGaps} vacíos metodológicos delimitados revelan una clara oportunidad de investigación para abordar de manera integral el problema formulado: "${this.topicInfo.question}". `;
    } else {
      text += `Se recomienda continuar la exploración de contrastes entre fuentes cuantitativas y cualitativas para consolidar el nicho de investigación.`;
    }

    text += `\n\nPor tanto, la propuesta de tesis se sitúa no como una mera reiteración técnica, sino como un puente resolutivo entre las limitaciones observadas en la literatura previa y los requerimientos del contexto de aplicación.`;

    return text;
  }

  getAllTrackedCards() {
    const map = new Map();
    // Añadir desde timeline
    this.timelineCards.forEach(c => map.set(c.id, c));
    // Añadir desde matriz
    Object.values(this.matrixGroups).forEach(list => {
      if (Array.isArray(list)) {
        list.forEach(c => map.set(c.id, c));
      }
    });
    // Añadir desde vacíos
    this.discoveredGaps.forEach(g => {
      if (g.cards) g.cards.forEach(c => map.set(c.id, c));
    });
    return Array.from(map.values());
  }

  generateFullReport() {
    return {
      topic: this.topicInfo,
      historicalNarrative: this.generateHistoricalNarrative(),
      comparativeTableMd: this.generateComparativeTableMarkdown(),
      gapsNarrative: this.generateGapsNarrative(),
      conclusions: this.generateConclusions(),
      stats: {
        timelineCount: this.timelineCards.length,
        classifiedCount: Object.values(this.matrixGroups).reduce((acc, l) => acc + (l.length || 0), 0),
        gapsCount: this.discoveredGaps.length,
        combatsCount: this.combats.length,
        totalUniqueCards: this.getAllTrackedCards().length
      }
    };
  }

  exportMarkdown() {
    const report = this.generateFullReport();
    const md = `# Estado del Arte: ${report.topic.name}

> **Línea / Disciplina:** ${report.topic.field}  
> **Pregunta de Investigación Central:** ${report.topic.question}  
> **Fecha de Generación:** ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}  
> **Generado mediante:** MTC Traceable Review Cards & Gamified Research Assistant

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
${this.getAllTrackedCards().map(c => `- ${c.citation || `${c.authors} (${c.year}). ${c.title}. ${c.venue}. ${c.doi || ''}`}`).join('\n')}
`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Estado_del_Arte_${report.topic.name.replace(/\s+/g, "_").slice(0, 30)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportBibTeX() {
    const cards = this.getAllTrackedCards();
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

    const blob = new Blob([bib], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "referencias_estado_del_arte.bib";
    a.click();
    URL.revokeObjectURL(url);
  }

  exportJSON() {
    const data = {
      timestamp: new Date().toISOString(),
      report: this.generateFullReport(),
      cards: this.getAllTrackedCards(),
      timeline: this.timelineCards.map(c => c.id),
      matrix: Object.fromEntries(
        Object.entries(this.matrixGroups).map(([k, v]) => [k, v.map(c => c.id)])
      ),
      gaps: this.discoveredGaps,
      combats: this.combats
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sesion_investigacion_mtc.json";
    a.click();
    URL.revokeObjectURL(url);
  }
}

window.synthesisEngine = new SynthesisEngine();
