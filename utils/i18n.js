import { Platform } from 'react-native';
const datasetLocales = require('../content/locales');

export const SUPPORTED_LANGS = ['cs','en','zh','hi','es','fr','pt','ru','ur','bn'];

export const isTaggedPlaceholder = (s) =>
  typeof s === 'string' && /^\s*\[[A-Z]{2}\]/.test(s);

export const stripTags = (s) =>
  (s || '')
    .replace(/^\s*\[[A-Z]{2}\]\s*/, '')
    .replace(/\s*\(\d+\)[\?\.\!]?$/, '')
    .trim();

const normalizeBase = (s) =>
  (s || '')
    .replace(/^\s*\[[A-Z]{2}\]\s*/, '')
    .replace(/\s*\(\d+\)/g, '')
    .replace(/\s+([\?\.!:,;])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

export function getLocalizedText(obj, lang) {
  if (!obj || typeof obj !== 'object') return '';
  const primary = obj[lang];
  if (primary && !isTaggedPlaceholder(primary)) return stripTags(primary);

  const en = obj.en;
  if (en && !isTaggedPlaceholder(en)) return stripTags(en);

  const cs = obj.cs;
  if (cs) {
    // Try overlay for target lang when only cs is real
    const base = stripTags(cs);
    const norm = normalizeBase(cs);
    const overlay = datasetLocales?.[lang]?.[base] || datasetLocales?.[lang]?.[norm];
    if (overlay && overlay.trim()) return overlay.trim();
    return base;
  }

  const firstReal = Object.values(obj).find((v) => v && !isTaggedPlaceholder(v));
  return stripTags(firstReal || Object.values(obj)[0] || '');
}

// Strict i18n: require the exact language to be present with non-empty string
export function requireText(obj, lang) {
  const value = obj?.[lang];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`[i18n] Missing translation for "${lang}" in: ${JSON.stringify(obj)}`);
  }
  return value.trim();
}

export default {
  SUPPORTED_LANGS,
  isTaggedPlaceholder,
  stripTags,
  getLocalizedText,
  requireText,
};


