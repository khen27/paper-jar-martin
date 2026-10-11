/**
 * Lightweight analytics shim (B3).
 * Logs in __DEV__; buffers events locally so we can flush to PostHog once keys exist.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@paper_jar_analytics_queue_v1';
const MAX_QUEUE = 200;

export async function track(event, properties = {}) {
  const payload = {
    event,
    properties,
    ts: new Date().toISOString(),
  };

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('📊', payload.event, payload.properties);
  }

  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push(payload);
    while (queue.length > MAX_QUEUE) queue.shift();
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    // ignore storage failures
  }

  // Hook for PostHog / Amplitude later:
  // if (globalThis.__POSTHOG__) globalThis.__POSTHOG__.capture(event, properties);
}

export async function getQueuedEvents() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export default { track, getQueuedEvents };
