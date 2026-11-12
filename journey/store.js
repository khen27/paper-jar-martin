// Local save for the next-generation journey. Lives in its own AsyncStorage key,
// completely separate from classic settings, streaks, favorites and shuffle bags.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEASONS } from './seasons';

const KEY = '@paper_jar_journey_v1';

export const DEFAULT_JOURNEY = {
  stage: null, // 'justMet' | 'dating' | 'living' | 'married'
  seasonId: null, // current season being played
  nameA: '',
  nameB: '',
  sawHowTo: false,
  answers: {}, // { [seasonId]: { [nightIndex]: NightResult } }
  freezes: 2, // "life happened" nights per season
  dateJar: 0, // euros the couple owes their own date jar
  streak: 0,
  lastPlayedDay: null, // 'YYYY-MM-DD' of the last completed night
  ownedSeasons: [], // fake one-time purchases, e.g. ['justUs']
  ownsAll: false, // fake "all seasons" purchase
  completedSeasons: [],
  betweenIndex: 0, // next between-seasons card
  betweenAnswers: [],
  interestSent: false,
};

export const todayKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
};

export async function loadJourney() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_JOURNEY };
    return { ...DEFAULT_JOURNEY, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_JOURNEY };
  }
}

export async function saveJourney(state) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    // local preview build: ignore storage failures
  }
  return state;
}

export async function patchJourney(patch) {
  const state = await loadJourney();
  return saveJourney({ ...state, ...patch });
}

export async function resetJourney() {
  return saveJourney({ ...DEFAULT_JOURNEY });
}

/** Clear only the fake purchases, keep progress. */
export async function resetJourneyPurchases() {
  return patchJourney({ ownedSeasons: [], ownsAll: false });
}

export const displayName = (state, who, fallbackA = 'A', fallbackB = 'B') => {
  if (who === 'a') return (state?.nameA || '').trim() || fallbackA;
  return (state?.nameB || '').trim() || fallbackB;
};

// ---- derived helpers ----

/** Number of completed nights in a season. */
export const nightsDone = (state, seasonId) =>
  Object.keys(state.answers?.[seasonId] || {}).length;

/** 0-based index of the next night to play, or null when the season is finished. */
export const nextNightIndex = (state, seasonId) => {
  const season = SEASONS[seasonId];
  if (!season) return null;
  const done = nightsDone(state, seasonId);
  return done >= season.nights.length ? null : done;
};

export const ownsSeason = (state, seasonId) =>
  !!state.ownsAll || (state.ownedSeasons || []).includes(seasonId);

/** Is this night behind the one-time purchase for this user? */
export const nightLocked = (state, seasonId, nightIndex) => {
  const season = SEASONS[seasonId];
  if (!season) return true;
  if (nightIndex < season.freeNights) return false;
  return !ownsSeason(state, seasonId);
};

/** Has tonight's card already been played today? */
export const playedToday = (state) => state.lastPlayedDay === todayKey();

/**
 * Record a completed season night.
 * `result` is a NightResult: { type, slot, qText, aText, bText, aPick, bPick, match, same, challengeStatus }
 */
export function completeNight(state, seasonId, nightIndex, result = {}) {
  const seasonAnswers = { ...(state.answers?.[seasonId] || {}) };
  seasonAnswers[nightIndex] = { ...result, at: new Date().toISOString() };
  const answers = { ...state.answers, [seasonId]: seasonAnswers };

  const today = todayKey();
  let streak = state.streak || 0;
  if (state.lastPlayedDay === yesterdayKey()) streak += 1;
  else if (state.lastPlayedDay !== today) streak = 1;

  const season = SEASONS[seasonId];
  const finished = Object.keys(seasonAnswers).length >= season.nights.length;
  const completedSeasons =
    finished && !(state.completedSeasons || []).includes(seasonId)
      ? [...(state.completedSeasons || []), seasonId]
      : state.completedSeasons || [];

  return { ...state, answers, streak, lastPlayedDay: today, completedSeasons };
}

/** Thumb feedback (good | flat | toomuch) — kept for old saves, UI no longer asks. */
export function rateNight(state, seasonId, nightIndex, thumb) {
  const night = state.answers?.[seasonId]?.[nightIndex];
  if (!night) return state;
  return {
    ...state,
    answers: {
      ...state.answers,
      [seasonId]: {
        ...state.answers[seasonId],
        [nightIndex]: { ...night, thumb },
      },
    },
  };
}

/** "Not tonight": spend a freeze if one is left, otherwise €2 into the couple's date jar. */
export function missNight(state) {
  if ((state.freezes || 0) > 0) {
    return { ...state, freezes: state.freezes - 1, lastPlayedDay: todayKey(), usedFreeze: true };
  }
  return { ...state, dateJar: (state.dateJar || 0) + 2, lastPlayedDay: todayKey(), usedFreeze: false };
}

/** Testing: fill nights 1–6 so tonight is night 7, playable right away. Mix of types for recap. */
export async function jumpToNightSeven() {
  const state = await loadJourney();
  const seasonId = state.seasonId || 'justUs';
  const season = SEASONS[seasonId];
  const seasonAnswers = {};
  const count = Math.min(6, season.nights.length - 1);
  const samples = [
    { type: 'guess', match: true, aText: 'Food / coffee', bText: 'Food / coffee' },
    { type: 'do', challengeStatus: 'done', aText: 'Done', bText: 'Done' },
    { type: 'pick', same: true, aText: 'A laugh', bText: 'A laugh' },
    { type: 'guess', match: false, aText: 'Quiet', bText: 'A message' },
    { type: 'pick', same: false, aText: 'Sleep in', bText: 'Walk' },
    { type: 'talk', a: 'The hiking story', b: 'The one about the train' },
  ];
  for (let i = 0; i < count; i++) {
    const s = samples[i % samples.length];
    seasonAnswers[i] = {
      ...s,
      slot: 'main',
      qText: '(testing)',
      at: new Date().toISOString(),
    };
  }
  return saveJourney({
    ...state,
    stage: state.stage || 'dating',
    seasonId,
    nameA: state.nameA || 'Alex',
    nameB: state.nameB || 'Sam',
    sawHowTo: true,
    answers: { ...state.answers, [seasonId]: seasonAnswers },
    streak: count,
    lastPlayedDay: yesterdayKey(),
  });
}
