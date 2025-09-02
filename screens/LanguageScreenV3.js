import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import {
  TamaguiProvider,
  createTamagui,
  YStack,
  XStack,
  Card,
  Text,
  Button,
  Circle,
  styled,
} from '@tamagui/core';
import { LinearGradient } from 'expo-linear-gradient';
import { config } from '@tamagui/config';
import LanguageFlags from '../components/LanguageFlags';
import BackIcon from '../components/BackIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tamaguiConfig = createTamagui(config);

const { width } = Dimensions.get('window');

// Custom styled components for gaming aesthetic
const GlowCard = styled(Card, {
  borderRadius: 24,
  padding: 24,
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.12)',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.2,
  shadowRadius: 16,
  elevation: 12,
  position: 'relative',
  overflow: 'hidden',
  variants: {
    selected: {
      true: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
        shadowOpacity: 0.3,
        elevation: 16,
        transform: [{ scale: 1.02 }],
      },
    },
    size: {
      card: {
        minHeight: 140,
        width: (width - 64) / 2,
      },
    },
  },
});

const GlowButton = styled(Button, {
  borderRadius: 18,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.15)',
  paddingHorizontal: 20,
  paddingVertical: 14,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 8,
  pressStyle: {
    scale: 0.95,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});

const SelectionBadge = styled(Circle, {
  size: 32,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  position: 'absolute',
  top: 12,
  right: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 6,
  alignItems: 'center',
  justifyContent: 'center',
});

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

const GameLanguageCard = ({ language, isSelected, onSelect, index }) => {
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
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: fadeAnim,
      }}
    >
      <GlowCard
        size="card"
        selected={isSelected}
        onPress={handlePress}
        pressStyle={{ scale: 0.98 }}
        animation="bouncy"
        enterStyle={{ scale: 0.9, opacity: 0 }}
        exitStyle={{ scale: 0.9, opacity: 0 }}
      >
        {/* Gaming glow effect */}
        <LinearGradient
          colors={
            isSelected
              ? ['rgba(103, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.2)', 'transparent']
              : ['rgba(255, 255, 255, 0.1)', 'transparent']
          }
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <YStack alignItems="center" justifyContent="center" space="$3">
          {/* Flag */}
          <YStack
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.2}
            shadowRadius={8}
            elevation={4}
          >
            <LanguageFlags code={language.code} size={56} />
          </YStack>

          {/* Language Label */}
          <Text
            fontSize={18}
            fontWeight="700"
            color="#ffffff"
            textAlign="center"
            textShadowColor="rgba(0, 0, 0, 0.3)"
            textShadowOffset={{ width: 0, height: 2 }}
            textShadowRadius={4}
            animation="lazy"
            enterStyle={{ opacity: 0, y: 10 }}
            exitStyle={{ opacity: 0, y: -10 }}
          >
            {language.label}
          </Text>
        </YStack>

        {/* Selection Badge */}
        {isSelected && (
          <SelectionBadge
            animation="bouncy"
            enterStyle={{ scale: 0, opacity: 0 }}
            exitStyle={{ scale: 0, opacity: 0 }}
          >
            <Text fontSize={18} fontWeight="900" color="#667eea">
              ✓
            </Text>
          </SelectionBadge>
        )}
      </GlowCard>
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
        <XStack key={i} justifyContent="space-between" space="$4" width="100%">
          {row.map((lang, rowIndex) => (
            <GameLanguageCard
              key={lang.code}
              language={lang}
              isSelected={language === lang.code}
              onSelect={() => handleLanguageSelect(lang.code)}
              index={i + rowIndex}
            />
          ))}
          {/* Fill empty space if odd number */}
          {row.length === 1 && <YStack flex={1} />}
        </XStack>
      );
    }
    return rows;
  };

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Gaming Gradient Background */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#667eea']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <YStack flex={1} padding="$6" space="$6">
          {/* Header */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <GlowButton
              onPress={() => navigation.goBack()}
              alignSelf="flex-start"
              icon={<BackIcon size={24} color="#fff" />}
            />
          </Animated.View>

          {/* Gaming Title */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <YStack space="$3">
              <Text
                fontSize={44}
                fontWeight="900"
                color="#ffffff"
                letterSpacing={-1}
                lineHeight={50}
                textShadowColor="rgba(0, 0, 0, 0.4)"
                textShadowOffset={{ width: 0, height: 3 }}
                textShadowRadius={10}
                animation="lazy"
                enterStyle={{ opacity: 0, y: 20 }}
              >
                {translations[language]?.selectLanguage || translations.cs.selectLanguage}
              </Text>
              <Text
                fontSize={19}
                fontWeight="500"
                color="rgba(255, 255, 255, 0.9)"
                letterSpacing={0.3}
                animation="lazy"
                enterStyle={{ opacity: 0, y: 10 }}
              >
                {translations[language]?.selectLanguageSubtitle || translations.cs.selectLanguageSubtitle}
              </Text>
            </YStack>
          </Animated.View>

          {/* Language Grid */}
          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <YStack flex={1} space="$4" paddingTop="$4">
              {renderLanguageGrid()}
            </YStack>
          </Animated.View>
        </YStack>
      </SafeAreaView>
    </TamaguiProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LanguageScreenV3;
