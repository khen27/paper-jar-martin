import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModernBackButton, AppDialog } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../translations';
import FunIcon from '../components/FunIcon';
import AdModal from '../components/AdModal';
import SeasonalDecor from '../components/SeasonalDecor';
import {
  isSkinUnlocked,
  grantAdUnlock,
  skinAdKey,
  adUnlockRemaining,
  hasPremium,
  AD_UNLOCK_SKIN_MS,
} from '../utils/entitlements';
import { track } from '../utils/analytics';

const ThemeCard = ({ theme, selected, locked, badge, onPress, label }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={[styles.card, selected && styles.cardSelected]}
    accessibilityRole="button"
    accessibilityState={{ selected }}
  >
    <LinearGradient colors={theme.colors} start={theme.start} end={theme.end} style={styles.preview}>
      {theme.decor && (
        <View style={styles.previewDecor}>
          {theme.decor.slice(0, 3).map((d) => (
            <FunIcon key={d} name={d} size={30} />
          ))}
        </View>
      )}
      {locked && (
        <View style={styles.lockBadge}>
          <FunIcon name="crown" size={22} />
        </View>
      )}
      {selected && (
        <View style={styles.check}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
    </LinearGradient>
    <Text style={styles.name}>{label}</Text>
    {!!badge && <Text style={styles.badge}>{badge}</Text>}
  </TouchableOpacity>
);

const ColorScreen = ({ navigation }) => {
  const { currentTheme, allThemes, changeTheme, getCurrentGradient } = useTheme();
  const { language } = useLanguage();
  const { settings, updateSettings } = useSettings();
  const t = (key, fallback) => translations[language]?.[key] || fallback;
  const [lockedTheme, setLockedTheme] = useState(null);
  const [adFor, setAdFor] = useState(null);
  const g = getCurrentGradient();
  const basic = allThemes.filter((th) => !th.premium);
  const skins = allThemes.filter((th) => th.premium);

  const pick = (theme) => {
    if (isSkinUnlocked(theme, settings)) {
      changeTheme(theme.id);
      if (theme.premium) track('skin_applied', { skin: theme.id });
    } else {
      setLockedTheme(theme);
    }
  };

  const skinLabel = (theme) => t(`skin_${theme.id}`, theme.name);

  const skinBadge = (theme) => {
    if (hasPremium(settings)) return null;
    const ms = adUnlockRemaining(settings, skinAdKey(theme.id));
    return ms > 0 ? `🎬 ${Math.ceil(ms / 3600000)} h` : null;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={g.colors} start={g.start} end={g.end} style={StyleSheet.absoluteFill} />
      <SeasonalDecor />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <ModernBackButton onPress={() => navigation.goBack()} />
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('themeTitle', 'Choose your look')}</Text>
          <Text style={styles.subtitle}>{t('themeSubtitle', 'Pick a color or a seasonal skin.')}</Text>

          <View style={styles.sectionHead}>
            <FunIcon name="crown" size={28} />
            <Text style={styles.sectionTitle}>{t('premiumSkins', 'Premium skins')}</Text>
          </View>
          <Text style={styles.sectionSub}>
            {t('premiumSkinsSub', 'Seasonal backgrounds with floating decorations. Free with the Premium trial, or watch an ad to try one for 24 hours.')}
          </Text>
          <View style={styles.grid}>
            {skins.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                label={skinLabel(theme)}
                selected={currentTheme.id === theme.id}
                locked={!isSkinUnlocked(theme, settings)}
                badge={skinBadge(theme)}
                onPress={() => pick(theme)}
              />
            ))}
          </View>

          <Text style={[styles.sectionTitle, styles.colorsTitle]}>🎨 {t('colorThemes', 'Colors')}</Text>
          <View style={styles.grid}>
            {basic.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                label={t(`theme_${theme.id}`, theme.name)}
                selected={currentTheme.id === theme.id}
                onPress={() => pick(theme)}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <AppDialog
        visible={!!lockedTheme}
        title={lockedTheme ? `👑 ${skinLabel(lockedTheme)}` : ''}
        message={t('skinLockedMsg', 'This skin is part of Premium. Start the free trial to unlock every skin, or watch a short ad to use it for 24 hours.')}
        buttons={[
          {
            text: t('startTrial', 'Start free trial'),
            onPress: () => {
              setLockedTheme(null);
              navigation.navigate('Upgrade', { upgradeReason: 'skin' });
            },
          },
          {
            text: `🎬 ${t('watchAdSkin', 'Watch an ad: 24 h')}`,
            onPress: () => {
              const theme = lockedTheme;
              setLockedTheme(null);
              setTimeout(() => setAdFor(theme), 300);
            },
          },
          { text: t('cancel', 'Cancel'), style: 'cancel' },
        ]}
        onRequestClose={() => setLockedTheme(null)}
      />

      <AdModal
        visible={!!adFor}
        kind="rewarded"
        t={t}
        rewardLabel={t('adRewardSkin', 'Unlock skin for 24 h')}
        onReward={() => {
          const theme = adFor;
          updateSettings(grantAdUnlock(settings, skinAdKey(theme.id), AD_UNLOCK_SKIN_MS));
          changeTheme(theme.id);
          setAdFor(null);
        }}
        onClose={() => setAdFor(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 8 },
  content: { paddingHorizontal: 20, paddingBottom: 48 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600', textAlign: 'center', marginTop: 4, marginBottom: 22 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  colorsTitle: { marginTop: 10, marginBottom: 12 },
  sectionSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginTop: 4, marginBottom: 12, lineHeight: 19 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 22,
    padding: 8,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  cardSelected: { borderColor: '#fff' },
  preview: { height: 86, borderRadius: 16, overflow: 'hidden', justifyContent: 'center' },
  previewDecor: { flexDirection: 'row', justifyContent: 'space-around', opacity: 0.9 },
  lockBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
    padding: 3,
  },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: '#22163F', fontWeight: '900' },
  name: { color: '#fff', fontWeight: '800', fontSize: 15, textAlign: 'center', marginTop: 8 },
  badge: { color: '#FFE08A', fontWeight: '800', fontSize: 12, textAlign: 'center', marginTop: 2 },
});

export default ColorScreen;
