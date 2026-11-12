// Fake one-time paywall for the journey. Preview only: buying sets flags on the
// journey save (ownedSeasons / ownsAll) and never touches premiumUnlocked.

import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import FunIcon from '../components/FunIcon';
import { JourneyButton } from './ui';
import { jt } from './strings';
import { SEASONS, loc, seasonPriceLabel, allSeasonsPriceLabel } from './seasons';
import { track } from '../utils/analytics';

/**
 * context: 'gate' (night 8 wall) | 'album' (locked row) | 'recap' (next season) | 'home'
 * seasonId: the season the single-season offer applies to.
 */
const JourneyPaywall = ({ visible, context = 'gate', seasonId, ownsAll, onBuySeason, onBuyAll, onClose }) => {
  const { language } = useLanguage();
  const t = (key) => jt(language, key);
  const [selected, setSelected] = useState('season');
  const season = SEASONS[seasonId];

  React.useEffect(() => {
    if (visible) {
      setSelected('season');
      track('journey_paywall_viewed', { context, seasonId });
    }
  }, [visible]);

  if (!season) return null;

  const isNextSeason = context === 'recap' || context === 'home';
  const headline = isNextSeason ? loc(season.title, language) : t('paywallGateTitle');
  const sub = isNextSeason ? loc(season.tagline, language) : t('paywallGateSub');
  const seasonLabel = isNextSeason ? t('paywallNextSeason') : t('paywallThisSeason');

  const buy = () => {
    track('journey_purchase_preview', { sku: selected === 'all' ? 'allSeasons' : seasonId, context });
    if (selected === 'all') onBuyAll && onBuyAll();
    else onBuySeason && onBuySeason(seasonId);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <FunIcon name={season.icon} size={64} style={styles.icon} />
            <Text style={styles.eyebrow}>{t('paywallEyebrow')}</Text>
            <Text style={styles.title}>{headline}</Text>
            <Text style={styles.sub}>{sub}</Text>

            <View style={styles.benefits}>
              {['paywallBenefit1', 'paywallBenefit2', 'paywallBenefit3'].map((key) => (
                <View key={key} style={styles.benefitRow}>
                  <Text style={styles.benefitDot}>✓</Text>
                  <Text style={styles.benefitText}>{t(key)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.plans}>
              <Pressable
                onPress={() => setSelected('season')}
                style={[styles.plan, selected === 'season' && styles.planActive]}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected === 'season' }}
              >
                <Text style={[styles.planName, selected === 'season' && styles.planNameActive]}>{seasonLabel}</Text>
                <Text style={[styles.planPrice, selected === 'season' && styles.planNameActive]}>
                  {seasonPriceLabel(language)}
                </Text>
                <Text style={[styles.planPeriod, selected === 'season' && styles.planPeriodActive]}>
                  {t('paywallOneTime')}
                </Text>
              </Pressable>

              {!ownsAll && (
                <Pressable
                  onPress={() => setSelected('all')}
                  style={[styles.plan, selected === 'all' && styles.planActive]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected === 'all' }}
                >
                  <View style={styles.popular}>
                    <Text style={styles.popularText}>{t('paywallBestValue')}</Text>
                  </View>
                  <Text style={[styles.planName, selected === 'all' && styles.planNameActive]}>
                    {t('paywallAllSeasons')}
                  </Text>
                  <Text style={[styles.planPrice, selected === 'all' && styles.planNameActive]}>
                    {allSeasonsPriceLabel(language)}
                  </Text>
                  <Text style={[styles.planPeriod, selected === 'all' && styles.planPeriodActive]}>
                    {t('paywallOneTime')}
                  </Text>
                </Pressable>
              )}
            </View>

            <JourneyButton
              icon={selected === 'all' ? 'crown' : 'party'}
              title={selected === 'all' ? t('paywallAllSeasons') : seasonLabel}
              onPress={buy}
              variant="primary"
              style={styles.cta}
            />
            <Text style={styles.finePrint}>{t('paywallFinePrint')}</Text>

            {context === 'gate' && (
              <TouchableOpacity onPress={onClose} style={styles.keepFree} accessibilityRole="button">
                <Text style={styles.keepFreeText}>{t('paywallKeepFree')}</Text>
              </TouchableOpacity>
            )}
            {context !== 'gate' && (
              <TouchableOpacity onPress={onClose} style={styles.keepFree} accessibilityRole="button">
                <Text style={styles.keepFreeText}>{t('tonightBack')}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,6,30,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '92%',
    backgroundColor: '#1E1638',
    borderRadius: 28,
    overflow: 'hidden',
  },
  content: { padding: 22, alignItems: 'center' },
  icon: { marginTop: 4 },
  eyebrow: {
    color: '#FFD43B',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 10,
  },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center', marginTop: 6 },
  sub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  benefits: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 14,
    gap: 8,
    marginTop: 16,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center' },
  benefitDot: { color: '#FFD43B', fontWeight: '900', fontSize: 15, marginRight: 10 },
  benefitText: { color: '#fff', fontWeight: '700', fontSize: 14, flex: 1 },
  plans: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 18 },
  plan: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  planActive: { backgroundColor: '#fff', borderColor: '#FFD43B', borderWidth: 3 },
  popular: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#FFD43B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  popularText: { color: '#5C3B00', fontWeight: '900', fontSize: 10, textTransform: 'uppercase' },
  planName: { color: '#fff', fontWeight: '800', fontSize: 14, marginTop: 4, textAlign: 'center' },
  planNameActive: { color: '#22163F' },
  planPrice: { color: '#fff', fontWeight: '900', fontSize: 20, marginTop: 6 },
  planPeriod: { color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: 12, marginTop: 2 },
  planPeriodActive: { color: 'rgba(34,22,63,0.6)' },
  cta: { width: '100%', marginTop: 18 },
  finePrint: { color: 'rgba(255,255,255,0.65)', fontSize: 12, textAlign: 'center', marginTop: 10 },
  keepFree: { padding: 10, marginTop: 4 },
  keepFreeText: { color: 'rgba(255,255,255,0.75)', fontWeight: '700', fontSize: 14, textDecorationLine: 'underline' },
});

export default JourneyPaywall;
