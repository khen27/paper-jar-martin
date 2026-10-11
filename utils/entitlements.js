// Freemium rules (Milestone B5). Real purchases will come from RevenueCat (native)
// and Paddle/Stripe (web); until then `premiumUnlocked` is a simulated purchase and
// nothing is gated unless the `paywallPreview` test setting is on.

export const PREMIUM_MODES = ['adult', 'workout', 'office'];
export const FREE_SAMPLE_CARDS = 3;
export const FREE_FAVORITES = 5;
export const FREE_CUSTOM_CARDS = 10;

export const hasPremium = (settings) => !!settings?.premiumUnlocked;

const gatingOn = (settings) => !!settings?.paywallPreview && !hasPremium(settings);

/** True when this deck is premium for the current user (they still get a free sample). */
export const isDeckLocked = (mode, variant, settings) => {
  if (!gatingOn(settings)) return false;
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
  { id: 'monthly', price: '99 Kč', priceEn: '€3.99', periodKey: 'perMonth', periodFallback: '/month' },
  { id: 'yearly', price: '499 Kč', priceEn: '€19.99', periodKey: 'perYear', periodFallback: '/year', trialDays: 3, popular: true },
  { id: 'lifetime', price: '899 Kč', priceEn: '€34.99', periodKey: 'oneTime', periodFallback: 'one-time' },
];
