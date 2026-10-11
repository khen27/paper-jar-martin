// Freemium rules (Milestone B5). Real purchases will come from RevenueCat (native)
// and Paddle/Stripe (web); until then `premiumUnlocked` is a simulated purchase and
// nothing is gated unless the `paywallPreview` test setting is on.

// While false, every plan is a free trial: nobody is charged until payments launch.
export const PAYMENTS_LIVE = false;

export const PREMIUM_MODES = ['adult', 'workout', 'office'];
export const AD_UNLOCK_DECK_MS = 60 * 60 * 1000;
export const AD_UNLOCK_SKIN_MS = 24 * 60 * 60 * 1000;
export const FREE_SAMPLE_CARDS = 3;
export const FREE_FAVORITES = 5;
export const FREE_CUSTOM_CARDS = 10;

export const hasPremium = (settings) => !!settings?.premiumUnlocked;

const adUnlocked = (settings, key) => (settings?.adUnlocks?.[key] || 0) > Date.now();

export const deckAdKey = (mode, variant) => `deck:${mode}:${variant}`;
export const skinAdKey = (themeId) => `skin:${themeId}`;

/** Remaining ms of an ad unlock, 0 if none. */
export const adUnlockRemaining = (settings, key) => Math.max(0, (settings?.adUnlocks?.[key] || 0) - Date.now());

/** Patch for updateSettings() that grants an ad reward and drops expired ones. */
export const grantAdUnlock = (settings, key, ms) => {
  const now = Date.now();
  const kept = Object.fromEntries(Object.entries(settings?.adUnlocks || {}).filter(([, exp]) => exp > now));
  return { adUnlocks: { ...kept, [key]: now + ms } };
};

export const isSkinUnlocked = (theme, settings) =>
  !theme?.premium || hasPremium(settings) || adUnlocked(settings, skinAdKey(theme.id));

const gatingOn = (settings) => !!settings?.paywallPreview && !hasPremium(settings);

/** True when this deck is premium for the current user (they still get a free sample). */
export const isDeckLocked = (mode, variant, settings) => {
  if (!gatingOn(settings)) return false;
  if (adUnlocked(settings, deckAdKey(mode, variant))) return false;
  return PREMIUM_MODES.includes(mode) || variant === 'drinks';
};

/** Variants of a mode that show a crown in the style picker. */
export const lockedVariants = (mode, settings) =>
  ['classic', 'drinks'].filter((v) => isDeckLocked(mode, v, settings));

export const isModeBadgedPremium = (mode, settings) =>
  gatingOn(settings) && PREMIUM_MODES.includes(mode);

export const favoritesLimit = (settings) => (hasPremium(settings) ? Infinity : FREE_FAVORITES);

export const customCardsLimit = (settings) =>
  gatingOn(settings) ? FREE_CUSTOM_CARDS : Infinity;

export const PLANS = [
  { id: 'monthly', price: '49 Kč', priceEn: '€1.99', periodKey: 'perMonth', periodFallback: '/month' },
  { id: 'yearly', price: '249 Kč', priceEn: '€9.99', periodKey: 'perYear', periodFallback: '/year', trialDays: 3, popular: true },
  { id: 'lifetime', price: '449 Kč', priceEn: '€17.99', periodKey: 'oneTime', periodFallback: 'one-time' },
];
