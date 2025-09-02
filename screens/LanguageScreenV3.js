import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import LanguageFlags from '../components/LanguageFlags';
import BackIcon from '../components/BackIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_SPACING = 20;
const CARD_WIDTH = (width - 60) / 2;

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

const GamingLanguageCard = ({ language, isSelected, onSelect, index }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 80),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    onSelect();
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={[
          styles.languageCard,
          isSelected && styles.selectedCard,
        ]}
      >
        {/* Gaming Glass Background */}
        <BlurView intensity={15} tint="light" style={styles.cardBlur}>
          <View style={[styles.cardOverlay, isSelected && styles.selectedOverlay]} />
        </BlurView>

        {/* Gaming glow effect */}
        <LinearGradient
          colors={
            isSelected
              ? ['rgba(103, 126, 234, 0.4)', 'rgba(118, 75, 162, 0.3)', 'transparent']
              : ['rgba(255, 255, 255, 0.1)', 'transparent']
          }
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.cardContent}>
          {/* Flag */}
          <View style={styles.flagContainer}>
            <LanguageFlags code={language.code} size={56} />
          </View>

          {/* Language Label */}
          <Text style={[styles.languageLabel, isSelected && styles.selectedLabel]}>
            {language.label}
          </Text>

          {/* Selection Badge */}
          {isSelected && (
            <View style={styles.selectionBadge}>
              <BlurView intensity={20} tint="light" style={styles.badgeBlur}>
                <Text style={styles.checkmark}>✓</Text>
              </BlurView>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const LanguageScreenV3 = ({ navigation }) => {
  const { language, setLanguage, isLoading } = useLanguage();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLanguageSelect = async (code) => {
    await setLanguage(code);
    navigation.goBack();
  };

  const renderLanguageGrid = () => {
    const rows = [];
    for (let i = 0; i < LANGUAGES.length; i += 2) {
      const row = LANGUAGES.slice(i, i + 2);
      rows.push(
        <View key={i} style={styles.gridRow}>
          {row.map((lang, rowIndex) => (
            <GamingLanguageCard
              key={lang.code}
              language={lang}
              isSelected={language === lang.code}
              onSelect={() => handleLanguageSelect(lang.code)}
              index={i + rowIndex}
            />
          ))}
          {/* Fill empty space if odd number */}
          {row.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      );
    }
    return rows;
  };

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Gaming Gradient Background */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#667eea']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.8}
            >
              <BlurView intensity={15} tint="light" style={styles.backButtonBlur}>
                <BackIcon size={24} color="#fff" />
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          {/* Gaming Title */}
          <Animated.View
            style={[
              styles.titleSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <Text style={styles.title}>
              {translations[language]?.selectLanguage || translations.cs.selectLanguage}
            </Text>
            <Text style={styles.subtitle}>
              {translations[language]?.selectLanguageSubtitle || translations.cs.selectLanguageSubtitle}
            </Text>
          </Animated.View>

          {/* Language Grid */}
          <Animated.View
            style={[
              styles.gridContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {renderLanguageGrid()}
          </Animated.View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonBlur: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    lineHeight: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 19,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.3,
  },
  gridContainer: {
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: CARD_SPACING,
  },
  cardContainer: {
    width: CARD_WIDTH,
  },
  languageCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 140,
  },
  selectedCard: {
    shadowOpacity: 0.25,
    elevation: 12,
  },
  cardBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  selectedOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    position: 'relative',
  },
  flagContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  languageLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  selectedLabel: {
    fontSize: 19,
    fontWeight: '800',
  },
  selectionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeBlur: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '900',
    color: '#667eea',
  },
});

export default LanguageScreenV3;