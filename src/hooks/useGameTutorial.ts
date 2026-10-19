import { useState, useEffect, useCallback } from 'react';
import { GameKey, TutorialsSeenState } from '../types/tutorial';

export const TUTORIAL_STORAGE_KEY = 'mtc_game_tutorials_seen';

// Estado en memoria para fallbacks cuando localStorage no esté disponible
const memoryTutorialState: TutorialsSeenState = {
  timeline: false,
  matrix: false,
  gapHunter: false,
  combat: false
};

export const getStoredTutorialState = (): TutorialsSeenState => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          timeline: Boolean(parsed.timeline),
          matrix: Boolean(parsed.matrix),
          gapHunter: Boolean(parsed.gapHunter),
          combat: Boolean(parsed.combat)
        };
      }
    }
  } catch (err) {
    console.warn('localStorage no está disponible para tutoriales. Usando memoria de sesión:', err);
  }
  return { ...memoryTutorialState };
};

export const setStoredTutorialState = (updated: Partial<TutorialsSeenState>): void => {
  try {
    const current = getStoredTutorialState();
    const next = { ...current, ...updated };
    Object.assign(memoryTutorialState, next);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(next));
    }
  } catch (err) {
    console.warn('Error al guardar estado de tutorial en localStorage:', err);
    Object.assign(memoryTutorialState, updated);
  }
};

export const useGameTutorial = (gameKey: GameKey) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    // Comprobar si este juego en particular ya fue visto
    const state = getStoredTutorialState();
    if (!state[gameKey]) {
      // Primera visita a este minijuego: abrir automáticamente
      setIsOpen(true);
    }
  }, [gameKey]);

  const markAsSeen = useCallback(() => {
    setStoredTutorialState({ [gameKey]: true });
  }, [gameKey]);

  const openTutorial = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeTutorial = useCallback(() => {
    markAsSeen();
    setIsOpen(false);
  }, [markAsSeen]);

  return {
    isOpen,
    openTutorial,
    closeTutorial,
    markAsSeen
  };
};
