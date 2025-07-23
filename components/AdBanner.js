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

      
      <TouchableOpacity 
        style={styles.bottomAdContent} 
        activeOpacity={0.8}
        onPress={handlePress}
      >
        <View style={styles.bottomAdInner}>
          {/* Sponsored label */}
          <View style={styles.sponsoredWrapper}>
            <Text style={styles.sponsoredText}>Sponsored</Text>
          </View>
          
          {/* Ad content */}
          <View style={styles.adTextContainer}>
            <Text style={styles.bottomAdHeadline} numberOfLines={1}>
              {currentAd.headline}
            </Text>
          </View>
          
          {/* CTA Button */}
          <View style={styles.bottomAdCTAWrapper}>
            <Text style={styles.bottomAdCTA} numberOfLines={1}>
              {currentAd.cta}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Glass overlay for premium effect */}
      <View style={styles.glassOverlay} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomAdBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40, // Moved up from 0 to avoid system home indicator
    height: BANNER_HEIGHT + 20, // Extra space for shadow and safe area
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  bottomAdContent: {
    width: width - 40,
    height: BANNER_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomAdInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  sponsoredWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sponsoredText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  adTextContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  bottomAdHeadline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomAdCTAWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomAdCTA: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    pointerEvents: 'none',
  },
});

export { BANNER_HEIGHT };
export default AdBanner; 