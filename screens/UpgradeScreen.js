import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../translations';
import { ModernBackButton, AppDialog } from '../components/ui';
import ChunkyButton from '../components/ChunkyButton';
import { PLANS, hasPremium, PAYMENTS_LIVE, grantAdUnlock, deckAdKey, AD_UNLOCK_DECK_MS } from '../utils/entitlements';
import { useTheme } from '../contexts/ThemeContext';
import FunIcon from '../components/FunIcon';
import AdModal from '../components/AdModal';
import SeasonalDecor from '../components/SeasonalDecor';
import { track } from '../utils/analytics';

const BENEFITS = [
  { icon: 'adult', key: 'benefitAdult', fallback: 'Adult Fun, Workout & Office packs' },
  { icon: 'drinks', key: 'benefitDrinks', fallback: 'Every Drinks edition' },
  { icon: 'halloween', key: 'benefitSkins', fallback: 'Seasonal skins: Halloween, Fall, Winter' },
  { icon: 'partner', key: 'benefitFavorites', fallback: 'Unlimited favorites' },
  { icon: 'custom', key: 'benefitCustom', fallback: 'Unlimited custom cards' },
  { icon: 'gift', key: 'benefitNew', fallback: 'New seasonal packs all year' },
];

const HEADLINES = {
  pack: ['upgradeHeadlinePack', 'Loving it? Unlock the full deck'],
  favorites: ['upgradeHeadlineFavorites', 'Keep every card you love'],
  custom: ['upgradeHeadlineCustom', 'Write as many cards as you want'],
  skin: ['upgradeHeadlineSkin', 'Dress Talk Trap up for the season'],
};

