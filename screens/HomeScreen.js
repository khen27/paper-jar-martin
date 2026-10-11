import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import LanguageIcon from '../components/LanguageIcon';
import { PartnerIcon, FriendIcon, PartyIcon, HeartIcon, BrnoIcon, ColorIcon } from '../components/GameModeIcons';
import { ModernButton, AppDialog } from '../components/ui';
import GameTile from '../components/GameTile';
import StylePickerSheet from '../components/StylePickerSheet';
import { hasDrinksVariant, isKnownMode } from '../utils/decks';
import { useResponsive } from '../utils/responsive';
import { lockedVariants, isModeBadgedPremium, isSkinUnlocked } from '../utils/entitlements';
import { getSeasonalTiles } from '../utils/seasons';
import SeasonalDecor from '../components/SeasonalDecor';
import { consumeDeepLink, shareText } from '../utils/share';
import { tokens } from '../theme/tokens';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { isInstalledApp } from '../utils/install';
import { appWidth as width, appHeight as height } from '../utils/layout';
import { getQuestionOfTheDay } from '../utils/dailyQuestion';
import { getStreak, recordPlay } from '../utils/streaks';
import { track } from '../utils/analytics';

// Feature Flag for OtázoJar Refresh
const OTAZO_JAR_REFRESH_ENABLED = true;

const MODE_TILES = {
  partner: { icon: 'partner', emoji: '💞', colors: ['#FF5E8A', '#E0245E'], titleKey: 'partnerMode', title: 'Partner', subKey: 'partnerTileSub', sub: 'Date night for two' },
  friend: { icon: 'friend', emoji: '🍕', colors: ['#8F6BFF', '#5B3FD9'], titleKey: 'friendMode', title: 'Friends', subKey: 'friendTileSub', sub: 'Small crew, big laughs' },
  party: { icon: 'party', emoji: '🎉', colors: ['#FF9F1C', '#FF4E50'], titleKey: 'partyMode', title: 'Party', subKey: 'partyTileSub', sub: 'Pass the phone · 2–8 players', wide: true },
  adult: { icon: 'adult', emoji: '🔥', colors: ['#FF3D6E', '#8E2DE2'], titleKey: 'adultMode', title: 'Adult Fun', subKey: 'adultTileSub', sub: 'Flirty truths & dares', corner: '18+' },
  workout: { icon: 'workout', emoji: '💪', colors: ['#2ED47A', '#0C9F8C'], titleKey: 'workoutMode', title: 'Workout', subKey: 'workoutTileSub', sub: 'Sweat, reps & gym talk' },
  knowMe: { icon: 'knowMe', emoji: '🧠', colors: ['#3DA9FC', '#1F6FEB'], titleKey: 'knowMeMode', title: 'How well do you know me?', subKey: 'knowMeTileSub', sub: 'Guess answers, score points' },
  brnoPrague: { icon: 'brnoPrague', emoji: '🍺', colors: ['#FFC94D', '#F28B1D'], titleKey: 'brnoPragueMode', title: 'Brno vs. Prague', subKey: 'brnoTileSub', sub: 'The great rivalry' },
  office: { icon: 'office', emoji: '💼', colors: ['#5C7CFA', '#364FC7'], titleKey: 'officeMode', title: 'Office', subKey: 'officeTileSub', sub: 'Team icebreakers' },
  homePack: { icon: 'homePack', emoji: '⭐', colors: ['#FFD95A', '#E8A100'], titleKey: 'homePackMode', title: 'Golden Jar', subKey: 'homePackSubtext', sub: 'Bonus cards — your install reward' },
  custom: { icon: 'custom', emoji: '✍️', colors: ['#22D3EE', '#0E7490'], titleKey: 'customMode', title: 'Your cards', subKey: 'customTileSub', sub: 'Write your own questions & dares' },
  halloween: { icon: 'halloween', emoji: '🎃', colors: ['#3B0F5C', '#F76707'], titleKey: 'halloweenMode', title: 'Halloween', subKey: 'halloweenTileSub', sub: 'Spooky questions & dares' },
  autumn: { icon: 'autumn', emoji: '🍂', colors: ['#B45309', '#F59E0B'], titleKey: 'autumnMode', title: 'Cozy Fall', subKey: 'autumnTileSub', sub: 'Blankets, tea & stories' },
  christmas: { icon: 'christmas', emoji: '🎄', colors: ['#166534', '#DC2626'], titleKey: 'christmasMode', title: 'Christmas', subKey: 'christmasTileSub', sub: 'Festive fun for the whole family' },
  invite: { icon: 'invite', emoji: '💌', colors: ['#F472B6', '#BE185D'], titleKey: 'inviteTile', title: 'Invite friends', subKey: 'inviteTileSub', sub: 'Send a link and play together' },
};

