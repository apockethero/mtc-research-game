import React, { useState, useMemo } from 'react';
import { useSession } from '../../context/SessionContext';
import { Card3D } from '../../components/cards/Card3D';
import { soundEngine } from '../../services/soundEngine';

export const DeckGallery: React.FC = () => {
  const { deck, topic, setActiveTab } = useSession();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedQuality, setSelectedQuality] = useState<string>('ALL');
  const [selectedMethodClass, setSelectedMethodClass] = useState<string>('ALL');

  // Obtener categorías únicas presentes en el mazo
  const categories = useMemo(() => {
    const set = new Set<string>();
    deck.forEach(c => {
      if (c.categoryEs) set.add(c.categoryEs);
      else if (c.category) set.add(c.category);
    });
    return Array.from(set).sort();
  }, [deck]);

  // Obtener calidades únicas presentes en el mazo
  const qualities = useMemo(() => {
    const set = new Set<string>();
    deck.forEach(c => {
      if (c.quality) set.add(c.quality);
    });
    return Array.from(set).sort();
  }, [deck]);

  // Filtrado reactivo de cartas
  const filteredCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return deck.filter(card => {
      // Búsqueda por texto
      if (query) {
        const matchId = card.id.toLowerCase().includes(query);
        const matchTitle = card.title.toLowerCase().includes(query);
        const matchAuthors = card.authors.toLowerCase().includes(query);
        const matchKeyword = card.keyword ? card.keyword.toLowerCase().includes(query) : false;
        const matchLimit = card.limitation.toLowerCase().includes(query);
        if (!matchId && !matchTitle && !matchAuthors && !matchKeyword && !matchLimit) {
          return false;
        }
      }

      // Filtro de categoría
      if (selectedCategory !== 'ALL') {
        const cat = card.categoryEs || card.category;
        if (cat !== selectedCategory) return false;
      }

      // Filtro de calidad
      if (selectedQuality !== 'ALL') {
        if (card.quality !== selectedQuality) return false;
      }

      // Filtro de macro-clase metodológica
      if (selectedMethodClass !== 'ALL') {
        if (card.methodClass !== selectedMethodClass) return false;
      }

      return true;
    });
  }, [deck, searchQuery, selectedCategory, selectedQuality, selectedMethodClass]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedQuality('ALL');
    setSelectedMethodClass('ALL');
  };

  return (
    <div className="view-panel active">
      <div className="game-header-bar">
        <div>
          <div className="game-tag">CATÁLOGO GENERAL · ANTECEDENTES MTC</div>
          <h2>Mazo de Antecedentes y Evidencias Científicas</h2>
          <p>
            Explora las <b>{deck.length} cartas</b> indexadas para el tópico <i>{topic.name}</i>.
            Cada carta integra trazabilidad bibliográfica, citas Scopus, y doble cara didáctica/técnica.
          </p>
        </div>
      </div>

      <div className="deck-controls-bar cyber-panel" style={{ padding: '16px 20px', borderRadius: '10px' }}>
        <div className="deck-search-box">
          <input
            type="text"
            className="cyber-input"
            placeholder="🔍 Buscar por título, autor, palabra clave, limitación o ID (ej. MTC06)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="deck-filter-group" style={{ flexWrap: 'wrap' }}>
          <select
            className="cyber-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            title="Filtrar por categoría temática"
          >
            <option value="ALL">Todas las Categorías ({deck.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="cyber-select"
            value={selectedQuality}
            onChange={(e) => setSelectedQuality(e.target.value)}
            title="Filtrar por cuartil / calidad"
          >
            <option value="ALL">Todos los Niveles / Cuartiles</option>
            {qualities.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>

          <select
            className="cyber-select"
            value={selectedMethodClass}
            onChange={(e) => setSelectedMethodClass(e.target.value)}
            title="Filtrar por macro-clase metodológica"
          >
            <option value="ALL">Todos los Enfoques Metodológicos</option>
            <option value="Simulación y Modelado">Simulación y Modelado</option>
            <option value="Diseño y Prototipado">Diseño y Prototipado</option>
            <option value="Pruebas Experimentales">Pruebas Experimentales</option>
            <option value="Estudios Empíricos y Políticas">Estudios Empíricos y Políticas</option>
          </select>

          {(searchQuery || selectedCategory !== 'ALL' || selectedQuality !== 'ALL' || selectedMethodClass !== 'ALL') && (
            <button
              className="cyber-btn cyber-btn-outline"
              onClick={handleResetFilters}
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              Limpiar Filtros ✕
            </button>
          )}
        </div>
      </div>

      <div style={{ margin: '14px 0 20px', fontSize: '13px', color: 'var(--c-rose)' }}>
        Mostrando <b>{filteredCards.length}</b> de <b>{deck.length}</b> antecedentes
      </div>

      {filteredCards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--c-rose)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
          <h3>No se encontraron cartas con los criterios seleccionados</h3>
          <p style={{ marginTop: '8px' }}>Prueba con términos más generales o limpia los filtros activos.</p>
          <button
            className="cyber-btn cyber-btn-secondary"
            onClick={handleResetFilters}
            style={{ marginTop: '16px' }}
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredCards.map(card => (
            <Card3D key={card.id} card={card} />
          ))}
        </div>
      )}

      {/* Barra de continuidad de la ruta metodológica */}
      <div className="activity-continuity-bar">
        <div className="continuity-info">
          <span className="continuity-step-tag">Etapa 01 de 07 · Catálogo Exploratorio</span>
          <span className="continuity-desc">
            Has explorado el catálogo completo de 49 antecedentes. El siguiente paso en la ruta metodológica es ordenar temporalmente los estudios para construir la línea base histórica.
          </span>
        </div>
        <button
          type="button"
          className="cyber-btn cyber-btn-primary continuity-next-btn"
          onClick={() => {
            soundEngine.playSuccess();
            setActiveTab('timeline');
          }}
        >
          <span>Siguiente paso: El Puente de Cronología</span>
          <span className="continuity-arrow">→</span>
        </button>
      </div>
    </div>
  );
};
