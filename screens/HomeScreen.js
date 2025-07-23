import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
// import Easing from 'react-native/Libraries/Animated/Easing';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import LanguageIcon from '../components/LanguageIcon';
import { PartnerIcon, FriendIcon, PartyIcon } from '../components/GameModeIcons';

const { width, height } = Dimensions.get('window');

// Feature Flag for OtázoJar Refresh
const OTAZO_JAR_REFRESH_ENABLED = true;

const HomeScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const [displayText, setDisplayText] = useState('');
  const [selectedMode, setSelectedMode] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.95)).current;
  const glassRotation = useRef(new Animated.Value(0)).current;
  const jarScale = useRef(new Animated.Value(0.9)).current; // New jar entrance animation
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  
  // Animation refs for game mode buttons
  const partnerButtonScale = useRef(new Animated.Value(1)).current;
  const friendButtonScale = useRef(new Animated.Value(1)).current;
  const partyButtonScale = useRef(new Animated.Value(1)).current;
  
  // Refs for animation control
  const typingTimeoutRef = useRef(null);
  const animationRef = useRef(null);
  const isAnimatingRef = useRef(false);

  // Comprehensive logging function
  const logAction = useCallback((action, details = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      action,
      language,
      selectedMode,
      details,
    };
    console.log('🎮 PAPER JAR - USER ACTION:', logEntry);
    
    // Additional logging for debugging
    if (__DEV__) {
      console.log('🔍 DEBUG - Component State:', {
        displayText,
        selectedMode,
        language,
      });
    }
  }, [language, selectedMode, displayText]);

  // Cleanup function for typing animation
  const cleanupTypingAnimation = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    isAnimatingRef.current = false;
  }, []);

  // FIXED typing animation - no more infinite loop
  const startTypingAnimation = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    
    logAction('TYPING_ANIMATION_STARTED', { 
      text: OTAZO_JAR_REFRESH_ENABLED ? 'OtázoJar' : 'Paper Jar' 
    });
    
    const text = OTAZO_JAR_REFRESH_ENABLED ? 'OtázoJar' : 'Paper Jar';
    let currentIndex = 0;
    setDisplayText('');

    const typeText = () => {
      if (currentIndex < text.length) {
        setDisplayText(text.substring(0, currentIndex + 1));
        currentIndex++;
        typingTimeoutRef.current = setTimeout(typeText, 100);
      } else {
        // Animation complete - stop here for OtázoJar refresh
        isAnimatingRef.current = false;
        
        // Start jar entrance animation for new design
        if (OTAZO_JAR_REFRESH_ENABLED) {
          Animated.timing(jarScale, {
            toValue: 1.0,
            duration: 300,
            // easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start();
        }
      }
    };

    typeText();
  }, [logAction, jarScale]);

  // Handle game mode selection
  const handleGameModeSelect = useCallback((mode) => {
    logAction('GAME_MODE_SELECTED', { selectedMode: mode });
    setSelectedMode(mode);
    
    // Scale animation for button press
    const scaleAnim = mode === 'partner' ? partnerButtonScale : 
                     mode === 'friend' ? friendButtonScale : partyButtonScale;
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        // easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        // easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After animation, navigate based on mode
      if (mode === 'party') {
        // Party Mode requires premium upgrade
        logAction('PARTY_MODE_PAYWALL_TRIGGERED', { mode });
        navigation.navigate('Upgrade');
      } else {
        // Partner and Friend modes are free
        logAction('NAVIGATING_TO_GAME', { gameMode: mode });
        navigation.navigate('Game', { gameMode: mode });
      }
    });
  }, [logAction, navigation, partnerButtonScale, friendButtonScale, partyButtonScale]);

  // Cursor blink animation
  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 600,
          // easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 600,
          // easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    blinkAnimation.start();

    return () => {
      blinkAnimation.stop();
    };
  }, []);

  // FIXED typing animation effect - only start once
  useEffect(() => {
    const text = translations[language]?.paperJar || 'Paper Jar';
    logAction('TYPING_ANIMATION_STARTED', { text });
    startTypingAnimation(text);

    return cleanupTypingAnimation;
  }, [language]); // Removed other dependencies to prevent infinite loop

  // Initial animations
  useEffect(() => {
    logAction('COMPONENT_MOUNTED');
    
    // Feature flag logging
    if (OTAZO_JAR_REFRESH_ENABLED) {
      console.log('🎯 OtázoJar Refresh: Phase 1 Active - Layout & Typography');
    }

    // Start entrance animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      // easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();

    // Start glass rotation animation
    const glassAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glassRotation, {
          toValue: 1,
          duration: 3000,
          // easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(glassRotation, {
          toValue: 0,
          duration: 3000,
          // easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
      ])
    );

    // Start cursor blinking
    const cursorAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 600,
          // easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 600,
          // easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    animationRef.current = glassAnimation;
    glassAnimation.start();
    cursorAnimation.start();

    // Start typing animation after a delay
    setTimeout(() => {
      startTypingAnimation();
    }, 500);

    // Remove the old tagline animation for refresh
    if (!OTAZO_JAR_REFRESH_ENABLED) {
      startTaglineAnimation();
    } else {
      // Start enhanced tagline animation for OtázoJar refresh
      setTimeout(() => {
        startEnhancedTaglineAnimation();
      }, 1200); // Start after typing animation begins
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      logAction('COMPONENT_UNMOUNTED');
    };
  }, []);

  // Update language effect to retrigger typing animation
  useEffect(() => {
    if (OTAZO_JAR_REFRESH_ENABLED) {
      startTypingAnimation();
    }
  }, [language]);

  const startEnhancedTaglineAnimation = useCallback(() => {
    taglineOpacity.setValue(0);
    Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 1200,
      delay: 800,
      useNativeDriver: true,
    }).start(() => {
      // Hold visible for a moment then fade out and repeat
      setTimeout(() => {
        Animated.timing(taglineOpacity, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => {
            Animated.timing(taglineOpacity, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }).start(() => {
              // Repeat the cycle
              setTimeout(() => startEnhancedTaglineAnimation(), 3000);
            });
          }, 800);
        });
      }, 2500);
    });
  }, [taglineOpacity]);

  const startTaglineAnimation = useCallback(() => {
    taglineOpacity.setValue(0);
    Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 1800,
      delay: 1500,
      // easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      // Loop the animation
      setTimeout(() => {
        Animated.timing(taglineOpacity, {
          toValue: 0,
          duration: 1800,
          // easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }).start(() => startTaglineAnimation());
      }, 4000);
    });
  }, [taglineOpacity]);

  const onPressIn = () => {
    logAction('LANGUAGE_BUTTON_PRESSED');
    Animated.spring(buttonScale, {
      toValue: 0.9,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  // Game mode button press handlers
  const onGameModePressIn = useCallback((mode) => {
    logAction('GAME_MODE_BUTTON_PRESSED', { mode });
    
    if (OTAZO_JAR_REFRESH_ENABLED) {
      // New feedback: 1.02x scale + elevated shadow
      const scaleAnim = mode === 'partner' ? partnerButtonScale : 
                       mode === 'friend' ? friendButtonScale : partyButtonScale;
      
      Animated.spring(scaleAnim, {
        toValue: 1.02, // Spec: 1.02x scale
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }).start();
    }
  }, [logAction, partnerButtonScale, friendButtonScale, partyButtonScale]);

  const onGameModePressOut = useCallback((mode) => {
    if (OTAZO_JAR_REFRESH_ENABLED) {
      const scaleAnim = mode === 'partner' ? partnerButtonScale : 
                       mode === 'friend' ? friendButtonScale : partyButtonScale;
      
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }).start();
    }
  }, [partnerButtonScale, friendButtonScale, partyButtonScale]);

  return (
    <View style={styles.container}>
      {/* Premium Background Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#667eea']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <SafeAreaView style={OTAZO_JAR_REFRESH_ENABLED ? styles.safeAreaRefresh : styles.safeArea}>
        <TouchableOpacity
          style={styles.languageButton}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={() => {
            logAction('LANGUAGE_NAVIGATION');
            navigation.navigate('Language');
          }}
        >
          <View style={styles.languageButtonGlass}>
            <LanguageIcon size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={OTAZO_JAR_REFRESH_ENABLED ? styles.contentRefresh : styles.content}>
          {/* Jar Icon - Scaled 1.5x and centered above title */}
          <Animated.Image
            source={require('../assets/glass.png')}
            style={[
              OTAZO_JAR_REFRESH_ENABLED ? styles.jarIconRefresh : styles.glassImage,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    rotate: glassRotation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-3deg', '3deg'],
                    }),
                  },
                  { 
                    scale: OTAZO_JAR_REFRESH_ENABLED 
                      ? jarScale.interpolate({
                          inputRange: [0.9, 1],
                          outputRange: [0.9, 1],
                        })
                      : fadeAnim 
                  },
                ],
              },
            ]}
            resizeMode="contain"
          />

          {/* Title Container */}
          <View style={OTAZO_JAR_REFRESH_ENABLED ? styles.titleContainerRefresh : styles.titleContainer}>
            <Text style={OTAZO_JAR_REFRESH_ENABLED ? styles.titleRefresh : styles.title}>
              {displayText}
              <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
                |
              </Animated.Text>
            </Text>
          </View>

          {/* Tagline - New positioning */}
          <Text style={OTAZO_JAR_REFRESH_ENABLED ? styles.taglineRefresh : styles.tagline}>
            {translations[language]?.tagline || 'Spark meaningful conversations'}
          </Text>

          {/* Game Mode Selection */}
          <View style={OTAZO_JAR_REFRESH_ENABLED ? styles.gameModeContainerRefresh : styles.gameModeContainer}>
            <Text style={OTAZO_JAR_REFRESH_ENABLED ? styles.gameModeTitleRefresh : styles.gameModeTitle}>
              {translations[language]?.selectGameMode || 'Select Game Mode'}
            </Text>
            
            <View style={OTAZO_JAR_REFRESH_ENABLED ? styles.gameModeButtonsRefresh : styles.gameModeButtons}>
              {/* Partner Mode */}
              <TouchableOpacity
                style={OTAZO_JAR_REFRESH_ENABLED ? styles.gameModeButtonRefresh : styles.gameModeButton}
                onPressIn={() => onGameModePressIn('partner')}
                onPress={() => handleGameModeSelect('partner')}
                onPressOut={() => onGameModePressOut('partner')}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    OTAZO_JAR_REFRESH_ENABLED ? styles.gameModeButtonContentRefresh : styles.gameModeButtonContent,
                    { transform: [{ scale: partnerButtonScale }] },
                  ]}
                >
                  <LinearGradient
                    colors={['rgba(33, 150, 243, 0.3)', 'rgba(33, 150, 243, 0.1)']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <View style={OTAZO_JAR_REFRESH_ENABLED ? styles.buttonInnerRefresh : styles.buttonInner}>
                    <View style={[
                      OTAZO_JAR_REFRESH_ENABLED ? styles.iconContainerRefresh : styles.iconContainer, 
                      styles.partnerIconBg
                    ]}>
                      <PartnerIcon size={OTAZO_JAR_REFRESH_ENABLED ? 40 : 28} color="#2196f3" />
                    </View>
                    <View style={OTAZO_JAR_REFRESH_ENABLED ? styles.textContainerRefresh : styles.textContainer}>
                      <Text style={OTAZO_JAR_REFRESH_ENABLED ? styles.gameModeTextRefresh : styles.gameModeText}>
                        {translations[language]?.partnerMode || 'Partner Mode'}
                      </Text>
                      <Text style={OTAZO_JAR_REFRESH_ENABLED ? styles.gameModeSubtextRefresh : styles.gameModeSubtext}>
                        {translations[language]?.partnerModeSubtext || 'Perfect for couples'}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              </TouchableOpacity>

              {/* Friend Mode */}
              <TouchableOpacity
                style={OTAZO_JAR_REFRESH_ENABLED ? styles.gameModeButtonRefresh : styles.gameModeButton}
                onPressIn={() => onGameModePressIn('friend')}
                onPress={() => handleGameModeSelect('friend')}
                onPressOut={() => onGameModePressOut('friend')}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    OTAZO_JAR_REFRESH_ENABLED ? styles.gameModeButtonContentRefresh : styles.gameModeButtonContent,
                    { transform: [{ scale: friendButtonScale }] },
                  ]}
                >
                  <LinearGradient
                    colors={['rgba(76, 175, 80, 0.3)', 'rgba(76, 175, 80, 0.1)']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <View style={OTAZO_JAR_REFRESH_ENABLED ? styles.buttonInnerRefresh : styles.buttonInner}>
                    <View style={[
                      OTAZO_JAR_REFRESH_ENABLED ? styles.iconContainerRefresh : styles.iconContainer, 
                      styles.friendIconBg
                    ]}>
                      <FriendIcon size={OTAZO_JAR_REFRESH_ENABLED ? 40 : 28} color="#4caf50" />
                    </View>
                    <View style={OTAZO_JAR_REFRESH_ENABLED ? styles.textContainerRefresh : styles.textContainer}>
                      <Text style={OTAZO_JAR_REFRESH_ENABLED ? styles.gameModeTextRefresh : styles.gameModeText}>
                        {translations[language]?.friendMode || 'Friend Mode'}
                      </Text>
                      <Text style={OTAZO_JAR_REFRESH_ENABLED ? styles.gameModeSubtextRefresh : styles.gameModeSubtext}>
                        {translations[language]?.friendModeSubtext || 'Great for small groups'}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              </TouchableOpacity>

              {/* Party Mode */}
              <TouchableOpacity
                style={OTAZO_JAR_REFRESH_ENABLED ? styles.gameModeButtonRefresh : styles.gameModeButton}
                onPressIn={() => onGameModePressIn('party')}
                onPress={() => handleGameModeSelect('party')}
                onPressOut={() => onGameModePressOut('party')}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    OTAZO_JAR_REFRESH_ENABLED ? styles.gameModeButtonContentRefresh : styles.gameModeButtonContent,
                    { transform: [{ scale: partyButtonScale }] },
                  ]}
                >
                  <LinearGradient
                    colors={['rgba(255, 152, 0, 0.3)', 'rgba(255, 152, 0, 0.1)']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <View style={OTAZO_JAR_REFRESH_ENABLED ? styles.buttonInnerRefresh : styles.buttonInner}>
                    <View style={[
                      OTAZO_JAR_REFRESH_ENABLED ? styles.iconContainerRefresh : styles.iconContainer, 
                      styles.partyIconBg
                    ]}>
                      <PartyIcon size={OTAZO_JAR_REFRESH_ENABLED ? 40 : 28} color="#ff9800" />
                    </View>
                    <View style={OTAZO_JAR_REFRESH_ENABLED ? styles.textContainerRefresh : styles.textContainer}>
                      <Text style={OTAZO_JAR_REFRESH_ENABLED ? styles.gameModeTextRefresh : styles.gameModeText}>
                        {translations[language]?.partyMode || 'Party Mode'}
                      </Text>
                      <Text style={OTAZO_JAR_REFRESH_ENABLED ? styles.gameModeSubtextRefresh : styles.gameModeSubtext}>
                        {translations[language]?.partyModeSubtext || 'Perfect for celebrations'}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            </View>
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
  languageButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  languageButtonGlass: {
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  glassImage: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 40,
  },
  titleContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cursor: {
    color: '#fff',
    fontWeight: '300',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  gameModeContainer: {
    width: '100%',
    alignItems: 'center',
  },
  gameModeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  gameModeButtons: {
    width: '100%',
    gap: 16,
  },
  gameModeButton: {
    width: '100%',
  },
  gameModeButtonContent: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    minHeight: 100,
  },
  buttonGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  partnerIconBg: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  friendIconBg: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  partyIconBg: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  gameModeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'left',
    marginBottom: 4,
    letterSpacing: 0.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  gameModeSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
    letterSpacing: 0.1,
  },
  // New styles for OtázoJar refresh - RESPONSIVE DESIGN
  safeAreaRefresh: {
    flex: 1,
    position: 'relative',
  },
  contentRefresh: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: Math.max(20, width * 0.05),
    paddingTop: Math.max(60, height * 0.08), // Responsive top padding
  },
  jarIconRefresh: {
    width: Math.min(width * 0.35, 200), // Responsive jar size (1.5x from ~133px)
    height: Math.min(width * 0.35, 200),
    marginBottom: 24, // 24px below jar (spec compliance)
  },
  titleContainerRefresh: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16, // 16px below title (spec compliance)
  },
  titleRefresh: {
    fontSize: Math.min(32, width * 0.08), // 2rem = 32px responsive
    fontWeight: '800', // Enhanced: Extra Bold for main title impact
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1.8, // Increased letter spacing for premium feel
    textShadowColor: 'rgba(0, 0, 0, 0.4)', // Stronger shadow for depth
    textShadowOffset: { width: 0, height: 3 },
    textShadowOpacity: 1,
    textShadowRadius: 6,
  },
  taglineRefresh: {
    fontSize: 16, // Slightly larger for better readability
    fontWeight: '300', // Light weight for elegant contrast
    color: 'rgba(255, 255, 255, 0.85)', // Slightly more transparent
    marginBottom: 32, // 32px below tagline (spec compliance)
    textAlign: 'center',
    letterSpacing: 0.8, // More open letter spacing for readability
    lineHeight: 24, // Increased line height for breathing room
    paddingHorizontal: Math.max(20, width * 0.1), // Responsive padding
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowOpacity: 1,
    textShadowRadius: 4,
    fontStyle: 'normal', // Ensure clean rendering
  },
  gameModeContainerRefresh: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  gameModeTitleRefresh: {
    fontSize: 20, // Slightly larger for hierarchy
    fontWeight: '700', // Bold for section headers
    color: '#fff',
    marginBottom: 24, // 24px below heading (spec compliance)
    textAlign: 'center',
    letterSpacing: 0.5, // Refined letter spacing
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowOpacity: 1,
    textShadowRadius: 4,
  },
  gameModeButtonsRefresh: {
    width: '100%',
    gap: 16, // 16px between cards (spec compliance)
    paddingBottom: Math.max(40, height * 0.05), // 40px to bottom safe area
  },
  gameModeButtonRefresh: {
    width: '100%',
  },
  gameModeButtonContentRefresh: {
    height: 96, // Spec: 96px tall
    borderRadius: 16, // Spec: 16px corners
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Spec: ~15% opacity
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonInnerRefresh: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16, // Spec: 16px internal padding
    height: '100%',
  },
  iconContainerRefresh: {
    width: 40, // Spec: 40×40px
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8, // Spec: shifted left by 8px
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  textContainerRefresh: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  gameModeTextRefresh: {
    fontSize: 22, // Larger for better hierarchy
    fontWeight: '700', // Bold for card titles
    color: '#fff',
    textAlign: 'left',
    marginBottom: 6, // Slightly more space
    letterSpacing: 0.4, // Better letter spacing
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowOpacity: 1,
    textShadowRadius: 4,
  },
  gameModeSubtextRefresh: {
    fontSize: 15, // Slightly larger for readability
    fontWeight: '300', // Light weight for subtitle
    color: 'rgba(255, 255, 255, 0.75)', // Softer for hierarchy
    textAlign: 'left',
    letterSpacing: 0.3, // More open spacing
    lineHeight: 22, // Better breathing room
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowOpacity: 1,
    textShadowRadius: 2,
  },
});

export default HomeScreen; 