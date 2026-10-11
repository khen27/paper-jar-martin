import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Vibration,
  Animated,
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
import { getDeck } from '../utils/decks';
import { getCardTypeMeta } from '../utils/cardTypes';
import { flattenDataset, initBag, nextIndex } from '../utils/questionBag';
import { getLocalizedText } from '../utils/i18n';
import ConfettiBurst from '../components/ConfettiBurst';
import ChunkyButton from '../components/ChunkyButton';

const TIMER_SECONDS = 30;

const PartyScreen = ({ navigation, route }) => {
  const { language } = useLanguage();
  const { getCurrentGradient } = useTheme();
  const { settings, updateSettings } = useSettings();
  const t = (key, fallback) => translations[language]?.[key] || fallback;
  const variant = route.params?.variant === 'drinks' ? 'drinks' : 'classic';
  const { key: deckKey, data: activeDataset } = getDeck('party', variant);

  const [phase, setPhase] = useState('setup'); // setup | play
  const [nameDraft, setNameDraft] = useState('');
  const [players, setPlayers] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [prompt, setPrompt] = useState(null);
  const [promptType, setPromptType] = useState('questions');
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const timerOn = !!settings.partyTimerEnabled;
  const [burstKey, setBurstKey] = useState(0);
  const [round, setRound] = useState(0);
  const timerRef = useRef(null);
  const cardPop = useRef(new Animated.Value(1)).current;
  const cardMeta = getCardTypeMeta(promptType, variant, language);

  const refs = useMemo(() => flattenDataset(activeDataset), [activeDataset]);

  const currentPlayer = players[turnIndex] || '';

  const drawPrompt = useCallback(async () => {
    await initBag(deckKey, refs.length);
    const ref = refs[nextIndex(deckKey, refs.length)];
    const obj = activeDataset[ref.topicIndex][ref.type][ref.questionIndex];
    setPrompt(getLocalizedText(obj, language));
    setPromptType(ref.type);
    setBurstKey((k) => k + 1);
    setRound((r) => r + 1);
    cardPop.setValue(0.85);
    Animated.spring(cardPop, { toValue: 1, friction: 5, tension: 160, useNativeDriver: true }).start();
    setSecondsLeft(TIMER_SECONDS);
    try {
      Vibration.vibrate(25);
    } catch (e) {
      // ignore
    }
  }, [language, refs, activeDataset, deckKey]);

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
    track('party_started', { players: players.length, timer: timerOn, variant });
    recordPlay();
    await drawPrompt();
  };

  const nextTurn = async () => {
    setTurnIndex((i) => (i + 1) % players.length);
    await drawPrompt();
  };

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
          <View style={styles.headerPills}>
            <ModernCard variant="surface" size="sm" style={styles.pill}>
              <Text style={styles.pillText}>{t('partyMode', 'Party')}</Text>
            </ModernCard>
            {variant === 'drinks' && (
              <ModernCard variant="surface" size="sm" style={[styles.pill, styles.drinksPill]}>
                <Text style={styles.pillText}>{t('drinksEdition', 'Drinks 🍻')}</Text>
              </ModernCard>
            )}
          </View>
        </View>

        {phase === 'setup' ? (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.heroEmoji}>{variant === 'drinks' ? '🍻' : '🎉'}</Text>
            <Text style={styles.title}>{t('partySetupTitle', 'Pass the phone')}</Text>
            <Text style={styles.subtitle}>
              {variant === 'drinks'
                ? t(
                    'partySetupSubtitleDrinks',
                    'Add 2–8 players. Answer-or-drink, vote challenges — winner sips.'
                  )
                : t(
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

            <ChunkyButton
              title={`🎉  ${t('startParty', 'Start party')}`}
              disabled={players.length < 2}
              onPress={startGame}
              style={styles.startBtn}
            />
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <ConfettiBurst burstKey={burstKey} />
            <Text style={styles.passLabel}>📱 {t('passPhoneTo', 'Pass the phone to')}</Text>
            <View style={styles.playerChip}>
              <Text style={styles.playerName}>{currentPlayer}</Text>
            </View>

            {variant === 'drinks' && (
              <View style={styles.drinksRule}>
                <Text style={styles.drinksRuleText}>
                  🍻 {t('drinksRule', 'Don’t want to answer? Take a sip. Soft drinks count.')}
                </Text>
              </View>
            )}

            <Animated.View style={[styles.playingCard, { transform: [{ scale: cardPop }] }]}>
              <LinearGradient
                colors={cardMeta.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardBand}
              >
                <Text style={styles.cardBandText}>
                  {cardMeta.emoji}  {cardMeta.label}
                </Text>
                <Text style={styles.cardNumber}>
                  {t('cardLabel', 'Card')} #{round}
                </Text>
              </LinearGradient>
              <Text style={styles.promptText}>{prompt}</Text>
            </Animated.View>

            {timerOn && (
              <Text style={[styles.timer, secondsLeft === 0 && styles.timerDone]}>
                {secondsLeft === 0 ? t('timesUp', "Time's up!") : `${secondsLeft}s`}
              </Text>
            )}

            <ChunkyButton
              title={`${t('nextPlayer', 'Next player')}  👉`}
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
  headerPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
    maxWidth: '70%',
  },
  pill: { paddingHorizontal: 14, paddingVertical: 6, minHeight: 32 },
  drinksPill: {
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
    borderColor: 'rgba(251, 191, 36, 0.7)',
    borderWidth: 1,
  },
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
  heroEmoji: { fontSize: 56, marginBottom: 4 },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  chipText: { color: '#22163F', fontWeight: '800' },
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
  passLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '700', marginTop: 8 },
  playerChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 6,
    marginTop: 8,
    marginBottom: 16,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.15)',
    transform: [{ rotate: '-2deg' }],
  },
  playerName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#22163F',
    textAlign: 'center',
  },
  drinksRule: {
    backgroundColor: '#FFD43B',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
    borderBottomWidth: 3,
    borderBottomColor: '#E0A800',
  },
  drinksRuleText: { color: '#5C3B00', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  playingCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    overflow: 'hidden',
    minHeight: 200,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  cardBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  cardBandText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },
  cardNumber: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '800' },
  promptText: {
    fontSize: 22,
    color: '#22163F',
    textAlign: 'center',
    fontWeight: '800',
    lineHeight: 31,
    paddingHorizontal: 22,
    paddingVertical: 28,
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
