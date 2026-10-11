import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@paper_jar_custom_cards_v1';

export const CUSTOM_TYPES = ['questions', 'crazy_questions', 'challenges'];

// In-memory copy so the deck registry can read it synchronously.
let cache = [];

export const loadCustomCards = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? parsed.filter((c) => c && c.text && CUSTOM_TYPES.includes(c.type)) : [];
  } catch (e) {
    cache = [];
  }
  return cache;
};

export const saveCustomCards = async (cards) => {
  cache = cards;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards)).catch(() => {});
  return cache;
};

export const getCustomCards = () => cache;

/** Custom cards in the regular dataset shape (one topic); the text is shown in every language. */
export const getCustomDataset = () => {
  const topic = { topic: { cs: 'Vlastní karty', en: 'Your cards' } };
  CUSTOM_TYPES.forEach((type) => {
    topic[type] = cache
      .filter((c) => c.type === type)
      .map((c) => ({ cs: c.text, en: c.text }));
  });
  return [topic];
};
