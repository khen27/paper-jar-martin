import { Platform, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { track } from './analytics';

export const PUBLIC_URL = 'https://snack-f1451e12-d578-45f1-80ba-3277e2f9f4ea.expo.app';
const REF_KEY = '@paper_jar_ref_code';
const REFERRED_BY_KEY = '@paper_jar_referred_by';

const baseUrl = () =>
  Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : PUBLIC_URL;

/** Stable, anonymous invite code for this device. */
export const getReferralCode = async () => {
  try {
    const existing = await AsyncStorage.getItem(REF_KEY);
    if (existing) return existing;
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    await AsyncStorage.setItem(REF_KEY, code);
    return code;
  } catch (e) {
    return 'PAPERJAR';
  }
};

export const buildLink = ({ mode, variant, card, ref } = {}) => {
  const params = [];
  if (mode) params.push(`m=${encodeURIComponent(mode)}`);
  if (variant && variant !== 'classic') params.push(`v=${encodeURIComponent(variant)}`);
  if (card) params.push(`c=${card.topicIndex}.${card.type}.${card.questionIndex}`);
  if (ref) params.push(`ref=${encodeURIComponent(ref)}`);
  return `${baseUrl()}/${params.length ? `?${params.join('&')}` : ''}`;
};

/** Read ?m=&v=&c=&ref= from the web URL once, then clean the address bar. */
export const consumeDeepLink = async () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try {
    const q = new URLSearchParams(window.location.search);
    if (![...q.keys()].length) return null;
    const ref = q.get('ref');
    if (ref) {
      const already = await AsyncStorage.getItem(REFERRED_BY_KEY);
      if (!already) {
        await AsyncStorage.setItem(REFERRED_BY_KEY, ref);
        track('referral_opened', { ref });
      }
    }
    let card = null;
    const c = q.get('c');
    if (c) {
      const [topicIndex, type, questionIndex] = c.split('.');
      if (['questions', 'crazy_questions', 'challenges'].includes(type)) {
        card = { topicIndex: Number(topicIndex), type, questionIndex: Number(questionIndex) };
        if (!Number.isInteger(card.topicIndex) || !Number.isInteger(card.questionIndex)) card = null;
      }
    }
    window.history.replaceState(null, '', window.location.pathname);
    const mode = q.get('m');
    if (mode) track('deeplink_opened', { mode, hasCard: !!card });
    return mode ? { mode, variant: q.get('v') === 'drinks' ? 'drinks' : 'classic', card } : null;
  } catch (e) {
    return null;
  }
};

const wrapLines = (ctx, text, maxWidth) => {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
};

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

/** 1080×1920 story image of a card (web only). Resolves to a PNG Blob. */
const renderStoryImage = ({ text, label, colors, footer }) =>
  new Promise((resolve, reject) => {
    try {
      const W = 1080;
      const H = 1920;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, colors[0]);
      bg.addColorStop(1, colors[1]);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = '900 84px -apple-system, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Paper Jar 🫙', W / 2, 260);

      const font = '800 64px -apple-system, "Segoe UI", Roboto, sans-serif';
      ctx.font = font;
      const lines = wrapLines(ctx, text, W - 280).slice(0, 9);
      const lineH = 88;
      const cardH = Math.max(560, lines.length * lineH + 300);
      const cardY = (H - cardH) / 2;

      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(-0.02);
      ctx.translate(-W / 2, -H / 2);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      roundRect(ctx, 100, cardY + 24, W - 200, cardH, 56);
      ctx.fill();
      ctx.fillStyle = '#fff';
      roundRect(ctx, 100, cardY, W - 200, cardH, 56);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = colors[1];
      ctx.font = '900 44px -apple-system, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(label, W / 2, cardY + 120);

      ctx.fillStyle = '#22163F';
      ctx.font = font;
      const textTop = cardY + 120 + (cardH - 160 - lines.length * lineH) / 2 + lineH * 0.8;
      lines.forEach((l, i) => ctx.fillText(l, W / 2, textTop + i * lineH));

      ctx.fillStyle = '#fff';
      ctx.font = '800 46px -apple-system, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(footer, W / 2, H - 220);

      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
    } catch (e) {
      reject(e);
    }
  });

const download = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Share a card. Returns 'shared' | 'downloaded' | 'copied' | 'cancelled'.
 * Adult cards are never shared as text — only a teaser for the mode.
 */
export const shareCard = async ({ text, label, colors, mode, variant, card, teaser, footer }) => {
  const ref = await getReferralCode();
  const isTeaser = !!teaser;
  const link = buildLink({ mode, variant, card: isTeaser ? null : card, ref });
  const shownText = isTeaser ? teaser : text;
  const message = `${label}: „${shownText}“\n\n${link}`;
  track('card_shared', { mode, variant, teaser: isTeaser });

  if (Platform.OS !== 'web') {
    const res = await Share.share({ message });
    return res.action === Share.dismissedAction ? 'cancelled' : 'shared';
  }

  let blob = null;
  try {
    blob = await renderStoryImage({ text: shownText, label, colors, footer: footer || link.replace(/^https?:\/\//, '').split('?')[0].replace(/\/$/, '') });
  } catch (e) {
    blob = null;
  }

  try {
    if (blob && navigator.canShare) {
      const file = new File([blob], 'paper-jar-card.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: message });
        return 'shared';
      }
    }
    if (navigator.share) {
      await navigator.share({ text: message, url: link });
      return 'shared';
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return 'cancelled';
  }

  if (blob) {
    download(blob, 'paper-jar-card.png');
    await copyText(message);
    return 'downloaded';
  }
  return (await copyText(message)) ? 'copied' : 'cancelled';
};

/** Share plain text + link (invites, Know Me results). */
export const shareText = async ({ message, mode, event }) => {
  const ref = await getReferralCode();
  const link = buildLink({ mode, ref });
  const full = `${message}\n\n${link}`;
  track(event || 'text_shared', { mode });
  if (Platform.OS !== 'web') {
    const res = await Share.share({ message: full });
    return res.action === Share.dismissedAction ? 'cancelled' : 'shared';
  }
  try {
    if (navigator.share) {
      await navigator.share({ text: full });
      return 'shared';
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return 'cancelled';
  }
  return (await copyText(full)) ? 'copied' : 'cancelled';
};