const MODE_SECTIONS = [
  { key: 'duo', titleKey: 'sectionDuo', fallback: '💘 For two', modes: ['partner', 'knowMe'] },
  { key: 'group', titleKey: 'sectionGroup', fallback: '🥳 Group games', modes: ['party', 'friend', 'brnoPrague'] },
  { key: 'packs', titleKey: 'packsSection', fallback: '🎁 Packs', modes: ['adult', 'workout', 'office', 'homePack'] },
  { key: 'yours', titleKey: 'sectionYours', fallback: '✨ Make it yours', modes: ['custom', 'invite'] },
];

// 3-column layouts (tablet/desktop/TV): every row full, no lonely tiles.
const MODE_SECTIONS_WIDE = [
  { key: 'duo', titleKey: 'sectionDuo', fallback: '💘 For two', modes: ['partner', 'knowMe', 'custom'] },
  { key: 'group', titleKey: 'sectionGroup', fallback: '🥳 Group games', modes: ['party', 'friend', 'brnoPrague'] },
  { key: 'packs', titleKey: 'packsSection', fallback: '🎁 Packs', modes: ['adult', 'workout', 'office'] },
  { key: 'yours', titleKey: 'sectionYours', fallback: '✨ Make it yours', modes: ['homePack', 'invite'] },
];

const HomeScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { getCurrentGradient, currentTheme, changeTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const seasonalTiles = getSeasonalTiles(new Date(), !!settings.seasonPreview);
  const seasonalSection = seasonalTiles.length
    ? [{ key: 'season', titleKey: 'sectionSeason', fallback: '🍂 Seasonal', modes: seasonalTiles.map((p) => p.mode) }]
    : [];
  const [comingSoon, setComingSoon] = useState(null);
  const [pendingDrinks, setPendingDrinks] = useState(null);
  const { isWide, isPhone, device, maxWidth: columnMax, fs } = useResponsive();
  const splitLayout = device === 'desktop' || device === 'tv';
  const gridColumns = isPhone ? 2 : 3;
  const [gridWidth, setGridWidth] = useState(0);
  const GRID_GAP = isPhone ? 0 : 16;
  const tileWidth = gridWidth
    ? isPhone
      ? undefined
      : Math.floor((gridWidth - GRID_GAP * (gridColumns - 1)) / gridColumns)
    : undefined;
  const t = (key, fallback) => translations[language]?.[key] || fallback;
  const [displayText, setDisplayText] = useState('');
  const [selectedMode, setSelectedMode] = useState(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [showAdultDialog, setShowAdultDialog] = useState(false);
  const [pendingStyleMode, setPendingStyleMode] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [dailyQuestion, setDailyQuestion] = useState('');
  const homePackUnlocked = isInstalledApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.95)).current;
  const glassRotation = useRef(new Animated.Value(0)).current;
  const jarScale = useRef(new Animated.Value(0.9)).current; // New jar entrance animation
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  
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
    if (__DEV__) {
      console.log('🎮 PAPER JAR - USER ACTION:', logEntry);
    }
  }, [language, selectedMode]);

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
    
    const text = 'Talk Trap';
    logAction('TYPING_ANIMATION_STARTED', { text });
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

  // Premium skins fall back to the default theme once premium / the ad unlock runs out.
  useEffect(() => {
    if (currentTheme?.premium && !isSkinUnlocked(currentTheme, settings)) changeTheme('sunset-orange');
  }, [currentTheme, settings.premiumUnlocked, settings.adUnlocks]);

  const launchGameMode = useCallback((mode, variant = 'classic') => {
    if (variant === 'drinks' && !settings.drinksAgeConfirmed) {
      setPendingDrinks({ mode, variant });
      return;
    }
    logAction('NAVIGATING_TO_GAME', { gameMode: mode, variant });
    track('style_selected', { gameMode: mode, variant });
    if (mode === 'party') {
      navigation.navigate('Party', { variant });
    } else if (mode === 'knowMe') {
      navigation.navigate('KnowMe');
    } else {
      navigation.navigate('Game', { gameMode: mode, variant });
    }
  }, [logAction, navigation, settings.drinksAgeConfirmed]);

  // Modes with a Drinks deck ask Classic vs Drinks first; the rest start straight away.
  const handleGameModeSelect = useCallback((mode) => {
    logAction('GAME_MODE_SELECTED', { selectedMode: mode });
    setSelectedMode(mode);
    if (hasDrinksVariant(mode)) {
      setPendingStyleMode(mode);
      return;
    }
    launchGameMode(mode, 'classic');
  }, [logAction, launchGameMode]);

  const onTilePress = useCallback((mode) => {
    if (mode === 'custom') {
      navigation.navigate('CustomCards');
    } else if (mode === 'invite') {
      shareText({
        message:
          translations[language]?.inviteMessage ||
          'Come play Talk Trap with us 🎉 Party cards, dares and laughs, free in your browser.',
        event: 'invite_shared',
      });
    } else if (seasonalTiles.some((p) => p.mode === mode && !p.open)) {
      setComingSoon(seasonalTiles.find((p) => p.mode === mode));
    } else if (mode === 'homePack' && !homePackUnlocked) {
      logAction('INSTALL_GUIDE_OPENED');
      navigation.navigate('Install');
    } else if (mode === 'adult' && !settings.adultConfirmed) {
      setShowAdultDialog(true);
    } else {
      handleGameModeSelect(mode);
    }
  }, [homePackUnlocked, settings.adultConfirmed, handleGameModeSelect, logAction, navigation, language, seasonalTiles]);

  // Shared links: ?m=mode&v=variant&c=card open that game (adult still goes through the 18+ gate).
  useEffect(() => {
    let alive = true;
    consumeDeepLink().then((link) => {
      if (!alive || !link) return;
      if (link.mode === 'knowMe') {
        navigation.navigate('KnowMe');
      } else if (!isKnownMode(link.mode)) {
        return;
      } else if (link.mode === 'adult' && !settings.adultConfirmed) {
        setShowAdultDialog(true);
      } else if (link.mode === 'party') {
        navigation.navigate('Party', { variant: link.variant });
      } else if (link.mode === 'homePack' && !homePackUnlocked) {
        navigation.navigate('Install');
      } else if (link.variant === 'drinks' && !settings.drinksAgeConfirmed) {
        setPendingDrinks({ mode: link.mode, variant: 'drinks', startCard: link.card });
      } else if (link.mode !== 'custom') {
        navigation.navigate('Game', { gameMode: link.mode, variant: link.variant, startCard: link.card });
      }
    });
    return () => {
      alive = false;
    };
  }, []);

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
    const text = translations[language]?.paperJar || 'Talk Trap';
    logAction('TYPING_ANIMATION_STARTED', { text });
    startTypingAnimation(text);

    return cleanupTypingAnimation;
  }, [language]); // Removed other dependencies to prevent infinite loop

  const loadFavorites = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      const favoritesData = stored ? JSON.parse(stored) : [];
      setFavoritesCount(favoritesData.length);
      logAction('FAVORITES_COUNT_LOADED', { count: favoritesData.length });
    } catch (e) {
      console.error('Error loading favorites count:', e);
    }
  }, []);

  // Load favorites count on mount and when screen is focused
  useEffect(() => {
    loadFavorites();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadFavorites();
      getStreak().then((s) => setStreakCount(s.streak || 0));
    });

    return unsubscribe;
  }, [navigation, loadFavorites]);

  useEffect(() => {
    setDailyQuestion(getQuestionOfTheDay(language).text);
    getStreak().then((s) => setStreakCount(s.streak || 0));
    track('home_viewed', { language });
  }, [language]);

  // One-time celebration the first time the app launches from a home-screen icon (web PWA)
  useEffect(() => {
    if (Platform.OS !== 'web' || !homePackUnlocked) return;
    (async () => {
      try {
        const seen = await AsyncStorage.getItem('@paper_jar_homepack_celebrated');
        if (!seen) {
          setShowUnlockDialog(true);
          await AsyncStorage.setItem('@paper_jar_homepack_celebrated', '1');
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Initial animations
  useEffect(() => {
    logAction('COMPONENT_MOUNTED');

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

    animationRef.current = glassAnimation;
    glassAnimation.start();

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

  const handleFavoritesPress = () => {
    logAction('FAVORITES_BUTTON_PRESSED');
    navigation.navigate('Favorites');
  };

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

  const languageButton = (
    <ModernButton
      variant="secondary"
      size="sm"
      onPress={() => {
        logAction('LANGUAGE_NAVIGATION');
        navigation.navigate('Language');
      }}
      style={styles.topButton}
      accessibilityRole="button"
      accessibilityHint={`${translations[language]?.languageHint || 'Change language'}`}
    >
      <LanguageIcon size={tokens.components.icon.md} color="#fff" />
    </ModernButton>
  );

  const colorButton = (
    <ModernButton
      variant="secondary"
      size="sm"
      onPress={() => {
        logAction('COLOR_NAVIGATION');
        navigation.navigate('Color');
      }}
      style={styles.topButton}
      accessibilityRole="button"
      accessibilityHint="Choose app color theme"
    >
      <ColorIcon size={tokens.components.icon.md} color="#fff" />
    </ModernButton>
  );

  const settingsButton = (
    <ModernButton
      variant="secondary"
      size="sm"
      onPress={() => navigation.navigate('Settings')}
      style={styles.topButton}
      accessibilityRole="button"
      accessibilityHint="Open settings"
    >
      <Text style={styles.settingsGlyph}>⚙</Text>
    </ModernButton>
  );

  const favoritesButton = (
    <View>
      <ModernButton
        variant="secondary"
        size="sm"
        onPress={handleFavoritesPress}
        style={styles.topButton}
        accessibilityRole="button"
        accessibilityHint={`${translations[language]?.favoritesHint || 'View favorite questions'}`}
      >
        <HeartIcon size={tokens.components.icon.md} color="#fff" />
      </ModernButton>
      {favoritesCount > 0 && (
        <View style={styles.favoritesBadge}>
          <Text style={styles.favoritesBadgeText}>{favoritesCount > 99 ? '99+' : favoritesCount}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Premium Background Gradient */}
      <LinearGradient
        colors={getCurrentGradient().colors}
        style={styles.backgroundGradient}
        start={getCurrentGradient().start}
        end={getCurrentGradient().end}
      />
      
      <SeasonalDecor />
      <SafeAreaView style={OTAZO_JAR_REFRESH_ENABLED ? styles.safeAreaRefresh : styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="always"
        >
        <View style={[styles.pageColumn, { maxWidth: columnMax }]}>
        {isWide ? (
          <View style={styles.topBar}>
            <View style={styles.topBarGroup}>{favoritesButton}</View>
            <View style={styles.topBarGroup}>
              {languageButton}
              {colorButton}
              {settingsButton}
            </View>
          </View>
        ) : (
          <>
            <Animated.View
              style={[styles.topButtonContainer, styles.languageButton, { transform: [{ scale: buttonScale }] }]}
            >
              {languageButton}
            </Animated.View>
            <Animated.View
              style={[styles.topButtonContainer, styles.languageButtonDuplicate, { transform: [{ scale: buttonScale }] }]}
            >
              {colorButton}
            </Animated.View>
            <View style={[styles.topButtonContainer, styles.settingsButton]}>{settingsButton}</View>
            <View style={[styles.topButtonContainer, styles.favoritesButton]}>{favoritesButton}</View>
          </>
        )}

          <View
            style={[
              OTAZO_JAR_REFRESH_ENABLED ? styles.contentRefresh : styles.content,
              splitLayout && styles.splitRow,
              isWide && styles.contentWide,
            ]}
          >
          <View style={splitLayout ? styles.heroColumn : styles.heroStack}>
            <Animated.Image
            source={require('../assets/glass.png')}
            style={[
              OTAZO_JAR_REFRESH_ENABLED ? styles.jarIconRefresh : styles.glassImage,
              isWide && { width: fs(150), height: fs(150) },
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

          <View style={OTAZO_JAR_REFRESH_ENABLED ? styles.titleContainerRefresh : styles.titleContainer}>
            <Text style={[OTAZO_JAR_REFRESH_ENABLED ? styles.titleRefresh : styles.title, isWide && { fontSize: fs(44) }]}>
              {displayText}
              <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
                |
              </Animated.Text>
            </Text>
          </View>

          <Text style={[OTAZO_JAR_REFRESH_ENABLED ? styles.taglineRefresh : styles.tagline, isWide && styles.taglineWide]}>
            {translations[language]?.tagline || 'Spark meaningful conversations'}
          </Text>

          {streakCount > 0 && (
            <View style={styles.streakChip}>
              <Text style={styles.streakChipText}>
                🔥 {streakCount} {(translations[language]?.streakShort || 'day streak')}
              </Text>
            </View>
          )}

          <Pressable
            onPress={() => {
              recordPlay().then((s) => setStreakCount(s.streak || 0));
              track('qotd_tapped');
              navigation.navigate('Game', { gameMode: 'partner' });
            }}
            style={[styles.dailyWrap, isWide && !splitLayout && styles.dailyWrapCentered]}
            accessibilityRole="button"
          >
            <View style={styles.dailyCardBack} />
            <View style={styles.dailyCard}>
              <View style={styles.dailyHeader}>
                <Text style={styles.dailyEyebrow}>
                  🃏 {translations[language]?.questionOfDay || 'Card of the day'}
                </Text>
                <Text style={styles.dailyCta}>
                  {translations[language]?.tapToPlay || 'Tap to play →'}
                </Text>
              </View>
              <Text style={[styles.dailyText, isWide && { fontSize: fs(18), lineHeight: fs(25) }]} numberOfLines={3}>
                {dailyQuestion}
              </Text>
            </View>
          </Pressable>
          </View>

          <View
            style={[styles.gameMenu, splitLayout && styles.menuColumn]}
            onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
          >
            {[...seasonalSection, ...(isPhone ? MODE_SECTIONS : MODE_SECTIONS_WIDE)].map((section) => (
              <View key={section.key} style={styles.menuSection}>
                <Text style={[styles.menuTitle, isWide && { fontSize: fs(20) }]}>
                  {translations[language]?.[section.titleKey] || section.fallback}
                </Text>
                <View style={[styles.tileGrid, !isPhone && { justifyContent: 'flex-start', gap: GRID_GAP }]}>
                  {section.modes.map((mode, idx) => {
                    const tile = MODE_TILES[mode];
                    const oddLast =
                      section.key === 'season' && section.modes.length % 2 === 1 && idx === section.modes.length - 1;
                    const season = seasonalTiles.find((p) => p.mode === mode);
                    const seasonClosed = season && !season.open;
                    const locked = (mode === 'homePack' && !homePackUnlocked) || seasonClosed;
                    const premium = isModeBadgedPremium(mode, settings);
                    return (
                      <GameTile
                        key={mode}
                        emoji={tile.emoji}
                        icon={tile.icon}
                        colors={tile.colors}
                        wide={(tile.wide || oddLast) && isPhone}
                        width={tileWidth}
                        textScale={device === 'tv' ? 1.3 : 1}
                        locked={locked}
                        corner={
                          season && season.open
                            ? t('limitedCorner', '⏳ Limited')
                            : premium
                              ? `👑${tile.corner ? ` ${tile.corner}` : ''}`
                              : tile.corner
                        }
                        title={translations[language]?.[tile.titleKey] || tile.title}
                        subtitle={
                          seasonClosed
                            ? `${t('seasonOpensOn', 'Opens')} ${season.opensOn[1]}. ${season.opensOn[0]}.`
                            : locked
                              ? translations[language]?.homePackLockedSubtext ||
                                'Add Talk Trap to your home screen to unlock'
                              : translations[language]?.[tile.subKey] || tile.sub
                        }
                        badge={
                          hasDrinksVariant(mode)
                            ? translations[language]?.twoStylesBadge || '🎤 Classic · 🍻 Drinks'
                            : null
                        }
                        onPress={() => onTilePress(mode)}
                      />
                    );
                  })}
                </View>
              </View>
            ))}
            <Pressable onPress={() => navigation.navigate('Legal')} style={styles.legalLink} accessibilityRole="link">
              <Text style={styles.legalLinkText}>{t('legalLink', 'Terms & Privacy')}</Text>
            </Pressable>
          </View>

          </View>
        </View>
        </ScrollView>
      </SafeAreaView>

      <AppDialog
        visible={showUnlockDialog}
        title={translations[language]?.homePackUnlockedTitle || '⭐ Golden Jar unlocked!'}
        message={
          translations[language]?.homePackUnlockedMsg ||
          'Thanks for adding Talk Trap to your home screen. The bonus cards are yours.'
        }
        buttons={[
          {
            text: translations[language]?.letsPlay || "Let's play!",
            onPress: () => handleGameModeSelect('homePack'),
          },
          { text: translations[language]?.later || 'Later', style: 'cancel' },
        ]}
        onRequestClose={() => setShowUnlockDialog(false)}
      />

      <AppDialog
        visible={showAdultDialog}
        title={translations[language]?.adultGateTitle || 'Adult Fun · 18+'}
        message={
          translations[language]?.adultGateMsg ||
          'Flirty truths, dares, and drink-or-cringe forfeits. Confirm you are 18 or older. Play with consent — skip anything you’re not into.'
        }
        buttons={[
          {
            text: translations[language]?.adultConfirm || "I'm 18+",
            onPress: () => {
              updateSettings({ adultConfirmed: true });
              track('adult_confirmed');
              // Let the gate modal finish closing before the style sheet opens (iOS drops stacked modals).
              setTimeout(() => handleGameModeSelect('adult'), 300);
            },
          },
          {
            text: translations[language]?.cancel || 'Cancel',
            style: 'cancel',
          },
        ]}
        onRequestClose={() => setShowAdultDialog(false)}
      />

      <AppDialog
        visible={!!pendingDrinks}
        title={t('drinksAgeTitle', '🔞 Drinks edition')}
        message={t(
          'drinksAgeMsg',
          'Only people who are of legal drinking age where you are playing may drink alcohol. Everyone else plays with soft drinks — they count exactly the same. Drink responsibly and never drive after drinking.'
        )}
        buttons={[
          {
            text: t('drinksAgeConfirm', 'Got it, let’s play'),
            onPress: () => {
              const next = pendingDrinks;
              updateSettings({ drinksAgeConfirmed: true });
              track('drinks_age_confirmed');
              setPendingDrinks(null);
              if (next) {
                setTimeout(() => {
                  if (next.mode === 'party') navigation.navigate('Party', { variant: 'drinks' });
                  else navigation.navigate('Game', { gameMode: next.mode, variant: 'drinks', startCard: next.startCard });
                }, 300);
              }
            },
          },
          { text: t('drinksAgeClassic', 'Play Classic instead'), onPress: () => {
            const next = pendingDrinks;
            setPendingDrinks(null);
            if (next) setTimeout(() => launchGameMode(next.mode, 'classic'), 300);
          } },
          { text: t('cancel', 'Cancel'), style: 'cancel' },
        ]}
        onRequestClose={() => setPendingDrinks(null)}
      />

      <AppDialog
        visible={!!comingSoon}
        title={comingSoon ? `${MODE_TILES[comingSoon.mode].emoji} ${t(MODE_TILES[comingSoon.mode].titleKey, MODE_TILES[comingSoon.mode].title)}` : ''}
        message={
          comingSoon
            ? `${t('seasonComingSoon', 'This seasonal pack opens on')} ${comingSoon.opensOn[1]}. ${comingSoon.opensOn[0]}. (${comingSoon.days} ${t('seasonDays', 'days')}) 🎁`
            : ''
        }
        buttons={[{ text: 'OK' }]}
        onRequestClose={() => setComingSoon(null)}
      />

      <StylePickerSheet
        visible={!!pendingStyleMode}
        modeEmoji={MODE_TILES[pendingStyleMode]?.emoji}
        modeIcon={MODE_TILES[pendingStyleMode]?.icon}
        modeTitle={
          pendingStyleMode
            ? translations[language]?.[MODE_TILES[pendingStyleMode].titleKey] ||
              MODE_TILES[pendingStyleMode].title
            : ''
        }
        t={(key, fallback) => translations[language]?.[key] || fallback}
        lockedVariants={pendingStyleMode ? lockedVariants(pendingStyleMode, settings) : []}
        onPick={(variant) => {
          const mode = pendingStyleMode;
          setPendingStyleMode(null);
          if (mode) launchGameMode(mode, variant);
        }}
        onClose={() => setPendingStyleMode(null)}
      />
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
    top: Math.max(70, height * 0.08),
    right: Math.max(20, width * 0.05),
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
  favoritesButton: {
    position: 'absolute',
    top: Math.max(70, height * 0.08),
    left: Math.max(20, width * 0.05),
    zIndex: 1,
  },
  favoritesButtonGlass: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    minHeight: 50,
  },
  favoritesBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4757',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 999,
  },
  favoritesBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowOpacity: 1,
    textShadowRadius: 2,
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
    backgroundColor: 'rgba(34, 197, 94, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 1)',
    shadowColor: 'rgba(34, 197, 94, 0.4)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  friendIconBg: {
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 1)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  partyIconBg: {
    backgroundColor: 'rgba(168, 85, 247, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 1)',
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: Math.max(20, width * 0.05),
    paddingTop: Math.max(40, height * 0.05), // Reduced top padding
    paddingBottom: Math.max(20, height * 0.03), // Reduced bottom padding
  },
  jarIconRefresh: {
    width: Math.min(width * 0.3, 160), // Smaller jar size to save space
    height: Math.min(width * 0.3, 160),
    marginBottom: 16, // Reduced margin below jar
  },
  titleContainerRefresh: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8, // Reduced margin below title
  },
  titleRefresh: {
    fontSize: Math.min(40, width * 0.1),
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowOpacity: 1,
    textShadowRadius: 0,
  },
  taglineRefresh: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.92)',
    marginBottom: 16,
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
    justifyContent: 'flex-start',
    marginTop: 'auto', // Push to center vertically in available space
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
    gap: Math.max(16, height * 0.02), // Responsive gap between cards
    paddingBottom: Math.max(20, height * 0.02), // Reduced bottom padding
  },
  gameModeButtonRefresh: {
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
    minHeight: height - Math.max(60, height * 0.08), // Ensure full height minus status bar
    paddingBottom: Math.max(40, height * 0.05), // Safe bottom padding
  },
  gameModeButtonContentRefresh: {
    minHeight: 96, // Minimum height
    height: Math.min(height * 0.12, 120), // Responsive height with max
    maxHeight: 120, // Maximum height
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
    width: 44, // Slightly larger for better proportion
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8, // Spec: shifted left by 8px
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  partnerIconBgRefresh: {
    backgroundColor: 'rgba(34, 197, 94, 0.7)', // Vibrant green
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 1)',
    shadowColor: 'rgba(34, 197, 94, 0.5)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  friendIconBgRefresh: {
    backgroundColor: 'rgba(59, 130, 246, 0.7)', // Vibrant blue
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 1)',
    shadowColor: 'rgba(59, 130, 246, 0.5)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  partyIconBgRefresh: {
    backgroundColor: 'rgba(168, 85, 247, 0.7)', // Vibrant purple
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 1)',
    shadowColor: 'rgba(168, 85, 247, 0.5)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
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
  // New Grid Layout Styles for 2x2 Layout
  gameModeButtonsGridRefresh: {
    width: '100%',
    gap: Math.max(12, height * 0.015), // Gap between rows
    paddingBottom: Math.max(20, height * 0.02),
  },
  gridRowRefresh: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Math.max(12, width * 0.03), // Gap between columns
  },
  gameModeButtonGridRefresh: {
    flex: 1, // Equal width for both buttons in row
  },
  gameModeButtonContentGridRefresh: {
    minHeight: 85, // Slightly smaller for grid
    height: Math.min(height * 0.11, 100), // Responsive height
    maxHeight: 100,
    borderRadius: 14, // Slightly smaller radius
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonInnerGridRefresh: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12, // Smaller padding for grid
    height: '100%',
  },
  iconContainerGridRefresh: {
    width: 36, // Smaller icon container for grid
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },

  textContainerGridRefresh: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  gameModeTextGridRefresh: {
    fontSize: 16, // Smaller for grid layout
    fontWeight: '700',
    color: '#fff',
    textAlign: 'left',
    marginBottom: 3,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowOpacity: 1,
    textShadowRadius: 3,
  },
  gameModeSubtextGridRefresh: {
    fontSize: 12, // Smaller subtext for grid
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'left',
    letterSpacing: 0.2,
    lineHeight: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowOpacity: 1,
    textShadowRadius: 2,
  },
  // Grid Row Styles
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  // AI Mode Styles
  aiModeButtonRefresh: {
    width: '100%',
    marginTop: Math.max(16, height * 0.02), // Extra spacing above hero button
  },
  aiModeButtonContentRefresh: {
    minHeight: 90, // Slightly taller than grid buttons
    height: Math.min(height * 0.115, 105),
    maxHeight: 105,
    borderRadius: 16, // Slightly larger radius for prominence
    overflow: 'hidden',
    backgroundColor: 'rgba(156, 39, 176, 0.15)', // Purple AI theme
    backdropFilter: 'blur(25px)',
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.3)',
    shadowColor: '#9c27b0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  aiButtonInnerRefresh: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Math.max(16, width * 0.04),
    paddingVertical: Math.max(12, height * 0.015),
  },
  aiIconContainerRefresh: {
    width: Math.max(48, width * 0.12),
    height: Math.max(48, width * 0.12),
    borderRadius: Math.max(24, width * 0.06),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Math.max(16, width * 0.04),
  },
  aiIconBgRefresh: {
    backgroundColor: 'rgba(156, 39, 176, 0.8)',
  },
  aiTextContainerRefresh: {
    flex: 1,
    justifyContent: 'center',
  },
  aiModeTextRefresh: {
    fontSize: Math.max(16, height * 0.022),
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
    textAlign: 'left',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowOpacity: 1,
    textShadowRadius: 2,
  },
  aiModeSubtextRefresh: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
    letterSpacing: 0.2,
    lineHeight: 17,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowOpacity: 1,
    textShadowRadius: 2,
  },

  // Modern game mode card styles
  modernGameModeCard: {
    minHeight: 76,
    marginBottom: tokens.spacing.sm,
  },
  modernButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modernIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: tokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerIconBg: {
    backgroundColor: 'rgba(34, 197, 94, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 1)',
    shadowColor: 'rgba(34, 197, 94, 0.4)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  modernTextContainer: {
    flex: 1,
  },
  lockedCard: {
    opacity: 0.75,
  },
  homePackIconBg: {
    backgroundColor: 'rgba(251, 191, 36, 0.55)',
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 1)',
  },
  homePackEmoji: {
    fontSize: 26,
  },
  knowMeIconBg: {
    backgroundColor: 'rgba(244, 114, 182, 0.55)',
    borderWidth: 2,
    borderColor: 'rgba(244, 114, 182, 1)',
  },
  adultIconBg: {
    backgroundColor: 'rgba(248, 113, 113, 0.55)',
    borderWidth: 2,
    borderColor: 'rgba(248, 113, 113, 1)',
  },
  workoutIconBg: {
    backgroundColor: 'rgba(52, 211, 153, 0.55)',
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 1)',
  },
  officeIconBg: {
    backgroundColor: 'rgba(96, 165, 250, 0.55)',
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 1)',
  },
  settingsButton: {
    right: Math.max(20, width * 0.05),
    top: Math.max(170, height * 0.2),
  },
  settingsGlyph: { color: '#fff', fontSize: 22, fontWeight: '600' },
  streakChip: {
    backgroundColor: '#FFD43B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#E0A800',
  },
  streakChipText: { color: '#5C3B00', fontWeight: '900', fontSize: 13 },
  dailyWrap: {
    width: '100%',
    marginBottom: 28,
    marginTop: 4,
  },
  dailyCardBack: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 8,
    bottom: -8,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.35)',
    transform: [{ rotate: '-2deg' }],
  },
  dailyCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    transform: [{ rotate: '1deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyEyebrow: {
    color: '#E0245E',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  dailyText: {
    color: '#22163F',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 25,
  },
  dailyCta: {
    color: '#7C5CFF',
    fontSize: 12,
    fontWeight: '900',
  },
  gameMenu: { width: '100%' },
  pageColumn: { width: '100%', alignSelf: 'center', flexGrow: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  topBarGroup: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  contentWide: { paddingHorizontal: 32, paddingTop: 16 },
  splitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 48 },
  heroStack: { width: '100%', alignItems: 'center' },
  heroColumn: { width: '36%', alignItems: 'center', paddingTop: 24 },
  menuColumn: { flex: 1, width: undefined },
  taglineWide: { paddingHorizontal: 0, fontSize: 18 },
  dailyWrapCentered: { maxWidth: 560, alignSelf: 'center' },
  legalLink: { alignSelf: 'center', padding: 12, marginTop: 4 },
  legalLinkText: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },
  menuSection: { width: '100%', marginBottom: 10 },
  menuTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  packsSectionTitle: {
    width: '100%',
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 12,
    letterSpacing: 0.3,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modernGameModeText: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  modernGameModeSubtext: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.medium,
    color: tokens.colors.text.secondary,
    lineHeight: tokens.typography.sizes.sm * tokens.typography.lineHeights.relaxed,
  },

  // Modern top button styles
  topButtonContainer: {
    position: 'absolute',
    top: Math.max(50, height * 0.06),
    zIndex: 1,
  },
  topButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  favoritesButton: {
    left: Math.max(20, width * 0.05),
  },
  languageButton: {
    right: Math.max(20, width * 0.05),
  },
  languageButtonDuplicate: {
    right: Math.max(20, width * 0.05),
    top: Math.max(110, height * 0.13), // Position beneath the first language button
  },

});

export default HomeScreen; 