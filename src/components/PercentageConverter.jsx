import React, { useState, useEffect } from 'react';
import { Percent, Copy, Check, Sparkles, BookOpen, Clock, Trash2, Layers } from 'lucide-react';
import { calculatePageFromPercentage, formatBookverseCommand } from '../utils/converter';

export default function PercentageConverter({ currentBook, onCopyToast }) {
  // Percentage state
  const [percentage, setPercentage] = useState('0');
  
  // Options
  const [roundingMode, setRoundingMode] = useState('floor'); // 'floor', 'round', 'ceil'
  const [copied, setCopied] = useState(false);

  // Copied Command History Log (stored in localStorage)
  const [commandHistory, setCommandHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('sprint_copy_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync command history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sprint_copy_history', JSON.stringify(commandHistory));
    } catch (e) {}
  }, [commandHistory]);

  const totalPages = currentBook && currentBook.totalPages > 0 ? currentBook.totalPages : 350;
  
  // Clean & clamp percentage input safely
  let rawPct = parseFloat(percentage);
  if (isNaN(rawPct)) rawPct = 0;
  const currentPctValue = Math.min(100, Math.max(0, rawPct));

  const computedPage = calculatePageFromPercentage(currentPctValue, totalPages, roundingMode);
  const pagesRemaining = Math.max(0, totalPages - computedPage);
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

    // Save to history log (QoL Feature 4)
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const logItem = {
      id: Date.now(),
      time: timeStr,
      command: text,
      page: computedPage,
      bookTitle: currentBook ? currentBook.title : 'Book'
    };

    setCommandHistory((prev) => [logItem, ...prev.filter(item => item.command !== text)].slice(0, 5));
  };

  const handleClearHistory = () => {
    setCommandHistory([]);
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
        <div className="result-subtitle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span>out of <strong style={{ color: 'var(--text-main)' }}>{totalPages}</strong> total physical pages ({currentPctValue}% finished)</span>
          
          {/* QoL Feature 3: Pages Remaining Badge */}
          <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <BookOpen size={12} /> {pagesRemaining} pages left
          </span>
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
            1-Click Bookverse Command:
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

      {/* QoL Feature 4: Copied Command History Log */}
      {commandHistory.length > 0 && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={14} color="#818CF8" /> Copied Command History
            </span>
            <button onClick={handleClearHistory} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.75rem', cursor: 'pointer' }}>
              Clear Log
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {commandHistory.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleCopy(item.command)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
                title="Click to copy again"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{item.time}</span>
                  <span className="mono-font" style={{ color: '#38BDF8', fontWeight: 600 }}>{item.command}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Page {item.page}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QoL Feature 2: Sticky Mobile Quick-Copy Footer */}
      <div className="mobile-quick-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--accent-cyan)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentPctValue}% ({pagesRemaining} left)</div>
            <div className="mono-font" style={{ fontWeight: 800, fontSize: '1.05rem', color: 'white' }}>Page {computedPage}</div>
          </div>
        </div>
        <button className="btn-copy" onClick={() => handleCopy(updateCommand)}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy /sprint'}
        </button>
      </div>
    </div>
  );
}
