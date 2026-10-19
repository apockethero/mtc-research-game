import React, { useState, useMemo } from 'react';
import { Card } from '../../../types/card';
import { CombatVerdict, CombatRecord } from '../../../types/combat';
import { useSession } from '../../../context/SessionContext';
import { soundEngine } from '../../../services/soundEngine';
import { getCardImageUrl, getCardBackImageUrl } from '../../../utils/imagePath';
import { useGameTutorial } from '../../../hooks/useGameTutorial';
import { GameTutorialModal } from '../../../components/tutorial/GameTutorialModal';

export const CombatGame: React.FC = () => {
  const { deck, combats, addCombatRecord, inspectCard, setActiveTab } = useSession();
  const { isOpen: isTutorialOpen, openTutorial, closeTutorial } = useGameTutorial('combat');

  const [cardAId, setCardAId] = useState<string>(() => {
    const defaultA = deck.find(c => c.id === 'MTC22') || deck[0];
    return defaultA?.id || '';
  });

  const [cardBId, setCardBId] = useState<string>(() => {
    const defaultB = deck.find(c => c.id === 'MTC23') || deck[1] || deck[0];
    return defaultB?.id || '';
  });

  const [feedback, setFeedback] = useState<{
    verdict: CombatVerdict;
    text: string;
  } | null>(null);

  const cardA = useMemo(() => deck.find(c => c.id === cardAId) || deck[0], [deck, cardAId]);
  const cardB = useMemo(() => deck.find(c => c.id === cardBId) || deck[1] || deck[0], [deck, cardBId]);

  // Cálculo de solapamiento conceptual
  const overlapPercent = useMemo(() => {
    if (!cardA || !cardB) return 50;
    let overlap = 30;
    if (cardA.category === cardB.category || cardA.categoryEs === cardB.categoryEs) {
      overlap += 40;
    }
    if (cardA.methodClass === cardB.methodClass) {
      overlap += 20;
    }
    return Math.min(overlap, 95);
  }, [cardA, cardB]);

  const handleRandomCombat = () => {
    soundEngine.playFlip();
    if (deck.length < 2) return;
    const idxA = Math.floor(Math.random() * deck.length);
    let idxB = Math.floor(Math.random() * deck.length);
    while (idxB === idxA) {
      idxB = Math.floor(Math.random() * deck.length);
    }
    setCardAId(deck[idxA].id);
    setCardBId(deck[idxB].id);
    setFeedback(null);
  };

  const handleVerdict = (verdict: CombatVerdict) => {
    if (!cardA || !cardB) return;
    soundEngine.playSuccess();

    let verdictLabel = '🏆 Hito Novedoso';
    let analysis = '';

    if (verdict === 'hito') {
      verdictLabel = '🏆 Hito Novedoso';
      analysis = `La evidencia desafiante ${cardB.id} (${cardB.firstAuthor}, ${cardB.year}) introduce un avance cualitativo frente a ${cardA.id} (${cardA.firstAuthor}, ${cardA.year}) al implementar ${cardB.methodology.toLowerCase()} con hallazgos de mayor validez ecológica.`;
    } else if (verdict === 'complementaria') {
      verdictLabel = '🔗 Extensión Complementaria';
      analysis = `${cardB.id} (${cardB.firstAuthor}) y ${cardA.id} (${cardA.firstAuthor}) son complementarias: el primero profundiza en ${cardB.coreIdea.toLowerCase()} mitigando la limitación declarada por el segundo ("${cardA.limitation}").`;
    } else {
      verdictLabel = '⚠️ Evidencia Redundante';
      analysis = `Existe un solapamiento del ${overlapPercent}% entre ${cardB.id} y ${cardA.id}. Sus metodologías (${cardB.methodology} vs ${cardA.methodology}) reiteran hallazgos análogos sin ampliar sustancialmente el estado del arte.`;
    }

    const record: CombatRecord = {
      cardA,
      cardB,
      verdict,
      verdictLabel,
      analysis,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    addCombatRecord(record);
    setFeedback({ verdict, text: analysis });
  };

  return (
    <div className="view-panel active">
      <div className="game-wrapper">
        <div className="game-header-bar">
          <div>
            <div className="game-tag">DINÁMICA 4 · EVALUACIÓN CRÍTICA</div>
            <h2>Combates de Validación: Novedad vs. Redundancia</h2>
            <p>
              Enfrenta dos investigaciones para determinar si la propuesta desafiante representa un <b>Hito Novedoso</b>, una <b>Extensión Complementaria</b> o una <b>Reiteración Redundante</b>.
            </p>
          </div>
          <div className="game-actions">
            <button
              className="cyber-btn cyber-btn-outline tutorial-trigger-btn"
              onClick={openTutorial}
              title="Ver tutorial de Combates de Validación"
            >
              📖 ¿Cómo se juega?
            </button>
            <button className="cyber-btn cyber-btn-secondary" onClick={handleRandomCombat}>
              Duelo Aleatorio 🎲
            </button>
          </div>
        </div>

        <div className="combat-arena">
          {/* ESQUINA AZUL: HITO REFERENCIAL BASE */}
          <div className="fighter-corner corner-a glass-panel">
            <div className="corner-label">🔵 Antecedente Referencial (Hito Base)</div>
            <div className="fighter-select-row">
              <label>Seleccionar Antecedente Base:</label>
              <select
                className="cyber-select"
                value={cardAId}
                onChange={(e) => {
                  setCardAId(e.target.value);
                  setFeedback(null);
                }}
              >
                {deck.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id}: {c.firstAuthor} ({c.year}) - {c.title.slice(0, 32)}...
                  </option>
                ))}
              </select>
            </div>

            {cardA && (
              <div className="fighter-card">
                <div className="f-header">
                  <span className="f-id">{cardA.id} · {cardA.year}</span>
                  <span className="f-quality">
                    {cardA.quality || 'NQ'} · {cardA.venueHIndex ? `H:${cardA.venueHIndex}` : 'Indexado'}
                  </span>
                </div>
                <img
                  src={getCardImageUrl(cardA.image, cardA.id)}
                  alt={cardA.title}
                  className="f-img"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = getCardBackImageUrl();
                  }}
                />
                <h4 className="f-title">{cardA.title}</h4>
                <div className="f-author">
                  👤 {cardA.authors} ({cardA.venue || 'MTC Archive'})
                </div>

                <div className="f-specs">
                  <div className="f-spec-row">
                    <span className="f-lbl">Metodología:</span>
                    <span className="f-val"><b>{cardA.methodClass}</b> ({cardA.methodology})</span>
                  </div>
                  <div className="f-spec-row">
                    <span className="f-lbl">Aporte Clave:</span>
                    <span className="f-val">{cardA.contribution || cardA.coreIdea}</span>
                  </div>
                  <div className="f-spec-row limit">
                    <span className="f-lbl">Limitación Declarada:</span>
                    <span className="f-val">{cardA.limitation}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="cyber-btn cyber-btn-outline"
                  style={{ width: '100%', marginTop: '12px', fontSize: '11px', padding: '6px' }}
                  onClick={() => inspectCard(cardA)}
                >
                  🔍 Inspeccionar Ficha Completa
                </button>
              </div>
            )}
          </div>

          {/* CENTRO: RING VERSUS & VEREDICTO */}
          <div className="combat-versus-panel">
            <div className="vs-badge">VS</div>
            <div className="overlap-gauge">
              <span>Solapamiento Conceptual Calculado:</span>
              <div className="gauge-bar">
                <div className="gauge-fill" style={{ width: `${overlapPercent}%` }}></div>
              </div>
              <small>{overlapPercent}% de coincidencia temática y metodológica</small>
            </div>

            <div className="verdict-actions">
              <button
                className="cyber-btn verdict-btn hito"
                onClick={() => handleVerdict('hito')}
              >
                🏆 Hito Novedoso
                <small>Aporta avance metodológico no cubierto por el base</small>
              </button>
              <button
                className="cyber-btn verdict-btn comp"
                onClick={() => handleVerdict('complementaria')}
              >
                🔗 Extensión Complementaria
                <small>Resuelve o extiende una limitación del hito base</small>
              </button>
              <button
                className="cyber-btn verdict-btn redun"
                onClick={() => handleVerdict('redundante')}
              >
                ⚠️ Evidencia Redundante
                <small>Reitera hallazgos conceptuales sin aporte sustancial</small>
              </button>
            </div>

            {feedback && (
              <div className={`combat-feedback ${feedback.verdict}`}>
                <b>Veredicto Registrado:</b>
                <p style={{ marginTop: '4px' }}>{feedback.text}</p>
              </div>
            )}
          </div>

          {/* ESQUINA ROJA: DESAFIANTE */}
          <div className="fighter-corner corner-b glass-panel">
            <div className="corner-label">🔴 Antecedente Desafiante (Nueva Evidencia)</div>
            <div className="fighter-select-row">
              <label>Seleccionar Desafiante:</label>
              <select
                className="cyber-select"
                value={cardBId}
                onChange={(e) => {
                  setCardBId(e.target.value);
                  setFeedback(null);
                }}
              >
                {deck.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id}: {c.firstAuthor} ({c.year}) - {c.title.slice(0, 32)}...
                  </option>
                ))}
              </select>
            </div>

            {cardB && (
              <div className="fighter-card">
                <div className="f-header">
                  <span className="f-id">{cardB.id} · {cardB.year}</span>
                  <span className="f-quality">
                    {cardB.quality || 'NQ'} · {cardB.venueHIndex ? `H:${cardB.venueHIndex}` : 'Indexado'}
                  </span>
                </div>
                <img
                  src={getCardImageUrl(cardB.image, cardB.id)}
                  alt={cardB.title}
                  className="f-img"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = getCardBackImageUrl();
                  }}
                />
                <h4 className="f-title">{cardB.title}</h4>
                <div className="f-author">
                  👤 {cardB.authors} ({cardB.venue || 'MTC Archive'})
                </div>

                <div className="f-specs">
                  <div className="f-spec-row">
                    <span className="f-lbl">Metodología:</span>
                    <span className="f-val"><b>{cardB.methodClass}</b> ({cardB.methodology})</span>
                  </div>
                  <div className="f-spec-row">
                    <span className="f-lbl">Aporte Clave:</span>
                    <span className="f-val">{cardB.contribution || cardB.coreIdea}</span>
                  </div>
                  <div className="f-spec-row limit">
                    <span className="f-lbl">Limitación Declarada:</span>
                    <span className="f-val">{cardB.limitation}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="cyber-btn cyber-btn-outline"
                  style={{ width: '100%', marginTop: '12px', fontSize: '11px', padding: '6px' }}
                  onClick={() => inspectCard(cardB)}
                >
                  🔍 Inspeccionar Ficha Completa
                </button>
              </div>
            )}
          </div>
        </div>

        {/* HISTORIAL DE COMBATES */}
        <div className="combat-history-section glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3>Veredictos Críticos Registrados ({combats.length})</h3>
            {combats.length > 0 && (
              <button
                className="cyber-btn cyber-btn-primary"
                onClick={() => setActiveTab('synthesis')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                Ver Impacto en Tesis 📝
              </button>
            )}
          </div>

          <div className="history-grid">
            {combats.length === 0 ? (
              <p className="empty-hist" style={{ color: 'var(--c-rose)', fontSize: '12px' }}>
                Aún no has emitido veredictos en el ring. Evalúa el primer enfrentamiento arriba para alimentar las deducciones críticas de tu marco teórico.
              </p>
            ) : (
              combats.map((h, idx) => (
                <div key={idx} className={`history-item-card ${h.verdict}`}>
                  <div className="h-badge">{h.verdictLabel}</div>
                  <div className="h-title" style={{ color: '#fff', fontSize: '13px' }}>
                    <b>{h.cardB.id}</b> vs <b>{h.cardA.id}</b>{' '}
                    <span style={{ fontSize: '10px', color: 'var(--c-rose)' }}>({h.timestamp})</span>
                  </div>
                  <p className="h-reason">{h.analysis}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Barra de continuidad de la ruta metodológica */}
      <div className="activity-continuity-bar">
        <div className="continuity-info">
          <span className="continuity-step-tag">Etapa 05 de 07 · Contraste Cruzado</span>
          <span className="continuity-desc">
            Has validado comparaciones directas entre antecedentes. El siguiente paso es responder el instrumento de evaluación científica para registrar tus observaciones exploratorias.
          </span>
        </div>
        <button
          type="button"
          className="cyber-btn cyber-btn-primary continuity-next-btn"
          onClick={() => {
            soundEngine.playSuccess();
            setActiveTab('evaluation');
          }}
        >
          <span>Siguiente paso: Evaluación científica</span>
          <span className="continuity-arrow">→</span>
        </button>
      </div>

      <GameTutorialModal
        gameKey="combat"
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
      />
    </div>
  );
};
