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
      <div className="top-hud-container">
        {/* PRIMERA FILA: Título principal centrado horizontalmente con subtítulo centrado debajo */}
        <div className="hud-title-row">
          <div className="hud-brand-tag">
            <span className="brand-badge">MTC RESEARCH</span>
          </div>
          <h1 className="hud-topic-title">{topic.name}</h1>
          <p className="hud-question" title={topic.question}>
            ❓ {topic.question}
          </p>
        </div>

        {/* SEGUNDA FILA: Panel compacto de estadísticas y controles de configuración agrupados */}
        <div className="hud-sub-row">
          <div className="hud-stats-pill" aria-label="Estadísticas del juego">
            <span className="stat-item">📊 Tesis: <b>{stats.totalUniqueCards}</b></span>
            <span className="stat-item">⏳ Línea: <b>{stats.timelineCount}</b></span>
            <span className="stat-item">🗂️ Matriz: <b>{stats.classifiedCount}</b></span>
            <span className="stat-item">⚡ Vacíos: <b>{stats.gapsCount}</b></span>
            <span className="stat-item">⚔️ Combates: <b>{stats.combatsCount}</b></span>
          </div>

          <div className="hud-controls-group">
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
        </div>
      </div>
    </header>
  );
};
