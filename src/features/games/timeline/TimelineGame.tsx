import React, { useState, useEffect } from 'react';
import { Card } from '../../../types/card';
import { useSession } from '../../../context/SessionContext';
import { soundEngine } from '../../../services/soundEngine';
import { getCardImageUrl, getCardBackImageUrl } from '../../../utils/imagePath';
import { useGameTutorial } from '../../../hooks/useGameTutorial';
import { GameTutorialModal } from '../../../components/tutorial/GameTutorialModal';

export const TimelineGame: React.FC = () => {
  const { deck, topic, setTimelineCards, inspectCard, setActiveTab } = useSession();
  const { isOpen: isTutorialOpen, openTutorial, closeTutorial } = useGameTutorial('timeline');

  const [poolCards, setPoolCards] = useState<Card[]>([]);
  const [slots, setSlots] = useState<(Card | null)[]>([]);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning';
    title: string;
    message: string;
  } | null>(null);
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});

  // Inicializar muestra de cartas variadas en años
  useEffect(() => {
    const sampleIds = ['MTC03', 'MTC02', 'MTC36', 'MTC01', 'MTC09', 'MTC18', 'MTC04', 'MTC06', 'MTC17'];
    let sample = deck.filter(c => sampleIds.includes(c.id));
    if (sample.length < 6) {
      sample = deck.slice(0, 8);
    }
    // Barajar aleatoriamente
    const shuffled = [...sample].sort(() => Math.random() - 0.5);
    setPoolCards(shuffled);
    setSlots(new Array(shuffled.length).fill(null));
  }, [deck]);

  // Actualizar estado global de timelineCards cuando cambien los slots
  useEffect(() => {
    const activeTimeline = slots.filter((c): c is Card => c !== null);
    setTimelineCards(activeTimeline);
  }, [slots, setTimelineCards]);

  const toggleCardFlip = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playFlip();
    setFlippedMap(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const handleDragStart = (card: Card, e: React.DragEvent) => {
    setDraggedCardId(card.id);
    e.dataTransfer.setData('text/plain', card.id);
    soundEngine.playFlip();
  };

  const handleDragOver = (idx: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(idx);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (targetIdx: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (!cardId) return;

    const card = poolCards.find(c => c.id === cardId);
    if (!card) return;

    soundEngine.playDrop();

    setSlots(prev => {
      const next = [...prev];
      // Si ya estaba en otro slot, vaciarlo
      const existingIdx = next.findIndex(c => c?.id === card.id);
      if (existingIdx !== -1) {
        next[existingIdx] = null;
      }
      next[targetIdx] = card;
      return next;
    });
  };

  const handleRemoveFromSlot = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playDrop();
    setSlots(prev => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    setFeedback(null);
  };

  const handleCardClickToSlot = (card: Card) => {
    // Si ya está colocada, no hacer nada
    if (slots.some(c => c?.id === card.id)) return;

    // Buscar primer slot libre
    const firstEmpty = slots.findIndex(c => c === null);
    if (firstEmpty !== -1) {
      soundEngine.playDrop();
      setSlots(prev => {
        const next = [...prev];
        next[firstEmpty] = card;
        return next;
      });
    }
  };

  const handleValidate = () => {
    const filled = slots.filter((c): c is Card => c !== null);
    if (filled.length < 3) {
      alert('Coloca al menos 3 cartas en la línea de tiempo antes de validar el puente.');
      return;
    }

    let isSorted = true;
    for (let i = 0; i < filled.length - 1; i++) {
      if (filled[i].year > filled[i + 1].year) {
        isSorted = false;
        break;
      }
    }

    if (isSorted) {
      soundEngine.playSuccess();
      setFeedback({
        type: 'success',
        title: '✨ ¡Excelente! El Puente de Cronología es Coherente',
        message: `Has alineado correctamente la secuencia evolutiva (${filled[0].year} a ${filled[filled.length - 1].year}). La narrativa histórica del estado del arte se ha actualizado en tiempo real con citas académicas.`
      });
    } else {
      soundEngine.playError();
      setFeedback({
        type: 'warning',
        title: '⚠️ Hay Anacronismos en la Secuencia',
        message: 'Algunos antecedentes están ubicados antes de publicaciones de años anteriores. Recuerda revisar el año de publicación en el reverso o insignia de cada carta.'
      });
    }
  };

  const handleAutoSort = () => {
    soundEngine.playSuccess();
    const sorted = [...poolCards].sort((a, b) => a.year - b.year);
    setSlots(sorted);
    setFeedback({
      type: 'success',
      title: '💡 Auto-ordenación Pedagógica Completada',
      message: `Se han alineado cronológicamente los ${sorted.length} hitos desde ${sorted[0].year} hasta ${sorted[sorted.length - 1].year}. Observa cómo evoluciona la metodología de diseño inicial a pruebas en carretera.`
    });
  };

  const handleReset = () => {
    soundEngine.playDrop();
    setSlots(new Array(poolCards.length).fill(null));
    setFeedback(null);
  };

  return (
    <div className="view-panel active">
      <div className="game-wrapper">
        <div className="game-header-bar">
          <div>
            <div className="game-tag">DINÁMICA 1 · ORDENACIÓN TEMPORAL</div>
            <h2>El Puente de Cronología</h2>
            <p>
              Arrastra las cartas de la bandeja inferior hacia los hitos temporales para reconstruir la evolución tecnológica de <b>{topic.name}</b>.
            </p>
          </div>
          <div className="game-actions">
            <button
              className="cyber-btn cyber-btn-outline tutorial-trigger-btn"
              onClick={openTutorial}
              title="Ver tutorial de El Puente de Cronología"
            >
              📖 ¿Cómo se juega?
            </button>
            <button className="cyber-btn cyber-btn-primary" onClick={handleValidate}>
              Validar Puente ⚡
            </button>
            <button className="cyber-btn cyber-btn-secondary" onClick={handleAutoSort} style={{ fontSize: '12px' }}>
              Ayuda Pedagógica (Auto-ordenar)
            </button>
            <button className="cyber-btn cyber-btn-outline" onClick={handleReset} style={{ fontSize: '12px' }}>
              Reiniciar
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {feedback && (
          <div className={`timeline-feedback-banner ${feedback.type}`}>
            <h4 style={{ fontWeight: 800, marginBottom: '4px' }}>{feedback.title}</h4>
            <p style={{ fontSize: '13px', margin: 0 }}>{feedback.message}</p>
            {feedback.type === 'success' && (
              <button
                className="cyber-btn cyber-btn-primary"
                style={{ marginTop: '10px', fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setActiveTab('synthesis')}
              >
                Ver Evolución Histórica en el Borrador 📝
              </button>
            )}
          </div>
        )}

        {/* PUENTE DE CRONOLOGÍA (SLOTS) */}
        <div className="timeline-bridge-wrapper">
          <div className="timeline-meta-track">
            <span className="track-label start">2012 · Inicios & Modelado Conceptual</span>
            <div className="track-pulse"></div>
            <span className="track-label end">2025 · Validación & Frontera Tecnológica</span>
          </div>

          <div className="timeline-slots-container">
            {slots.map((card, idx) => {
              const isDragOver = dragOverIndex === idx;

              return (
                <div
                  key={idx}
                  className="timeline-slot"
                  onDragOver={(e) => handleDragOver(idx, e)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(idx, e)}
                >
                  <div className="slot-marker">Hito {idx + 1}</div>
                  <div className={`slot-dropzone ${card ? 'filled' : 'empty'} ${isDragOver ? 'drag-over' : ''}`}>
                    {card ? (
                      <div className="placed-card-preview">
                        <button
                          type="button"
                          className="remove-slot-btn"
                          onClick={(e) => handleRemoveFromSlot(idx, e)}
                          title="Quitar de este hito"
                        >
                          ✕
                        </button>
                        <span className="placed-year">{card.year}</span>
                        <img
                          src={getCardImageUrl(card.image, card.id)}
                          alt={card.title}
                          className="placed-thumb"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getCardBackImageUrl();
                          }}
                        />
                        <div className="placed-info">
                          <strong>{card.id} ({card.firstAuthor})</strong>
                          <span title={card.title}>{card.title.slice(0, 32)}...</span>
                        </div>
                        <button
                          type="button"
                          style={{
                            background: 'transparent',
                            border: 0,
                            color: 'var(--c-peach)',
                            fontSize: '10px',
                            cursor: 'pointer',
                            padding: '2px 4px'
                          }}
                          onClick={() => inspectCard(card)}
                        >
                          🔍 Ficha
                        </button>
                      </div>
                    ) : (
                      <span className="drop-hint">+ Arrastra una carta aquí</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BANDEJA DE ANTECEDENTES DESORDENADOS */}
        <div className="timeline-pool-section">
          <div className="pool-title">
            <span>
              Bandeja de Antecedentes Desordenados ({poolCards.filter(c => !slots.some(s => s?.id === c.id)).length} disponibles):
            </span>
            <span className="pool-tip">
              💡 Haz clic en una carta libre para colocarla en el primer hito disponible, o arrástrala. Voltea para ver detalles.
            </span>
          </div>

          <div className="timeline-cards-pool">
            {poolCards.map(c => {
              const isPlaced = slots.some(s => s?.id === c.id);
              const isFlipped = !!flippedMap[c.id];

              return (
                <div
                  key={c.id}
                  className={`draggable-card-wrap ${isPlaced ? 'placed' : ''}`}
                  draggable={!isPlaced}
                  onDragStart={(e) => !isPlaced && handleDragStart(c, e)}
                  onClick={() => !isPlaced && handleCardClickToSlot(c)}
                  title={isPlaced ? 'Carta ya colocada en el puente' : 'Haz clic o arrastra al puente'}
                >
                  <div className="mtc-mini-card">
                    <div className={`mini-card-inner ${isFlipped ? 'flipped' : ''}`}>
                      {/* MINI ANVERSO */}
                      <div className="mini-card-front">
                        <span className="mini-card-badge">{c.id}</span>
                        <span className="mini-card-year">{c.year}</span>
                        <img
                          src={getCardImageUrl(c.image, c.id)}
                          alt={c.title}
                          className="mini-card-img"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getCardBackImageUrl();
                          }}
                        />
                        <div className="mini-card-title">{c.title.slice(0, 38)}...</div>
                        <div className="mini-card-author">{c.firstAuthor} et al.</div>
                        <div className="mini-card-cat">{c.categoryEs || c.category}</div>
                        <div
                          className="mini-flip-hint"
                          onClick={(e) => toggleCardFlip(c.id, e)}
                        >
                          🔄 Ver Técnico
                        </div>
                      </div>

                      {/* MINI REVERSO */}
                      <div className="mini-card-back">
                        <span className="mini-card-badge">{c.id} · Metodología</span>
                        <div className="mini-card-method">
                          {c.methodClass}
                        </div>
                        <p className="mini-card-contrib">
                          <b>Aporte:</b> {c.contribution.slice(0, 90)}...
                        </p>
                        <div className="mini-card-limit">
                          <b>Límite:</b> {c.limitation.slice(0, 70)}...
                        </div>
                        <div
                          className="mini-flip-hint"
                          onClick={(e) => toggleCardFlip(c.id, e)}
                        >
                          🔄 Ver Anverso
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Barra de continuidad de la ruta metodológica */}
      <div className="activity-continuity-bar">
        <div className="continuity-info">
          <span className="continuity-step-tag">Etapa 02 de 07 · Secuencia Temporal</span>
          <span className="continuity-desc">
            ¿Has explorado la evolución cronológica de los antecedentes? Continúa hacia la clasificación teórica y epistemológica de las metodologías.
          </span>
        </div>
        <button
          type="button"
          className="cyber-btn cyber-btn-primary continuity-next-btn"
          onClick={() => {
            soundEngine.playSuccess();
            setActiveTab('matrix');
          }}
        >
          <span>Siguiente paso: La Matriz de Enfoques</span>
          <span className="continuity-arrow">→</span>
        </button>
      </div>

      <GameTutorialModal
        gameKey="timeline"
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
      />
    </div>
  );
};
