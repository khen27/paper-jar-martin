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
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../translations';
import { track } from '../utils/analytics';
import { recordPlay } from '../utils/streaks';
import { markSessionPlayed } from '../utils/experiment';
import { ModernCard, ModernButton, ModernBackButton } from '../components/ui';
import { tokens } from '../theme/tokens';
import { getDeck } from '../utils/decks';
import { getCardTypeMeta } from '../utils/cardTypes';
import { flattenDataset, initBag, nextIndex } from '../utils/questionBag';
import { getLocalizedText } from '../utils/i18n';
import ConfettiBurst from '../components/ConfettiBurst';
import ChunkyButton from '../components/ChunkyButton';
import RulesSheet from '../components/RulesSheet';
import DrinkTally from '../components/DrinkTally';
import AdModal from '../components/AdModal';
import SeasonalDecor from '../components/SeasonalDecor';
import FunIcon from '../components/FunIcon';
import { useResponsive } from '../utils/responsive';
import { useKeyboardShortcuts } from '../utils/useKeyboardShortcuts';
import { isDeckLocked, FREE_SAMPLE_CARDS, hasPremium } from '../utils/entitlements';
import { shareText } from '../utils/share';

const TIMER_SECONDS = 30;

const PartyScreen = ({ navigation, route }) => {
  const { language } = useLanguage();
  const { getCurrentGradient } = useTheme();
  const { settings, updateSettings } = useSettings();
  const isFocused = useIsFocused();
  const t = (key, fallback) => translations[language]?.[key] || fallback;
  const variant = route.params?.variant === 'drinks' ? 'drinks' : 'classic';
  const { key: deckKey, data: activeDataset } = getDeck('party', variant);
  const deckLocked = isDeckLocked('party', variant, settings);
  const { fs, cardMaxWidth, isWide } = useResponsive();
  const [rulesOpen, setRulesOpen] = useState(!!settings.showRules);
  const [adBreak, setAdBreak] = useState(false);
  const adsOn = !!settings.paywallPreview && !hasPremium(settings);

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
    if (deckLocked && round >= FREE_SAMPLE_CARDS) {
      track('paywall_sample_end', { gameMode: 'party', variant });
      navigation.navigate('Upgrade', { upgradeReason: 'pack', gameMode: 'party', variant });
      return false;
    }
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
    return true;
  }, [language, refs, activeDataset, deckKey, deckLocked, round, navigation, variant]);

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
    markSessionPlayed(updateSettings, settings);
    await drawPrompt();
  };

  const nextTurn = async () => {
    if (await drawPrompt()) setTurnIndex((i) => (i + 1) % players.length);
  };

  useEffect(() => {
    if (adsOn && round > 0 && round % 12 === 0) setAdBreak(true);
  }, [round]);

  useKeyboardShortcuts(
    {
      ' ': nextTurn,
      Enter: nextTurn,
      ArrowRight: nextTurn,
      '?': () => setRulesOpen(true),
      Escape: () => navigation.goBack(),
    },
    phase === 'play' && !rulesOpen && !adBreak && isFocused
  );

  const inviteFriends = () =>
    shareText({
      message: t('inviteMessage', 'Come play Talk Trap with us. Party cards, dares and laughs, free in your browser.'),
      mode: 'party',
      event: 'invite_shared',
    });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getCurrentGradient().colors}
        style={styles.bg}
        start={getCurrentGradient().start}
        end={getCurrentGradient().end}
      />
      <SeasonalDecor />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <ModernBackButton onPress={() => navigation.goBack()} size="md" />
          <View style={styles.headerPills}>
            <View style={styles.modePill}>
              <FunIcon name="party" size={16} />
              <Text style={styles.pillText}>{t('partyMode', 'Party')}</Text>
            </View>
            {variant === 'drinks' && (
              <View style={[styles.modePill, styles.drinksPill]}>
                <FunIcon name="drinks" size={16} />
                <Text style={styles.pillText}>{t('drinksTitle', 'Drinks')}</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => setRulesOpen(true)}
              style={styles.rulesBtn}
              accessibilityRole="button"
              accessibilityLabel={t('howToPlay', 'How to play')}
            >
              <Text style={styles.rulesBtnText}>?</Text>
            </TouchableOpacity>
          </View>
        </View>

        {phase === 'setup' ? (
          <ScrollView
            contentContainerStyle={[styles.content, { maxWidth: cardMaxWidth + 48 }]}
            keyboardShouldPersistTaps="handled"
          >
            <FunIcon name={variant === 'drinks' ? 'drinks' : 'party'} size={72} style={styles.heroEmoji} />
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
                  ? t('timerOn', `${TIMER_SECONDS}s timer on`)
                  : t('timerOff', 'Timer off (default)')}
              </Text>
              <Text style={styles.toggleHint}>
                {t('timerSettingsHint', 'Also in Settings — stays off unless you turn it on.')}
              </Text>
            </TouchableOpacity>

            <View style={styles.muteHintRow}>
              <FunIcon name="mute" size={18} />
              <Text style={styles.muteHint}>
                {t('muteHintShort', 'Passing the phone around? Turn on Do Not Disturb first.')}
              </Text>
            </View>

            <ChunkyButton
              icon="party"
              title={t('startParty', 'Start party')}
              disabled={players.length < 2}
              onPress={startGame}
              style={styles.startBtn}
            />
            <TouchableOpacity onPress={inviteFriends} style={styles.inviteBtn} accessibilityRole="button">
              <FunIcon name="invite" size={18} />
              <Text style={styles.inviteText}>{t('inviteFriends', 'Invite friends to play')}</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { maxWidth: cardMaxWidth + 48 },
              isWide && { flexGrow: 1, justifyContent: 'center' },
            ]}
          >
            <ConfettiBurst burstKey={burstKey} />
            <View style={styles.passRow}>
              <FunIcon name="mute" size={22} />
              <Text style={styles.passLabel}>{t('passPhoneTo', 'Pass the phone to')}</Text>
            </View>
            <View style={styles.playerChip}>
              <Text style={[styles.playerName, { fontSize: fs(32) }]}>{currentPlayer}</Text>
            </View>
            {deckLocked && (
              <View style={styles.sampleRow}>
                <FunIcon name="crown" size={16} />
                <Text style={styles.sampleText}>
                  {t('sampleLabel', 'Free sample')} · {Math.min(round, FREE_SAMPLE_CARDS)}/{FREE_SAMPLE_CARDS}
                </Text>
              </View>
            )}

            {variant === 'drinks' && (
              <View style={styles.drinksRule}>
                <FunIcon name="drinks" size={22} />
                <Text style={styles.drinksRuleText}>
                  {t('drinksRule', 'Don’t want to answer? Take a sip. Soft drinks count.')}
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
                <View style={styles.cardBandLeft}>
                  <FunIcon name={cardMeta.icon} size={22} />
                  <Text style={styles.cardBandText}>{cardMeta.label}</Text>
                </View>
                <Text style={styles.cardNumber}>
                  {t('cardLabel', 'Card')} #{round}
                </Text>
              </LinearGradient>
              <Text style={[styles.promptText, { fontSize: fs(22), lineHeight: fs(31) }]}>{prompt}</Text>
            </Animated.View>

            {variant === 'drinks' && <DrinkTally fixedPlayers={players} highlight={currentPlayer} t={t} />}

            {timerOn && (
              <Text style={[styles.timer, secondsLeft === 0 && styles.timerDone]}>
                {secondsLeft === 0 ? t('timesUp', "Time's up!") : `${secondsLeft}s`}
              </Text>
            )}

            <ChunkyButton
              title={t('nextPlayer', 'Next player')}
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

      <AdModal visible={adBreak} kind="break" t={t} onClose={() => setAdBreak(false)} />

      <RulesSheet
        visible={rulesOpen}
        mode="party"
        variant={variant}
        title={t('partyMode', 'Party')}
        language={language}
        t={t}
        onStart={() => {
          track('rules_start', { gameMode: 'party', variant });
          setRulesOpen(false);
        }}
        onClose={() => {
          setRulesOpen(false);
          if (phase === 'setup') navigation.goBack();
        }}
      />
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
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  drinksPill: {
    backgroundColor: 'rgba(255,212,59,0.28)',
    borderColor: 'rgba(255,212,59,0.7)',
  },
  pillText: {
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.weights.semibold,
    fontSize: tokens.typography.sizes.sm,
  },
  content: { padding: 24, alignItems: 'center', paddingBottom: 48, width: '100%', alignSelf: 'center' },
  rulesBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFD43B',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#E0A800',
  },
  rulesBtnText: { color: '#5C3B00', fontWeight: '900', fontSize: 18 },
  inviteBtn: { marginTop: 18, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  muteHintRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 },
  muteHint: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
  inviteText: { color: '#fff', fontWeight: '800', fontSize: 15, textDecorationLine: 'underline' },
  sampleText: { color: '#FFE08A', fontWeight: '900', fontSize: 12, marginBottom: 10 },
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
  heroEmoji: { marginBottom: 8, alignSelf: 'center' },
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFD43B',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
    borderBottomWidth: 3,
    borderBottomColor: '#E0A800',
  },
  drinksRuleText: { flex: 1, color: '#5C3B00', fontSize: 13, fontWeight: '800' },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  sampleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  cardBandLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
