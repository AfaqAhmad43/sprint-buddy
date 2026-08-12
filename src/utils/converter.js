/**
 * Conversion & Calculation Utilities for SprintBuddy
 */

export const calculatePageFromPercentage = (percentage, totalPages, roundingMode = 'floor') => {
  const pct = parseFloat(percentage);
  const total = parseInt(totalPages, 10);

  if (isNaN(pct) || isNaN(total) || total <= 0) return 0;

  const rawPage = (pct / 100) * total;
  
  switch (roundingMode) {
    case 'round':
      return Math.min(total, Math.max(1, Math.round(rawPage)));
    case 'ceil':
      return Math.min(total, Math.max(1, Math.ceil(rawPage)));
    case 'floor':
    default:
      return Math.min(total, Math.max(0, Math.floor(rawPage)));
  }
};

export const calculatePageFromLocation = (currentLoc, totalLoc, totalPages) => {
  const curr = parseFloat(currentLoc);
  const maxLoc = parseFloat(totalLoc);
  const total = parseInt(totalPages, 10);

  if (isNaN(curr) || isNaN(maxLoc) || isNaN(total) || maxLoc <= 0 || total <= 0) return 0;

  const pct = (curr / maxLoc) * 100;
  return calculatePageFromPercentage(pct, total);
};

export const calculatePageFromScreen = (currentScreen, totalScreens, totalPages) => {
  const curr = parseFloat(currentScreen);
  const maxSc = parseFloat(totalScreens);
  const total = parseInt(totalPages, 10);

  if (isNaN(curr) || isNaN(maxSc) || isNaN(total) || maxSc <= 0 || total <= 0) return 0;

  const pct = (curr / maxSc) * 100;
  return calculatePageFromPercentage(pct, total);
};

export const formatDiscordBotCommand = (preset, pageNumber, actionType = 'update', customTemplate = '') => {
  const page = parseInt(pageNumber, 10) || 0;

  switch (preset) {
    case 'bookverse':
      if (actionType === 'start') return `/sprint start page: ${page}`;
      if (actionType === 'end') return `/sprint update page: ${page}`;
      return `/sprint update page: ${page}`;

    case 'sprinty':
      if (actionType === 'start') return `!read ${page}`;
      if (actionType === 'end') return `!sprint end ${page}`;
      return `!read ${page}`;

    case 'bookish':
      if (actionType === 'start') return `.start ${page}`;
      if (actionType === 'end') return `.end ${page}`;
      return `.page ${page}`;

    case 'custom':
      if (!customTemplate) return `/sprint update page: ${page}`;
      return customTemplate.replace(/{page}/g, page);

    default:
      return `/sprint update page: ${page}`;
  }
};

export const calculateSprintStats = (startPct, endPct, totalPages, durationMinutes) => {
  const startP = calculatePageFromPercentage(startPct, totalPages);
  const endP = calculatePageFromPercentage(endPct, totalPages);
  const pagesRead = Math.max(0, endP - startP);
  const duration = parseInt(durationMinutes, 10) || 15;

  const pagesPerHour = duration > 0 ? ((pagesRead / duration) * 60).toFixed(1) : 0;
  const minutesPerPage = pagesRead > 0 ? (duration / pagesRead).toFixed(1) : 0;
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
