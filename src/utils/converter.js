/**
 * Conversion & Calculation Utilities for SprintBuddy (Bookverse Edition)
 */

export const calculatePageFromPercentage = (percentage, totalPages, roundingMode = 'floor') => {
  let pct = parseFloat(percentage);
  const total = parseInt(totalPages, 10);

  if (isNaN(pct) || isNaN(total) || total <= 0) return 0;

  // Clamp percentage between 0 and 100
  pct = Math.min(100, Math.max(0, pct));

  const rawPage = (pct / 100) * total;
  
  switch (roundingMode) {
    case 'round':
      return Math.min(total, Math.max(0, Math.round(rawPage)));
    case 'ceil':
      return Math.min(total, Math.max(0, Math.ceil(rawPage)));
    case 'floor':
    default:
      return Math.min(total, Math.max(0, Math.floor(rawPage)));
  }
};

export const formatBookverseCommand = (pageNumber) => {
  const page = Math.max(0, parseInt(pageNumber, 10) || 0);
  return `/sprint page ${page}`;
};

export const calculateSprintStats = (startPct, endPct, totalPages, durationMinutes) => {
  const startP = calculatePageFromPercentage(startPct, totalPages);
  const endP = calculatePageFromPercentage(endPct, totalPages);
  const pagesRead = Math.max(0, endP - startP);
  const duration = Math.max(1, parseInt(durationMinutes, 10) || 15);

  const pagesPerHour = duration > 0 ? ((pagesRead / duration) * 60).toFixed(1) : '0';
  const minutesPerPage = pagesRead > 0 ? (duration / pagesRead).toFixed(1) : '0';
  const pctGained = Math.max(0, parseFloat(endPct) - parseFloat(startPct)).toFixed(1);

  return {
    startPage: startP,
    endPage: endP,
    pagesRead,
    pagesPerHour,
    minutesPerPage,
    pctGained
  };
};

/**
 * Web Audio API Chime for Sprint Completion (Zero external asset dependencies)
 */
export const playSprintChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio chime
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.45);
    });
  } catch (e) {
    console.warn('Audio chime error:', e);
  }
};
