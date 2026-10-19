import React, { useState } from 'react';
import { getCardImageUrl, getCardBackImageUrl } from '../../utils/imagePath';
import { useSession } from '../../context/SessionContext';

interface EvaluationVisualCardProps {
  cardId: string;
  customTitle?: string;
  altText: string;
  maskAnswers?: boolean; // Si true, oculta títulos, autores, conclusiones o etiquetas que revelen la respuesta
  showMetadata?: boolean; // Para K2: muestra DOI, año y tipo documental para comprobar trazabilidad
  hintId?: string;
  hintText?: string;
  onHintUsed?: (hintId: string) => void;
  wasHintUsed?: boolean;
}

export const EvaluationVisualCard: React.FC<EvaluationVisualCardProps> = ({
  cardId,
  customTitle,
  altText,
  maskAnswers = true,
  showMetadata = false,
  hintId,
  hintText,
  onHintUsed,
  wasHintUsed = false
}) => {
  const { deck } = useSession();
  const card = deck.find(c => c.id === cardId);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);

  const imageUrl = getCardImageUrl(card?.image, cardId);

  const handleOpenHint = () => {
    setShowHintModal(true);
    if (hintId && onHintUsed) {
      onHintUsed(hintId);
    }
  };

  return (
    <div
      className="eval-visual-card-frame"
      style={{
        borderRadius: '10px',
        padding: '12px',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      {/* Cabecera de la tarjeta evaluativa */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              background: 'var(--c-crimson)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px'
            }}
          >
            {cardId}
          </span>
          <span className="eval-visual-card-title" style={{ fontSize: '13px' }}>
            {customTitle || `Ilustración Técnica: Investigación ${cardId}`}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {hintText && (
            <button
              type="button"
              className="cyber-btn cyber-btn-outline"
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                color: wasHintUsed ? '#15803d' : 'var(--c-copper)',
                borderColor: wasHintUsed ? 'rgba(21, 128, 61, 0.4)' : 'rgba(212, 120, 61, 0.4)'
              }}
              onClick={handleOpenHint}
              title="Consultar pista o explicación de términos"
            >
              {wasHintUsed ? '💡 Pista consultada' : '💡 ¿Necesitas una pista?'}
            </button>
          )}

          <button
            type="button"
            className="cyber-btn cyber-btn-outline"
            style={{ fontSize: '11px', padding: '3px 8px' }}
            onClick={() => setIsZoomed(true)}
            title="Ampliar imagen"
          >
            🔍 Ampliar
          </button>
        </div>
      </div>

      {/* Contenedor de la ilustración técnica con enmascaramiento controlado */}
      <div
        className="eval-visual-image-frame"
        style={{
          position: 'relative',
          width: '100%',
          maxHeight: '220px',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src={imageUrl}
          alt={altText}
          style={{
            width: '100%',
            height: '210px',
            objectFit: 'contain',
            display: 'block'
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = getCardBackImageUrl();
          }}
        />

        {/* Franja de enmascaramiento para preservar rigor en evaluación visual */}
        {maskAnswers && (
          <div
            className="mask-overlay"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(0deg, rgba(20, 10, 16, 0.95) 40%, rgba(20, 10, 16, 0.6) 80%, transparent)',
              padding: '6px 12px',
              fontSize: '10.5px',
              color: 'var(--c-rose)',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>🔒 Datos identificativos enmascarados para evaluación visual objetiva</span>
          </div>
        )}
      </div>

      {/* Metadatos visibles SOLO cuando corresponde a trazabilidad (K2) */}
      {showMetadata && card && (
        <div
          className="eval-visual-metadata-box"
          style={{
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '8px'
          }}
        >
          <div>
            <span className="eval-visual-metadata-lbl">Autor y Año: </span>
            <span className="eval-visual-metadata-val">{card.firstAuthor} ({card.year})</span>
          </div>
          <div>
            <span className="eval-visual-metadata-lbl">DOI: </span>
            <span className="eval-visual-metadata-val" style={{ wordBreak: 'break-all' }}>{card.doi || '10.1016/j.est.2023.107892'}</span>
          </div>
          <div>
            <span className="eval-visual-metadata-lbl">Tipo Documental: </span>
            <span className="eval-visual-metadata-val">Artículo en revista (Journal)</span>
          </div>
          <div>
            <span className="eval-visual-metadata-lbl">Indicador Scopus: </span>
            <span style={{ color: '#15803d', fontWeight: 700 }}>{card.quality || 'Q1'} (Verificado)</span>
          </div>
        </div>
      )}

      {/* Modal de Zoom */}
      {isZoomed && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsZoomed(false)}
          style={{ zIndex: 300, cursor: 'zoom-out' }}
        >
          <div
            className="glass-panel eval-zoom-modal-content"
            style={{
              maxWidth: '720px',
              width: '90%',
              padding: '18px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <b style={{ color: 'var(--c-copper)', fontSize: '14px', fontWeight: 800 }}>
                Vista Ampliada: Investigación {cardId}
              </b>
              <button
                type="button"
                className="tutorial-close-btn"
                onClick={() => setIsZoomed(false)}
                aria-label="Cerrar vista ampliada"
              >
                ✕
              </button>
            </div>
            <img
              src={imageUrl}
              alt={altText}
              style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '6px' }}
            />
            <p style={{ margin: '10px 0 0', fontSize: '11.5px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              {altText}
            </p>
          </div>
        </div>
      )}

      {/* Modal de Pista / Glosario Opcional */}
      {showHintModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowHintModal(false)}
          style={{ zIndex: 300 }}
        >
          <div
            className="glass-panel eval-hint-modal-content"
            style={{
              maxWidth: '520px',
              width: '90%',
              padding: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>💡</span>
                <b style={{ color: 'var(--c-copper)', fontSize: '14px', fontWeight: 800 }}>
                  Explicación Sencilla de Términos (Ayuda)
                </b>
              </div>
              <button
                type="button"
                className="tutorial-close-btn"
                onClick={() => setShowHintModal(false)}
                aria-label="Cerrar ayuda"
              >
                ✕
              </button>
            </div>

            <div className="eval-hint-modal-body" style={{ fontSize: '13px', lineHeight: 1.6, padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
              {hintText}
            </div>

            <p className="eval-hint-modal-disclaimer" style={{ margin: '0 0 16px 0', fontSize: '11px' }}>
              * Esta ayuda explica conceptos generales sin revelar la respuesta de la pregunta. El uso de pistas queda registrado en la sesión para análisis pedagógico.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="cyber-btn cyber-btn-primary"
                onClick={() => setShowHintModal(false)}
              >
                Entendido, volver a la pregunta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
