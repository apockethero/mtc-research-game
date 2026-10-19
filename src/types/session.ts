import { Card, TopicConfig } from './card';
import { ResearchGap } from './gap';
import { CombatRecord } from './combat';

export type ClassificationCriteria = 'category' | 'methodology' | 'quality';

export interface SessionStats {
  timelineCount: number;
  classifiedCount: number;
  gapsCount: number;
  combatsCount: number;
  totalUniqueCards: number;
}

export interface SynthesisReport {
  topic: TopicConfig;
  historicalNarrative: string;
  comparativeTableMd: string;
  gapsNarrative: string;
  conclusions: string;
  stats: SessionStats;
}

export interface SessionState {
  topic: TopicConfig;
  criteria: ClassificationCriteria;
  deck: Card[];
  timelineCards: Card[];
  matrixGroups: Record<string, Card[]>;
  discoveredGaps: ResearchGap[];
  combats: CombatRecord[];
  soundEnabled: boolean;
  selectedCardForInspection: Card | null;
}
