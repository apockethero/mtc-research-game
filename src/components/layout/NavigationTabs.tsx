import React, { useMemo } from 'react';
import { useSession, NavTab } from '../../context/SessionContext';

interface TabItem {
  id: NavTab;
  stepNumber: string;
  label: string;
  icon: string;
  subtitle: string;
  isComplete: boolean;
  badge?: number;
}

export const NavigationTabs: React.FC = () => {
  const { activeTab, setActiveTab, stats, deck } = useSession();

  // Comprobar completitud de la evaluación científica desde localStorage de forma segura
  const isEvaluationComplete = useMemo(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('mtc_scientific_evaluation_session_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          return Boolean(parsed?.isComplete);
        }
      }
    } catch {
      // Ignorar errores en entornos sin localStorage
    }
    return false;
  }, [activeTab]);

  // Identificar si el participante se encuentra en el estado inicial sin avances
  const isInitialState = (
    stats.timelineCount === 0 &&
    stats.classifiedCount === 0 &&
    stats.gapsCount === 0 &&
    stats.combatsCount === 0 &&
    !isEvaluationComplete
  );

  const tabs: TabItem[] = [
    {
      id: 'deck',
      stepNumber: '01',
      label: 'Mazo Completo',
      icon: '🗃️',
      subtitle: 'Exploración inicial',
      isComplete: stats.totalUniqueCards > 0 || !isInitialState,
      badge: deck.length
    },
    {
      id: 'timeline',
      stepNumber: '02',
      label: 'El Puente de Cronología',
      icon: '⏳',
      subtitle: 'Secuencia temporal',
      isComplete: stats.timelineCount >= 5,
      badge: stats.timelineCount
    },
    {
      id: 'matrix',
      stepNumber: '03',
      label: 'La Matriz de Enfoques',
      icon: '🗂️',
      subtitle: 'Clasificación teórica',
      isComplete: stats.classifiedCount >= 4,
      badge: stats.classifiedCount
    },
    {
      id: 'gaphunter',
      stepNumber: '04',
      label: 'Cazadores de Vacíos',
      icon: '⚡',
      subtitle: 'Detección de brechas',
      isComplete: stats.gapsCount >= 1,
      badge: stats.gapsCount
    },
    {
      id: 'combat',
      stepNumber: '05',
      label: 'Combates de Validación',
      icon: '⚔️',
      subtitle: 'Contraste cruzado',
      isComplete: stats.combatsCount >= 1,
      badge: stats.combatsCount
    },
    {
      id: 'evaluation',
      stepNumber: '06',
      label: 'Evaluación científica',
      icon: '🧪',
      subtitle: 'Validación empírica',
      isComplete: isEvaluationComplete
    },
    {
      id: 'synthesis',
      stepNumber: '07',
      label: 'Estado del Arte Vivo',
      icon: '📝',
      subtitle: 'Síntesis y exportación',
      isComplete: stats.totalUniqueCards >= 5 && (stats.timelineCount > 0 || stats.classifiedCount > 0)
    }
  ];

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];
  const completedCount = tabs.filter(t => t.isComplete).length;
  const progressPercent = Math.round((completedCount / tabs.length) * 100);

  return (
    <div className="main-nav-tabs-bar">
      {/* Barra de progreso sutil de la ruta metodológica */}
      <div
        className="nav-route-progress-bar"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        title={`Progreso de la ruta: ${completedCount} de ${tabs.length} etapas (${progressPercent}%)`}
      >
        <div
          className="nav-route-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Indicador contextual de etapa */}
      <div className="nav-route-banner">
        <div className="nav-route-legend">
          <span className="route-legend-title">Ruta Metodológica MTC</span>
          <span className="route-legend-sep">·</span>
          <span className="route-legend-step">
            Etapa {currentTab.stepNumber} de {tabs.length.toString().padStart(2, '0')}: <strong>{currentTab.label}</strong>
          </span>
          <span className="route-legend-purpose">({currentTab.subtitle})</span>
        </div>
        <div className="nav-route-summary">
          {isInitialState && (
            <span className="route-start-badge" title="Punto de partida sugerido: explora primero el mazo de antecedentes">
              Punto de partida: 01 Mazo Completo
            </span>
          )}
          <span className="route-progress-counter">
            <b>{completedCount}</b>/{tabs.length} completadas
          </span>
        </div>
      </div>

      {/* Pestañas de navegación de la ruta */}
      <nav className="main-nav-tabs" role="tablist" aria-label="Ruta secuencial de minijuegos y vistas de investigación">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isInitialTarget = isInitialState && tab.id === 'deck';
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`nav-tab ${isActive ? 'active' : ''} ${tab.isComplete ? 'is-completed' : ''} ${isInitialTarget ? 'initial-target' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={`${tab.stepNumber} · ${tab.label}: ${tab.subtitle}${tab.isComplete ? ' (Completada ✓)' : ''}`}
            >
              <span className="nav-step-num">{tab.stepNumber}</span>
              <span className="nav-tab-icon">{tab.icon}</span>
              <div className="nav-tab-text-wrap">
                <span className="nav-tab-label">{tab.label}</span>
                <span className="nav-tab-subtitle">{tab.subtitle}</span>
              </div>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="nav-tab-badge">
                  {tab.badge}
                </span>
              )}
              {tab.isComplete ? (
                <span className="nav-step-status completed" title="Etapa completada">✓</span>
              ) : isInitialTarget ? (
                <span className="nav-step-status start-hint" title="Punto de partida recomendado">Inicio</span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
