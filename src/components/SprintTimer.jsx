import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, Award, Zap, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculatePageFromPercentage, calculateSprintStats, formatDiscordBotCommand } from '../utils/converter';

export default function SprintTimer({ currentBook, botPreset, onCopyToast }) {
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isRunning, setIsRunning] = useState(false);
  
  const [startPct, setStartPct] = useState('0');
  const [endPct, setEndPct] = useState('0');
  const [sprintFinished, setSprintFinished] = useState(false);

  const [copied, setCopied] = useState(false);

  const totalPages = currentBook ? currentBook.totalPages : 350;

  // Handle timer countdown ticks
  useEffect(() => {
    let timerId;
    if (isRunning && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      setSprintFinished(true);
      
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log(e);
      }
    }

    return () => clearInterval(timerId);
  }, [isRunning, timeLeft]);

  const handleSetPresetDuration = (mins) => {
    setDurationMinutes(mins);
    setTimeLeft(mins * 60);
    setIsRunning(false);
    setSprintFinished(false);
  };

  const handleStart = () => {
    if (timeLeft <= 0) setTimeLeft(durationMinutes * 60);
    setIsRunning(true);
    setSprintFinished(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durationMinutes * 60);
    setSprintFinished(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const stats = calculateSprintStats(startPct, endPct, totalPages, durationMinutes);
  const endCommand = formatDiscordBotCommand(botPreset, stats.endPage, 'end');

  const handleCopyEnd = () => {
    navigator.clipboard.writeText(endCommand);
    setCopied(true);
    onCopyToast(`Copied Discord Update Command: ${endCommand}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Timer size={20} color="var(--accent-pink)" />
          Live Reading Sprint Timer
        </h3>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[10, 15, 20, 25, 30].map((m) => (
            <button
              key={m}
              onClick={() => handleSetPresetDuration(m)}
              className={`mode-btn ${durationMinutes === m ? 'active' : ''}`}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      {/* Timer Clock Display */}
      <div style={{ textAlign: 'center', margin: '1rem 0 1.5rem 0', background: 'rgba(10, 14, 23, 0.6)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <div className="mono-font" style={{ fontSize: '4.5rem', fontWeight: 800, color: isRunning ? '#38BDF8' : 'var(--text-main)', letterSpacing: '2px', lineHeight: 1 }}>
          {formatTime(timeLeft)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
          {!isRunning ? (
            <button onClick={handleStart} className="btn-primary" style={{ padding: '0.7rem 1.75rem' }}>
              <Play size={18} fill="currentColor" /> Start Sprint
            </button>
          ) : (
            <button onClick={handlePause} className="btn-secondary" style={{ padding: '0.7rem 1.75rem', borderColor: '#F59E0B', color: '#F59E0B' }}>
              <Pause size={18} fill="currentColor" /> Pause
            </button>
          )}
          <button onClick={handleReset} className="btn-secondary" style={{ padding: '0.7rem' }}>
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Sprint Percentage Inputs */}
      <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Sprint Start Percentage (%)</label>
          <input
            type="number"
            step="0.1"
            className="custom-input no-icon mono-font"
            placeholder="e.g. 10.0"
            value={startPct}
            onChange={(e) => setStartPct(e.target.value)}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Starting Physical Page: <strong style={{ color: 'var(--text-main)' }}>{calculatePageFromPercentage(startPct, totalPages)}</strong>
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label" style={{ color: '#34D399' }}>Sprint End Percentage (%)</label>
          <input
            type="number"
            step="0.1"
            className="custom-input no-icon mono-font"
            placeholder="e.g. 18.5"
            value={endPct}
            onChange={(e) => setEndPct(e.target.value)}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Ending Physical Page: <strong style={{ color: 'var(--text-main)' }}>{stats.endPage}</strong>
          </div>
        </div>
      </div>

      {/* Sprint Results Summary */}
      {(parseFloat(endPct) > 0 || sprintFinished) && (
        <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', color: '#34D399', marginBottom: '0.75rem' }}>
            <Award size={18} /> Sprint Achievement Summary
          </div>

          <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pages Read</div>
              <div className="mono-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>
                +{stats.pagesRead} <span style={{ fontSize: '0.85rem' }}>pages</span>
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reading Velocity</div>
              <div className="mono-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38BDF8' }}>
                {stats.pagesPerHour} <span style={{ fontSize: '0.85rem' }}>p/hr</span>
              </div>
            </div>
          </div>

          {/* Quick Copy Command for Bot */}
          <div className="discord-box" style={{ margin: 0 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Discord Bot Command</div>
              <span className="discord-code">{endCommand}</span>
            </div>
            <button onClick={handleCopyEnd} className="btn-copy">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Result'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
