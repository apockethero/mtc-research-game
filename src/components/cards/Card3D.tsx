import React, { useState } from 'react';
import { Card } from '../../types/card';
import { useSession } from '../../context/SessionContext';
import { soundEngine } from '../../services/soundEngine';

import { getCardImageUrl, getCardBackImageUrl } from '../../utils/imagePath';

interface Card3DProps {
  card: Card;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  compact?: boolean;
  extraActions?: React.ReactNode;
}

export const Card3D: React.FC<Card3DProps> = ({
  card,
  draggable = false,
  onDragStart,
  onDragEnd,
  compact = false,
  extraActions
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { inspectCard } = useSession();

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playFlip();
    setIsFlipped(prev => !prev);
  };

  const handleInspect = (e: React.MouseEvent) => {
    e.stopPropagation();
    inspectCard(card);
  };

  const imgSrc = getCardImageUrl(card.image, card.id);

  return (
    <div
      className={`deck-card-container ${compact ? 'compact' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ cursor: draggable ? 'grab' : 'default' }}
    >
      <div className={`card-3d-wrapper ${isFlipped ? 'flipped' : ''}`}>
        {/* CARA ANVERSO (VISUAL / ATRACTIVO) */}
        <div className="card-face card-front">
          <div className="card-header-bar">
            <span className="card-id-tag">{card.id}</span>
            <span className={`card-quality-badge ${card.quality}`}>
              {card.quality || 'VERIF'}
            </span>
          </div>

          <div className="card-img-box">
            <img
              src={imgSrc}
              alt={card.title}
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getCardBackImageUrl();
              }}
            />
            {card.keyword && (
              <span className="card-keyword-overlay">
                🏷️ {card.keyword}
              </span>
            )}
          </div>

          <div className="card-body">
            <div className="card-category-lbl">
              {card.categoryEs || card.category}
            </div>
            <h3 className="card-title" title={card.title}>
              {card.title}
            </h3>
            <div className="card-authors">
              👤 {card.authors} ({card.year})
            </div>

            <div className="card-indicators-strip">
              <div className="ind-item">
                <span className="ind-lbl">Citas</span>
                <span className="ind-val">{card.citationCount || 0}</span>
              </div>
              <div className="ind-item">
                <span className="ind-lbl">SJR</span>
                <span className="ind-val">{card.sjr ? card.sjr.slice(0, 4) : 'N/D'}</span>
              </div>
              <div className="ind-item">
                <span className="ind-lbl">CiteScore</span>
                <span className="ind-val">{card.citeScore || 'N/D'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="card-flip-btn"
              style={{ flex: 1, borderTop: 0 }}
              onClick={handleFlip}
            >
              🔄 Datos Técnicos
            </button>
            <button
              type="button"
              className="card-flip-btn"
              style={{ width: '44px', borderTop: 0, borderLeft: '1px solid var(--border-color)' }}
              onClick={handleInspect}
              title="Inspeccionar Ficha Completa"
            >
              🔍
            </button>
          </div>
          {extraActions}
        </div>

        {/* CARA REVERSO (TÉCNICO / RIGOR CIENTÍFICO) */}
        <div className="card-face card-back">
          <div className="card-header-bar" style={{ background: 'linear-gradient(90deg, #3d1b28, #6C3745)' }}>
            <span className="card-id-tag">{card.id} - Rigor Científico</span>
            <span className="card-quality-badge">{card.year}</span>
          </div>

          <div className="card-back-content">
            <div className="back-section">
              <span className="back-label">🔬 Enfoque Metodológico:</span>
              <p className="back-text">
                <b>{card.methodClass}</b> — {card.methodology}
              </p>
            </div>

            <div className="back-section">
              <span className="back-label">💡 Hallazgo / Aporte Principal:</span>
              <p className="back-text">{card.contribution || card.coreIdea}</p>
            </div>

            <div className="back-section limit-box">
              <span className="back-label">⚠️ Vacío o Limitación Declarada:</span>
              <p className="back-text">{card.limitation}</p>
            </div>

            <div className="back-meta-box">
              <div><b>Revista / Venue:</b> {card.venue || 'No indexado'}</div>
              {card.doi && (
                <div style={{ marginTop: '4px' }}>
                  <b>DOI:</b>{' '}
                  <a href={card.doi} target="_blank" rel="noopener noreferrer">
                    {card.doi.replace('https://doi.org/', '')}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="card-flip-btn"
              style={{ flex: 1, borderTop: 0 }}
              onClick={handleFlip}
            >
              🔄 Ver Anverso Visual
            </button>
            <button
              type="button"
              className="card-flip-btn"
              style={{ width: '44px', borderTop: 0, borderLeft: '1px solid var(--border-color)' }}
              onClick={handleInspect}
              title="Inspeccionar Ficha Completa"
            >
              🔍
            </button>
          </div>
          {extraActions}
        </div>
      </div>
    </div>
  );
};
