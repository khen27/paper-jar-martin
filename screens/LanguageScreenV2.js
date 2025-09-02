import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Dimensions,
  Animated,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button } from '@rneui/themed';
import { BlurView } from 'expo-blur';
import LanguageFlags from '../components/LanguageFlags';
import BackIcon from '../components/BackIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const CARD_SPACING = 16;
const CARD_WIDTH = (width - 48 - CARD_SPACING) / 2;

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

const PremiumLanguageCard = ({ language, isSelected, onSelect, index }) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
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
        duration: 150,
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
          opacity: opacityAnim,
        },
      ]}
    >
      <Card
        containerStyle={[
          styles.languageCard,
          isSelected && styles.selectedCard,
        ]}
        wrapperStyle={styles.cardWrapper}
      >
        <Button
          onPress={handlePress}
          buttonStyle={styles.cardButton}
          titleStyle={{ opacity: 0 }}
        >
          <View style={styles.cardContent}>
            {/* Flag */}
            <View style={styles.flagContainer}>
              <LanguageFlags code={language.code} size={50} />
            </View>
            
            {/* Language Label */}
            <Text style={[
              styles.languageLabel,
              isSelected && styles.selectedLabel
            ]}>
              {language.label}
            </Text>

            {/* Selection Indicator */}
            {isSelected && (
              <View style={styles.selectionBadge}>
                <BlurView intensity={20} tint="light" style={styles.badgeBlur}>
                  <View style={styles.checkContainer}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                </BlurView>
              </View>
            )}
          </View>
        </Button>
      </Card>
    </Animated.View>
  );
};

const LanguageScreenV2 = ({ navigation }) => {
  const { language, setLanguage, isLoading } = useLanguage();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
          {row.map((lang, index) => (
            <PremiumLanguageCard
              key={lang.code}
              language={lang}
              isSelected={language === lang.code}
              onSelect={() => handleLanguageSelect(lang.code)}
              index={i + index}
            />
          ))}
        </View>
      );
    }
    return rows;
  };

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Premium Gradient Background */}
        <LinearGradient
          colors={['#667eea', '#764ba2', '#667eea']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
          {/* Premium Header */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <Button
              onPress={() => navigation.goBack()}
              buttonStyle={styles.backButton}
              icon={<BackIcon size={24} color="#fff" />}
            />
          </Animated.View>

          {/* Title Section */}
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
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
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
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  titleSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -1,
    lineHeight: 48,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 0,
    margin: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  selectedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowOpacity: 0.25,
  },
  cardWrapper: {
    padding: 0,
    margin: 0,
  },
  cardButton: {
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
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
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectedLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  selectionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  badgeBlur: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  checkContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '900',
    color: '#667eea',
  },
});

export default LanguageScreenV2;
