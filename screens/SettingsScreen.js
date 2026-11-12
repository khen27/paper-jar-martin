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
// Preview triage: lab helpers. Restore with the Testing cards below.
// import { hasPremium } from '../utils/entitlements';
// import { jumpToNightSeven, resetJourney, resetJourneyPurchases } from '../journey/store';
// import { clearPath } from '../utils/experiment';
import FunIcon from '../components/FunIcon';

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

// Testing action row: runs an async journey helper and shows a brief checkmark.
// Preview triage: unused while Testing cards are commented out.
// const ActionRow = ({ title, desc, onPress }) => {
//   const [done, setDone] = React.useState(false);
//   return (
//     <TouchableOpacity
//       style={styles.row}
//       accessibilityRole="button"
//       onPress={async () => {
//         await onPress();
//         setDone(true);
//         setTimeout(() => setDone(false), 1500);
//       }}
//     >
//       <View style={styles.rowText}>
//         <Text style={styles.rowTitle}>{done ? `✓ ${title}` : title}</Text>
//         <Text style={styles.rowDesc}>{desc}</Text>
//       </View>
//     </TouchableOpacity>
//   );
// };

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
            {t('settingsSubtitle', 'Keep Talk Trap simple — tweak only what you need.')}
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

          {/* Preview triage: Premium / paywall not needed while payments are fake.
          <ModernCard variant="surface" size="lg" style={styles.card}>
            <View style={styles.iconTitle}>
              <FunIcon name="crown" size={22} />
              <Text style={styles.rowTitle}>Premium</Text>
            </View>
            <Text style={styles.rowDesc}>
              {hasPremium(settings)
                ? t('youArePremium', 'You have Premium on this device.')
                : t('premiumSettingsDesc', 'All packs, every Drinks edition, unlimited favorites and custom cards.')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Upgrade')} style={styles.actionBtn}>
              <Text style={styles.actionText}>{t('seePremium', 'See Premium')} →</Text>
            </TouchableOpacity>
          </ModernCard>
          */}

          <ModernCard variant="surface" size="lg" style={styles.card}>
            <View style={styles.iconTitle}>
              <FunIcon name="invite" size={22} />
              <Text style={styles.rowTitle}>{t('inviteFriends', 'Invite friends to play')}</Text>
            </View>
            <Text style={styles.rowDesc}>
              {t('inviteCodeDesc', 'Your invite code')}: <Text style={styles.code}>{refCode}</Text>
            </Text>
            <TouchableOpacity
              onPress={() =>
                shareText({
                  message: t('inviteMessage', 'Come play Talk Trap with us. Party cards, dares and laughs, free in your browser.'),
                  event: 'invite_shared',
                })
              }
              style={styles.actionBtn}
            >
              <Text style={styles.actionText}>{t('shareInvite', 'Share invite link')} →</Text>
            </TouchableOpacity>
          </ModernCard>

          <ModernCard variant="surface" size="lg" style={styles.card}>
            <View style={styles.iconTitle}>
              <FunIcon name="sparkles" size={22} />
              <Text style={styles.rowTitle}>{t('streakLabel', 'Play streak')}</Text>
            </View>
            <Text style={styles.streakValue}>
              {streak > 0
                ? t('streakDays', `${streak} day streak`).replace('{n}', String(streak))
                : t('streakNone', 'Play today to start a streak')}
            </Text>
            <Text style={styles.rowDesc}>
              {t('streakDesc', 'One freeze per week if you miss a day. Comes back automatically.')}
            </Text>
          </ModernCard>

          {/* Preview triage: internal story + lab toggles. Restore by uncommenting.
          <ModernCard variant="surface" size="lg" style={[styles.card, styles.introCard]}>
            <View style={styles.iconTitle}>
              <FunIcon name="candle" size={22} />
              <Text style={styles.rowTitle}>{t('journeyIntroTitle', 'Why next-gen Talk Trap')}</Text>
            </View>
            <Text style={styles.rowDesc}>
              {t(
                'journeyIntroDesc',
                'The pivot, the outcome goals, how we learn, and the revenue model — a short read for Martin.'
              )}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('JourneyIntro')} style={styles.actionBtn}>
              <Text style={styles.actionText}>{t('journeyIntroCta', 'Read the story')} →</Text>
            </TouchableOpacity>
          </ModernCard>

          <ModernCard variant="surface" size="md" style={styles.card}>
            <View style={[styles.iconTitle, styles.sectionHead]}>
              <FunIcon name="dice" size={18} />
              <Text style={styles.sectionLabel}>{t('testingSection', 'Testing')}</Text>
            </View>
            <ToggleRow
              title={t('experimentUxSetting', 'Three-path preview')}
              desc={t('experimentUxDesc', 'Home starts with how you play: group, couple classic, or 14 nights. Turn off to use the lab Next generation toggle instead.')}
              value={settings.experimentUx}
              onChange={(v) => updateSettings({ experimentUx: v, experimentJob: v ? settings.experimentJob : null })}
            />
            <View style={styles.divider} />
            <ActionRow
              title={t('experimentResetDoors', 'Reset doors')}
              desc={t('experimentResetDoorsDesc', 'Back to “how are you playing tonight?” so you can walk the three paths again.')}
              onPress={() => clearPath(updateSettings)}
            />
            <View style={styles.divider} />
            <ToggleRow
              title={t('paywallPreviewSetting', 'Preview paywall')}
              desc={t('paywallPreviewDesc', 'Locks premium packs after 3 free cards, the way it will work once payments are live.')}
              value={settings.paywallPreview}
              onChange={(v) => updateSettings({ paywallPreview: v })}
            />
            <View style={styles.divider} />
            <ToggleRow
              title={t('seasonPreviewSetting', 'Open all seasonal packs')}
              desc={t('seasonPreviewDesc', 'Shows Christmas and other packs before their dates, for testing.')}
              value={settings.seasonPreview}
              onChange={(v) => updateSettings({ seasonPreview: v })}
            />
            <View style={styles.divider} />
            <ToggleRow
              title={t('nextGenSetting', 'Next generation Talk Trap')}
              desc={t('nextGenDesc', 'Swaps Home for the new 14-night journey for two. Turn off to get classic Talk Trap back — nothing is deleted.')}
              value={settings.nextGen}
              onChange={(v) => updateSettings({ nextGen: v })}
            />
          </ModernCard>

          {(settings.nextGen || settings.experimentArm === 'journey') && (
            <ModernCard variant="surface" size="md" style={styles.card}>
              <View style={[styles.iconTitle, styles.sectionHead]}>
                <FunIcon name="sparkles" size={18} />
                <Text style={styles.sectionLabel}>{t('journeyTestingSection', 'Next generation (testing)')}</Text>
              </View>
              <ToggleRow
                title={t('journeyNoLimitSetting', 'No daily limit')}
                desc={t('journeyNoLimitDesc', 'Lets you play several journey nights in one day, to test end to end.')}
                value={settings.journeyNoDailyLimit}
                onChange={(v) => updateSettings({ journeyNoDailyLimit: v })}
              />
              <View style={styles.divider} />
              <ActionRow
                title={t('journeyJump7', 'Jump to night 7')}
                desc={t('journeyJump7Desc', 'Fills nights 1–6 so the paywall at night 8 is one night away.')}
                onPress={jumpToNightSeven}
              />
              <View style={styles.divider} />
              <ActionRow
                title={t('journeyResetPurchase', 'Reset journey purchase')}
                desc={t('journeyResetPurchaseDesc', 'Clears the fake one-time purchases, keeps your nights and album.')}
                onPress={resetJourneyPurchases}
              />
              <View style={styles.divider} />
              <ActionRow
                title={t('journeyReset', 'Reset journey')}
                desc={t('journeyResetDesc', 'Wipes the journey save: stage, nights, album, purchases, date jar.')}
                onPress={resetJourney}
              />
            </ModernCard>
          )}

          <ModernCard variant="surface" size="md" style={styles.card}>
            <Text style={styles.rowTitle}>{t('aboutPacks', 'Game packs')}</Text>
            <Text style={styles.rowDesc}>
              {t(
                'aboutPacksDesc',
                'Adult Fun needs an 18+ confirm. Office stays work-safe. Workout is movement-friendly for everyone.'
              )}
            </Text>
          </ModernCard>
          */}

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
  introCard: { borderWidth: 1.5, borderColor: 'rgba(255,212,59,0.5)' },
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
  sectionLabel: { color: '#FFE08A', fontWeight: '900', fontSize: 12, marginBottom: 0, letterSpacing: 0.6 },
  legalLink: { alignSelf: 'center', padding: 12 },
  legalText: { color: 'rgba(255,255,255,0.7)', fontWeight: '700', textDecorationLine: 'underline' },
  iconTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionHead: { marginBottom: 10 },
  rowTitle: {
    color: tokens.colors.text.primary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 0,
    flex: 1,
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
