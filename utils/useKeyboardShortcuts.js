import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

/**
 * Keyboard / TV-remote shortcuts on web. `handlers` maps a key name
 * (e.key, e.g. ' ', 'Enter', 'ArrowRight', 'h', 'Escape') to a callback.
 * Ignored while typing in an input or when `enabled` is false.
 */
export const useKeyboardShortcuts = (handlers, enabled = true) => {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !enabled) return undefined;
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const onButton = tag === 'BUTTON' || (e.target.getAttribute && e.target.getAttribute('role') === 'button');
      if (onButton && (key === ' ' || key === 'Enter')) return;
      const fn = ref.current[key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
};

export default useKeyboardShortcuts;
