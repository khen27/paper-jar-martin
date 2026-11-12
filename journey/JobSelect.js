// First screen of the experiment preview: pick how you're playing tonight.
// Three doors so Martin can walk every path. A live test would only show
// group vs couple, then randomize the couple arm.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import FunIcon from '../components/FunIcon';
import { translations } from '../translations';
import { applyPath } from '../utils/experiment';
import {
  JC,
  useJourney,
  JourneyScaffold,
  JourneyChrome,
  Eyebrow,
} from './ui';
import ChromeActions from './ChromeActions';

const CARDS = [
  {
    path: 'group',
    icon: 'party',
    titleKey: 'jobGroup',
    title: 'Group / party',
    subKey: 'jobGroupSub',
    sub: 'One phone, 2–8 people. Classic Talk Trap.',
  },
  {
    path: 'coupleClassic',
    icon: 'handshake',
    titleKey: 'jobCoupleClassic',
    title: 'Just us — classic',
    subKey: 'jobCoupleClassicSub',
    sub: 'Partner + How well do you know me. One night.',
  },
  {
    path: 'coupleJourney',
    icon: 'candle',
    titleKey: 'jobCoupleJourney',
    title: 'Just us — 14 nights',
    subKey: 'jobCoupleJourneySub',
    sub: 'Guess, Pick, Dare. A path over two weeks.',
  },
];

const JobSelect = ({ navigation }) => {
  const { language } = useLanguage();
  const { updateSettings } = useSettings();
  const { type, heroSplit } = useJourney();
  const t = (k, f) => translations[language]?.[k] || f;

  const pick = (path) => applyPath(updateSettings, path);

  const hero = (
    <View style={[styles.hero, heroSplit ? styles.left : styles.center]}>
      {!heroSplit && <Text style={styles.wordmark}>Talk Trap</Text>}
      <View style={styles.iconWrap}>
        <FunIcon name="jar" size={heroSplit ? 88 : 56} />
      </View>
      <Eyebrow>{t('jobEyebrow', 'Preview for Martin')}</Eyebrow>
      <Text
        style={[
          styles.title,
          { fontSize: heroSplit ? type.title : 26, lineHeight: heroSplit ? Math.round(type.title * 1.15) : 32 },
          heroSplit ? styles.tLeft : styles.tCenter,
        ]}
      >
        {t('jobTitle', 'How are you playing tonight?')}
      </Text>
      <Text style={[styles.sub, heroSplit ? styles.tLeft : styles.tCenter]}>
        {t(
          'jobSub',
          'Three doors, same app. In a real test, a couple would be split at random. Here you pick so you can try all three.'
        )}
      </Text>
    </View>
  );

  return (
    <JourneyScaffold
      alignTop={!heroSplit}
      chrome={
        <JourneyChrome
          brand={!!heroSplit}
          right={<ChromeActions navigation={navigation} />}
        />
      }
      hero={hero}
    >
      {CARDS.map((c) => (
        <Pressable
          key={c.path}
          onPress={() => pick(c.path)}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          accessibilityRole="button"
        >
          <FunIcon name={c.icon} size={36} style={styles.emoji} />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{t(c.titleKey, c.title)}</Text>
            <Text style={styles.cardSub}>{t(c.subKey, c.sub)}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
      <Text style={styles.note}>
        {t('jobNote', 'Nothing is charged. After you pick, the back arrow brings you here again.')}
      </Text>
    </JourneyScaffold>
  );
};

const styles = StyleSheet.create({
  hero: { width: '100%', marginBottom: 8 },
  left: { alignItems: 'flex-start' },
  center: { alignItems: 'center' },
  tLeft: { textAlign: 'left' },
  tCenter: { textAlign: 'center' },
  wordmark: {
    color: JC.onDark,
    fontWeight: '900',
    fontSize: 34,
    letterSpacing: 0.2,
    marginBottom: 10,
  },
  iconWrap: { marginBottom: 10 },
  title: { color: JC.onDark, fontWeight: '900', marginTop: 8 },
  sub: { color: JC.onDarkSoft, fontWeight: '600', fontSize: 15, marginTop: 10, lineHeight: 22, maxWidth: 460 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
    padding: 16,
    marginBottom: 12,
  },
  cardPressed: { backgroundColor: 'rgba(255,255,255,0.22)', transform: [{ scale: 0.99 }] },
  emoji: { marginRight: 14 },
  cardText: { flex: 1 },
  cardTitle: { color: JC.onDark, fontWeight: '900', fontSize: 17 },
  cardSub: { color: JC.onDarkFaint, fontWeight: '600', fontSize: 13, marginTop: 4, lineHeight: 18 },
  chevron: { color: JC.onDarkFaint, fontSize: 26, fontWeight: '800', marginLeft: 8 },
  note: {
    color: JC.onDarkFaint,
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});

export default JobSelect;
