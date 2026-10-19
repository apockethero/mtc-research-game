import { ReactNode } from 'react';

export type GameKey = 'timeline' | 'matrix' | 'gapHunter' | 'combat';

export interface TutorialStep {
  stepNumber: number;
  title: string;
  explanation: string;
  visualAlt: string;
  visualComponent: React.ComponentType | ReactNode;
}

export interface GameTutorialConfig {
  gameKey: GameKey;
  gameTitle: string;
  badgeTag: string;
  steps: TutorialStep[];
  startBtnLabel: string;
}

export interface TutorialsSeenState {
  timeline: boolean;
  matrix: boolean;
  gapHunter: boolean;
  combat: boolean;
}
