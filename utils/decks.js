import { dataset } from '../full_dataset';
import { brnoDataset } from '../brno_dataset';
import { bonusDataset } from '../bonus_dataset';
import { adultDataset } from '../adult_dataset';
import { workoutDataset } from '../workout_dataset';
import { officeDataset } from '../office_dataset';
import { partyDataset } from '../party_dataset';
import { partnerDrinksDataset } from '../partner_drinks_dataset';
import { friendsDrinksDataset } from '../friends_drinks_dataset';
import { partyDrinksDataset } from '../party_drinks_dataset';
import { adultDrinksDataset } from '../adult_drinks_dataset';
import { workoutIntenseDataset } from '../workout_intense_dataset';
import { brnoDrinksDataset } from '../brno_drinks_dataset';
import { officeHuddleDataset } from '../office_huddle_dataset';
import { halloweenDataset } from '../halloween_dataset';
import { halloweenDrinksDataset } from '../halloween_drinks_dataset';
import { autumnDataset } from '../autumn_dataset';
import { christmasDataset } from '../christmas_dataset';
import { christmasDrinksDataset } from '../christmas_drinks_dataset';
import { getCustomDataset } from './customCards';

// Shuffle-bag keys must stay stable so saved no-repeat progress survives app updates.
const DECKS = {
  partner: {
    classic: { key: 'main', data: dataset },
    drinks: { key: 'partner_drinks', data: partnerDrinksDataset },
  },
  friend: {
    classic: { key: 'main', data: dataset },
    drinks: { key: 'friend_drinks', data: friendsDrinksDataset },
  },
  party: {
    classic: { key: 'party', data: partyDataset },
    drinks: { key: 'party_drinks', data: partyDrinksDataset },
  },
  adult: {
    classic: { key: 'adult', data: adultDataset },
    drinks: { key: 'adult_drinks', data: adultDrinksDataset },
  },
  workout: {
    classic: { key: 'workout', data: workoutDataset },
    intense: { key: 'workout_intense', data: workoutIntenseDataset },
  },
  brnoPrague: {
    classic: { key: 'brno', data: brnoDataset },
    drinks: { key: 'brno_drinks', data: brnoDrinksDataset },
  },
  office: {
    classic: { key: 'office', data: officeDataset },
    huddle: { key: 'office_huddle', data: officeHuddleDataset },
  },
  homePack: {
    classic: { key: 'homePack', data: bonusDataset },
  },
  halloween: {
    classic: { key: 'halloween', data: halloweenDataset },
    drinks: { key: 'halloween_drinks', data: halloweenDrinksDataset },
  },
  autumn: {
    classic: { key: 'autumn', data: autumnDataset },
  },
  christmas: {
    classic: { key: 'christmas', data: christmasDataset },
    drinks: { key: 'christmas_drinks', data: christmasDrinksDataset },
  },
  custom: {
    classic: {
      key: 'custom',
      get data() {
        return getCustomDataset();
      },
    },
  },
};

export const hasDrinksVariant = (mode) => !!DECKS[mode]?.drinks;

export const getDeck = (mode, variant = 'classic') => {
  const entry = DECKS[mode] || DECKS.partner;
  const deck = (variant && variant !== 'classic' && entry[variant]) || entry.classic;
  return { key: deck.key, data: deck.data };
};

export const isKnownMode = (mode) => !!DECKS[mode];

export const variantsFor = (mode) => Object.keys(DECKS[mode] || { classic: true });
