import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import FunIcon from './FunIcon';
import ChunkyButton from './ChunkyButton';
import { track } from '../utils/analytics';

const Chip = ({ name, count, active, onAdd, onRemove }) => {
  const pop = useRef(new Animated.Value(1)).current;
  const add = () => {
    pop.setValue(1.25);
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }).start();
    onAdd();
  };
  return (
    <Pressable
      onPress={add}
      onLongPress={onRemove}
      accessibilityRole="button"
      accessibilityLabel={`${name} ${count}`}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipName, active && styles.chipNameActive]} numberOfLines={1}>
        {name}
      </Text>
      <Animated.View style={[styles.countBubble, { transform: [{ scale: pop }] }]}>
        <Text style={styles.countText}>{count}</Text>
      </Animated.View>
    </Pressable>
  );
};

/**
 * Sip counter for Drinks mode. Tap a player = +1, long-press = −1.
 * `fixedPlayers` comes from Party setup; otherwise players are added here.
 */
const DrinkTally = ({ fixedPlayers, highlight, t, defaultPlayers = [] }) => {
  const [players, setPlayers] = useState(fixedPlayers || defaultPlayers);
  const [counts, setCounts] = useState({});
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (fixedPlayers) setPlayers(fixedPlayers);
  }, [fixedPlayers]);

  const bump = (name, delta) => {
    setCounts((c) => ({ ...c, [name]: Math.max(0, (c[name] || 0) + delta) }));
    if (delta > 0) track('drink_tallied');
  };

  const addPlayer = () => {
    const name = draft.trim();
    if (name && !players.includes(name) && players.length < 10) setPlayers((p) => [...p, name]);
    setDraft('');
    setAdding(false);
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const ranking = [...players].sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
  const top = counts[ranking[0]] || 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <FunIcon name="cheers" size={26} />
        <Text style={styles.title}>{t('tallyTitle', 'Sip tally')}</Text>
        <Text style={styles.total}>
          {total} 🍻
        </Text>
        {players.length > 0 && (
          <Pressable onPress={() => setShowResults(true)} style={styles.resultsBtn} accessibilityRole="button">
            <FunIcon name="trophy" size={20} />
          </Pressable>
        )}
      </View>

      <View style={styles.chips}>
        {players.map((name) => (
          <Chip
            key={name}
            name={name}
            count={counts[name] || 0}
            active={name === highlight}
            onAdd={() => bump(name, 1)}
            onRemove={() => bump(name, -1)}
          />
        ))}
        {!fixedPlayers &&
          (adding ? (
            <TextInput
              autoFocus
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={addPlayer}
              onBlur={addPlayer}
              placeholder={t('playerNamePlaceholder', 'Player name')}
              placeholderTextColor="rgba(255,255,255,0.5)"
              maxLength={16}
              style={styles.input}
            />
          ) : (
            <Pressable onPress={() => setAdding(true)} style={styles.addChip} accessibilityRole="button">
              <Text style={styles.addChipText}>＋ {t('tallyAddPlayer', 'Player')}</Text>
            </Pressable>
          ))}
      </View>
      <Text style={styles.help}>{t('tallyHelp', 'Tap a name = +1 sip · hold = −1 · soft drinks count too 🥤')}</Text>

      <Modal visible={showResults} transparent animationType="fade" onRequestClose={() => setShowResults(false)}>
        <View style={styles.backdrop}>
          <View style={styles.resultsCard}>
            <FunIcon name="trophy" size={72} style={styles.trophy} />
            <Text style={styles.resultsTitle}>{t('tallyResults', 'Tonight’s sip tally')}</Text>
            <ScrollView style={styles.resultsList}>
              {ranking.map((name, i) => {
                const n = counts[name] || 0;
                const badge =
                  n > 0 && n === top
                    ? t('tallyChampion', '🏆 Sip champion')
                    : n === 0
                      ? t('tallyHero', '😇 Hydration hero')
                      : '';
                return (
                  <View key={name} style={styles.resultRow}>
                    <Text style={styles.rank}>{i + 1}.</Text>
                    <Text style={styles.resultName} numberOfLines={1}>
                      {name}
                    </Text>
                    {!!badge && <Text style={styles.badge}>{badge}</Text>}
                    <Text style={styles.resultCount}>{n}</Text>
                  </View>
                );
              })}
            </ScrollView>
            <Text style={styles.resultsNote}>
              {t('tallyNote', 'Drink water too. Nobody drives after drinking: plan a ride home.')}
            </Text>
            <ChunkyButton title={t('tallyKeepPlaying', 'Keep playing')} onPress={() => setShowResults(false)} />
            <Pressable
              onPress={() => {
                setCounts({});
                setShowResults(false);
              }}
              style={styles.reset}
            >
              <Text style={styles.resetText}>{t('tallyReset', 'Reset tally')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  title: { color: '#fff', fontWeight: '900', fontSize: 15, flex: 1 },
  total: { color: '#FFE08A', fontWeight: '900', fontSize: 14 },
  resultsBtn: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, padding: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.15)',
    maxWidth: 180,
  },
  chipActive: { backgroundColor: '#FFD43B', borderBottomColor: '#E0A800' },
  chipName: { color: '#22163F', fontWeight: '800', fontSize: 14, marginRight: 8, flexShrink: 1 },
  chipNameActive: { color: '#5C3B00' },
  countBubble: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F08A00',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  addChip: {
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  addChipText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  input: {
    minWidth: 120,
    color: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
    paddingVertical: 4,
    fontSize: 14,
    fontWeight: '700',
  },
  help: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', marginTop: 8 },
  backdrop: { flex: 1, backgroundColor: 'rgba(10,6,30,0.7)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  resultsCard: { width: '100%', maxWidth: 420, backgroundColor: '#1E1638', borderRadius: 28, padding: 20 },
  trophy: { alignSelf: 'center' },
  resultsTitle: { color: '#fff', fontWeight: '900', fontSize: 22, textAlign: 'center', marginVertical: 10 },
  resultsList: { maxHeight: 280, marginBottom: 10 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 6,
  },
  rank: { color: 'rgba(255,255,255,0.6)', fontWeight: '900', width: 24 },
  resultName: { color: '#fff', fontWeight: '800', flex: 1 },
  badge: { color: '#FFE08A', fontWeight: '800', fontSize: 12, marginRight: 8 },
  resultCount: { color: '#fff', fontWeight: '900', fontSize: 16 },
  resultsNote: { color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center', marginBottom: 12 },
  reset: { alignSelf: 'center', padding: 10 },
  resetText: { color: 'rgba(255,255,255,0.6)', fontWeight: '700' },
});

export default DrinkTally;
