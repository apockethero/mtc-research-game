import { Card, TopicConfig } from '../types/card';
import { ResearchGap } from '../types/gap';
import { SynthesisReport, SessionStats } from '../types/session';

/**
 * Synthesis Engine - Redactor Universal en Tiempo Real del Estado del Arte
 * Transforma el juego en un borrador estructurado para tesis o artículo científico.
 */

export function getAllTrackedCards(
  timelineCards: Card[],
  matrixGroups: Record<string, Card[]>,
  discoveredGaps: ResearchGap[]
): Card[] {
  const map = new Map<string, Card>();
  timelineCards.forEach(c => map.set(c.id, c));
  Object.values(matrixGroups).forEach(list => {
    if (Array.isArray(list)) {
      list.forEach(c => map.set(c.id, c));
    }
  });
  discoveredGaps.forEach(g => {
    if (g.cards) g.cards.forEach(c => map.set(c.id, c));
  });
  return Array.from(map.values());
}

export function generateHistoricalNarrative(topic: TopicConfig, timelineCards: Card[]): string {
  if (!timelineCards || timelineCards.length === 0) {
    return "*(Aún no se han ordenado hitos en el Puente de Cronología. A medida que ordenes las cartas en la línea de tiempo, este acápite se redactará automáticamente hilando la evolución tecnológica con citas académicas).*";
  }

  const sorted = [...timelineCards].sort((a, b) => a.year - b.year);
  const minYear = sorted[0].year;
  const maxYear = sorted[sorted.length - 1].year;

  let narrative = `El estudio de ${topic.name.toLowerCase()} ha transitado por una notable trayectoria evolutiva entre los años ${minYear} y ${maxYear}. `;
  
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
    narrative += `Más recientemente, los trabajos de frontera documentados por ${recentCit} enfatizan la necesidad de validaciones experimentales en condiciones operativas reales y modelos dinámicos avanzados. A pesar de estos avances significativos, persiste la necesidad imperiosa de integrar variables de operación específicas para resolver la problemática planteada: "${topic.question}".`;
  }

  return narrative;
}

export function generateComparativeTableMarkdown(cards: Card[]): string {
  if (cards.length === 0) {
    return "| Autor(es) y Año | Enfoque / Categoría | Metodología / Tipo Evidencia | Hallazgo / Aporte Principal | Vacío / Limitación Declarada | Trazabilidad (DOI/Índice) |\n|---|---|---|---|---|---|\n| *(Juega en la Matriz o Cronología para poblar la tabla)* | - | - | - | - | - |";
  }

  let md = "| Autor(es) y Año | Enfoque / Categoría | Metodología / Tipo Evidencia | Hallazgo / Aporte Principal | Vacío / Limitación Declarada | Trazabilidad (DOI/Índice) |\n";
  md += "|---|---|---|---|---|---|\n";

  cards.forEach(c => {
    const doiLink = c.doi ? `[${c.quality || 'DOI'}](${c.doi})` : (c.quality || "N/A");
    md += `| **${c.firstAuthor} et al. (${c.year})** | ${c.categoryEs || c.category} | ${c.methodology} | ${c.contribution} | *${c.limitation}* | ${doiLink} |\n`;
  });

  return md;
}

export function generateGapsNarrative(gaps: ResearchGap[]): string {
  if (!gaps || gaps.length === 0) {
    return "*(Aún no se han sintetizado haces en 'Cazadores de Vacíos'. Conecta 2 o más cartas en la constelación para que el algoritmo extraiga los vacíos de investigación complementarios que justifican tu tesis).*";
  }

  let text = `A partir del análisis de constelaciones y cruce de limitaciones metodológicas, se han identificado ${gaps.length} vacíos de investigación esenciales que justifican la necesidad del presente estudio:\n\n`;

  gaps.forEach((gap, idx) => {
    text += `#### Vacío de Investigación ${idx + 1}: ${gap.title}\n`;
    text += `- **Artículos en tensión:** ${gap.cards.map(c => `**${c.firstAuthor} et al. (${c.year})** [${c.id}]`).join(" y ")}.\n`;
    text += `- **Brecha identificada:** ${gap.description}\n`;
    text += `- **Justificación para el proyecto:** ${gap.justification}\n\n`;
  });

  return text;
}

export function generateConclusions(topic: TopicConfig, cards: Card[], gaps: ResearchGap[]): string {
  const totalCards = cards.length;
  const totalGaps = gaps.length;

  let text = `La sistematización interactiva de ${totalCards > 0 ? totalCards : 'múltiples'} antecedentes especializados ha permitido corroborar que, si bien la literatura provee soluciones aisladas de diseño y simulación, existe una fragmentación crítica entre el modelado teórico y su validación contextual. `;
  
  if (totalGaps > 0) {
    text += `Específicamente, los ${totalGaps} vacíos metodológicos delimitados revelan una clara oportunidad de investigación para abordar de manera integral el problema formulado: "${topic.question}". `;
  } else {
    text += `Se recomienda continuar la exploración de contrastes entre fuentes cuantitativas y cualitativas para consolidar el nicho de investigación.`;
  }

  text += `\n\nPor tanto, la propuesta de tesis se sitúa no como una mera reiteración técnica, sino como un puente resolutivo entre las limitaciones observadas en la literatura previa y los requerimientos del contexto de aplicación.`;

  return text;
}

export function buildFullSynthesisReport(
  topic: TopicConfig,
  timelineCards: Card[],
  matrixGroups: Record<string, Card[]>,
  discoveredGaps: ResearchGap[],
  combatsCount: number
): SynthesisReport {
  const allCards = getAllTrackedCards(timelineCards, matrixGroups, discoveredGaps);
  const classifiedCount = Object.values(matrixGroups).reduce((acc, l) => acc + (l.length || 0), 0);

  const stats: SessionStats = {
    timelineCount: timelineCards.length,
    classifiedCount,
    gapsCount: discoveredGaps.length,
    combatsCount,
    totalUniqueCards: allCards.length
  };

  return {
    topic,
    historicalNarrative: generateHistoricalNarrative(topic, timelineCards),
    comparativeTableMd: generateComparativeTableMarkdown(allCards),
    gapsNarrative: generateGapsNarrative(discoveredGaps),
    conclusions: generateConclusions(topic, allCards, discoveredGaps),
    stats
  };
}
