import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../translations';
import { ModernBackButton } from '../components/ui';
import ChunkyButton from '../components/ChunkyButton';
import { getCardTypeMeta } from '../utils/cardTypes';
import { CUSTOM_TYPES, loadCustomCards, saveCustomCards } from '../utils/customCards';
import { customCardsLimit } from '../utils/entitlements';
import { track } from '../utils/analytics';

const MAX_LEN = 160;

const CustomCardsScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { getCurrentGradient } = useTheme();
  const { settings } = useSettings();
  const t = (key, fallback) => translations[language]?.[key] || fallback;
  const [cards, setCards] = useState([]);
  const [draft, setDraft] = useState('');
  const [type, setType] = useState('questions');
  const limit = customCardsLimit(settings);
  const g = getCurrentGradient();

  useEffect(() => {
    loadCustomCards().then(setCards);
  }, []);

  const addCard = async () => {
    const text = draft.trim();
    if (!text) return;
    if (cards.length >= limit) {
      navigation.navigate('Upgrade', { upgradeReason: 'custom' });
      return;
    }
    const next = [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, text }, ...cards];
    setCards(await saveCustomCards(next));
    setDraft('');
    track('custom_card_added', { type, total: next.length });
  };

  const removeCard = async (id) => {
    setCards(await saveCustomCards(cards.filter((c) => c.id !== id)));
  };

  const play = () => {
    track('custom_deck_played', { total: cards.length });
    navigation.navigate('Game', { gameMode: 'custom', variant: 'classic' });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={g.colors} start={g.start} end={g.end} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <ModernBackButton onPress={() => navigation.goBack()} size="md" />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.hero}>✍️</Text>
          <Text style={styles.title}>{t('customTitle', 'Your cards')}</Text>
          <Text style={styles.subtitle}>
            {t('customSubtitle', 'Write inside jokes, questions for your crew or dares for tonight. Saved on this device only.')}
          </Text>

          <View style={styles.editor}>
            <View style={styles.typeRow}>
              {CUSTOM_TYPES.map((ct) => {
                const meta = getCardTypeMeta(ct, 'classic', language);
                const active = ct === type;
                return (
                  <TouchableOpacity
                    key={ct}
                    onPress={() => setType(ct)}
                    style={[styles.typeChip, active && { backgroundColor: meta.colors[0], borderColor: meta.colors[1] }]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                      {meta.emoji} {meta.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder={t('customPlaceholder', 'e.g. What was the funniest moment of our last trip?')}
              placeholderTextColor="rgba(34,22,63,0.4)"
              maxLength={MAX_LEN}
              multiline
              onSubmitEditing={addCard}
              blurOnSubmit
            />
            <View style={styles.editorFooter}>
              <Text style={styles.counter}>
                {draft.length}/{MAX_LEN}
              </Text>
              <TouchableOpacity
                onPress={addCard}
                disabled={!draft.trim()}
                style={[styles.addBtn, !draft.trim() && styles.addBtnDisabled]}
                accessibilityRole="button"
              >
                <Text style={styles.addBtnText}>＋ {t('customAdd', 'Add card')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ChunkyButton
            title={`🎲 ${t('customPlay', 'Play my cards')} (${cards.length})`}
            disabled={cards.length === 0}
            onPress={play}
            style={styles.playBtn}
          />
          {limit !== Infinity && (
            <Text style={styles.limitText}>
              {cards.length}/{limit} {t('customFreeLimit', 'free cards · 👑 Premium = unlimited')}
            </Text>
          )}

          {cards.length === 0 ? (
            <Text style={styles.empty}>{t('customEmpty', 'No cards yet. Add your first one above 👆')}</Text>
          ) : (
            cards.map((c) => {
              const meta = getCardTypeMeta(c.type, 'classic', language);
              return (
                <View key={c.id} style={styles.cardRow}>
                  <View style={[styles.cardStripe, { backgroundColor: meta.colors[0] }]} />
                  <Text style={styles.cardEmoji}>{meta.emoji}</Text>
                  <Text style={styles.cardText}>{c.text}</Text>
                  <TouchableOpacity
                    onPress={() => removeCard(c.id)}
                    style={styles.deleteBtn}
                    accessibilityRole="button"
                    accessibilityLabel={t('delete', 'Delete')}
                  >
                    <Text style={styles.deleteText}>×</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 8 },
  content: { padding: 24, paddingTop: 0, paddingBottom: 60, alignItems: 'center' },
  hero: { fontSize: 52 },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 4 },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 6,
    marginBottom: 20,
  },
  editor: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(34,22,63,0.12)',
    backgroundColor: 'rgba(34,22,63,0.05)',
  },
  typeChipText: { color: '#22163F', fontWeight: '800', fontSize: 13 },
  typeChipTextActive: { color: '#fff' },
  input: {
    minHeight: 84,
    color: '#22163F',
    fontSize: 18,
    fontWeight: '700',
    textAlignVertical: 'top',
    padding: 4,
  },
  editorFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  counter: { color: 'rgba(34,22,63,0.45)', fontWeight: '700', fontSize: 12 },
  addBtn: { backgroundColor: '#7C5CFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16 },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  playBtn: { width: '100%', marginTop: 20 },
  limitText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '700', marginTop: 10 },
  empty: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', marginTop: 24, fontSize: 15 },
  cardRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingRight: 8,
    marginTop: 12,
    overflow: 'hidden',
  },
  cardStripe: { width: 6, alignSelf: 'stretch', marginRight: 10 },
  cardEmoji: { fontSize: 20, marginRight: 8 },
  cardText: { flex: 1, color: '#22163F', fontWeight: '700', fontSize: 15, lineHeight: 21 },
  deleteBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  deleteText: { color: 'rgba(34,22,63,0.4)', fontSize: 26, fontWeight: '700' },
});

export default CustomCardsScreen;
