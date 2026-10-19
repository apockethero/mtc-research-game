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
    <nav className="main-nav-tabs" role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
          {tab.badge !== undefined && tab.badge > 0 && (
            <span
              style={{
                background: activeTab === tab.id ? 'var(--c-peach)' : 'rgba(210, 152, 132, 0.25)',
                color: activeTab === tab.id ? '#140c11' : 'var(--c-rose)',
                fontSize: '10px',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '10px',
                marginLeft: '4px'
              }}
            >
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};
