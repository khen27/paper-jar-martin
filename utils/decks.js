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
import { workoutDrinksDataset } from '../workout_drinks_dataset';
import { brnoDrinksDataset } from '../brno_drinks_dataset';
import { officeDrinksDataset } from '../office_drinks_dataset';
import { getCustomDataset } from './customCards';

// Every game mode with a Classic and a Drinks deck. Shuffle-bag keys must stay stable
// so saved no-repeat progress survives app updates.
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
    drinks: { key: 'workout_drinks', data: workoutDrinksDataset },
  },
  brnoPrague: {
    classic: { key: 'brno', data: brnoDataset },
    drinks: { key: 'brno_drinks', data: brnoDrinksDataset },
  },
  office: {
    classic: { key: 'office', data: officeDataset },
    drinks: { key: 'office_drinks', data: officeDrinksDataset },
  },
  homePack: {
    classic: { key: 'homePack', data: bonusDataset },
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
  const deck = (variant === 'drinks' && entry.drinks) || entry.classic;
  return { key: deck.key, data: deck.data };
};

export const isKnownMode = (mode) => !!DECKS[mode];
