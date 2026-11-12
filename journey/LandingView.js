// Journey landing: the story as a responsive hero, night 1 shown in full on the
// signature white card, night 8 as a locked tease, and a light interest form.
// The couple can read night 1 before any form, and can always skip into the game.

import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import FunIcon from '../components/FunIcon';
import { jt } from './strings';
import { justUsSeason } from './justUs';
import { loc, bandForPhase } from './seasons';
import { typeLabel, typeIcon, locOpt } from './mechanics';
import { submitInterest } from './interest';
import { track } from '../utils/analytics';
import {
  JC,
  useJourney,
  JourneyScaffold,
  Eyebrow,
  GlassPanel,
  PlayingCard,
  CardQuestion,
  CardChallenge,
  JourneyButton,
  LinkText,
} from './ui';

const LandingView = ({ onStart, onInterestSent, chrome }) => {
  const { language } = useLanguage();
  const { type, heroSplit } = useJourney();
  const t = (key) => jt(language, key);
  const [path, setPath] = useState(null); // 'new' | 'long'
  const [email, setEmail] = useState('');
  const [wouldPay, setWouldPay] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    track('journey_landing_viewed');
  }, []);

  const night1 = justUsSeason.nights[0];
  const band = {
    ...bandForPhase(night1.phase, language),
    icon: typeIcon(night1.type),
    label: typeLabel(night1.type, language),
  };

  const sendAndStart = async () => {
    if (email.trim() || path) {
      const result = await submitInterest({ email: email.trim(), path, wouldPay, language });
      if (result !== 'failed') {
        setSent(true);
        onInterestSent && onInterestSent();
      }
    }
    onStart(path);
  };

  const hero = (
    <View style={[styles.hero, heroSplit ? styles.alignLeft : styles.alignCenter]}>
      <View style={styles.heroIcon}>
        <FunIcon name="jar" size={heroSplit ? 88 : 64} />
      </View>
      <Eyebrow>Talk Trap · {language === 'cs' ? 'Nová generace' : 'Next generation'}</Eyebrow>
      <Text
        style={[
          styles.headline,
          { fontSize: type.hero, lineHeight: Math.round(type.hero * 1.1) },
          heroSplit ? styles.tLeft : styles.tCenter,
        ]}
      >
        {t('landingHeadline')}
      </Text>
      <Text style={[styles.sub, { fontSize: type.body }, heroSplit ? styles.tLeft : styles.tCenter]}>
        {t('landingSub')}
      </Text>

      <View style={styles.rules}>
        {['landingRule1', 'landingRule2', 'landingRule3'].map((key) => (
          <View key={key} style={styles.ruleRow}>
            <Text style={styles.ruleDot}>·</Text>
            <Text style={styles.ruleText}>{t(key)}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.honest, heroSplit ? styles.tLeft : styles.tCenter]}>{t('landingHonest')}</Text>
    </View>
  );

  return (
    <JourneyScaffold chrome={chrome} hero={hero}>
      {/* Night 1, in full, on the signature card */}
      <PlayingCard band={band} bandRight={t('landingNight1')}>
        <CardQuestion>{loc(night1.q, language)}</CardQuestion>
        {!!night1.options && (
          <View style={styles.previewOpts}>
            {night1.options.map((opt, i) => (
              <View key={i} style={styles.previewOpt}>
                <Text style={styles.previewOptText}>{locOpt(opt, language)}</Text>
              </View>
            ))}
          </View>
        )}
        {!!night1.challenge && (
          <CardChallenge label={t('tonightChallenge')}>{loc(night1.challenge, language)}</CardChallenge>
        )}
      </PlayingCard>

      {/* Night 8, only a locked line */}
      <GlassPanel style={styles.lockedCard}>
        <FunIcon name="lock" size={26} style={styles.lockIcon} />
        <View style={styles.lockedTextWrap}>
          <Text style={styles.lockedLabel}>{t('landingNight8')}</Text>
          <Text style={styles.lockedTease}>„{t('landingNight8Tease')}“</Text>
        </View>
      </GlassPanel>

      {/* Interest form */}
      <Text style={styles.pathQuestion}>{t('landingPathQuestion')}</Text>
      <View style={styles.pathRow}>
        {[
          ['new', t('landingPathNew')],
          ['long', t('landingPathLong')],
        ].map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => setPath(value)}
            style={[styles.pathBtn, path === value && styles.pathBtnActive]}
            accessibilityRole="radio"
            accessibilityState={{ checked: path === value }}
          >
            <Text style={[styles.pathText, path === value && styles.pathTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.emailInput}
        placeholder={t('landingEmail')}
        placeholderTextColor="rgba(255,255,255,0.5)"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Pressable
        onPress={() => setWouldPay((v) => !v)}
        style={styles.payRow}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: wouldPay }}
      >
        <View style={[styles.checkbox, wouldPay && styles.checkboxOn]}>
          {wouldPay && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.payText}>{t('landingWouldPay')}</Text>
      </Pressable>

      {sent && <Text style={styles.sentNote}>✓ {t('landingSent')}</Text>}

      <JourneyButton icon="party" title={t('landingSendStart')} onPress={sendAndStart} style={styles.cta} />
      <View style={styles.skip}>
        <LinkText onPress={() => onStart(path)}>{t('landingJustStart')}</LinkText>
      </View>
      <Text style={styles.freeNote}>{t('landingFree')}</Text>
    </JourneyScaffold>
  );
};

