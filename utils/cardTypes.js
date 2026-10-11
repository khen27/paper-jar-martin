import { translations } from '../translations';

const META = {
  classic: {
    questions: { emoji: '💬', key: 'typeQuestion', fallback: 'Question', colors: ['#7C5CFF', '#5A3FE0'] },
    crazy_questions: { emoji: '🤪', key: 'typeWild', fallback: 'Wild card', colors: ['#FF5FA2', '#E0307C'] },
    challenges: { emoji: '🎯', key: 'typeDare', fallback: 'Dare', colors: ['#16C79A', '#0E9F7A'] },
  },
  drinks: {
    questions: { emoji: '🍻', key: 'typeAnswerOrDrink', fallback: 'Answer or drink', colors: ['#FFB020', '#F08A00'] },
    crazy_questions: { emoji: '🗳️', key: 'typeVote', fallback: 'Vote', colors: ['#FF7A45', '#E5501B'] },
    challenges: { emoji: '🎯', key: 'typeDoOrDrink', fallback: 'Do it or drink', colors: ['#FF4D6D', '#D62848'] },
  },
};

export const getCardTypeMeta = (type, variant, language) => {
  const group = variant === 'drinks' ? META.drinks : META.classic;
  const meta = group[type] || group.questions;
  return {
    emoji: meta.emoji,
    label: translations[language]?.[meta.key] || meta.fallback,
    colors: meta.colors,
  };
};
