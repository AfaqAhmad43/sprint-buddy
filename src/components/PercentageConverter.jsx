import React, { useState } from 'react';
import { Percent, Copy, Check, Hash, Sliders, Sparkles } from 'lucide-react';
import { calculatePageFromPercentage, calculatePageFromLocation, calculatePageFromScreen, formatDiscordBotCommand } from '../utils/converter';

export default function PercentageConverter({ currentBook, botPreset, onCopyToast }) {
  const [conversionType, setConversionType] = useState('percentage'); // 'percentage', 'location', 'screen'
  
  // Percentage state
  const [percentage, setPercentage] = useState('0');
  
  // Location state
  const [currentLoc, setCurrentLoc] = useState('');
  const [totalLoc, setTotalLoc] = useState('');

  // Screen page state
  const [currentScreen, setCurrentScreen] = useState('');
  const [totalScreens, setTotalScreens] = useState('');

  // Options
  const [roundingMode, setRoundingMode] = useState('floor'); // 'floor', 'round', 'ceil'
  const [copiedType, setCopiedType] = useState(null); // 'start' or 'update' or null

  const totalPages = currentBook ? currentBook.totalPages : 350;

  // Calculate physical page based on current mode
  let computedPage = 0;
  let currentPctValue = 0;

  if (conversionType === 'percentage') {
    currentPctValue = parseFloat(percentage) || 0;
    computedPage = calculatePageFromPercentage(currentPctValue, totalPages, roundingMode);
  } else if (conversionType === 'location') {
    computedPage = calculatePageFromLocation(currentLoc, totalLoc, totalPages);
    currentPctValue = totalLoc > 0 ? ((currentLoc / totalLoc) * 100).toFixed(1) : 0;
  } else if (conversionType === 'screen') {
    computedPage = calculatePageFromScreen(currentScreen, totalScreens, totalPages);
    currentPctValue = totalScreens > 0 ? ((currentScreen / totalScreens) * 100).toFixed(1) : 0;
  }

  const startCommand = formatDiscordBotCommand(botPreset, computedPage, 'start');
  const updateCommand = formatDiscordBotCommand(botPreset, computedPage, 'end');

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    onCopyToast(`Copied to clipboard: "${text}"`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      {/* Sub-navigation for conversion modes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="var(--accent-cyan)" />
          E-Reader Progress Converter
        </h3>

        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-input)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            className={`mode-btn ${conversionType === 'percentage' ? 'active' : ''}`}
            onClick={() => setConversionType('percentage')}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            <Percent size={13} /> Percentage (%)
          </button>
          <button 
            className={`mode-btn ${conversionType === 'location' ? 'active' : ''}`}
            onClick={() => setConversionType('location')}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            <Hash size={13} /> Kindle Location
          </button>
          <button 
            className={`mode-btn ${conversionType === 'screen' ? 'active' : ''}`}
            onClick={() => setConversionType('screen')}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            <Sliders size={13} /> E-Reader Pages
          </button>
        </div>
      </div>

      {/* Percentage Mode (HERO) */}
      {conversionType === 'percentage' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="input-group">
            <div className="input-label">
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Your E-Reader Percentage</span>
              <span className="mono-font" style={{ color: '#38BDF8', fontWeight: 700, fontSize: '1.1rem' }}>{percentage}%</span>
            </div>
            <div className="input-wrapper">
              <Percent className="input-icon" size={20} color="var(--accent-cyan)" />
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                className="custom-input mono-font"
                style={{ fontSize: '1.3rem', fontWeight: 700 }}
                placeholder="e.g. 35.5"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Quick Slider for percentages */}
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={percentage || 0}
            onChange={(e) => setPercentage(e.target.value)}
            style={{
              width: '100%',
              accentColor: 'var(--accent-primary)',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          />
        </div>
      )}

      {/* Kindle Location Mode */}
      {conversionType === 'location' && (
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Current Kindle Location</label>
            <input
              type="number"
              className="custom-input no-icon mono-font"
              placeholder="e.g. 1850"
              value={currentLoc}
              onChange={(e) => setCurrentLoc(e.target.value)}
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Total Kindle Locations in Book</label>
            <input
              type="number"
              className="custom-input no-icon mono-font"
              placeholder="e.g. 5200"
              value={totalLoc}
              onChange={(e) => setTotalLoc(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* E-Reader Screen Page Mode */}
      {conversionType === 'screen' && (
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Current E-Reader Screen Page</label>
            <input
              type="number"
              className="custom-input no-icon mono-font"
              placeholder="e.g. 210"
              value={currentScreen}
              onChange={(e) => setCurrentScreen(e.target.value)}
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Total E-Reader Screen Pages</label>
            <input
              type="number"
              className="custom-input no-icon mono-font"
              placeholder="e.g. 680"
              value={totalScreens}
              onChange={(e) => setTotalScreens(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Hero Result Display */}
      <div className="result-hero">
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Physical Page Equivalent
        </div>
        <div className="result-number">
          Page {computedPage}
        </div>
        <div className="result-subtitle">
          out of <strong style={{ color: 'var(--text-main)' }}>{totalPages}</strong> total physical pages ({currentPctValue}% finished)
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, currentPctValue))}%` }}></div>
        </div>
      </div>

      {/* Discord Bot Commands Section */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            1-Click Discord Bot Commands:
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Rounding: 
            <button 
              onClick={() => setRoundingMode(roundingMode === 'floor' ? 'round' : 'floor')}
              style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', marginLeft: '0.3rem', fontWeight: 700 }}
            >
              {roundingMode.toUpperCase()}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Update / End Sprint Command */}
          <div className="discord-box">
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem', fontWeight: 600 }}>
                Update / Finish Sprint Command:
              </div>
              <span className="discord-code">{updateCommand}</span>
            </div>
            <button 
              className="btn-copy"
              onClick={() => handleCopy(updateCommand, 'update')}
            >
              {copiedType === 'update' ? <Check size={16} /> : <Copy size={16} />}
              {copiedType === 'update' ? 'Copied!' : 'Copy Update'}
            </button>
          </div>

          {/* Start Sprint Command */}
          <div className="discord-box" style={{ opacity: 0.9 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem', fontWeight: 600 }}>
                Start Sprint Command:
              </div>
              <span className="discord-code" style={{ color: '#A5B4FC' }}>{startCommand}</span>
            </div>
            <button 
              className="btn-secondary"
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}
              onClick={() => handleCopy(startCommand, 'start')}
            >
              {copiedType === 'start' ? <Check size={14} /> : <Copy size={14} />}
              {copiedType === 'start' ? 'Copied!' : 'Copy Start'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
