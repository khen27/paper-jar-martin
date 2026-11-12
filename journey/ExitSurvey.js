// One-beat survey after the first session. Preview only: answers are tracked
// locally, nothing is sent. Shown once per path until they switch doors.

import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import FunIcon from '../components/FunIcon';
import { track } from '../utils/analytics';
import { JC, JourneyButton } from './ui';

const ExitSurvey = ({ visible, onDone }) => {
  const { language } = useLanguage();
  const t = (k, f) => translations[language]?.[k] || f;
  const [fun, setFun] = useState(null);
  const [again, setAgain] = useState(null);

  const submit = () => {
    track('exit_survey', { fun, again });
    onDone && onDone({ fun, again });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => onDone && onDone()}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.kicker}>{t('surveyKicker', 'One question')}</Text>
          <Text style={styles.title}>{t('surveyTitle', 'Was that fun?')}</Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => {
              const on = n <= (fun || 0);
              return (
                <Pressable
                  key={n}
                  onPress={() => setFun(n)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${n}`}
                  style={[styles.starBtn, on && styles.starBtnOn]}
                >
                  <FunIcon name="sparkles" size={28} style={!on ? styles.starOff : null} />
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.q}>{t('surveyAgain', 'Would you play again this week?')}</Text>
          <View style={styles.row}>
            {[
              ['yes', t('surveyYes', 'Yes')],
              ['no', t('surveyNo', 'No')],
              ['maybe', t('surveyMaybe', 'Not sure')],
            ].map(([id, label]) => (
              <Pressable
                key={id}
                onPress={() => setAgain(id)}
                style={[styles.choice, again === id && styles.choiceOn]}
                accessibilityRole="radio"
                accessibilityState={{ checked: again === id }}
              >
                <Text style={[styles.choiceText, again === id && styles.choiceTextOn]}>{label}</Text>
              </Pressable>
            ))}
          </View>

          <JourneyButton
            title={t('surveyCta', 'Continue')}
            onPress={submit}
            disabled={fun == null || !again}
            variant="primary"
            style={styles.cta}
          />
          <Pressable onPress={() => onDone && onDone()} style={styles.skip} accessibilityRole="button">
            <Text style={styles.skipText}>{t('surveySkip', 'Skip')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,6,30,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 22,
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  kicker: { color: JC.accent, fontWeight: '900', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: JC.ink, fontWeight: '900', fontSize: 22, marginTop: 8 },
  stars: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 8, gap: 6 },
  starBtn: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(34,22,63,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starBtnOn: {
    backgroundColor: '#FFE08A',
    borderBottomWidth: 3,
    borderBottomColor: '#E0A800',
  },
  starOff: { opacity: 0.28 },
  q: { color: JC.ink, fontWeight: '800', fontSize: 15, marginTop: 14 },
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
  choice: {
    flex: 1,
    backgroundColor: 'rgba(34,22,63,0.06)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 10,
    alignItems: 'center',
  },
  choiceOn: { borderColor: JC.accent, backgroundColor: 'rgba(124,58,237,0.1)' },
  choiceText: { color: JC.ink, fontWeight: '800', fontSize: 13 },
  choiceTextOn: { color: JC.accent },
  cta: { width: '100%', marginTop: 18 },
  skip: { alignSelf: 'center', padding: 10, marginTop: 4 },
  skipText: { color: JC.inkSoft, fontWeight: '700', fontSize: 13, textDecorationLine: 'underline' },
});

export default ExitSurvey;
