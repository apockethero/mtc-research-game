import React from 'react';
import { useSession } from '../context/SessionContext';
import { HeaderHUD } from '../components/layout/HeaderHUD';
import { NavigationTabs } from '../components/layout/NavigationTabs';
import { DeckGallery } from '../features/deck/DeckGallery';
import { TimelineGame } from '../features/games/timeline/TimelineGame';
import { MatrixGame } from '../features/games/matrix/MatrixGame';
import { GapHunterGame } from '../features/games/gaphunter/GapHunterGame';
import { CombatGame } from '../features/games/combat/CombatGame';
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
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderActiveView()}
      </main>

      {/* Global Modals */}
      <WizardModal />
      <CardInspectorModal />
    </div>
  );
};
