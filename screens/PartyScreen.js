import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../translations';
import { track } from '../utils/analytics';
import { recordPlay } from '../utils/streaks';
import { ModernCard, ModernButton, ModernBackButton } from '../components/ui';
import { tokens } from '../theme/tokens';
import { partyDataset } from '../party_dataset';
import { flattenDataset, initBag, nextIndex } from '../utils/questionBag';
import { getLocalizedText } from '../utils/i18n';
import ConfettiBurst from '../components/ConfettiBurst';

const TIMER_SECONDS = 30;
const DECK_KEY = 'party';

const PartyScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { getCurrentGradient } = useTheme();
  const { settings, updateSettings } = useSettings();
  const t = (key, fallback) => translations[language]?.[key] || fallback;

  const [phase, setPhase] = useState('setup'); // setup | play
  const [nameDraft, setNameDraft] = useState('');
  const [players, setPlayers] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [prompt, setPrompt] = useState(null);
  const [promptType, setPromptType] = useState('questions');
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const timerOn = !!settings.partyTimerEnabled;
  const [burstKey, setBurstKey] = useState(0);
  const timerRef = useRef(null);

  const refs = useMemo(() => flattenDataset(partyDataset), []);

  const currentPlayer = players[turnIndex] || '';

  const drawPrompt = useCallback(async () => {
    await initBag(DECK_KEY, refs.length);
    const ref = refs[nextIndex(DECK_KEY, refs.length)];
    const obj = partyDataset[ref.topicIndex][ref.type][ref.questionIndex];
    setPrompt(getLocalizedText(obj, language));
    setPromptType(ref.type);
    setBurstKey((k) => k + 1);
    setSecondsLeft(TIMER_SECONDS);
    try {
      Vibration.vibrate(25);
    } catch (e) {
      // ignore
    }
  }, [language, refs]);

  useEffect(() => {
    if (phase !== 'play' || !timerOn) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, timerOn, prompt]);

  const addPlayer = () => {
    const name = nameDraft.trim();
    if (!name || players.includes(name) || players.length >= 8) return;
    setPlayers((p) => [...p, name]);
    setNameDraft('');
  };

  const removePlayer = (name) => {
    setPlayers((p) => p.filter((n) => n !== name));
  };

  const startGame = async () => {
    if (players.length < 2) return;
    setPhase('play');
    setTurnIndex(0);
    track('party_started', { players: players.length, timer: timerOn });
    recordPlay();
    await drawPrompt();
  };

  const nextTurn = async () => {
    setTurnIndex((i) => (i + 1) % players.length);
    await drawPrompt();
  };

  const typeLabel =
    promptType === 'challenges'
      ? t('dareLabel', 'Dare')
      : promptType === 'crazy_questions'
        ? t('wildLabel', 'Wild')
        : t('questionLabel', 'Question');

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
            <Text style={styles.pillText}>{t('partyMode', 'Party')}</Text>
          </ModernCard>
        </View>

        {phase === 'setup' ? (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>{t('partySetupTitle', 'Pass the phone')}</Text>
            <Text style={styles.subtitle}>
              {t(
                'partySetupSubtitle',
                'Add 2–8 players. Each turn, pass the phone, answer a question or do a dare.'
              )}
            </Text>

            <ModernCard variant="surface" size="lg" style={styles.card}>
              <View style={styles.addRow}>
                <TextInput
                  style={styles.input}
                  value={nameDraft}
                  onChangeText={setNameDraft}
                  placeholder={t('playerNamePlaceholder', 'Player name')}
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  maxLength={20}
                  onSubmitEditing={addPlayer}
                  returnKeyType="done"
                />
                <ModernButton
                  title={t('add', 'Add')}
                  size="sm"
                  variant="secondary"
                  onPress={addPlayer}
                  style={styles.addBtn}
                />
              </View>
              <View style={styles.chips}>
                {players.map((name) => (
                  <TouchableOpacity key={name} style={styles.chip} onPress={() => removePlayer(name)}>
                    <Text style={styles.chipText}>{name}  ×</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {players.length < 2 && (
                <Text style={styles.hint}>{t('needTwoPlayers', 'Add at least 2 players to start.')}</Text>
              )}
            </ModernCard>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => updateSettings({ partyTimerEnabled: !timerOn })}
              activeOpacity={0.8}
            >
              <Text style={styles.toggleText}>
                {timerOn
                  ? t('timerOn', `⏱ ${TIMER_SECONDS}s timer on`)
                  : t('timerOff', '⏱ Timer off (default)')}
              </Text>
              <Text style={styles.toggleHint}>
                {t('timerSettingsHint', 'Also in Settings — stays off unless you turn it on.')}
              </Text>
            </TouchableOpacity>

            <ModernButton
              title={t('startParty', 'Start party')}
              size="lg"
              variant="primary"
              disabled={players.length < 2}
              onPress={startGame}
              style={styles.startBtn}
            />
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <ConfettiBurst burstKey={burstKey} />
            <Text style={styles.passLabel}>{t('passPhoneTo', 'Pass the phone to')}</Text>
            <Text style={styles.playerName}>{currentPlayer}</Text>

            <ModernCard variant="surface" size="sm" style={styles.typePill}>
              <Text style={styles.typeText}>{typeLabel}</Text>
            </ModernCard>

            <ModernCard variant="surface" size="lg" style={styles.promptCard}>
              <Text style={styles.promptText}>{prompt}</Text>
            </ModernCard>

            {timerOn && (
              <Text style={[styles.timer, secondsLeft === 0 && styles.timerDone]}>
                {secondsLeft === 0 ? t('timesUp', "Time's up!") : `${secondsLeft}s`}
              </Text>
            )}

            <ModernButton
              title={t('nextPlayer', 'Next player')}
              size="lg"
              variant="primary"
              onPress={nextTurn}
              style={styles.startBtn}
            />
            <ModernButton
              title={t('skipPrompt', 'Skip prompt')}
              size="md"
              variant="outline"
              onPress={drawPrompt}
              style={styles.skipBtn}
            />
          </ScrollView>
        )}
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
  pill: { paddingHorizontal: 14, paddingVertical: 6, minHeight: 32 },
  pillText: {
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.weights.semibold,
    fontSize: tokens.typography.sizes.sm,
  },
  content: { padding: 24, alignItems: 'center', paddingBottom: 48 },
  title: {
    fontSize: 28,
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
    marginBottom: 24,
  },
  card: { width: '100%', marginBottom: 16 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
  },
  addBtn: { minWidth: 72 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { color: '#fff', fontWeight: '600' },
  hint: { color: 'rgba(255,255,255,0.7)', marginTop: 12, fontSize: 13 },
  toggleRow: { marginBottom: 16, alignItems: 'center' },
  toggleText: { color: '#fff', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  toggleHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  startBtn: { width: '100%', marginTop: 8 },
  skipBtn: { width: '100%', marginTop: 12 },
  passLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 16, marginTop: 8 },
  playerName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  typePill: { marginBottom: 16, paddingHorizontal: 16, paddingVertical: 6 },
  typeText: { color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
  promptCard: { width: '100%', marginBottom: 20, minHeight: 140, justifyContent: 'center' },
  promptText: {
    fontSize: tokens.typography.sizes.xl,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    fontWeight: tokens.typography.weights.semibold,
    lineHeight: tokens.typography.sizes.xl * 1.35,
  },
  timer: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
  },
  timerDone: { color: '#FBBF24' },
});

export default PartyScreen;
