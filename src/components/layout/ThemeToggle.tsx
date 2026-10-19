import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';
  const label = isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={label}
      title={label}
      className={`theme-toggle-switch ${theme}`}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-icon-track track-moon" aria-hidden="true">🌙</span>
      <span className="theme-toggle-icon-track track-sun" aria-hidden="true">☀️</span>
      <span className="theme-toggle-thumb" aria-hidden="true">
        {isLight ? '☀️' : '🌙'}
      </span>
    </button>
  );
};
