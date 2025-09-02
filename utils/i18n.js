import { Platform } from 'react-native';

export const SUPPORTED_LANGS = ['cs','en','zh','hi','es','fr','pt','ru','ur','bn'];

export const isTaggedPlaceholder = (s) =>
  typeof s === 'string' && /^\s*\[[A-Z]{2}\]/.test(s);

export const stripTags = (s) =>
  (s || '')
    .replace(/^\s*\[[A-Z]{2}\]\s*/, '')
    .replace(/\s*\(\d+\)[\?\.\!]?$/, '')
    .trim();

export function getLocalizedText(obj, lang) {
  if (!obj || typeof obj !== 'object') return '';
  const primary = obj[lang];
  if (primary && !isTaggedPlaceholder(primary)) return stripTags(primary);

  const en = obj.en;
  if (en && !isTaggedPlaceholder(en)) return stripTags(en);

  const cs = obj.cs;
  if (cs) return stripTags(cs);

  const firstReal = Object.values(obj).find((v) => v && !isTaggedPlaceholder(v));
  return stripTags(firstReal || Object.values(obj)[0] || '');
}

export default {
  SUPPORTED_LANGS,
  isTaggedPlaceholder,
  stripTags,
  getLocalizedText,
};


