import React from 'react';
import { BookOpen, Moon, Sun, MessageSquareCode } from 'lucide-react';

export default function Header({ theme, toggleTheme, botPreset, setBotPreset }) {
  return (
    <header className="app-header">
      <div className="brand-logo">
        <div className="brand-icon">
          <BookOpen size={24} />
        </div>
        <div>
          Sprint<span className="title-gradient">Buddy</span>
          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            E-Reader to Physical Page Converter
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Discord Bot Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-input)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
          <MessageSquareCode size={16} color="var(--accent-cyan)" />
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Bot:</span>
          <select 
            value={botPreset} 
            onChange={(e) => setBotPreset(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
          >
            <option value="bookverse" style={{ background: '#0F172A' }}>Bookverse (/sprint)</option>
            <option value="sprinty" style={{ background: '#0F172A' }}>Sprinty (!read / !sprint)</option>
            <option value="bookish" style={{ background: '#0F172A' }}>Bookish (.page)</option>
            <option value="custom" style={{ background: '#0F172A' }}>Custom Format</option>
          </select>
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
