import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../translations';
import { ModernCard, ModernButton, ModernBackButton } from '../components/ui';
import { tokens } from '../theme/tokens';
import { knowMeDataset } from '../knowme_dataset';
import ConfettiBurst from '../components/ConfettiBurst';
import { track } from '../utils/analytics';
import { recordPlay } from '../utils/streaks';

const ROUNDS = 6;

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const KnowMeScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { getCurrentGradient } = useTheme();
  const t = (key, fallback) => translations[language]?.[key] || fallback;

  const [phase, setPhase] = useState('setup'); // setup | answer | guess | reveal | score
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [round, setRound] = useState(0);
  const [secretIndex, setSecretIndex] = useState(null);
  const [guessIndex, setGuessIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const [deckSeed, setDeckSeed] = useState(0);

  const deck = useMemo(() => shuffle(knowMeDataset).slice(0, ROUNDS), [deckSeed]);
  const item = deck[round];
  const question = item ? item[language] || item.en || item.cs : '';
  const options = item ? item.options[language] || item.options.en || item.options.cs : [];

  const start = () => {
    if (!nameA.trim() || !nameB.trim()) return;
    setPhase('answer');
    setRound(0);
    setScore(0);
    setSecretIndex(null);
    setGuessIndex(null);
    track('knowme_started');
    recordPlay();
  };

  const confirmAnswer = () => {
    if (secretIndex === null) return;
    setPhase('guess');
    setGuessIndex(null);
  };

  const confirmGuess = () => {
    if (guessIndex === null) return;
    const match = guessIndex === secretIndex;
    if (match) {
      setScore((s) => s + 1);
      setBurstKey((k) => k + 1);
    }
    setPhase('reveal');
  };

  const nextRound = () => {
    if (round + 1 >= ROUNDS) {
      setPhase('score');
      setBurstKey((k) => k + 1);
      return;
    }
    setRound((r) => r + 1);
    setSecretIndex(null);
    setGuessIndex(null);
    setPhase('answer');
  };

  const scoreTitle =
    score >= 5
      ? t('knowMeScoreGreat', "You're basically telepathic 💞")
      : score >= 3
        ? t('knowMeScoreGood', 'Pretty in sync!')
        : t('knowMeScoreOk', 'Room to learn — play again!');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getCurrentGradient().colors}
        style={styles.bg}
        start={getCurrentGradient().start}
        end={getCurrentGradient().end}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <ModernBackButton onPress={() => navigation.goBack()} size="md" />
          <ModernCard variant="surface" size="sm" style={styles.pill}>
            <Text style={styles.pillText}>{t('knowMeMode', 'How well do you know me?')}</Text>
          </ModernCard>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {(phase === 'reveal' || phase === 'score') && <ConfettiBurst burstKey={burstKey} />}

          {phase === 'setup' && (
            <>
              <Text style={styles.title}>{t('knowMeSetupTitle', 'How well do you know me?')}</Text>
              <Text style={styles.subtitle}>
                {t(
                  'knowMeSetupSubtitle',
                  'One person answers secretly. The other guesses. 6 rounds. See how in sync you are.'
                )}
              </Text>
              <ModernCard variant="surface" size="lg" style={styles.card}>
                <Text style={styles.label}>{t('playerA', 'Player A (answers first)')}</Text>
                <TextInput
                  style={styles.input}
                  value={nameA}
                  onChangeText={setNameA}
                  placeholder={t('namePlaceholder', 'Name')}
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  maxLength={20}
                />
                <Text style={[styles.label, { marginTop: 14 }]}>
                  {t('playerB', 'Player B (guesses)')}
                </Text>
                <TextInput
                  style={styles.input}
                  value={nameB}
                  onChangeText={setNameB}
                  placeholder={t('namePlaceholder', 'Name')}
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  maxLength={20}
                />
              </ModernCard>
              <ModernButton
                title={t('startGame', 'Start')}
                size="lg"
                variant="primary"
                disabled={!nameA.trim() || !nameB.trim()}
                onPress={start}
                style={styles.cta}
              />
            </>
          )}

          {phase === 'answer' && (
            <>
              <Text style={styles.passLabel}>
                {t('passPhoneTo', 'Pass the phone to')} {nameA.trim()}
              </Text>
              <Text style={styles.round}>
                {t('roundOf', 'Round')} {round + 1}/{ROUNDS}
              </Text>
              <Text style={styles.instruction}>
                {t('knowMeAnswerHint', 'Answer about yourself — keep it secret from')} {nameB.trim()}.
              </Text>
              <ModernCard variant="surface" size="lg" style={styles.card}>
                <Text style={styles.question}>{question}</Text>
              </ModernCard>
              {options.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSecretIndex(i)}
                  activeOpacity={0.85}
                  style={{ width: '100%' }}
                >
                  <ModernCard
                    variant="surface"
                    size="md"
                    selected={secretIndex === i}
                    style={styles.option}
                  >
                    <Text style={styles.optionText}>{opt}</Text>
                  </ModernCard>
                </TouchableOpacity>
              ))}
              <ModernButton
                title={t('lockAnswer', 'Lock answer & pass phone')}
                size="lg"
                variant="primary"
                disabled={secretIndex === null}
                onPress={confirmAnswer}
                style={styles.cta}
              />
            </>
          )}

          {phase === 'guess' && (
            <>
              <Text style={styles.passLabel}>
                {t('passPhoneTo', 'Pass the phone to')} {nameB.trim()}
              </Text>
              <Text style={styles.round}>
                {t('roundOf', 'Round')} {round + 1}/{ROUNDS}
              </Text>
              <Text style={styles.instruction}>
                {t('knowMeGuessHint', 'What would')} {nameA.trim()} {t('knowMeGuessHint2', 'pick?')}
              </Text>
              <ModernCard variant="surface" size="lg" style={styles.card}>
                <Text style={styles.question}>{question}</Text>
              </ModernCard>
              {options.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setGuessIndex(i)}
                  activeOpacity={0.85}
                  style={{ width: '100%' }}
                >
                  <ModernCard
                    variant="surface"
                    size="md"
                    selected={guessIndex === i}
                    style={styles.option}
                  >
                    <Text style={styles.optionText}>{opt}</Text>
                  </ModernCard>
                </TouchableOpacity>
              ))}
              <ModernButton
                title={t('reveal', 'Reveal')}
                size="lg"
                variant="primary"
                disabled={guessIndex === null}
                onPress={confirmGuess}
                style={styles.cta}
              />
            </>
          )}

          {phase === 'reveal' && (
            <>
              <Text style={styles.title}>
                {guessIndex === secretIndex
                  ? t('knowMeMatch', 'Match! 🎉')
                  : t('knowMeMiss', 'Not quite')}
              </Text>
              <ModernCard variant="surface" size="lg" style={styles.card}>
                <Text style={styles.revealLine}>
                  {nameA.trim()}: {options[secretIndex]}
                </Text>
                <Text style={styles.revealLine}>
                  {nameB.trim()}: {options[guessIndex]}
                </Text>
                <Text style={styles.scoreLine}>
                  {t('score', 'Score')}: {score}/{round + 1}
                </Text>
              </ModernCard>
              <ModernButton
                title={round + 1 >= ROUNDS ? t('seeResults', 'See results') : t('nextRound', 'Next round')}
                size="lg"
                variant="primary"
                onPress={nextRound}
                style={styles.cta}
              />
            </>
          )}

          {phase === 'score' && (
            <>
              <Text style={styles.bigScore}>
                {score}/{ROUNDS}
              </Text>
              <Text style={styles.title}>{scoreTitle}</Text>
              <Text style={styles.subtitle}>
                {nameB.trim()} {t('knowMeGuessed', 'guessed')} {nameA.trim()} {t('knowMeCorrectly', 'correctly')}{' '}
                {score} {t('knowMeTimes', 'times')}.
              </Text>
              <ModernButton
                title={t('playAgain', 'Play again')}
                size="lg"
                variant="primary"
                onPress={() => {
                  setDeckSeed((s) => s + 1);
                  setPhase('setup');
                  setSecretIndex(null);
                  setGuessIndex(null);
                }}
                style={styles.cta}
              />
              <ModernButton
                title={t('back', 'Back')}
                size="md"
                variant="outline"
                onPress={() => navigation.goBack()}
                style={styles.cta}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { ...StyleSheet.absoluteFillObject },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pill: { paddingHorizontal: 12, paddingVertical: 6, maxWidth: 220 },
  pillText: {
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.weights.semibold,
    fontSize: 12,
    textAlign: 'center',
  },
  content: { padding: 24, alignItems: 'center', paddingBottom: 48 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  card: { width: '100%', marginBottom: 16 },
  label: { color: 'rgba(255,255,255,0.85)', marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
  },
  cta: { width: '100%', marginTop: 8 },
  passLabel: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  round: { color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  instruction: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  question: {
    fontSize: tokens.typography.sizes.lg,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    fontWeight: tokens.typography.weights.semibold,
    lineHeight: 28,
  },
  option: { width: '100%', marginBottom: 10 },
  optionText: {
    color: tokens.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  revealLine: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreLine: {
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '700',
  },
  bigScore: {
    fontSize: 64,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
});

export default KnowMeScreen;
