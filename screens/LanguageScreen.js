import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BackIcon from '../components/BackIcon';
import LanguageFlags from '../components/LanguageFlags';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

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
  { code: 'cs', label: 'Čeština' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'ur', label: 'اردو' },
  { code: 'bn', label: 'বাংলা' },
];

const LanguageScreen = ({ navigation }) => {
  const { language, setLanguage, isLoading } = useLanguage();

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
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonGlass}>
              <BackIcon size={32} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            {translations[language]?.selectLanguage || translations.cs.selectLanguage}
          </Text>
          <Text style={styles.subtitle}>
            {translations[language]?.selectLanguageSubtitle || translations.cs.selectLanguageSubtitle}
          </Text>
        </View>

        {/* Language Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.grid}>
            {LANGUAGES.map((lang) => (
              <View key={lang.code} style={styles.cardWrapper}>
                <TouchableOpacity
                  style={[
                    styles.card,
                    isLoading && styles.cardDisabled
                  ]}
                  onPress={() => handleLanguageSelect(lang.code)}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {/* Glass morphism background */}
                  <View style={styles.cardGlass}>
                    {language === lang.code && (
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                        style={styles.cardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                    )}
                    <View style={styles.flagContainer}>
                      <LanguageFlags code={lang.code} size={40} />
                    </View>
                    <Text style={[
                      styles.language,
                      language === lang.code && styles.languageActive
                    ]}>
                      {lang.label}
                    </Text>
                    {language === lang.code && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedText}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonGlass: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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
    flex: 1,
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
  card: {
    width: '100%',
  },
  cardGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    minHeight: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  flagContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  language: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  languageActive: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default LanguageScreen; 