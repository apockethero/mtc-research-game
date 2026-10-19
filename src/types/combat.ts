import { Card } from './card';

export type CombatVerdict = 'hito' | 'complementaria' | 'redundante';

export interface CombatRecord {
  cardA: Card;
  cardB: Card;
  verdict: CombatVerdict;
  verdictLabel: string;
  analysis: string;
  timestamp: string;
}
