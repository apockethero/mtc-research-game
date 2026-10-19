import React from 'react';
import { useSession } from '../../context/SessionContext';

export const HeaderHUD: React.FC = () => {
  const {
    topic,
    stats,
    soundEnabled,
    toggleSound,
    setWizardOpen,
    resetSession,
    setActiveTab
  } = useSession();

  return (
    <header className="top-hud">
      <div className="hud-left">
        <div className="brand-badge">MTC RESEARCH</div>
        <div className="hud-topic-info">
          <span className="hud-topic-title">{topic.name}</span>
          <span className="hud-question" title={topic.question}>
            ❓ {topic.question}
          </span>
        </div>
      </div>

      <div className="hud-stats-pill">
        <span>📊 Tesis: <b>{stats.totalUniqueCards}</b></span>
        <span>⏳ Línea: <b>{stats.timelineCount}</b></span>
        <span>🗂️ Matriz: <b>{stats.classifiedCount}</b></span>
        <span>⚡ Vacíos: <b>{stats.gapsCount}</b></span>
        <span>⚔️ Combates: <b>{stats.combatsCount}</b></span>
      </div>

      <div className="hud-right">
        <button
          className="cyber-btn cyber-btn-secondary"
          onClick={() => setWizardOpen(true)}
          title="Configurar temática, criterios o dataset"
        >
          ⚙️ Configurar (Wizard)
        </button>

        <button
          className={`cyber-btn ${soundEnabled ? 'cyber-btn-secondary' : 'cyber-btn-outline'}`}
          onClick={toggleSound}
          title={soundEnabled ? 'Silenciar efectos de sonido' : 'Activar efectos de sonido'}
        >
          {soundEnabled ? '🔊 Sonido: ON' : '🔇 Sonido: OFF'}
        </button>

        <button
          className="cyber-btn cyber-btn-outline"
          onClick={resetSession}
          title="Reiniciar avances del juego"
        >
          🔄 Reiniciar
        </button>

        <button
          className="cyber-btn cyber-btn-primary"
          onClick={() => setActiveTab('synthesis')}
          title="Ver borrador de tesis y exportaciones"
        >
          📝 Borrador de Tesis
        </button>
      </div>
    </header>
  );
};
