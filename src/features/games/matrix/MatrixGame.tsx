import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../../types/card';
import { ClassificationCriteria } from '../../../types/session';
import { useSession } from '../../../context/SessionContext';
import { soundEngine } from '../../../services/soundEngine';
import { getCardImageUrl, getCardBackImageUrl } from '../../../utils/imagePath';
import { useGameTutorial } from '../../../hooks/useGameTutorial';
import { GameTutorialModal } from '../../../components/tutorial/GameTutorialModal';

interface CategoryConfig {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export const MatrixGame: React.FC = () => {
  const { deck, criteria, setCriteria, matrixGroups, setMatrixGroups, inspectCard, setActiveTab } = useSession();
  const { isOpen: isTutorialOpen, openTutorial, closeTutorial } = useGameTutorial('matrix');

  const [score, setScore] = useState<number>(0);
  const [activePool, setActivePool] = useState<Card[]>([]);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [zoneAnimState, setZoneAnimState] = useState<Record<string, 'validate-success' | 'validate-error' | null>>({});
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);

  // Categorías según criterio
  const categories: CategoryConfig[] = useMemo(() => {
    if (criteria === 'methodology') {
      return [
        { id: 'Simulación y Modelado', name: 'Simulación y Modelado', desc: 'Modelos dinámicos, simulación CAE, algoritmos y optimización numéricos.', icon: '💻' },
        { id: 'Diseño y Prototipado', name: 'Diseño y Prototipado', desc: 'Diseño mecánico, prototipos funcionales y componentes físicos de chasis.', icon: '⚙️' },
        { id: 'Pruebas Experimentales', name: 'Pruebas Experimentales', desc: 'Bancos de ensayo dinamométrico, pruebas en ruta y mediciones empíricas.', icon: '🔬' },
        { id: 'Estudios Empíricos y Políticas', name: 'Estudios Empíricos y Políticas', desc: 'Encuestas a operadores, análisis normativo, estudios de caso y adopción.', icon: '📊' }
      ];
    } else if (criteria === 'quality') {
      return [
        { id: 'Q1-Q2', name: 'Núcleo de Alto Impacto (Q1/Q2)', desc: 'Artículos en revistas Scopus de primer y segundo cuartil con alta visibilidad.', icon: '🏆' },
        { id: 'Q3-Q4', name: 'Impacto Moderado (Q3/Q4)', desc: 'Artículos indexados en cuartiles 3 y 4 en consolidación científica.', icon: '📈' },
        { id: 'Apoyo-NQ', name: 'Actas y Fuentes Técnicas (NQ/Proc/Cap)', desc: 'Proceedings de congresos, capítulos de libro y fuentes técnicas locales.', icon: '📁' }
      ];
    } else {
      // Default: Categorías temáticas oficiales
      return [
        { id: 'Estructura, ergonomía y seguridad', name: 'Estructura, Ergonomía y Seguridad', desc: 'Chasis, estabilidad de vuelco, dinámica de giro y ergonomía del usuario.', icon: '🛡️' },
        { id: 'Propulsión, batería y energía', name: 'Propulsión, Batería y Energía', desc: 'Motores eléctricos, gestión térmica, soporte solar y dimensionamiento.', icon: '⚡' },
        { id: 'Logística, producción y despliegue', name: 'Logística y Despliegue', desc: 'Reparto de última milla, talleres locales y operaciones de flota.', icon: '📦' },
        { id: 'Accesibilidad y movilidad inclusiva', name: 'Accesibilidad Inclusiva', desc: 'Diseño adaptativo, usuarios mayores y movilidad para discapacidad.', icon: '♿' },
        { id: 'Aceptación pública y servicio', name: 'Aceptación Pública y Servicio', desc: 'Percepción comunitaria, costo-beneficio y calidad de transporte.', icon: '👥' },
        { id: 'Política, regulación y sociedad', name: 'Política, Regulación y Sociedad', desc: 'Marco legal de mototaxis, impacto en el tráfico y normas viales.', icon: '⚖️' }
      ];
    }
  }, [criteria]);

  // Inicializar muestra de pool de cartas para jugar
  useEffect(() => {
    // Tomar 16 cartas variadas para la partida
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setActivePool(shuffled.slice(0, 16));
  }, [deck]);

  // Asegurar que las llaves de categorías existen en matrixGroups
  useEffect(() => {
    setMatrixGroups(prev => {
      const updated = { ...prev };
      categories.forEach(cat => {
        if (!updated[cat.id]) {
          updated[cat.id] = [];
        }
      });
      return updated;
    });
  }, [categories, setMatrixGroups]);

