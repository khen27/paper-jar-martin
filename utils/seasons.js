// Seasonal packs rotate automatically by date. Windows are [month, day] inclusive and may wrap the new year.
export const SEASONAL_PACKS = [
  { mode: 'halloween', from: [10, 1], to: [11, 5] },
  { mode: 'autumn', from: [9, 15], to: [11, 30] },
  { mode: 'christmas', from: [11, 20], to: [1, 6] },
];

const dayOfYear = (m, d) => m * 100 + d;

const inWindow = (date, { from, to }) => {
  const today = dayOfYear(date.getMonth() + 1, date.getDate());
  const a = dayOfYear(...from);
  const b = dayOfYear(...to);
  return a <= b ? today >= a && today <= b : today >= a || today <= b;
};

/** Days until the pack opens (0 if open now). */
const daysUntil = (date, { from }) => {
  const year = date.getFullYear();
  let open = new Date(year, from[0] - 1, from[1]);
  if (open < new Date(year, date.getMonth(), date.getDate())) open = new Date(year + 1, from[0] - 1, from[1]);
  return Math.round((open - new Date(year, date.getMonth(), date.getDate())) / 86400000);
};

/**
 * Seasonal tiles for Home: open packs, plus packs opening within 45 days as "coming soon".
 * `previewAll` (testing) opens everything.
 */
export const getSeasonalTiles = (date = new Date(), previewAll = false) =>
  SEASONAL_PACKS.map((p) => {
    const open = previewAll || inWindow(date, p);
    return { mode: p.mode, open, opensOn: p.from, days: open ? 0 : daysUntil(date, p) };
  }).filter((p) => p.open || p.days <= 45);

export const isSeasonOpen = (mode, date = new Date(), previewAll = false) => {
  const p = SEASONAL_PACKS.find((s) => s.mode === mode);
  return !p || previewAll || inWindow(date, p);
};
