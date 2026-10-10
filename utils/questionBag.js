import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Shuffle-bag question picker: every question in a deck is shown exactly once
 * before any repeats. Order + position are persisted per deck, so progress
 * survives app restarts.
 */

const KEY_PREFIX = '@paper_jar_bag_v1:';
const bags = {}; // in-memory: { [deckKey]: { order: number[], pos: number } }

const shuffle = (n) => {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

/** Flatten a dataset into [{topicIndex, type, questionIndex}] refs. */
export const flattenDataset = (dataset) => {
  const refs = [];
  dataset.forEach((topic, topicIndex) => {
    ['questions', 'crazy_questions', 'challenges'].forEach((type) => {
      if (Array.isArray(topic[type])) {
        topic[type].forEach((_, questionIndex) => {
          refs.push({ topicIndex, type, questionIndex });
        });
      }
    });
  });
  return refs;
};

/** Load persisted bag state for a deck (call once before first nextQuestion). */
export const initBag = async (deckKey, totalCount) => {
  if (bags[deckKey] && bags[deckKey].order.length === totalCount) return;
  try {
    const raw = await AsyncStorage.getItem(KEY_PREFIX + deckKey);
    if (raw) {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved.order) && saved.order.length === totalCount && saved.pos >= 0) {
        bags[deckKey] = saved;
        return;
      }
    }
  } catch (e) {
    // Corrupt state: fall through to a fresh shuffle
  }
  bags[deckKey] = { order: shuffle(totalCount), pos: 0 };
  persist(deckKey);
};

const persist = (deckKey) => {
  AsyncStorage.setItem(KEY_PREFIX + deckKey, JSON.stringify(bags[deckKey])).catch(() => {});
};

/** Synchronously get the next question index for a deck. Reshuffles when exhausted. */
export const nextIndex = (deckKey, totalCount) => {
  let bag = bags[deckKey];
  if (!bag || bag.order.length !== totalCount) {
    bag = bags[deckKey] = { order: shuffle(totalCount), pos: 0 };
  }
  if (bag.pos >= bag.order.length) {
    // Deck exhausted: reshuffle, but avoid immediately repeating the last question
    const last = bag.order[bag.order.length - 1];
    let order = shuffle(totalCount);
    if (totalCount > 1 && order[0] === last) {
      [order[0], order[totalCount - 1]] = [order[totalCount - 1], order[0]];
    }
    bag.order = order;
    bag.pos = 0;
  }
  const idx = bag.order[bag.pos];
  bag.pos += 1;
  persist(deckKey);
  return idx;
};

export default { flattenDataset, initBag, nextIndex };
