import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { soundEngine } from '../../services/soundEngine';
import { getCardImageUrl, getCardBackImageUrl } from '../../utils/imagePath';

export const CardInspectorModal: React.FC = () => {
  const { selectedCardForInspection, inspectCard } = useSession();
  const [copied, setCopied] = useState(false);

  if (!selectedCardForInspection) return null;

  const card = selectedCardForInspection;

  const handleCopyCitation = () => {
    const citation = card.citation || `${card.authors} (${card.year}). ${card.title}. ${card.venue || 'MTC Journal'}. ${card.doi || ''}`;
    navigator.clipboard.writeText(citation).then(() => {
      soundEngine.playSuccess();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const imgSrc = getCardImageUrl(card.image, card.id);

  return (
    <div
      className="modal-overlay"
      onClick={() => inspectCard(null)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="inspector-modal-box cyber-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={() => inspectCard(null)}
          title="Cerrar Ficha"
        >
          ✕
        </button>

        <div className="inspector-layout">
          {/* Columna Izquierda: Visual e Indicadores */}
          <div className="inspector-visual">
            <img
              src={imgSrc}
              alt={card.title}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getCardBackImageUrl();
              }}
            />

            <div className="inspector-badge-row">
              <span className={`badge card-quality-badge ${card.quality}`}>
                {card.quality || 'Verificada'}
              </span>
              <span className="badge year">{card.year}</span>
              <span className="badge cat">{card.categoryEs || card.category}</span>
            </div>

            <div className="bibliometrics-grid">
              <div className="b-box">
                <span>Citas Scopus</span>
                <b>{card.citationCount || 0}</b>
              </div>
              <div className="b-box">
                <span>SJR Score</span>
                <b>{card.sjr ? card.sjr.slice(0, 4) : 'N/D'}</b>
              </div>
              <div className="b-box">
                <span>CiteScore</span>
                <b>{card.citeScore || 'N/D'}</b>
              </div>
              <div className="b-box">
                <span>Cuartil</span>
                <b>{card.sjrQuartile || card.quality || 'N/D'}</b>
              </div>
            </div>

            {card.doi && (
              <a
                href={card.doi}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-btn cyber-btn-outline"
                style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}
              >
                🔗 Abrir Artículo Original (DOI)
              </a>
            )}
          </div>

          {/* Columna Derecha: Contenido Académico */}
          <div className="inspector-details">
            <span style={{ fontSize: '12px', color: 'var(--c-peach)', fontWeight: 800 }}>
              {card.id} — ANTECEDENTE CIENTÍFICO
            </span>
            <h2 style={{ fontSize: '20px', color: '#fff', margin: '6px 0 10px', lineHeight: 1.3 }}>
              {card.title}
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--c-rose)', marginBottom: '14px' }}>
              👥 <b>Autores:</b> {card.authors}
            </div>

            <div className="data-block">
              <h4>🔬 Enfoque Metodológico</h4>
              <p><b>{card.methodClass}</b>: {card.methodology}</p>
            </div>

            <div className="data-block">
              <h4>💡 Idea Central y Aporte</h4>
              <p>{card.contribution || card.coreIdea}</p>
            </div>

            <div className="data-block limit-block">
              <h4>⚠️ Limitación Declarada / Vacío Abierto</h4>
              <p>{card.limitation}</p>
            </div>

            <div className="data-block citation-block">
              <h4>📚 Cita Bibliográfica Formateada</h4>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', lineHeight: 1.5 }}>
                {card.citation || `${card.authors} (${card.year}). ${card.title}. ${card.venue || 'MTC Journal'}.`}
              </p>
              <button
                className="cyber-btn cyber-btn-secondary"
                style={{ marginTop: '8px', padding: '6px 12px', fontSize: '11px' }}
                onClick={handleCopyCitation}
              >
                {copied ? '✅ ¡Cita Copiada al Portapapeles!' : '📋 Copiar Referencia APA'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
