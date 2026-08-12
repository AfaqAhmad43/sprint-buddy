import React from 'react';
import { BookOpen, Moon, Sun, MessageSquareCode } from 'lucide-react';

export default function Header({ theme, toggleTheme }) {
  return (
    <header className="app-header">
      <div className="brand-logo">
        <div className="brand-icon">
          <BookOpen size={24} />
        </div>
        <div>
          Sprint<span className="title-gradient">Buddy</span>
          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            E-Reader Page Converter for Bookverse
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Bookverse Bot Indicator Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99, 102, 241, 0.12)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(129, 140, 248, 0.3)', fontSize: '0.85rem' }}>
          <MessageSquareCode size={16} color="var(--accent-cyan)" />
          <span style={{ color: '#A5B4FC', fontWeight: 700 }}>Bookverse Bot</span>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="btn-secondary"
          style={{ padding: '0.5rem', borderRadius: '12px' }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#6366F1" />}
        </button>
      </div>
    </header>
  );
}
