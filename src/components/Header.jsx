import React from 'react';
import { BookOpen, Moon, Sun, Zap } from 'lucide-react';

export default function Header({ theme, setTheme }) {
  return (
    <header className="app-header">
      <div className="brand-logo">
        <div className="brand-icon">
          <BookOpen size={20} />
        </div>
        <div>
          Sprint<span className="title-gradient">Buddy</span>
          <div style={{ fontSize: '0.725rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            E-Reader Page Converter
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Theme Segmented Switcher */}
        <div className="theme-switcher">
          <button
            className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
            title="Slate Dark Theme"
          >
            <Moon size={12} /> Dark
          </button>
          <button
            className={`theme-btn ${theme === 'oled' ? 'active' : ''}`}
            onClick={() => setTheme('oled')}
            title="Pitch Black OLED Battery Saver Mode"
          >
            <Zap size={12} /> OLED
          </button>
          <button
            className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
            title="Clean Light Theme"
          >
            <Sun size={12} /> Light
          </button>
        </div>
      </div>
    </header>
  );
}