  const getCorrectCategoryId = (card: Card): string => {
    if (criteria === 'methodology') {
      return card.methodClass || 'Simulación y Modelado';
    }
    if (criteria === 'quality') {
      if (card.quality === 'Q1' || card.quality === 'Q2') return 'Q1-Q2';
      if (card.quality === 'Q3' || card.quality === 'Q4') return 'Q3-Q4';
      return 'Apoyo-NQ';
    }
    return card.categoryEs || card.category;
  };

  // Cartas que aún no han sido clasificadas en ninguna zona
  const unassignedCards = useMemo(() => {
    const assignedIds = new Set<string>();
    Object.values(matrixGroups).forEach(list => {
      if (Array.isArray(list)) {
        list.forEach(c => assignedIds.add(c.id));
      }
    });
    return activePool.filter(c => !assignedIds.has(c.id));
  }, [activePool, matrixGroups]);

  const handleDragStart = (card: Card, e: React.DragEvent) => {
    setDraggedCardId(card.id);
    e.dataTransfer.setData('text/plain', card.id);
    soundEngine.playFlip();
  };

  const handleDragOver = (catId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverZone(catId);
  };

  const handleDragLeave = () => {
    setDragOverZone(null);
  };

  const handleDrop = (catId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverZone(null);
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (!cardId) return;

    const card = activePool.find(c => c.id === cardId) || deck.find(c => c.id === cardId);
    if (!card) return;

    classifyCard(card, catId);
  };

  const classifyCard = (card: Card, targetCatId: string) => {
    const correctCatId = getCorrectCategoryId(card);
    const isCorrect = correctCatId === targetCatId;

    if (isCorrect) {
      soundEngine.playSuccess();
      setScore(prev => prev + 100);
      setZoneAnimState(prev => ({ ...prev, [targetCatId]: 'validate-success' }));
    } else {
      soundEngine.playError();
      setZoneAnimState(prev => ({ ...prev, [targetCatId]: 'validate-error' }));
      setTimeout(() => {
        alert(
          `⚠️ Clasificación Incorrecta:\n\n"${card.title}" (${card.id}) pertenece epistemológicamente a:\n→ "${correctCatId}"\n\n(Criterio evaluado: ${criteria.toUpperCase()})`
        );
      }, 50);
    }

    setTimeout(() => {
      setZoneAnimState(prev => ({ ...prev, [targetCatId]: null }));
    }, 800);

    // Mover carta al grupo de destino
    setMatrixGroups(prev => {
      const next: Record<string, Card[]> = {};
      Object.keys(prev).forEach(key => {
        next[key] = (prev[key] || []).filter(c => c.id !== card.id);
      });
      next[targetCatId] = [...(next[targetCatId] || []), card];
      return next;
    });
  };

  const handleRemoveCardFromZone = (catId: string, cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playDrop();
    setMatrixGroups(prev => ({
      ...prev,
      [catId]: (prev[catId] || []).filter(c => c.id !== cardId)
    }));
  };

  const handleAutoClassifyAll = () => {
    soundEngine.playSuccess();
    const newGroups: Record<string, Card[]> = {};
    categories.forEach(cat => {
      newGroups[cat.id] = [];
    });

    activePool.forEach(card => {
      const correct = getCorrectCategoryId(card);
      if (newGroups[correct]) {
        newGroups[correct].push(card);
      } else {
        newGroups[categories[0].id].push(card);
      }
    });

    setMatrixGroups(newGroups);
    setScore(activePool.length * 100);
  };

  const handleResetMatrix = () => {
    soundEngine.playDrop();
    const emptyGroups: Record<string, Card[]> = {};
    categories.forEach(cat => {
      emptyGroups[cat.id] = [];
    });
    setMatrixGroups(emptyGroups);
    setScore(0);
  };

  const gridColsClass = categories.length <= 4 ? 'cols-2' : 'cols-3';

