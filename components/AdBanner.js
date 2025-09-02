import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ModernCard, ModernButton } from './ui';
import { tokens } from '../theme/tokens';

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 60;

// Fake ad data with multiple variations
const fakeAds = [
  {
    id: 1,
    headline: 'Focus Timer Pro',
    cta: 'Boost Productivity ➜',
    colors: ['#667eea', '#764ba2'],
  },
  {
    id: 2,
    headline: 'Master New Skills',
    cta: 'Start Learning ➜',
    colors: ['#764ba2', '#667eea'],
  },
  {
    id: 3,
    headline: 'Mindful Meditation',
    cta: 'Find Your Zen ➜',
    colors: ['#667eea', '#764ba2'],
  },
  {
    id: 4,
    headline: 'Word Puzzle Challenge',
    cta: 'Play Now ➜',
    colors: ['#764ba2', '#667eea'],
  },
];

const AdBanner = ({ onPress }) => {
  const [currentAd, setCurrentAd] = useState(fakeAds[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Random ad selection
    const randomAd = fakeAds[Math.floor(Math.random() * fakeAds.length)];
    setCurrentAd(randomAd);

    // Smooth fade-in animation
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

  const handlePress = () => {
    console.log('🔔 Ad Banner Clicked:', currentAd.headline);
    if (onPress) {
      onPress(currentAd);
    }
  };

  return (
    <Animated.View 
      style={[
        styles.bottomAdBanner,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <ModernCard variant="surface" size="lg" style={styles.adCard}>
        <TouchableOpacity 
          style={styles.bottomAdContent} 
          activeOpacity={0.8}
          onPress={handlePress}
        >
          <View style={styles.bottomAdInner}>
            {/* Sponsored label */}
            <ModernCard variant="surface" size="xs" style={styles.sponsoredWrapper}>
              <Text style={styles.sponsoredText}>SPONSORED</Text>
            </ModernCard>

            {/* Ad content */}
            <View style={styles.adTextContainer}>
              <Text style={styles.bottomAdHeadline} numberOfLines={1}>
                {currentAd.headline}
              </Text>
            </View>

            {/* CTA Button */}
            <ModernButton variant="secondary" size="sm" style={styles.ctaButton}>
              <Text style={styles.bottomAdCTA} numberOfLines={1}>
                {currentAd.cta}
              </Text>
            </ModernButton>
          </View>
        </TouchableOpacity>
      </ModernCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomAdBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: tokens.spacing['4xl'],
    height: BANNER_HEIGHT + tokens.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.sm,
  },
  adCard: {
    width: width - (tokens.spacing.xl * 2),
    height: BANNER_HEIGHT,
    ...tokens.shadows.md,
    borderWidth: 1,
  },
  bottomAdContent: {
    flex: 1,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
  },
  bottomAdInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    justifyContent: 'space-between',
  },
  sponsoredWrapper: {
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.sm,
  },
  sponsoredText: {
    ...tokens.typography.sizes.xs,
    ...tokens.typography.weights.semibold,
    color: tokens.colors.text.tertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  adTextContainer: {
    flex: 1,
    marginHorizontal: tokens.spacing.md,
  },
  bottomAdHeadline: {
    ...tokens.typography.sizes.lg,
    ...tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  ctaButton: {
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
  },
  bottomAdCTA: {
    ...tokens.typography.sizes.sm,
    ...tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export { BANNER_HEIGHT };
export default AdBanner; 