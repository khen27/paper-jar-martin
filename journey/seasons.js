// Season registry + fake one-time prices for the next-generation journey.
// Purchases here are previews only: they set flags on the journey save,
// never `premiumUnlocked`, and never charge anything.

import { justUsSeason } from './justUs';
import { stayCloseSeason } from './stayClose';
import { stageById } from './stages';

export const SEASONS = {
  justUs: justUsSeason,
  stayClose: stayCloseSeason,
};

export const SEASON_ORDER = ['justUs', 'stayClose'];

/** Stage → first season. */
export const seasonForStage = (stage) =>
  stage === 'living' || stage === 'married' ? 'stayClose' : 'justUs';

/** The season to offer after finishing `currentId` (first other season, in order). */
export const nextSeasonId = (currentId) => SEASON_ORDER.find((id) => id !== currentId) || null;

export const SEASON_PRICE = { cs: '149 Kč', en: '€5.99' };
export const ALL_SEASONS_PRICE = { cs: '399 Kč', en: '€14.99' };

export const seasonPriceLabel = (language) => (language === 'cs' ? SEASON_PRICE.cs : SEASON_PRICE.en);
export const allSeasonsPriceLabel = (language) =>
  language === 'cs' ? ALL_SEASONS_PRICE.cs : ALL_SEASONS_PRICE.en;

/** Pick a localized string from a { cs, en } pair. */
export const loc = (pair, language) => (pair ? pair[language] || pair.en || pair.cs : '');

/**
 * Resolve the night for a season at `index`, applying the stage opener for
 * night 0 so each stage gets its own first card. Falls back to the season's
 * own night when the stage has no opener.
 */
export const getNight = (seasonId, stageId, index) => {
  const season = SEASONS[seasonId];
  if (!season) return null;
  if (index === 0) {
    const stage = stageById(stageId);
    if (stage?.opener) return { phase: stage.opener.phase || 'play', ...stage.opener };
  }
  return season.nights[index];
};

/**
 * Tonight's two choices: the main card plus an optional alt (funny vs soft).
 * Playing either one completes the night. Coming-soon nights have no alt.
 */
export const getNightChoices = (seasonId, stageId, index) => {
  const night = getNight(seasonId, stageId, index);
  if (!night) return [];
  const { alt, ...main } = night;
  const cards = [{ ...main, slot: 'main' }];
  if (alt && !night.comingSoon) {
    cards.push({ ...alt, phase: alt.phase || main.phase, slot: 'alt' });
  }
  return cards;
};

// Card-band colors per phase — mirrors the classic playing-card band so the
// journey reads as the same product, with a warm→rose→gold emotional gradient.
export const PHASE_BANDS = {
  play: { colors: ['#FF9F1C', '#FF4E50'], labelCs: 'Lehce', labelEn: 'Light' },
  life: { colors: ['#8F6BFF', '#5B3FD9'], labelCs: 'Všední život', labelEn: 'Everyday' },
  closer: { colors: ['#FF5E8A', '#E0245E'], labelCs: 'Blíž', labelEn: 'Closer' },
  recap: { colors: ['#FFC94D', '#F28B1D'], labelCs: 'Ohlédnutí', labelEn: 'Looking back' },
};

export const bandForPhase = (phase, language) => {
  const b = PHASE_BANDS[phase] || PHASE_BANDS.play;
  return { colors: b.colors, label: language === 'cs' ? b.labelCs : b.labelEn };
};