const styles = StyleSheet.create({
  hero: { width: '100%' },
  alignLeft: { alignItems: 'flex-start' },
  alignCenter: { alignItems: 'center' },
  tLeft: { textAlign: 'left' },
  tCenter: { textAlign: 'center' },
  heroIcon: { marginBottom: 14 },
  headline: { color: JC.onDark, fontWeight: '900', marginTop: 10, letterSpacing: 0.2 },
  sub: { color: JC.onDarkSoft, fontWeight: '600', marginTop: 14, lineHeight: 24, maxWidth: 520 },
  rules: { width: '100%', maxWidth: 520, marginTop: 20, gap: 10 },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  ruleDot: { color: JC.gold, fontWeight: '900', fontSize: 20, marginRight: 12, lineHeight: 22 },
  ruleText: { color: JC.onDark, fontWeight: '700', fontSize: 15, flex: 1, lineHeight: 22 },
  honest: {
    color: JC.onDarkFaint,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 20,
    lineHeight: 20,
    fontStyle: 'italic',
    maxWidth: 520,
  },

  previewOpts: { marginTop: 14, gap: 8 },
  previewOpt: {
    backgroundColor: 'rgba(34,22,63,0.05)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(34,22,63,0.1)',
  },
  previewOptText: { color: JC.ink, fontWeight: '800', fontSize: 15 },
  lockedCard: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  lockIcon: { marginRight: 12 },
  lockedTextWrap: { flex: 1 },
  lockedLabel: { color: JC.onDarkFaint, fontWeight: '800', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  lockedTease: { color: JC.onDark, fontWeight: '700', fontSize: 15, marginTop: 3 },

  pathQuestion: { color: JC.onDark, fontSize: 18, fontWeight: '900', marginTop: 28 },
  pathRow: { width: '100%', gap: 10, marginTop: 12 },
  pathBtn: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
  },
  pathBtnActive: { backgroundColor: '#fff', borderColor: JC.gold },
  pathText: { color: JC.onDark, fontWeight: '800', fontSize: 15, textAlign: 'center' },
  pathTextActive: { color: JC.ink },
  emailInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    color: JC.onDark,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  payRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: 14 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: JC.gold, borderColor: JC.gold },
  checkmark: { color: JC.goldInk, fontWeight: '900', fontSize: 14 },
  payText: { color: JC.onDark, fontWeight: '700', fontSize: 14, flex: 1, lineHeight: 20 },
  sentNote: { color: JC.gold, fontWeight: '800', fontSize: 13, marginTop: 12 },
  cta: { width: '100%', marginTop: 18 },
  skip: { marginTop: 12, alignItems: 'center' },
  freeNote: { color: JC.onDarkFaint, fontSize: 12, fontWeight: '600', marginTop: 10, textAlign: 'center' },
});

export default LandingView;
