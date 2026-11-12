import { translations } from '../translations';

const META = {
  classic: {
    questions: { icon: 'sparkles', key: 'typeQuestion', fallback: 'Question', colors: ['#7C5CFF', '#5A3FE0'] },
    crazy_questions: { icon: 'dice', key: 'typeWild', fallback: 'Wild card', colors: ['#FF5FA2', '#E0307C'] },
    challenges: { icon: 'trophy', key: 'typeDare', fallback: 'Dare', colors: ['#16C79A', '#0E9F7A'] },
  },
  drinks: {
    questions: { icon: 'drinks', key: 'typeAnswerOrDrink', fallback: 'Answer or drink', colors: ['#FFB020', '#F08A00'] },
    crazy_questions: { icon: 'cheers', key: 'typeVote', fallback: 'Vote', colors: ['#FF7A45', '#E5501B'] },
    challenges: { icon: 'dice', key: 'typeDoOrDrink', fallback: 'Do it or drink', colors: ['#FF4D6D', '#D62848'] },
  },
  intense: {
    questions: { icon: 'workout', key: 'typeMove', fallback: 'Move', colors: ['#2ED47A', '#0C9F8C'] },
    crazy_questions: { icon: 'dice', key: 'typeWild', fallback: 'Wild card', colors: ['#FF9F1C', '#FF4E50'] },
    challenges: { icon: 'trophy', key: 'typeDare', fallback: 'Dare', colors: ['#16C79A', '#0E9F7A'] },
  },
  huddle: {
    questions: { icon: 'handshake', key: 'typePitch', fallback: 'Pitch', colors: ['#5C7CFA', '#364FC7'] },
    crazy_questions: { icon: 'sparkles', key: 'typeWild', fallback: 'Wild card', colors: ['#8F6BFF', '#5B3FD9'] },
    challenges: { icon: 'trophy', key: 'typeDare', fallback: 'Dare', colors: ['#16C79A', '#0E9F7A'] },
  },
};

export const getCardTypeMeta = (type, variant, language) => {
  const group = META[variant] || META.classic;
  const meta = group[type] || group.questions;
  return {
    icon: meta.icon,
    label: translations[language]?.[meta.key] || meta.fallback,
    colors: meta.colors,
  };
};
