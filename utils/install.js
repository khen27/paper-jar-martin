import { Platform } from 'react-native';

/**
 * True when running as an "installed" app:
 * - any native build (Expo Go / dev client / store build), or
 * - a web app launched from the home-screen icon (standalone display mode).
 */
export const isInstalledApp = () => {
  if (Platform.OS !== 'web') return true;
  if (typeof window === 'undefined') return false;
  try {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
    if (window.navigator && window.navigator.standalone === true) return true; // iOS Safari
  } catch (e) {
    // ignore
  }
  return false;
};

/** Best-effort platform hint for install instructions on web. */
export const getWebPlatform = () => {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
};

export default { isInstalledApp, getWebPlatform };
