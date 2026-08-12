import React, { useState } from 'react';
import { Percent, Copy, Check, Sparkles, CornerDownLeft } from 'lucide-react';
import { calculatePageFromPercentage, formatBookverseCommand } from '../utils/converter';

export default function PercentageConverter({ currentBook, onCopyToast }) {
  // Percentage state
  const [percentage, setPercentage] = useState('0');
  
  // Options
  const [roundingMode, setRoundingMode] = useState('floor'); // 'floor', 'round', 'ceil'
  const [copied, setCopied] = useState(false);

  const totalPages = currentBook && currentBook.totalPages > 0 ? currentBook.totalPages : 350;
  
  // Clean & clamp percentage input safely
  let rawPct = parseFloat(percentage);
  if (isNaN(rawPct)) rawPct = 0;
  const currentPctValue = Math.min(100, Math.max(0, rawPct));

  const computedPage = calculatePageFromPercentage(currentPctValue, totalPages, roundingMode);
  const updateCommand = formatBookverseCommand(computedPage);

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setPercentage('');
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setPercentage(val);
    }
  };

  const handleQuickAdd = (delta) => {
    const next = Math.min(100, Math.max(0, (parseFloat(percentage) || 0) + delta));
    setPercentage(next.toFixed(1).replace(/\.0$/, ''));
  };

  const handleQuickSet = (value) => {
    setPercentage(value.toString());
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onCopyToast(`Copied Bookverse Command: "${text}"`);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard shortcut: Press Enter to copy command immediately!
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCopy(updateCommand);
    }
  };

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="var(--accent-cyan)" />
          Percentage Converter
        </h3>

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

      {/* Percentage Hero Input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="input-group">
          <div className="input-label">
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Your E-Reader Percentage (%)</span>
            <span className="mono-font" style={{ color: '#38BDF8', fontWeight: 700, fontSize: '1.1rem' }}>
              {currentPctValue}%
            </span>
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
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', marginTop: '0.2rem' }}>
            <CornerDownLeft size={12} color="#818CF8" /> Press <strong style={{ color: '#818CF8' }}>Enter</strong> to Copy Command
          </div>
        </div>

        {/* Quick Slider for percentages */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={currentPctValue}
          onChange={(e) => setPercentage(e.target.value)}
          style={{
            width: '100%',
            accentColor: 'var(--accent-primary)',
            cursor: 'pointer',
            marginTop: '0.25rem'
          }}
        />

        {/* QoL Quick Preset Buttons */}
        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => handleQuickAdd(1)} className="mode-btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>+1%</button>
          <button onClick={() => handleQuickAdd(5)} className="mode-btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>+5%</button>
          <button onClick={() => handleQuickAdd(10)} className="mode-btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>+10%</button>
          <button onClick={() => handleQuickSet(25)} className="mode-btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>25%</button>
          <button onClick={() => handleQuickSet(50)} className="mode-btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>50%</button>
          <button onClick={() => handleQuickSet(75)} className="mode-btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>75%</button>
          <button onClick={() => handleQuickSet(100)} className="mode-btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>100%</button>
        </div>
      </div>

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
          <div className="progress-fill" style={{ width: `${currentPctValue}%` }}></div>
        </div>
      </div>

      {/* Discord Bot Command Section */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            1-Click Bookverse Bot Command:
          </span>
        </div>

        <div className="discord-box">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem', fontWeight: 600 }}>
              Bookverse Sprint Command:
            </div>
            <span className="discord-code">{updateCommand}</span>
          </div>
          <button 
            className="btn-copy"
            onClick={() => handleCopy(updateCommand)}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Command'}
          </button>
        </div>
      </div>
    </div>
  );
}
