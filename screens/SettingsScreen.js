import React from 'react';
import { StyleSheet, Text, View, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../translations';
import { ModernCard, ModernBackButton } from '../components/ui';
import { tokens } from '../theme/tokens';
import { getStreak } from '../utils/streaks';

const SettingsScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { getCurrentGradient } = useTheme();
  const { settings, updateSettings } = useSettings();
  const [streak, setStreak] = React.useState(0);
  const t = (k, f) => translations[language]?.[k] || f;

  React.useEffect(() => {
    getStreak().then((s) => setStreak(s.streak || 0));
  }, []);

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
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t('settingsTitle', 'Settings')}</Text>
          <Text style={styles.subtitle}>
            {t('settingsSubtitle', 'Keep Paper Jar simple — tweak only what you need.')}
          </Text>

          <ModernCard variant="surface" size="lg" style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{t('partyTimerSetting', 'Party timer')}</Text>
                <Text style={styles.rowDesc}>
                  {t(
                    'partyTimerSettingDesc',
                    '30-second countdown in Party mode. Off by default.'
                  )}
                </Text>
              </View>
              <Switch
                value={!!settings.partyTimerEnabled}
                onValueChange={(v) => updateSettings({ partyTimerEnabled: v })}
                trackColor={{ false: 'rgba(255,255,255,0.25)', true: 'rgba(255,255,255,0.55)' }}
                thumbColor="#fff"
              />
            </View>
          </ModernCard>

          <ModernCard variant="surface" size="lg" style={styles.card}>
            <Text style={styles.rowTitle}>{t('streakLabel', 'Play streak')}</Text>
            <Text style={styles.streakValue}>
              {streak > 0
                ? t('streakDays', `${streak} day streak 🔥`).replace('{n}', String(streak))
                : t('streakNone', 'Play today to start a streak')}
            </Text>
            <Text style={styles.rowDesc}>
              {t('streakDesc', 'One freeze per week if you miss a day. Comes back automatically.')}
            </Text>
          </ModernCard>

          <ModernCard variant="surface" size="md" style={styles.card}>
            <Text style={styles.rowTitle}>{t('aboutPacks', 'Game packs')}</Text>
            <Text style={styles.rowDesc}>
              {t(
                'aboutPacksDesc',
                'Adult Fun needs an 18+ confirm. Office stays work-safe. Workout is movement-friendly for everyone.'
              )}
            </Text>
          </ModernCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { ...StyleSheet.absoluteFillObject },
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 8 },
  content: { padding: 24, paddingBottom: 48 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 24,
    lineHeight: 22,
  },
  card: { marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { flex: 1 },
  rowTitle: {
    color: tokens.colors.text.primary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  rowDesc: {
    color: tokens.colors.text.secondary,
    fontSize: 13,
    lineHeight: 19,
  },
  streakValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 8,
  },
});

export default SettingsScreen;
