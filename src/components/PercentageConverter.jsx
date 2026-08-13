import React, { useState, useEffect, useRef } from 'react';
import { Percent, Copy, Check, Sparkles, BookOpen, Clock, Layers, Hash, TrendingUp } from 'lucide-react';
import { calculatePageFromPercentage, formatBookverseCommand } from '../utils/converter';

export default function PercentageConverter({ currentBook, onCopyToast }) {
  // Lookup mode: 'pct' = % → Page (default), 'page' = Page → %
  const [lookupMode, setLookupMode] = useState('pct');

  // % → Page state
  const [percentage, setPercentage] = useState('0');

  // Page → % state
  const [pageInput, setPageInput] = useState('');

  // Rounding mode cycles: floor → round → ceil → floor
  const [roundingMode, setRoundingMode] = useState('floor');
  const [copied, setCopied] = useState(false);

  // Track previous book title so we only reset on an actual book switch
  const isFirstRender = useRef(true);
  const prevBookTitle = useRef(currentBook?.title ?? null);

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

  // Reset inputs when the active book changes (not on first mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevBookTitle.current = currentBook?.title ?? null;
      return;
    }
    if (currentBook?.title !== prevBookTitle.current) {
      prevBookTitle.current = currentBook?.title ?? null;
      setPercentage('0');
      setPageInput('');
    }
  }, [currentBook?.title]);

  const totalPages = currentBook && currentBook.totalPages > 0 ? currentBook.totalPages : 304;

  // ── % → Page computed values ──────────────────────────────────────────────
  let rawPct = parseFloat(percentage);
  if (isNaN(rawPct)) rawPct = 0;
  const currentPctValue = Math.min(100, Math.max(0, rawPct));

  const computedPage = calculatePageFromPercentage(currentPctValue, totalPages, roundingMode);
  const pagesRemaining = Math.max(0, totalPages - computedPage);
  const updateCommand = formatBookverseCommand(computedPage);

  // ── Page → % computed values ──────────────────────────────────────────────
  const pageInputNum = Math.min(totalPages, Math.max(1, parseInt(pageInput, 10) || 0));
  const reversePct = pageInput ? ((pageInputNum / totalPages) * 100).toFixed(2) : '0.00';
  const reverseCommand = formatBookverseCommand(pageInput ? pageInputNum : 0);

  // ── Pace estimator (reads last recorded sprint pace from localStorage) ────
  let lastPace = null;
  let estimatedHours = null;
  try {
    const stored = parseFloat(localStorage.getItem('sprint_last_pace'));
    if (!isNaN(stored) && stored > 0) {
      lastPace = stored;
      const pagesLeft = lookupMode === 'pct' ? pagesRemaining : Math.max(0, totalPages - pageInputNum);
      estimatedHours = (pagesLeft / lastPace).toFixed(1);
    }
  } catch (e) {}

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePctInputChange = (e) => {
    const val = e.target.value;
    if (val === '') { setPercentage(''); return; }
    // Accept only numeric-looking strings (blocks 5e2, 1e3, etc.)
    if (/^-?\d*\.?\d*$/.test(val)) setPercentage(val);
  };

  const handlePageInputChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d*$/.test(val)) setPageInput(val);
  };

  const handleQuickAdd = (delta) => {
    const next = Math.min(100, Math.max(0, (parseFloat(percentage) || 0) + delta));
    setPercentage(next.toFixed(1).replace(/\.0$/, ''));
  };

  const handleQuickSet = (value) => {
    setPercentage(value.toString());
  };

  const cycleRounding = () => {
    setRoundingMode(r => r === 'floor' ? 'round' : r === 'round' ? 'ceil' : 'floor');
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopyToast(`Copied: "${text}"`);
      setTimeout(() => setCopied(false), 2000);

      // Save to history
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const page = lookupMode === 'pct' ? computedPage : pageInputNum;
      const logItem = {
        id: Date.now(),
        time: timeStr,
        command: text,
        page,
        bookTitle: currentBook ? currentBook.title : 'Paradise Logic'
      };
      setCommandHistory((prev) => [logItem, ...prev.filter(item => item.command !== text)].slice(0, 5));
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      onCopyToast('Could not copy — please copy manually.');
    }
  };

  const handleClearHistory = () => {
    setCommandHistory([]);
  };

  // Enter key on % input triggers copy
  const handlePctKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCopy(updateCommand);
    }
  };

  // Enter key on page input triggers copy
  const handlePageKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (pageInput) handleCopy(reverseCommand);
    }
  };

  const activeCommand = lookupMode === 'pct' ? updateCommand : reverseCommand;

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="var(--accent-cyan)" />
          Percentage Converter
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Lookup mode toggle */}
          <div className="mode-toggle" style={{ margin: 0 }}>
            <button
              type="button"
              className={`mode-btn ${lookupMode === 'pct' ? 'active' : ''}`}
              onClick={() => setLookupMode('pct')}
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
              title="Percentage → Page"
            >
              <Percent size={12} /> %→Pg
            </button>
            <button
              type="button"
              className={`mode-btn ${lookupMode === 'page' ? 'active' : ''}`}
              onClick={() => setLookupMode('page')}
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
              title="Page → Percentage"
            >
              <Hash size={12} /> Pg→%
            </button>
          </div>

          {/* Rounding cycle (only visible in % mode) */}
          {lookupMode === 'pct' && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              <button
                onClick={cycleRounding}
                style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem' }}
                title="Click to cycle rounding: FLOOR → ROUND → CEIL"
              >
                {roundingMode.toUpperCase()}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MODE: % → Page ──────────────────────────────────────────────── */}
      {lookupMode === 'pct' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="input-group">
            <div className="input-label">
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Your E-Reader Percentage (%)
              </span>
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
                onChange={handlePctInputChange}
                onKeyDown={handlePctKeyDown}
                autoFocus
              />
            </div>
          </div>

          {/* Quick Slider */}
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={currentPctValue}
            onChange={(e) => setPercentage(e.target.value)}
            style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer', marginTop: '0.25rem' }}
          />

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => handleQuickAdd(1)} className="mode-btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>+1%</button>
            <button onClick={() => handleQuickAdd(5)} className="mode-btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>+5%</button>
            <button onClick={() => handleQuickAdd(10)} className="mode-btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>+10%</button>
            <button onClick={() => handleQuickSet(25)} className="mode-btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>25%</button>
            <button onClick={() => handleQuickSet(50)} className="mode-btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>50%</button>
            <button onClick={() => handleQuickSet(75)} className="mode-btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>75%</button>
            <button onClick={() => handleQuickSet(100)} className="mode-btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>100%</button>
          </div>

          {/* Hero Result Display */}
          <div className="result-hero" style={{ marginTop: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Physical Page Equivalent
            </div>
            <div className="result-number">Page {computedPage}</div>
            <div className="result-subtitle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>out of <strong style={{ color: 'var(--text-main)' }}>{totalPages}</strong> total ({currentPctValue}% finished)</span>
              <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <BookOpen size={12} /> {pagesRemaining} pages left
              </span>
            </div>
            <div className="progress-container">
              <div className="progress-fill" style={{ width: `${currentPctValue}%` }}></div>
            </div>

            {/* Pace estimator (shows only when a sprint pace is on record) */}
            {lastPace !== null && pagesRemaining > 0 && (
              <div style={{ marginTop: '0.65rem', fontSize: '0.775rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                <TrendingUp size={13} color="var(--accent-primary)" />
                At your last sprint pace ({lastPace} p/hr) — ~{estimatedHours} hrs to finish
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODE: Page → % ──────────────────────────────────────────────── */}
      {lookupMode === 'page' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="input-group">
            <div className="input-label">
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Physical Page Number
              </span>
              <span className="mono-font" style={{ color: '#38BDF8', fontWeight: 700, fontSize: '1.1rem' }}>
                of {totalPages}
              </span>
            </div>
            <div className="input-wrapper">
              <Hash className="input-icon" size={20} color="var(--accent-primary)" />
              <input
                type="number"
                step="1"
                min="1"
                max={totalPages}
                className="custom-input mono-font"
                style={{ fontSize: '1.3rem', fontWeight: 700 }}
                placeholder={`e.g. ${Math.floor(totalPages / 2)}`}
                value={pageInput}
                onChange={handlePageInputChange}
                onKeyDown={handlePageKeyDown}
                autoFocus
              />
            </div>
          </div>

          {/* Hero Result for reverse mode */}
          <div className="result-hero" style={{ marginTop: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              E-Reader Percentage
            </div>
            <div className="result-number">{reversePct}%</div>
            <div className="result-subtitle">
              {pageInput
                ? <>Page <strong style={{ color: 'var(--text-main)' }}>{pageInputNum}</strong> = {reversePct}% through the book</>
                : <span style={{ color: 'var(--text-dim)' }}>Enter a page number above</span>
              }
            </div>
            {pageInput && (
              <div className="progress-container">
                <div className="progress-fill" style={{ width: `${reversePct}%` }}></div>
              </div>
            )}

            {/* Pace estimator for page mode */}
            {lastPace !== null && pageInput && Math.max(0, totalPages - pageInputNum) > 0 && (
              <div style={{ marginTop: '0.65rem', fontSize: '0.775rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                <TrendingUp size={13} color="var(--accent-primary)" />
                At your last sprint pace ({lastPace} p/hr) — ~{estimatedHours} hrs to finish
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bookverse Command Box (shared for both modes) ─────────────────── */}
      <div style={{ marginTop: lookupMode === 'page' ? '0' : '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            1-Click Bookverse Command:
          </span>
          {lookupMode === 'pct' && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Press Enter to copy</span>
          )}
        </div>

        <div className="discord-box">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem', fontWeight: 600 }}>
              Bookverse Sprint Command:
            </div>
            <span className="discord-code">{activeCommand}</span>
          </div>
          <button
            className="btn-copy"
            onClick={() => handleCopy(activeCommand)}
            disabled={lookupMode === 'page' && !pageInput}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Command'}
          </button>
        </div>
      </div>

      {/* Copied Command History Log */}
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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>pg {item.page}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Quick-Copy Footer */}
      <div className="mobile-quick-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--accent-cyan)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {lookupMode === 'pct' ? `${currentPctValue}% (${pagesRemaining} left)` : `${reversePct}%`}
            </div>
            <div className="mono-font" style={{ fontWeight: 800, fontSize: '1.05rem', color: 'white' }}>
              {lookupMode === 'pct' ? `Page ${computedPage}` : `Page ${pageInputNum || '—'}`}
            </div>
          </div>
        </div>
        <button className="btn-copy" onClick={() => handleCopy(activeCommand)} disabled={lookupMode === 'page' && !pageInput}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy /sprint'}
        </button>
      </div>
    </div>
  );
}
