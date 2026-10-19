import React, { useState, useMemo, useRef } from 'react';
import { Card } from '../../../types/card';
import { ResearchGap } from '../../../types/gap';
import { useSession } from '../../../context/SessionContext';
import { soundEngine } from '../../../services/soundEngine';
import { getCardImageUrl, getCardBackImageUrl } from '../../../utils/imagePath';
import { BeamCanvas } from './BeamCanvas';
import { useGameTutorial } from '../../../hooks/useGameTutorial';
import { GameTutorialModal } from '../../../components/tutorial/GameTutorialModal';

export const GapHunterGame: React.FC = () => {
  const { deck, topic, discoveredGaps, addDiscoveredGap, inspectCard, setActiveTab } = useSession();
  const { isOpen: isTutorialOpen, openTutorial, closeTutorial } = useGameTutorial('gapHunter');

  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Nodos orbitales representativos para la constelación
  const constellationCards = useMemo(() => {
    const nodeIds = ['MTC06', 'MTC43', 'MTC49', 'MTC02', 'MTC07', 'MTC29', 'MTC22', 'MTC31', 'MTC34', 'MTC09', 'MTC16', 'MTC14'];
    let selected = deck.filter(c => nodeIds.includes(c.id));
    if (selected.length < 8) {
      selected = deck.slice(0, 12);
    }
    return selected;
  }, [deck]);

  const handleNodeClick = (card: Card) => {
    soundEngine.playFlip();

    setSelectedCards(prev => {
      const exists = prev.some(c => c.id === card.id);
      if (exists) {
        return prev.filter(c => c.id !== card.id);
      } else {
        if (prev.length >= 3) {
          // Reemplazar la más antigua si ya hay 3
          return [...prev.slice(1), card];
        }
        return [...prev, card];
      }
    });
  };

  const handleClearSelection = () => {
    soundEngine.playDrop();
    setSelectedCards([]);
  };

  const computeResearchGap = (cards: Card[]): ResearchGap => {
    const authors = cards.map(c => `${c.firstAuthor} (${c.year})`).join(' y ');

    // Comprobación de intersección de categorías
    const hasStructure = cards.some(c => c.category.includes('Structure') || (c.categoryEs && c.categoryEs.includes('Estructura')));
    const hasPropulsion = cards.some(c => c.category.includes('Propulsion') || (c.categoryEs && c.categoryEs.includes('Propulsión')));
    const hasLogistics = cards.some(c => c.category.includes('Logistics') || (c.categoryEs && c.categoryEs.includes('Logística')));
    const hasAccessibility = cards.some(c => c.category.includes('Accessibility') || c.category.includes('Public') || (c.categoryEs && c.categoryEs.includes('Accesibilidad')));

    let title = 'Brecha de Integración Multidisciplinar y Validación Empírica';
    let desc = `Al contrastar las investigaciones de ${authors}, se observa que ${cards[0].firstAuthor} aborda ${cards[0].coreIdea.toLowerCase()} pero advierte que "${cards[0].limitation}", mientras que ${cards[1].firstAuthor} se enfoca en ${cards[1].coreIdea.toLowerCase()} con la limitación "${cards[1].limitation}".`;
    let just = `El proyecto del investigador aporta novedad al cerrar la brecha entre el modelado aislado y las demandas operativas formuladas en la pregunta central: "${topic.question}".`;

    if (hasStructure && hasLogistics) {
      title = 'Falta de Validación Estructural ante Cargas Dinámicas de Reparto en Última Milla';
      desc = 'Los estudios de chasis se limitan a cargas estáticas teóricas, mientras que los estudios de logística de carga no incorporan telemetría de fatiga mecánica en pavimentos irregulares.';
      just = 'Justifica la necesidad de diseñar estructuras ligeras optimizadas con pruebas de esfuerzo bajo ciclos de entrega reales.';
    } else if (hasStructure && hasPropulsion) {
      title = 'Desacoplamiento entre Control Dinámico Antivuelco y Eficiencia del Tren Motriz';
      desc = 'Los algoritmos de estabilidad asumen torque infinito sin considerar la caída de tensión en baterías de baja capacidad, mientras que los diseños de batería ignoran las demandas bruscas de frenado diferencial.';
      just = 'Abre la oportunidad para un sistema integrado de gestión energética y control de estabilidad dinámica de bajo costo.';
    } else if (hasAccessibility && hasPropulsion) {
      title = 'Incompatibilidad entre Asistencia Motriz Adaptativa y Restricciones de Autonomía Urbana';
      desc = 'Las interfaces ergonómicas para personas mayores o con discapacidad incrementan el peso y consumo motriz, sin contar con optimizaciones de carga solar o recuperación regenerativa compacta.';
      just = 'Demuestra la urgencia de desarrollar soluciones de movilidad inclusiva energéticamente autosuficientes para ciudades emergentes.';
    }

    return {
      id: `GAP-${Date.now()}`,
      title,
      cards: [...cards],
      description: desc,
      justification: just
    };
  };

  const handleSynthesizeGap = () => {
    if (selectedCards.length < 2) return;

    soundEngine.playBeamHum();
    setTimeout(() => {
      soundEngine.playGapDiscovered();
    }, 300);

    const newGap = computeResearchGap(selectedCards);
    addDiscoveredGap(newGap);

    setTimeout(() => {
      alert(
        `⚡ ¡Haz Digital Conectado y Vacío Descubierto!\n\n` +
        `BRECHA: ${newGap.title}\n\n` +
        `${newGap.description}\n\n` +
        `🎯 IMPACTO EN TU TESIS:\n${newGap.justification}\n\n` +
        `Este vacío ha sido transferido directamente al capítulo de Justificación de tu Estado del Arte.`
      );
    }, 400);
  };

  const selectedCardIds = useMemo(() => selectedCards.map(c => c.id), [selectedCards]);

  return (
    <div className="view-panel active">
      <div className="game-wrapper">
        <div className="game-header-bar">
          <div>
            <div className="game-tag">DINÁMICA 3 · IDENTIFICACIÓN DE GAPS CIENTÍFICOS</div>
            <h2>Cazadores de Vacíos</h2>
            <p>
              Haz clic en 2 o 3 antecedentes para proyectar un <b>haz digital luminoso</b> entre ellos. El motor analizará sus limitaciones cruzadas y sintetizará el vacío que tu investigación resolverá.
            </p>
          </div>
          <div className="game-actions">
            <button
              className="cyber-btn cyber-btn-outline tutorial-trigger-btn"
              onClick={openTutorial}
              title="Ver tutorial de Cazadores de Vacíos"
            >
              📖 ¿Cómo se juega?
            </button>
            <button
              className="cyber-btn cyber-btn-primary"
              disabled={selectedCards.length < 2}
              onClick={handleSynthesizeGap}
            >
              Trazar Haz Digital y Revelar Vacío ⚡ ({selectedCards.length}/3)
            </button>
            <button
              className="cyber-btn cyber-btn-outline"
              onClick={handleClearSelection}
              style={{ fontSize: '12px' }}
            >
              Limpiar Selección
            </button>
          </div>
        </div>

        <div className="constellation-layout">
          {/* LIENZO DE LA CONSTELACIÓN ESPACIAL */}
          <div className="constellation-stage" ref={stageRef} id="constellationStage">
            <BeamCanvas
              selectedCardIds={selectedCardIds}
              nodeRefs={nodeRefs}
              stageRef={stageRef}
            />

            <div className="nodes-overlay">
              {constellationCards.map((card, idx) => {
                const angle = (idx / constellationCards.length) * Math.PI * 2;
                const rx = 40; // radio porcentual elíptico X
                const ry = 36; // radio porcentual elíptico Y
                const left = 50 + rx * Math.cos(angle);
                const top = 50 + ry * Math.sin(angle);
                const isSelected = selectedCards.some(c => c.id === card.id);

                return (
                  <div
                    key={card.id}
                    ref={(el) => {
                      if (el) nodeRefs.current.set(card.id, el);
                      else nodeRefs.current.delete(card.id);
                    }}
                    className={`constellation-node ${isSelected ? 'selected' : ''}`}
                    style={{ left: `${left}%`, top: `${top}%` }}
                    onClick={() => handleNodeClick(card)}
                  >
                    <div className="node-ring"></div>
                    <img
                      src={getCardImageUrl(card.image, card.id)}
                      alt={card.title}
                      className="node-img"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = getCardBackImageUrl();
                      }}
                    />
                    <div className="node-tooltip">
                      <strong>{card.id}: {card.firstAuthor} ({card.year})</strong>
                      <span className="tip-core">{card.title}</span>
                      <span className="tip-lim"><b>Límite:</b> {card.limitation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PANEL LATERAL DE VACÍOS DESCUBIERTOS */}
          <div className="gaps-sidebar glass-panel">
            <div className="sidebar-header">
              <h3>Vacíos de Investigación Revelados ({discoveredGaps.length})</h3>
              <p>Cada brecha descubierta se integra automáticamente en la Justificación de tu Tesis.</p>
            </div>

            <div className="gaps-list">
              {discoveredGaps.length === 0 ? (
                <div className="empty-gaps-state">
                  <div className="radar-scan-icon">📡</div>
                  <p>No se han enlazado cartas todavía.</p>
                  <span>
                    Selecciona 2 o 3 antecedentes en la constelación cósmica que aborden problemas relacionados para extraer su brecha oculta.
                  </span>
                </div>
              ) : (
                discoveredGaps.map((g, idx) => (
                  <div key={g.id || idx} className="gap-card-discovered glass-card">
                    <div className="gap-badge">BRECHA METODOLÓGICA #{String(idx + 1).padStart(2, '0')}</div>
                    <h4 className="gap-title">{g.title}</h4>
                    <div className="gap-cards-linked">
                      {g.cards.map(c => (
                        <span
                          key={c.id}
                          className="linked-tag"
                          style={{ cursor: 'pointer' }}
                          onClick={() => inspectCard(c)}
                          title="Clic para inspeccionar esta carta"
                        >
                          {c.id} ({c.firstAuthor}, {c.year}) 🔍
                        </span>
                      ))}
                    </div>
                    <p className="gap-desc">{g.description}</p>
                    <div className="gap-justification">
                      <b style={{ color: 'var(--c-peach)', fontSize: '11px' }}>🎯 Impacto en tu Proyecto:</b>
                      <p style={{ fontSize: '12px', marginTop: '2px' }}>{g.justification}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {discoveredGaps.length > 0 && (
              <button
                className="cyber-btn cyber-btn-primary"
                onClick={() => setActiveTab('synthesis')}
                style={{ marginTop: '12px', fontSize: '12px' }}
              >
                Ver Vacíos en el Borrador 📝
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Barra de continuidad de la ruta metodológica */}
      <div className="activity-continuity-bar">
        <div className="continuity-info">
          <span className="continuity-step-tag">Etapa 04 de 07 · Detección de Brechas</span>
          <span className="continuity-desc">
            Has identificado vacíos de investigación conectando estudios complementarios. El siguiente paso es contrastar directamente dos estudios en un ring de combate crítico.
          </span>
        </div>
        <button
          type="button"
          className="cyber-btn cyber-btn-primary continuity-next-btn"
          onClick={() => {
            soundEngine.playSuccess();
            setActiveTab('combat');
          }}
        >
          <span>Siguiente paso: Combates de Validación</span>
          <span className="continuity-arrow">→</span>
        </button>
      </div>

      <GameTutorialModal
        gameKey="gapHunter"
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
      />
    </div>
  );
};
