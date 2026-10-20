import React from 'react';
import { useSession } from '../context/SessionContext';
import { HeaderHUD } from '../components/layout/HeaderHUD';
import { NavigationTabs } from '../components/layout/NavigationTabs';
import { DeckGallery } from '../features/deck/DeckGallery';
import { TimelineGame } from '../features/games/timeline/TimelineGame';
import { MatrixGame } from '../features/games/matrix/MatrixGame';
import { GapHunterGame } from '../features/games/gaphunter/GapHunterGame';
import { CombatGame } from '../features/games/combat/CombatGame';
import { EvaluationView } from '../features/evaluation/EvaluationView';
import { SynthesisView } from '../features/synthesis/SynthesisView';
import { WizardModal } from '../features/wizard/WizardModal';
import { CardInspectorModal } from '../components/cards/CardInspectorModal';

export const App: React.FC = () => {
  const { activeTab } = useSession();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'deck':
        return <DeckGallery />;
      case 'timeline':
        return <TimelineGame />;
      case 'matrix':
        return <MatrixGame />;
      case 'gaphunter':
        return <GapHunterGame />;
      case 'combat':
        return <CombatGame />;
      case 'evaluation':
        return <EvaluationView />;
      case 'synthesis':
        return <SynthesisView />;
      default:
        return <DeckGallery />;
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top HUD */}
      <HeaderHUD />

      {/* Main Navigation Tabs */}
      <NavigationTabs />

      {/* Main View Area */}
      <main className="main-view-area" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderActiveView()}
      </main>

      {/* Global Discreet Footer */}
      <footer
        className="app-global-footer"
        style={{
          width: '100%',
          textAlign: 'center',
          padding: '16px 20px',
          marginTop: 'auto',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'transparent',
          letterSpacing: '0.03em',
          userSelect: 'none',
          lineHeight: 1.4,
        }}
      >
        CIPAS: A. A. A. D. · Ingeniería de Sistemas · 2026B
      </footer>

      {/* Global Modals */}
      <WizardModal />
      <CardInspectorModal />
    </div>
  );
};