const UpgradeScreen = ({ navigation, route }) => {
  const { language } = useLanguage();
  const { settings, updateSettings } = useSettings();
  const { getCurrentGradient } = useTheme();
  const g = getCurrentGradient();
  const [adOpen, setAdOpen] = useState(false);
  const adMode = route?.params?.gameMode;
  const adVariant = route?.params?.variant || 'classic';
  const t = (key, fallback) => translations[language]?.[key] || fallback;
  const reason = route?.params?.upgradeReason || 'general';
  const [plan, setPlan] = useState('yearly');
  const [dialog, setDialog] = useState(null);
  const crown = useRef(new Animated.Value(0)).current;
  const isPremium = hasPremium(settings);
  const [headKey, headFallback] = HEADLINES[reason] || ['upgradeHeadline', 'Talk Trap Premium'];
  const selected = PLANS.find((p) => p.id === plan);

  useEffect(() => {
    track('paywall_viewed', { reason });
    Animated.loop(
      Animated.sequence([
        Animated.timing(crown, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(crown, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const price = (p) => (language === 'cs' ? p.price : p.priceEn);

  const purchase = () => {
    track(PAYMENTS_LIVE ? 'paywall_purchase' : 'paywall_free_trial', { plan, reason });
    updateSettings({ premiumUnlocked: true, premiumPlan: plan });
    setDialog({
      title: t('premiumWelcome', 'Welcome to Premium! 👑'),
      message: t(
        'trialStartedMessage',
        'Your free trial is on. Every pack and skin is open on this device, and nothing is charged: we’ll let you know well before Premium starts costing money.'
      ),
      buttons: [{ text: t('startPlaying', 'Start playing'), onPress: () => navigation.goBack() }],
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={g.colors} start={g.start} end={g.end} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.shade]} />
      <SeasonalDecor />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <ModernBackButton onPress={() => navigation.goBack()} size="md" />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View
            style={[
              styles.crown,
              { transform: [{ translateY: crown.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }] },
            ]}
          >
            <FunIcon name="crown" size={84} />
          </Animated.View>
          <Text style={styles.eyebrow}>Talk Trap Premium</Text>
          {!PAYMENTS_LIVE && !isPremium && (
            <View style={styles.betaPill}>
              <Text style={styles.betaText}>🎁 {t('betaFreeTrial', 'Free trial for everyone while we’re in beta')}</Text>
            </View>
          )}
          <Text style={styles.title}>{t(headKey, headFallback)}</Text>

          <View style={styles.benefits}>
            {BENEFITS.map((b) => (
              <View key={b.key} style={styles.benefitRow}>
                <FunIcon name={b.icon} size={30} style={styles.benefitIcon} />
                <Text style={styles.benefitText}>{t(b.key, b.fallback)}</Text>
              </View>
            ))}
          </View>

          {isPremium ? (
            <View style={styles.premiumBox}>
              <Text style={styles.premiumText}>✅ {t('youArePremium', 'You have Premium on this device.')}</Text>
              <TouchableOpacity
                onPress={() => updateSettings({ premiumUnlocked: false, premiumPlan: null })}
                style={styles.linkBtn}
              >
                <Text style={styles.linkText}>{t('disableTestPremium', 'Turn off test Premium')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.plans}>
                {PLANS.map((p) => {
                  const active = p.id === plan;
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => setPlan(p.id)}
                      style={[styles.plan, active && styles.planActive]}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                    >
                      {p.popular && (
                        <View style={styles.popular}>
                          <Text style={styles.popularText}>{t('mostPopular', 'Most popular')}</Text>
                        </View>
                      )}
                      <Text style={[styles.planName, active && styles.planNameActive]}>
                        {t(`plan_${p.id}`, p.id[0].toUpperCase() + p.id.slice(1))}
                      </Text>
                      <Text style={[styles.planPrice, active && styles.planNameActive]}>{price(p)}</Text>
                      <Text style={[styles.planPeriod, active && styles.planPeriodActive]}>
                        {t(p.periodKey, p.periodFallback)}
                      </Text>
                      {!PAYMENTS_LIVE ? (
                        <Text style={[styles.trial, active && styles.trialActive]}>{t('freeInBeta', 'free in beta')}</Text>
                      ) : p.trialDays ? (
                        <Text style={[styles.trial, active && styles.trialActive]}>
                          {p.trialDays} {t('trialDaysFree', 'days free')}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              <ChunkyButton
                title={
                  !PAYMENTS_LIVE || selected?.trialDays
                    ? `${t('startTrial', 'Start free trial')} 🎉`
                    : `${t('continue', 'Continue')} 👑`
                }
                onPress={purchase}
                style={styles.cta}
              />
              <Text style={styles.fineprint}>
                {!PAYMENTS_LIVE
                  ? t('betaFineprint', 'No card needed. Prices above apply only after launch, and we’ll ask before charging anything.')
                  : selected?.trialDays
                    ? t('trialFineprint', '3 days free, then the yearly price. Cancel anytime before the trial ends.')
                    : t('cancelAnytime', 'Cancel anytime.')}
              </Text>
              {reason === 'pack' && adMode && (
                <TouchableOpacity onPress={() => setAdOpen(true)} style={styles.adBtn} accessibilityRole="button">
                  <FunIcon name="ad" size={30} />
                  <Text style={styles.adBtnText}>{t('watchAdPack', 'Or watch a short ad: play this pack free for 1 hour')}</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <Text style={styles.proof}>
            🇨🇿 {t('madeInBrno', 'Made in Brno · new cards every month · no ads')}
          </Text>

          <View style={styles.footerLinks}>
            <TouchableOpacity
              onPress={() =>
                setDialog({
                  title: t('restorePurchases', 'Restore purchases'),
                  message: t('restoreNothing', 'No previous purchases found on this account yet.'),
                  buttons: [{ text: 'OK' }],
                })
              }
              style={styles.linkBtn}
            >
              <Text style={styles.linkText}>{t('restorePurchases', 'Restore purchases')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Legal')} style={styles.linkBtn}>
              <Text style={styles.linkText}>{t('legalLink', 'Terms & Privacy')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <AdModal
        visible={adOpen}
        kind="rewarded"
        t={t}
        rewardLabel={t('adRewardPack', 'Unlock for 1 hour')}
        onReward={() => {
          updateSettings(grantAdUnlock(settings, deckAdKey(adMode, adVariant), AD_UNLOCK_DECK_MS));
          setAdOpen(false);
          navigation.goBack();
        }}
        onClose={() => setAdOpen(false)}
      />

      <AppDialog
        visible={!!dialog}
        title={dialog?.title}
        message={dialog?.message}
        buttons={dialog?.buttons}
        onRequestClose={() => setDialog(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 8 },
  content: { paddingHorizontal: 24, paddingBottom: 48, alignItems: 'center' },
  crown: { marginTop: 4 },
  shade: { backgroundColor: 'rgba(15,8,40,0.35)' },
  betaPill: { backgroundColor: '#FFD43B', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5, marginTop: 8 },
  betaText: { color: '#5C3B00', fontWeight: '900', fontSize: 12 },
  benefitIcon: { marginRight: 10 },
  adBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  adBtnText: { color: '#fff', fontWeight: '800', fontSize: 14, flex: 1 },
  eyebrow: {
    color: '#FFD43B',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  benefits: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    padding: 16,
    gap: 10,
    marginBottom: 22,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center' },
  benefitText: { color: '#fff', fontWeight: '700', fontSize: 16, flex: 1 },
  plans: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 20 },
  plan: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  planActive: { backgroundColor: '#fff', borderColor: '#FFD43B', borderWidth: 3, transform: [{ scale: 1.04 }] },
  popular: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#FFD43B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  popularText: { color: '#5C3B00', fontWeight: '900', fontSize: 10, textTransform: 'uppercase' },
  planName: { color: '#fff', fontWeight: '800', fontSize: 14, marginTop: 4 },
  planNameActive: { color: '#22163F' },
  planPrice: { color: '#fff', fontWeight: '900', fontSize: 20, marginTop: 6 },
  planPeriod: { color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: 12 },
  planPeriodActive: { color: 'rgba(34,22,63,0.6)' },
  trial: { color: '#FFD43B', fontWeight: '900', fontSize: 12, marginTop: 6 },
  trialActive: { color: '#16A34A' },
  cta: { width: '100%' },
  fineprint: { color: 'rgba(255,255,255,0.75)', fontSize: 12, textAlign: 'center', marginTop: 10 },
  testNote: { color: '#FFE08A', fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  premiumBox: { width: '100%', backgroundColor: 'rgba(22,199,154,0.25)', borderRadius: 18, padding: 16, alignItems: 'center' },
  premiumText: { color: '#fff', fontWeight: '800', fontSize: 16, textAlign: 'center' },
  proof: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 13, marginTop: 22, textAlign: 'center' },
  footerLinks: { flexDirection: 'row', gap: 16, marginTop: 8 },
  linkBtn: { padding: 8 },
  linkText: { color: 'rgba(255,255,255,0.75)', fontWeight: '700', fontSize: 13, textDecorationLine: 'underline' },
});

export default UpgradeScreen;
