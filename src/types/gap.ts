import { Card } from './card';

export interface ResearchGap {
  id: string;
  title: string;
  cards: Card[];
  description: string;
  justification: string;
}