  return (
    <div className="view-panel active">
      <div className="game-wrapper">
        <div className="game-header-bar">
          <div>
            <div className="game-tag">DINÁMICA 2 · CLASIFICACIÓN Y VALIDACIÓN</div>
            <h2>La Matriz de Enfoques</h2>
            <p>
              Arrastra cada carta a su cuadrante metodológico o temático correcto. Al atinar, se disparará una validación y se enriquecerá la tabla comparativa de tu tesis.
            </p>
          </div>

          <div className="game-actions">
            <div className="hud-stats-pill" style={{ background: '#20121a' }}>
              <span>Criterio:</span>
              <select
                className="cyber-select"
                style={{ padding: '3px 8px', fontSize: '12px', border: 0 }}
                value={criteria}
                onChange={(e) => setCriteria(e.target.value as ClassificationCriteria)}
              >
                <option value="category">Categoría Temática</option>
                <option value="methodology">Enfoque Metodológico</option>
                <option value="quality">Cuartil / Calidad</option>
              </select>
            </div>

            <div className="score-pill">
              Puntaje Epistemológico: <b>{score} pts</b>
            </div>

            <button
              className="cyber-btn cyber-btn-outline tutorial-trigger-btn"
              onClick={openTutorial}
              title="Ver tutorial de La Matriz de Enfoques"
            >
              📖 ¿Cómo se juega?
            </button>
            <button className="cyber-btn cyber-btn-secondary" onClick={handleAutoClassifyAll} style={{ fontSize: '12px' }}>
              Clasificar Todo (Demostración)
            </button>
            <button className="cyber-btn cyber-btn-outline" onClick={handleResetMatrix} style={{ fontSize: '12px' }}>
              Reiniciar Matriz
            </button>
          </div>
        </div>

        {/* CUADRANTES DE LA MATRIZ */}
        <div className={`matrix-grid ${gridColsClass}`}>
          {categories.map(cat => {
            const list = matrixGroups[cat.id] || [];
            const isDragOver = dragOverZone === cat.id;
            const anim = zoneAnimState[cat.id] || '';

            return (
              <div
                key={cat.id}
                className={`matrix-zone ${isDragOver ? 'drag-over' : ''} ${anim}`}
                onDragOver={(e) => handleDragOver(cat.id, e)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(cat.id, e)}
              >
                <div className="zone-header">
                  <span className="zone-icon">{cat.icon}</span>
                  <div className="zone-title-box">
                    <h4>{cat.name}</h4>
                    <span className="zone-count">{list.length} artículos clasificados</span>
                  </div>
                </div>

                <p className="zone-desc">{cat.desc}</p>

                <div className="zone-dropzone">
                  {list.length === 0 ? (
                    <div className="empty-zone-hint">
                      Arrastra cartas aquí para clasificarlas
                    </div>
                  ) : (
                    list.map(c => (
                      <div key={c.id} className="docked-card-pill">
                        <span className="dock-badge">{c.id}</span>
                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.title}>
                          <b>{c.firstAuthor} ({c.year})</b>: {c.title}
                        </span>
                        <button
                          type="button"
                          style={{
                            background: 'transparent',
                            border: 0,
                            color: 'var(--c-peach)',
                            cursor: 'pointer',
                            fontSize: '11px',
                            padding: '0 4px'
                          }}
                          onClick={() => inspectCard(c)}
                          title="Inspeccionar"
                        >
                          🔍
                        </button>
                        <button
                          type="button"
                          style={{
                            background: 'var(--c-crimson)',
                            border: 0,
                            color: '#fff',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            fontSize: '10px'
                          }}
                          onClick={(e) => handleRemoveCardFromZone(cat.id, c.id, e)}
                          title="Quitar de este cuadrante"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* BANDEJA INFERIOR DE CARTAS POR CLASIFICAR */}
        <div className="matrix-pool-section">
          <div className="pool-title">
            <span>Bandeja de Antecedentes por Clasificar ({unassignedCards.length} disponibles):</span>
            <span className="pool-tip">
              💡 Arrastra cada tarjeta a su cuadrante correspondiente o haz clic para inspeccionar.
            </span>
          </div>

          {unassignedCards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--c-peach)' }}>
              🎉 ¡Todas las cartas de esta ronda han sido clasificadas en la Matriz!
              <div style={{ marginTop: '10px' }}>
                <button
                  className="cyber-btn cyber-btn-primary"
                  onClick={() => setActiveTab('synthesis')}
                  style={{ fontSize: '12px' }}
                >
                  Ver Tabla Comparativa en el Borrador 📝
                </button>
              </div>
            </div>
          ) : (
            <div className="matrix-cards-pool">
              {unassignedCards.map(c => (
                <div
                  key={c.id}
                  className="matrix-draggable-card"
                  draggable
                  onDragStart={(e) => handleDragStart(c, e)}
                  onClick={() => inspectCard(c)}
                  title="Arrastra al cuadrante correspondiente o haz clic para ver ficha"
                >
                  <div className="m-card-badge">{c.id} · {c.quality || 'NQ'}</div>
                  <img
                    src={getCardImageUrl(c.image, c.id)}
                    alt={c.title}
                    className="m-card-thumb"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = getCardBackImageUrl();
                    }}
                  />
                  <div className="m-card-title">{c.title.slice(0, 32)}...</div>
                  <div className="m-card-meta">
                    👤 {c.firstAuthor} ({c.year})<br />
                    🔬 <i>{c.methodClass || c.methodology}</i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <GameTutorialModal
        gameKey="matrix"
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
      />
    </div>
  );
};
