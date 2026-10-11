import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModernCard, ModernBackButton } from '../components/ui';
import { tokens } from '../theme/tokens';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { getWebPlatform } from '../utils/install';

const Step = ({ number, text }) => (
  <View style={styles.stepRow}>
    <View style={styles.stepBadge}>
      <Text style={styles.stepNumber}>{number}</Text>
    </View>
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const InstallScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { getCurrentGradient } = useTheme();
  const t = (key, fallback) => translations[language]?.[key] || fallback;
  const platform = getWebPlatform();

  const iosSteps = [
    t('installIos1', 'Open Talk Trap in Safari'),
    t('installIos2', 'Tap the Share button (square with an arrow)'),
    t('installIos3', "Scroll down and tap 'Add to Home Screen'"),
  ];
  const androidSteps = [
    t('installAndroid1', 'Open Talk Trap in Chrome'),
    t('installAndroid2', 'Tap the ⋮ menu (top right)'),
    t('installAndroid3', "Tap 'Add to Home screen' or 'Install app'"),
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getCurrentGradient().colors}
        style={styles.backgroundGradient}
        start={getCurrentGradient().start}
        end={getCurrentGradient().end}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ModernBackButton onPress={() => navigation.goBack()} size="md" />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.emoji}>⭐</Text>
          <Text style={styles.title}>{t('installTitle', 'Unlock the Golden Jar')}</Text>
          <Text style={styles.subtitle}>
            {t(
              'installSubtitle',
              'Add Talk Trap to your home screen and get a free bonus pack of 20 questions — plus one-tap access anytime.'
            )}
          </Text>

          {(platform === 'ios' || platform === 'desktop' || platform === 'other') && (
            <ModernCard variant="surface" size="lg" style={styles.card}>
              <Text style={styles.cardTitle}> iPhone / iPad</Text>
              {iosSteps.map((text, i) => (
                <Step key={i} number={i + 1} text={text} />
              ))}
            </ModernCard>
          )}

          {(platform === 'android' || platform === 'desktop' || platform === 'other') && (
            <ModernCard variant="surface" size="lg" style={styles.card}>
              <Text style={styles.cardTitle}>🤖 Android</Text>
              {androidSteps.map((text, i) => (
                <Step key={i} number={i + 1} text={text} />
              ))}
            </ModernCard>
          )}

          <Text style={styles.footer}>
            {t('installFooter', 'Once added, open Talk Trap from the new icon — the pack unlocks automatically. 🎉')}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundGradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 8 },
  scrollContent: { padding: 24, alignItems: 'center' },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  card: { width: '100%', marginBottom: tokens.spacing.lg },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 12,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumber: { color: '#fff', fontWeight: '700', fontSize: 13 },
  stepText: { flex: 1, color: tokens.colors.text.primary, fontSize: 15, lineHeight: 21 },
  footer: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },
});

export default InstallScreen;
