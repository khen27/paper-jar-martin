import React from 'react';
import { View } from 'react-native';

// Import SVGs with correct filenames
import BengaliFlag from '../assets/languages/bengali.svg';
import ChineseFlag from '../assets/languages/chinese.svg';
import CzechFlag from '../assets/languages/czech.svg';
import EnglishFlag from '../assets/languages/english.svg';
import FrenchFlag from '../assets/languages/french.svg';
import HindiFlag from '../assets/languages/hindi.svg';
import PortugueseFlag from '../assets/languages/portugues.svg';
import RussianFlag from '../assets/languages/russian.svg';
import SpanishFlag from '../assets/languages/spanish.svg';
import UrduFlag from '../assets/languages/urdu.svg';

const LanguageFlags = ({ code, size = 40 }) => {
  const flagMap = {
    bn: BengaliFlag,
    zh: ChineseFlag,
    cs: CzechFlag,
    en: EnglishFlag,
    fr: FrenchFlag,
    hi: HindiFlag,
    pt: PortugueseFlag,
    ru: RussianFlag,
    es: SpanishFlag,
    ur: UrduFlag,
  };

  const Flag = flagMap[code];

  if (!Flag) {
    console.warn(`No flag found for language code: ${code}`);
    return null;
  }

  return (
    <View style={{ width: size, height: size }}>
      <Flag width={size} height={size} />
    </View>
  );
};

export default LanguageFlags; 