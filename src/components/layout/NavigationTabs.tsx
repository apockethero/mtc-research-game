import React from 'react';
import { useSession, NavTab } from '../../context/SessionContext';

interface TabItem {
  id: NavTab;
  label: string;
  icon: string;
  badge?: number;
}

export const NavigationTabs: React.FC = () => {
  const { activeTab, setActiveTab, stats, deck } = useSession();

  const tabs: TabItem[] = [
    { id: 'deck', label: 'Mazo Completo', icon: '🗃️', badge: deck.length },
    { id: 'timeline', label: 'El Puente de Cronología', icon: '⏳', badge: stats.timelineCount },
    { id: 'matrix', label: 'La Matriz de Enfoques', icon: '🗂️', badge: stats.classifiedCount },
    { id: 'gaphunter', label: 'Cazadores de Vacíos', icon: '⚡', badge: stats.gapsCount },
    { id: 'combat', label: 'Combates de Validación', icon: '⚔️', badge: stats.combatsCount },
    { id: 'evaluation', label: 'Evaluación científica', icon: '🧪' },
    { id: 'synthesis', label: 'Estado del Arte Vivo', icon: '📝' }
  ];

  return (
    <div className="main-nav-tabs-bar">
      <nav className="main-nav-tabs" role="tablist" aria-label="Navegación principal de minijuegos y vistas">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-tab-icon">{tab.icon}</span>
            <span className="nav-tab-label">{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="nav-tab-badge">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};
