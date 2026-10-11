import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../translations';
import { ModernBackButton } from '../components/ui';

// DRAFT legal copy — must be reviewed by a lawyer before taking real payments.
const DOCS = {
  terms: {
    cs: [
      ['Koncept', 'Tento text je návrh a před spuštěním plateb projde právní kontrolou.'],
      ['Služba', 'Paper Jar je konverzační party hra. Obsah slouží pro zábavu; hrajete dobrovolně a na vlastní zodpovědnost.'],
      ['Věk a alkohol', 'Režim Adult a varianty Drinks jsou jen pro osoby starší 18 let. Alkohol nikdy není povinný, nealko se počítá stejně. Pijte zodpovědně a nikdy neřiďte po pití.'],
      ['Premium', 'Předplatné se obnovuje automaticky, dokud ho nezrušíte v obchodě (App Store / Google Play) nebo u platební brány na webu. Zkušební verzi můžete zrušit kdykoli před jejím koncem bez platby. Spotřebitelé v EU mají zákonná práva na odstoupení podle platných předpisů.'],
      ['Vlastní karty', 'Za obsah vlastních karet odpovídáte vy. Ukládají se jen ve vašem zařízení.'],
      ['Kontakt', 'Dotazy a žádosti: hello@paperjar.app (doplnit finální adresu).'],
    ],
    en: [
      ['Draft', 'This text is a draft and will be reviewed by a lawyer before payments go live.'],
      ['The service', 'Paper Jar is a conversation party game. Content is for entertainment; you play voluntarily and at your own risk.'],
      ['Age & alcohol', 'Adult mode and Drinks editions are for people aged 18+. Alcohol is never required; soft drinks count the same. Drink responsibly and never drive after drinking.'],
      ['Premium', 'Subscriptions renew automatically until cancelled in the store (App Store / Google Play) or with the web payment provider. You can cancel a free trial anytime before it ends without being charged. EU consumers keep their statutory withdrawal rights.'],
      ['Your cards', 'You are responsible for the content of cards you write. They are stored only on your device.'],
      ['Contact', 'Questions and requests: hello@paperjar.app (replace with final address).'],
    ],
  },
  privacy: {
    cs: [
      ['Koncept (GDPR)', 'Návrh zásad ochrany osobních údajů, před spuštěním projde právní kontrolou.'],
      ['Co ukládáme', 'Nastavení, oblíbené karty, vlastní karty, sérii hraní a anonymní kód pozvánky ukládáme pouze ve vašem zařízení. Nevyžadujeme účet ani e-mail.'],
      ['Analytika', 'Anonymní události (např. „karta sdílena“) pomáhají hru zlepšovat. Bez vašeho souhlasu je neposíláme třetím stranám; před zapnutím externí analytiky přidáme souhlas s cookies.'],
      ['Platby', 'Platby zpracuje Apple, Google nebo platební brána (Paddle/Stripe). Údaje o kartě nikdy nevidíme.'],
      ['Vaše práva', 'Máte právo na přístup, opravu a výmaz údajů. Všechna lokální data smažete vymazáním dat aplikace nebo prohlížeče.'],
      ['Správce', 'Doplnit: jméno/firma, IČO, adresa, kontaktní e-mail.'],
    ],
    en: [
      ['Draft (GDPR)', 'Draft privacy policy, to be reviewed by a lawyer before launch.'],
      ['What we store', 'Settings, favorite cards, your custom cards, play streak and an anonymous invite code are stored only on your device. No account or email is required.'],
      ['Analytics', 'Anonymous events (e.g. “card shared”) help improve the game. We do not send them to third parties without consent; a cookie consent will be added before any external analytics is enabled.'],
      ['Payments', 'Payments are processed by Apple, Google or a payment provider (Paddle/Stripe). We never see your card details.'],
      ['Your rights', 'You have the right to access, correct and delete your data. Clearing the app or browser data removes everything stored locally.'],
      ['Controller', 'To fill in: name/company, company ID, address, contact email.'],
    ],
  },
};

const LegalScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { getCurrentGradient } = useTheme();
  const t = (key, fallback) => translations[language]?.[key] || fallback;
  const [tab, setTab] = useState('terms');
  const g = getCurrentGradient();
  const sections = DOCS[tab][language === 'cs' ? 'cs' : 'en'];

  return (
    <View style={styles.container}>
      <LinearGradient colors={g.colors} start={g.start} end={g.end} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <ModernBackButton onPress={() => navigation.goBack()} size="md" />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.tabs}>
            {[
              ['terms', t('termsTitle', 'Terms')],
              ['privacy', t('privacyTitle', 'Privacy')],
            ].map(([key, label]) => (
              <TouchableOpacity
                key={key}
                onPress={() => setTab(key)}
                style={[styles.tab, tab === key && styles.tabActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === key }}
              >
                <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {sections.map(([title, body], i) => (
            <View key={title} style={[styles.section, i === 0 && styles.draftSection]}>
              <Text style={[styles.sectionTitle, i === 0 && styles.draftText]}>{title}</Text>
              <Text style={[styles.sectionBody, i === 0 && styles.draftText]}>{body}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 8 },
  content: { padding: 24, paddingTop: 4, paddingBottom: 48 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 4,
    marginBottom: 18,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 16, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  tabTextActive: { color: '#22163F' },
  section: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 18, padding: 16, marginBottom: 12 },
  draftSection: { backgroundColor: '#FFD43B' },
  sectionTitle: { color: '#22163F', fontWeight: '900', fontSize: 16, marginBottom: 4 },
  sectionBody: { color: '#3A2F5B', fontWeight: '600', fontSize: 14, lineHeight: 21 },
  draftText: { color: '#5C3B00' },
});

export default LegalScreen;
