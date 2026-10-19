/**
 * Types: Card & Bibliometrics
 * Modela una carta didáctica MTC con rigor científico y trazabilidad Scopus/SCImago.
 */

export type SourceQuality = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Proceedings' | 'Chapter' | 'NQ' | string;

export type MethodologyMacroClass = 
  | 'Simulación y Modelado'
  | 'Diseño y Prototipado'
  | 'Pruebas Experimentales'
  | 'Estudios Empíricos y Políticas';

export interface CardPoints {
  source: number;
  evidence: number;
  trace: number;
  risk: number;
}

export interface Card {
  id: string; // ej. "MTC01"
  title: string;
  authors: string;
  firstAuthor: string;
  year: number;
  category: string;
  categoryEs: string;
  categoryColor?: string;
  methodology: string; // Tipo de evidencia original
  methodClass: MethodologyMacroClass; // Macro-enfoque metodológico
  coreIdea: string;
  contribution: string;
  limitation: string;
  quality: SourceQuality;
  doi: string;
  venue: string;
  citation: string;
  citationCount: number;
  sjr: string;
  sjrQuartile: string;
  citeScore: string;
  image: string;
  keyword: string;
  venueHIndex?: number | null;
  scopusIndexed?: string;
  points: CardPoints;
}

export interface TopicConfig {
  id: string;
  name: string;
  question: string;
  field: string;
  defaultCategories: string[];
  deckType: 'mtc_pilot' | 'custom';
}
