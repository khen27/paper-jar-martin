import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@paper_jar_streak_v1';

const dayKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
};

/**
 * Record a play for today. Returns { streak, lastPlayed, freezeAvailable }.
 */
export async function recordPlay() {
  const today = dayKey();
  let state = { streak: 0, lastPlayed: null, freezeAvailable: true, freezeUsedOn: null };
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) state = { ...state, ...JSON.parse(raw) };
  } catch (e) {
    // ignore
  }

  if (state.lastPlayed === today) {
    return state;
  }

  if (state.lastPlayed === yesterdayKey()) {
    state.streak = (state.streak || 0) + 1;
  } else if (state.lastPlayed) {
    // Missed a day — consume freeze once per week-ish, else reset
    if (state.freezeAvailable) {
      state.freezeAvailable = false;
      state.freezeUsedOn = today;
      state.streak = (state.streak || 0) + 1;
    } else {
      state.streak = 1;
    }
  } else {
    state.streak = 1;
  }

  // Reset freeze weekly (simple: if freeze used more than 7 days ago)
  if (state.freezeUsedOn) {
    const used = new Date(state.freezeUsedOn);
    const ageDays = (Date.now() - used.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays >= 7) {
      state.freezeAvailable = true;
      state.freezeUsedOn = null;
    }
  }

  state.lastPlayed = today;
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
  return state;
}

export async function getStreak() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { streak: 0, lastPlayed: null, freezeAvailable: true };
    return JSON.parse(raw);
  } catch (e) {
    return { streak: 0, lastPlayed: null, freezeAvailable: true };
  }
}

export default { recordPlay, getStreak };
