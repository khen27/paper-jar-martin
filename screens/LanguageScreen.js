import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LanguageFlags from '../components/LanguageFlags';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModernCard, ModernBackButton, ModernSelectionIndicator } from '../components/ui';
import { tokens, gradients } from '../theme/tokens';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 16;
const CARD_MARGIN = 8;
const NUM_COLUMNS = 2;
const MIN_CARD_WIDTH = 150;
const MAX_CARD_WIDTH = 180;

const CARD_WIDTH = Math.min(
  MAX_CARD_WIDTH,
  Math.max(
    MIN_CARD_WIDTH,
    (width - (COLUMN_GAP + CARD_MARGIN * 4)) / NUM_COLUMNS
  )
);

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'cs', label: 'Čeština' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'zh', label: '中文' },
  { code: 'ru', label: 'Русский' },
  { code: 'ur', label: 'اردو' },
  { code: 'bn', label: 'বাংলা' },
];

const LanguageScreen = ({ navigation }) => {
  const { language, setLanguage, isLoading } = useLanguage();
  const insets = useSafeAreaInsets();

  const handleLanguageSelect = async (code) => {
    await setLanguage(code);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Premium Background Gradient */}
      <LinearGradient
        colors={gradients.primary.colors}
        style={styles.backgroundGradient}
        start={gradients.primary.start}
        end={gradients.primary.end}
      />

      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top + 8 }]}>
        {/* Header */}
        <View style={styles.header}>
          <ModernBackButton 
            onPress={() => navigation.goBack()}
            size="md"
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              {translations[language]?.selectLanguage || translations.cs.selectLanguage}
            </Text>
            <Text style={styles.subtitle}>
              {translations[language]?.selectLanguageSubtitle || translations.cs.selectLanguageSubtitle}
            </Text>
          </View>

          {/* Modern Language Grid */}
          <View style={styles.gridContainer}>
            <View style={styles.grid}>
              {LANGUAGES.map((lang) => (
                <View key={lang.code} style={styles.cardWrapper}>
                  <TouchableOpacity
                    onPress={() => handleLanguageSelect(lang.code)}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <ModernCard
                      variant="surface"
                      size="md"
                      selected={language === lang.code}
                      style={[isLoading && styles.cardDisabled]}
                    >
                      <View style={styles.flagContainer}>
                        <LanguageFlags code={lang.code} size={tokens.components.icon['2xl']} />
                      </View>
                      <Text style={[
                        styles.languageText,
                        language === lang.code && styles.languageTextActive
                      ]}>
                        {lang.label}
                      </Text>
                      <ModernSelectionIndicator 
                        active={language === lang.code} 
                        size="md"
                      />
                    </ModernCard>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
  },

  titleSection: {
    paddingHorizontal: tokens.spacing['2xl'],
    marginBottom: tokens.spacing['3xl'],
    marginTop: tokens.spacing.xl,
  },
  title: {
    fontSize: tokens.typography.sizes['4xl'],
    fontWeight: tokens.typography.weights.extrabold,
    marginBottom: tokens.spacing.sm,
    color: tokens.colors.text.primary,
    letterSpacing: -0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: tokens.typography.sizes.lg,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.weights.medium,
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: tokens.typography.sizes.lg * tokens.typography.lineHeights.relaxed,
  },
  gridContainer: {
    paddingHorizontal: CARD_MARGIN * 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    padding: CARD_MARGIN,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  flagContainer: {
    marginBottom: tokens.spacing.md,
    alignItems: 'center',
  },
  languageText: {
    fontSize: tokens.typography.sizes.base,
    textAlign: 'center',
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.weights.semibold,
    letterSpacing: 0.3,
  },
  languageTextActive: {
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.weights.extrabold,
    fontSize: tokens.typography.sizes.lg,
  },
});

export default LanguageScreen;
