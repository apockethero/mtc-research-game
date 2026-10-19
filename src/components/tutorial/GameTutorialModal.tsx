import React, { useState, useEffect, useRef } from 'react';
import { GameKey } from '../../types/tutorial';
import { TUTORIAL_CONFIGS } from './tutorialData';
import { soundEngine } from '../../services/soundEngine';

interface GameTutorialModalProps {
  gameKey: GameKey;
  isOpen: boolean;
  onClose: () => void;
}

export const GameTutorialModal: React.FC<GameTutorialModalProps> = ({
  gameKey,
  isOpen,
  onClose
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);

  const config = TUTORIAL_CONFIGS[gameKey];
  const steps = config?.steps || [];
  const currentStep = steps[currentStepIdx];
  const totalSteps = steps.length;
  const isFirstStep = currentStepIdx === 0;
  const isLastStep = currentStepIdx === totalSteps - 1;

  // Al abrir el modal, reiniciar al paso 0 y enfocar
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIdx(0);
      setTimeout(() => {
        nextBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Manejo de teclado (Escape para cerrar, Flechas para navegar)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        soundEngine.playDrop();
        onClose();
      } else if (e.key === 'ArrowRight' && !isLastStep) {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIdx, isFirstStep, isLastStep, onClose]);

  if (!isOpen || !config || steps.length === 0) return null;

  const handleNext = () => {
    if (isLastStep) {
      soundEngine.playSuccess();
      onClose();
    } else {
      soundEngine.playFlip();
      setCurrentStepIdx(prev => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      soundEngine.playFlip();
      setCurrentStepIdx(prev => Math.max(prev - 1, 0));
    }
  };

  const handleSkip = () => {
    soundEngine.playDrop();
    onClose();
  };

  return (
    <div
      className="modal-overlay tutorial-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-modal-title"
      onClick={(e) => {
        // Cerrar si hace clic fuera del contenedor principal
        if (e.target === e.currentTarget) {
          soundEngine.playDrop();
          onClose();
        }
      }}
    >
      <div className="glass-panel tutorial-modal-container" ref={modalRef}>
        {/* Cabecera del tutorial */}
        <div className="tutorial-header">
          <div className="tutorial-header-meta">
            <span className="game-tag tutorial-badge">{config.badgeTag}</span>
            <h3 id="tutorial-modal-title" className="tutorial-game-title">
              {config.gameTitle}
            </h3>
          </div>

          <div className="tutorial-header-right">
            {/* Indicador de paso numérico */}
            <div className="tutorial-step-counter">
              Paso <span>{currentStepIdx + 1}</span> de {totalSteps}
            </div>

            {/* Botón de cierre */}
            <button
              type="button"
              className="tutorial-close-btn"
              onClick={() => {
                soundEngine.playDrop();
                onClose();
              }}
              aria-label="Cerrar tutorial"
              title="Cerrar tutorial (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Barra de progreso de puntos */}
        <div className="tutorial-progress-bar" role="tablist" aria-label="Progreso del tutorial">
          {steps.map((st, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <button
                key={st.stepNumber}
                type="button"
                className={`tutorial-progress-dot ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  soundEngine.playFlip();
                  setCurrentStepIdx(idx);
                }}
                aria-label={`Ir al paso ${idx + 1}: ${st.title}`}
                title={`Paso ${idx + 1}: ${st.title}`}
              />
            );
          })}
        </div>

        {/* Cuerpo del paso actual */}
        <div className="tutorial-body">
          <div className="tutorial-step-header">
            <h4 className="tutorial-step-title">{currentStep.title}</h4>
            <p className="tutorial-step-explanation">{currentStep.explanation}</p>
          </div>

          {/* Recurso visual / Diagrama SVG interactivo */}
          <div className="tutorial-visual-wrapper">
            {React.isValidElement(currentStep.visualComponent) ? (
              currentStep.visualComponent
            ) : typeof currentStep.visualComponent === 'function' ? (
              React.createElement(currentStep.visualComponent)
            ) : null}
          </div>
        </div>

        {/* Pie de navegación del tutorial */}
        <div className="tutorial-footer">
          <button
            type="button"
            className="cyber-btn cyber-btn-outline tutorial-skip-btn"
            onClick={handleSkip}
          >
            Saltar tutorial
          </button>

          <div className="tutorial-nav-controls">
            <button
              type="button"
              className="cyber-btn cyber-btn-secondary"
              onClick={handlePrev}
              disabled={isFirstStep}
              style={{ visibility: isFirstStep ? 'hidden' : 'visible' }}
            >
              ← Anterior
            </button>

            <button
              ref={nextBtnRef}
              type="button"
              className={`cyber-btn ${isLastStep ? 'cyber-btn-primary tutorial-start-btn' : 'cyber-btn-primary'}`}
              onClick={handleNext}
            >
              {isLastStep ? `${config.startBtnLabel} 🚀` : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
