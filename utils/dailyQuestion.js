import { dataset } from '../full_dataset';
import { getLocalizedText } from './i18n';

const dayIndex = () => {
  const start = new Date(Date.UTC(2024, 0, 1));
  const now = new Date();
  const utc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((utc - start.getTime()) / (1000 * 60 * 60 * 24));
};

/** Stable question-of-the-day from the main dataset (same for everyone that calendar day). */
export function getQuestionOfTheDay(language = 'en') {
  const flat = [];
  dataset.forEach((topic, ti) => {
    (topic.questions || []).forEach((q, qi) => {
      flat.push({ ti, qi, q });
    });
  });
  if (!flat.length) {
    return { text: language === 'cs' ? 'Jaký byl tvůj den?' : 'How was your day?', id: 'fallback' };
  }
  const idx = Math.abs(dayIndex()) % flat.length;
  const item = flat[idx];
  return {
    id: `${item.ti}-${item.qi}`,
    text: getLocalizedText(item.q, language),
    questionObject: item.q,
  };
}

export default { getQuestionOfTheDay };
