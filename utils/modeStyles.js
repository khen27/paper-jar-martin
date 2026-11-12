// Per-mode "how do you want to play" choices. Social modes keep Classic vs Drinks.
// Office and Workout get a second, non-alcohol style instead.

export const STYLE_CHIPS = {
  classic: [
    { icon: 'sparkles', labelKey: 'typeQuestion', label: 'Question' },
    { icon: 'dice', labelKey: 'typeWild', label: 'Wild card' },
    { icon: 'trophy', labelKey: 'typeDare', label: 'Dare' },
  ],
  drinks: [
    { icon: 'drinks', labelKey: 'typeAnswerOrDrink', label: 'Answer or drink' },
    { icon: 'cheers', labelKey: 'typeVote', label: 'Vote' },
    { icon: 'dice', labelKey: 'typeDoOrDrink', label: 'Do it or drink' },
  ],
  intense: [
    { icon: 'workout', labelKey: 'typeMove', label: 'Move' },
    { icon: 'dice', labelKey: 'typeWild', label: 'Wild card' },
    { icon: 'trophy', labelKey: 'typeDare', label: 'Dare' },
  ],
  huddle: [
    { icon: 'handshake', labelKey: 'typePitch', label: 'Pitch' },
    { icon: 'sparkles', labelKey: 'typeWild', label: 'Wild card' },
    { icon: 'trophy', labelKey: 'typeDare', label: 'Dare' },
  ],
};

const classicOpt = {
  id: 'classic',
  icon: 'classic',
  titleKey: 'classicTitle',
  title: 'Classic',
  descKey: 'classicDesc',
  desc: 'Talk, laugh and do funny challenges.',
  colors: ['#7C5CFF', '#4B32C3'],
  chips: STYLE_CHIPS.classic,
};

const drinksOpt = {
  id: 'drinks',
  icon: 'drinks',
  titleKey: 'drinksTitle',
  title: 'Drinks',
  descKey: 'drinksDesc',
  desc: 'Answer or drink. Vote together — the winner drinks.',
  colors: ['#FFB020', '#E86A00'],
  chips: STYLE_CHIPS.drinks,
  footer: true,
};

const intenseOpt = {
  id: 'intense',
  icon: 'workout',
  titleKey: 'intenseTitle',
  title: 'Intense',
  descKey: 'intenseDesc',
  desc: 'Harder moves. You set the pace. No alcohol.',
  colors: ['#2ED47A', '#0C9F8C'],
  chips: STYLE_CHIPS.intense,
};

const huddleOpt = {
  id: 'huddle',
  icon: 'handshake',
  titleKey: 'huddleTitle',
  title: 'Huddle',
  descKey: 'huddleDesc',
  desc: 'Fast team pitches and workshop games. Work-safe, no drinks.',
  colors: ['#5C7CFA', '#364FC7'],
  chips: STYLE_CHIPS.huddle,
};

export const getStyleOptions = (mode) => {
  if (mode === 'workout') return [classicOpt, intenseOpt];
  if (mode === 'office') return [classicOpt, huddleOpt];
  return null;
};

export const drinksModes = ['partner', 'friend', 'party', 'adult', 'brnoPrague', 'halloween', 'christmas'];

export const hasStyleChoice = (mode) =>
  drinksModes.includes(mode) || mode === 'workout' || mode === 'office';

export const styleOptionsFor = (mode) => {
  const special = getStyleOptions(mode);
  if (special) return special;
  if (drinksModes.includes(mode)) return [classicOpt, drinksOpt];
  return [classicOpt];
};

export const styleBadgeChips = (mode) => {
  if (!hasStyleChoice(mode)) return null;
  return styleOptionsFor(mode).map((o) => ({ icon: o.icon, titleKey: o.titleKey, title: o.title }));
};
