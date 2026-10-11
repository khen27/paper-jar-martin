import React from 'react';
import { StyleSheet, Text, View, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../translations';
import { ModernCard, ModernBackButton } from '../components/ui';
import { tokens } from '../theme/tokens';
import { getStreak } from '../utils/streaks';
import { getReferralCode, shareText } from '../utils/share';
import { hasPremium } from '../utils/entitlements';

const ToggleRow = ({ title, desc, value, onChange }) => (
  <View style={styles.row}>
    <View style={styles.rowText}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowDesc}>{desc}</Text>
    </View>
    <Switch
      value={!!value}
      onValueChange={onChange}
      trackColor={{ false: 'rgba(255,255,255,0.25)', true: 'rgba(255,255,255,0.55)' }}
      thumbColor="#fff"
    />
  </View>
);

const SettingsScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { getCurrentGradient } = useTheme();
  const { settings, updateSettings } = useSettings();
  const [streak, setStreak] = React.useState(0);
  const t = (k, f) => translations[language]?.[k] || f;

  const [refCode, setRefCode] = React.useState('');

  React.useEffect(() => {
    getStreak().then((s) => setStreak(s.streak || 0));
    getReferralCode().then(setRefCode);
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
            <ToggleRow
              title={t('showRulesSetting', 'How to play before each game')}
              desc={t('showRulesSettingDesc', 'Shows the rules and the fun pact when a game starts. On by default.')}
              value={settings.showRules}
              onChange={(v) => updateSettings({ showRules: v })}
            />
            <View style={styles.divider} />
            <ToggleRow
              title={t('partyTimerSetting', 'Party timer')}
              desc={t('partyTimerSettingDesc', '30-second countdown in Party mode. Off by default.')}
              value={settings.partyTimerEnabled}
              onChange={(v) => updateSettings({ partyTimerEnabled: v })}
            />
          </ModernCard>

          <ModernCard variant="surface" size="lg" style={styles.card}>
            <Text style={styles.rowTitle}>👑 Premium</Text>
            <Text style={styles.rowDesc}>
              {hasPremium(settings)
                ? t('youArePremium', 'You have Premium on this device.')
                : t('premiumSettingsDesc', 'All packs, every Drinks edition, unlimited favorites and custom cards.')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Upgrade')} style={styles.actionBtn}>
              <Text style={styles.actionText}>{t('seePremium', 'See Premium')} →</Text>
            </TouchableOpacity>
          </ModernCard>

          <ModernCard variant="surface" size="lg" style={styles.card}>
            <Text style={styles.rowTitle}>💌 {t('inviteFriends', 'Invite friends to play')}</Text>
            <Text style={styles.rowDesc}>
              {t('inviteCodeDesc', 'Your invite code')}: <Text style={styles.code}>{refCode}</Text>
            </Text>
            <TouchableOpacity
              onPress={() =>
                shareText({
                  message: t('inviteMessage', 'Come play Paper Jar with us 🎉 Party cards, dares and laughs, free in your browser.'),
                  event: 'invite_shared',
                })
              }
              style={styles.actionBtn}
            >
              <Text style={styles.actionText}>{t('shareInvite', 'Share invite link')} →</Text>
            </TouchableOpacity>
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
            <Text style={styles.sectionLabel}>🧪 {t('testingSection', 'Testing')}</Text>
            <ToggleRow
              title={t('paywallPreviewSetting', 'Preview paywall')}
              desc={t('paywallPreviewDesc', 'Locks premium packs after 3 free cards, the way it will work once payments are live.')}
              value={settings.paywallPreview}
              onChange={(v) => updateSettings({ paywallPreview: v })}
            />
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

          <TouchableOpacity onPress={() => navigation.navigate('Legal')} style={styles.legalLink}>
            <Text style={styles.legalText}>{t('legalLink', 'Terms & Privacy')}</Text>
          </TouchableOpacity>
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
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 14 },
  actionBtn: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  actionText: { color: '#22163F', fontWeight: '900', fontSize: 14 },
  code: { color: '#FFD43B', fontWeight: '900', letterSpacing: 1.5 },
  sectionLabel: { color: '#FFE08A', fontWeight: '900', fontSize: 12, marginBottom: 10, letterSpacing: 0.6 },
  legalLink: { alignSelf: 'center', padding: 12 },
  legalText: { color: 'rgba(255,255,255,0.7)', fontWeight: '700', textDecorationLine: 'underline' },
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
