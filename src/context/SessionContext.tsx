import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Card, TopicConfig } from '../types/card';
import { ResearchGap } from '../types/gap';
import { CombatRecord } from '../types/combat';
import { ClassificationCriteria, SessionStats, SynthesisReport } from '../types/session';
import { DEFAULT_TOPICS } from '../data/topics/defaultTopics';
import { MTC_CARDS_DATA } from '../data/cards/mtcCardsData';
import { soundEngine } from '../services/soundEngine';
import { buildFullSynthesisReport, getAllTrackedCards } from '../services/synthesisEngine';

export type NavTab = 'deck' | 'timeline' | 'matrix' | 'gaphunter' | 'combat' | 'evaluation' | 'synthesis';

interface SessionContextValue {
  topic: TopicConfig;
  setTopic: (t: TopicConfig) => void;
  criteria: ClassificationCriteria;
  setCriteria: (c: ClassificationCriteria) => void;
  deck: Card[];
  setDeck: (cards: Card[]) => void;
  timelineCards: Card[];
  setTimelineCards: React.Dispatch<React.SetStateAction<Card[]>>;
  matrixGroups: Record<string, Card[]>;
  setMatrixGroups: React.Dispatch<React.SetStateAction<Record<string, Card[]>>>;
  discoveredGaps: ResearchGap[];
  addDiscoveredGap: (gap: ResearchGap) => void;
  combats: CombatRecord[];
  addCombatRecord: (record: CombatRecord) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  selectedCardForInspection: Card | null;
  inspectCard: (card: Card | null) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isWizardOpen: boolean;
  setWizardOpen: (open: boolean) => void;
  resetSession: () => void;
  allTrackedCards: Card[];
  report: SynthesisReport;
  stats: SessionStats;
}

const STORAGE_KEY = 'mtc_research_game_state_v2';

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [topic, setTopic] = useState<TopicConfig>(DEFAULT_TOPICS[0]);
  const [criteria, setCriteria] = useState<ClassificationCriteria>('category');
  const [deck, setDeck] = useState<Card[]>(MTC_CARDS_DATA);
  const [timelineCards, setTimelineCards] = useState<Card[]>([]);
  const [matrixGroups, setMatrixGroups] = useState<Record<string, Card[]>>({});
  const [discoveredGaps, setDiscoveredGaps] = useState<ResearchGap[]>([]);
  const [combats, setCombats] = useState<CombatRecord[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedCardForInspection, setSelectedCardForInspection] = useState<Card | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('deck');
  const [isWizardOpen, setWizardOpen] = useState<boolean>(false);

  // Intentar restaurar sesión guardada
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.topic) setTopic(parsed.topic);
        if (parsed.criteria) setCriteria(parsed.criteria);
        if (parsed.deck && Array.isArray(parsed.deck) && parsed.deck.length > 0) setDeck(parsed.deck);
        if (parsed.timelineCards && Array.isArray(parsed.timelineCards)) setTimelineCards(parsed.timelineCards);
        if (parsed.matrixGroups && typeof parsed.matrixGroups === 'object') setMatrixGroups(parsed.matrixGroups);
        if (parsed.discoveredGaps && Array.isArray(parsed.discoveredGaps)) setDiscoveredGaps(parsed.discoveredGaps);
        if (parsed.combats && Array.isArray(parsed.combats)) setCombats(parsed.combats);
      }
    } catch (e) {
      console.warn("Could not load saved session state:", e);
    }
  }, []);

  // Guardar en localStorage ante cambios relevantes
  useEffect(() => {
    try {
      const stateToPersist = {
        topic,
        criteria,
        deck,
        timelineCards,
        matrixGroups,
        discoveredGaps,
        combats
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch (e) {
      console.warn("Failed to save state to localStorage:", e);
    }
  }, [topic, criteria, deck, timelineCards, matrixGroups, discoveredGaps, combats]);

  const toggleSound = () => {
    const isNowOn = soundEngine.toggleSound();
    setSoundEnabled(isNowOn);
  };

  const inspectCard = (card: Card | null) => {
    if (card) soundEngine.playFlip();
    setSelectedCardForInspection(card);
  };

  const addDiscoveredGap = (gap: ResearchGap) => {
    setDiscoveredGaps(prev => {
      if (prev.some(g => g.id === gap.id)) return prev;
      return [gap, ...prev];
    });
  };

  const addCombatRecord = (record: CombatRecord) => {
    setCombats(prev => [record, ...prev]);
  };

  const resetSession = () => {
    if (window.confirm("¿Seguro que deseas reiniciar la partida y los avances de investigación?")) {
      setTopic(DEFAULT_TOPICS[0]);
      setCriteria('category');
      setDeck(MTC_CARDS_DATA);
      setTimelineCards([]);
      setMatrixGroups({});
      setDiscoveredGaps([]);
      setCombats([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const allTrackedCards = useMemo(() => {
    return getAllTrackedCards(timelineCards, matrixGroups, discoveredGaps);
  }, [timelineCards, matrixGroups, discoveredGaps]);

  const report = useMemo(() => {
    return buildFullSynthesisReport(topic, timelineCards, matrixGroups, discoveredGaps, combats.length);
  }, [topic, timelineCards, matrixGroups, discoveredGaps, combats.length]);

  const stats = report.stats;

  return (
    <SessionContext.Provider
      value={{
        topic,
        setTopic,
        criteria,
        setCriteria,
        deck,
        setDeck,
        timelineCards,
        setTimelineCards,
        matrixGroups,
        setMatrixGroups,
        discoveredGaps,
        addDiscoveredGap,
        combats,
        addCombatRecord,
        soundEnabled,
        toggleSound,
        selectedCardForInspection,
        inspectCard,
        activeTab,
        setActiveTab,
        isWizardOpen,
        setWizardOpen,
        resetSession,
        allTrackedCards,
        report,
        stats
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
