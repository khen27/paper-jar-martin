import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BackIcon from '../components/BackIcon';
import LanguageFlags from '../components/LanguageFlags';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
// import GlassCard from '../components/GlassCard';  // Commented out glass
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { flags } from '../src/config/flags';  // Commented out glass system
// import { GlassCard as NewGlassCard, GlassPressable, GlassIndicator } from '../src/components/glass';  // Commented out glass

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
        colors={['#667eea', '#764ba2', '#667eea']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top + 8 }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonModern}>
              <BackIcon size={24} color="#fff" />
            </View>
          </TouchableOpacity>
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
                    style={[
                      styles.modernCard,
                      language === lang.code && styles.selectedCard,
                      isLoading && styles.cardDisabled
                    ]}
                    onPress={() => handleLanguageSelect(lang.code)}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.flagContainer}>
                        <LanguageFlags code={lang.code} size={48} />
                      </View>
                      <Text style={[
                        styles.languageText,
                        language === lang.code && styles.languageTextActive
                      ]}>
                        {lang.label}
                      </Text>
                      {language === lang.code && (
                        <View style={styles.modernIndicator}>
                          <Text style={styles.checkText}>✓</Text>
                        </View>
                      )}
                    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonModern: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  titleSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
    color: '#fff',
    letterSpacing: -0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    letterSpacing: 0.2,
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
  modernCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 130,
  },
  selectedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 3,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 130,
  },
  flagContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  languageText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  languageTextActive: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  modernIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  checkText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '900',
  },
});

export default LanguageScreen;
