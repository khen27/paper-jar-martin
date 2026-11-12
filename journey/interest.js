// Landing-page interest form. Paste a Tally / Formspree / any JSON endpoint URL
// into INTEREST_FORM_URL and submissions will POST there. Until then, the form
// falls back to a mailto draft so nothing is lost — and either way the couple
// can start playing.

import { Linking } from 'react-native';
import { track } from '../utils/analytics';

export const INTEREST_FORM_URL = ''; // e.g. 'https://formspree.io/f/xxxxxx'
export const INTEREST_FALLBACK_EMAIL = 'hello@talktrap.app';

export async function submitInterest({ email, path, wouldPay, language }) {
  const payload = {
    email: email || '',
    path: path || '',
    wouldPayOnce: wouldPay ? 'yes' : 'no',
    language: language || '',
    sentAt: new Date().toISOString(),
  };
  track('journey_interest_submitted', { path: payload.path, wouldPay: payload.wouldPayOnce, hasEmail: !!email });

  if (INTEREST_FORM_URL) {
    try {
      await fetch(INTEREST_FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      return 'sent';
    } catch (e) {
      // fall through to mailto
    }
  }

  try {
    const subject = encodeURIComponent('Talk Trap journey — interest');
    const body = encodeURIComponent(
      `email: ${payload.email}\npath: ${payload.path}\nwould pay €5.99 once: ${payload.wouldPayOnce}\nlanguage: ${payload.language}`
    );
    await Linking.openURL(`mailto:${INTEREST_FALLBACK_EMAIL}?subject=${subject}&body=${body}`);
    return 'mailto';
  } catch (e) {
    return 'failed';
  }
}
