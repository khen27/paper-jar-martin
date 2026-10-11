import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FunIcon from './FunIcon';
import ChunkyButton from './ChunkyButton';
import { useResponsive } from '../utils/responsive';
import { track } from '../utils/analytics';

// House ads shown until a real ad network (AdMob on native, AdSense/GAM on web) is connected.
const HOUSE_ADS = [
  { icon: 'crown', colors: ['#7C3AED', '#DB2777'], key: 'houseAdPremium', fallback: 'Talk Trap Premium: every pack, every skin. Free trial while we’re in beta.' },
  { icon: 'invite', colors: ['#EC4899', '#F97316'], key: 'houseAdInvite', fallback: 'Game night is better with more people. Send your crew an invite link!' },
  { icon: 'halloween', colors: ['#2A0E45', '#E8590C'], key: 'houseAdSeason', fallback: 'Seasonal packs are here: Halloween, Fall and soon Christmas.' },
  { icon: 'custom', colors: ['#0891B2', '#22D3EE'], key: 'houseAdCustom', fallback: 'Write your own cards: inside jokes welcome.' },
];

/**
 * Simulated ad. `kind="rewarded"`: watch to the end to get `onReward`.
 * `kind="break"`: short ad break, skippable after 5 seconds.
 */
const AdModal = ({ visible, kind = 'rewarded', seconds = 15, rewardLabel, t, onReward, onClose }) => {
  const { isWide } = useResponsive();
  const duration = kind === 'break' ? Math.min(seconds, 8) : seconds;
  const [left, setLeft] = useState(duration);
  const ad = useMemo(() => HOUSE_ADS[Math.floor(Math.random() * HOUSE_ADS.length)], [visible]);

  useEffect(() => {
    if (!visible) return undefined;
    setLeft(duration);
    track('ad_started', { kind });
    const id = setInterval(() => setLeft((s) => (s <= 1 ? (clearInterval(id), 0) : s - 1)), 1000);
    return () => clearInterval(id);
  }, [visible]);

  const done = left === 0;
  const canSkip = kind === 'break' && duration - left >= 5;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, isWide && styles.cardWide]}>
          <View style={styles.topRow}>
            <Text style={styles.adTag}>{t('adLabel', 'Ad')}</Text>
            <Text style={styles.timer}>{done ? '✓' : `${left}s`}</Text>
          </View>
          <LinearGradient colors={ad.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.creative}>
            <FunIcon name={ad.icon} size={96} />
            <Text style={styles.creativeText}>{t(ad.key, ad.fallback)}</Text>
          </LinearGradient>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((duration - left) / duration) * 100}%` }]} />
          </View>

          {kind === 'rewarded' ? (
            done ? (
              <ChunkyButton
                title={`🎁 ${rewardLabel || t('adClaim', 'Claim reward')}`}
                onPress={() => {
                  track('ad_rewarded');
                  onReward && onReward();
                }}
                style={styles.cta}
              />
            ) : (
              <Text style={styles.hint}>{t('adWatchToEnd', 'Watch to the end to get your reward.')}</Text>
            )
          ) : (
            <ChunkyButton
              title={done || canSkip ? `${t('adContinue', 'Back to the game')} 👉` : `${t('adSkipIn', 'Skip in')} ${Math.max(0, 5 - (duration - left))}s`}
              disabled={!(done || canSkip)}
              onPress={onClose}
              style={styles.cta}
            />
          )}

          {kind === 'rewarded' && (
            <Pressable onPress={onClose} style={styles.close} accessibilityRole="button">
              <Text style={styles.closeText}>{done ? t('back', 'Back') : t('adCloseNoReward', 'Close (no reward)')}</Text>
            </Pressable>
          )}
          <Text style={styles.placeholder}>{t('adPlaceholderNote', 'Preview ad: real sponsors will appear here later.')}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10,6,30,0.8)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 440, backgroundColor: '#1E1638', borderRadius: 28, padding: 18 },
  cardWide: { maxWidth: 560 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  adTag: {
    color: '#1E1638',
    backgroundColor: '#FFD43B',
    fontWeight: '900',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  timer: { color: '#fff', fontWeight: '900', fontSize: 14 },
  creative: { borderRadius: 22, padding: 24, alignItems: 'center', minHeight: 240, justifyContent: 'center' },
  creativeText: { color: '#fff', fontWeight: '900', fontSize: 20, textAlign: 'center', marginTop: 14, lineHeight: 27 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', marginTop: 14, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: '#FFD43B' },
  cta: { marginTop: 16 },
  hint: { color: 'rgba(255,255,255,0.75)', textAlign: 'center', fontWeight: '700', marginTop: 16 },
  close: { alignSelf: 'center', padding: 10, marginTop: 4 },
  closeText: { color: 'rgba(255,255,255,0.6)', fontWeight: '700' },
  placeholder: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', marginTop: 6 },
});

export default AdModal;
