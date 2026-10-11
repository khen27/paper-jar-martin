import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  ScrollView,
  PanResponder,
  Platform,
  Pressable,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { HintIcon } from '../components/GameIcons';
import { HeartIcon } from '../components/GameModeIcons';

import { ModernCard, ModernButton, ModernBackButton } from '../components/ui';
import { tokens } from '../theme/tokens';
import { useTheme } from '../contexts/ThemeContext';
import { getLocalizedText } from '../utils/i18n';
import { isRTL } from '../utils/rtl';
import { getDeck } from '../utils/decks';
import { getCardTypeMeta } from '../utils/cardTypes';
import { flattenDataset, initBag, nextIndex } from '../utils/questionBag';
import { appWidth as width } from '../utils/layout';
import ConfettiBurst from '../components/ConfettiBurst';
import RulesSheet from '../components/RulesSheet';
import { track } from '../utils/analytics';
import { recordPlay } from '../utils/streaks';
import { useSettings } from '../contexts/SettingsContext';
import { useResponsive } from '../utils/responsive';
import { useKeyboardShortcuts } from '../utils/useKeyboardShortcuts';
import { isDeckLocked, FREE_SAMPLE_CARDS, favoritesLimit } from '../utils/entitlements';
import { shareCard } from '../utils/share';

const glassImage = require('../assets/glass.png');

const buzz = () => {
  try {
    Vibration.vibrate(30);
  } catch (e) {
    // Not supported (e.g. iOS Safari) — ignore
  }
};

const GameScreen = ({ route, navigation }) => {
  const { language } = useLanguage();
  const { getCurrentGradient } = useTheme();
  const { settings } = useSettings();
  const isFocused = useIsFocused();
  const { fs, cardMaxWidth, isWide, height: winHeight } = useResponsive();
  const t = (key, fallback) => translations[language]?.[key] || fallback;
  const [rulesOpen, setRulesOpen] = useState(!!settings.showRules);
  const [currentRef, setCurrentRef] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionObject, setCurrentQuestionObject] = useState(null); // Store the full question object
  const [showHints, setShowHints] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const gameMode = route.params?.gameMode || 'partner';
  const variant = route.params?.variant === 'drinks' ? 'drinks' : 'classic';
  const startCard = route.params?.startCard;
  const deckLocked = isDeckLocked(gameMode, variant, settings);
  const modeTitle = t(`${gameMode}Mode`, `${gameMode} Mode`);
  const [questionType, setQuestionType] = useState('questions');
  const [burstKey, setBurstKey] = useState(0);
  const [cardCount, setCardCount] = useState(0);
  const cardPop = useRef(new Animated.Value(1)).current;
  const cardMeta = getCardTypeMeta(questionType, variant, language);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(50)).current;
  
  // Swipe gesture handling
  const swipeTranslateX = useRef(new Animated.Value(0)).current;
  const swipeOpacity = useRef(new Animated.Value(1)).current;
  // PanResponder is created once, so its handlers must read the latest render's functions through this ref
  const latestRef = useRef({});

  // Comprehensive logging function
  const logAction = useCallback((action, details = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      action,
      language,
      gameMode,
      currentQuestion: currentQuestion ? currentQuestion.substring(0, 50) + '...' : null,
      details,
    };
    if (__DEV__) {
      console.log('🎮 PAPER JAR GAME - USER ACTION:', logEntry);
    }
  }, [language, gameMode, currentQuestion]);

  // Swipe animations use the JS driver: these values are also set directly via setValue while dragging,
  // and on the New Architecture setValue does not reach a view after a native-driven animation has run.
  const snapBack = () => {
    Animated.parallel([
      Animated.spring(swipeTranslateX, { toValue: 0, useNativeDriver: false }),
      Animated.spring(swipeOpacity, { toValue: 1, useNativeDriver: false }),
    ]).start();
  };

  // PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Activate swipe if horizontal movement > 20 and vertical movement < 80
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 80;
      },
      onPanResponderGrant: () => {
        latestRef.current.logAction('SWIPE_STARTED');
      },
      onPanResponderMove: (evt, gestureState) => {
        // Update the animated value for visual feedback
        swipeTranslateX.setValue(gestureState.dx);
        // Fade out slightly as user swipes
        const opacity = Math.max(0.3, 1 - Math.abs(gestureState.dx) / (width * 0.5));
        swipeOpacity.setValue(opacity);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const swipeThreshold = width * 0.25; // 25% of screen width
        
        if (Math.abs(gestureState.dx) > swipeThreshold) {
          // Valid swipe - animate out and get new question
          const direction = gestureState.dx > 0 ? 'right' : 'left';
          latestRef.current.logAction('SWIPE_COMPLETED', { direction, distance: Math.abs(gestureState.dx) });
          buzz();
          
          // Animate the current question out
          Animated.parallel([
            Animated.timing(swipeTranslateX, {
              toValue: gestureState.dx > 0 ? width : -width,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.timing(swipeOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start(() => {
            // Generate new question immediately without shake animation
            const newQuestion = latestRef.current.getRandomQuestion();
            setCurrentQuestion(newQuestion);
            
            // Reset animation values
            swipeTranslateX.setValue(0);
            swipeOpacity.setValue(1);
          });
        } else {
          // Not enough swipe - animate back to original position
          latestRef.current.logAction('SWIPE_CANCELLED', { distance: Math.abs(gestureState.dx) });
          snapBack();
        }
      },
      // The parent ScrollView can steal the gesture mid-drag; don't leave the card stranded off-screen
      onPanResponderTerminate: () => {
        snapBack();
      },
    })
  ).current;

  // Load favorites on mount and whenever the screen regains focus (e.g. returning from Upgrade)
  useEffect(() => {
    loadFavorites();
    return navigation.addListener('focus', loadFavorites);
  }, [navigation]);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      const favoritesData = stored ? JSON.parse(stored) : [];
      setFavorites(favoritesData);
    } catch (e) {
      console.error('GameScreen: Error loading favorites:', e);
    }
  };

  // The active deck for this mode+variant, flattened for the shuffle bag.
  const deckInfo = useMemo(() => {
    const { key, data } = getDeck(gameMode, variant);
    return { key, data, refs: flattenDataset(data) };
  }, [gameMode, variant]);

  useEffect(() => {
    track('game_opened', { gameMode, variant });
    recordPlay();
  }, [gameMode, variant]);

  // Draw the next question from the shuffle bag (no repeats until the deck is exhausted).
  // `forcedRef` shows a specific card (deep link) instead.
  const getRandomQuestion = (forcedRef) => {
    try {
      const { data, key, refs } = deckInfo;
      if (deckLocked && cardCount >= FREE_SAMPLE_CARDS) {
        track('paywall_sample_end', { gameMode, variant });
        navigation.navigate('Upgrade', { upgradeReason: 'pack', gameMode, variant });
        return currentQuestion;
      }
      const ref = forcedRef || refs[nextIndex(key, refs.length)];
      const questionObject = data[ref.topicIndex][ref.type][ref.questionIndex];

      // Store the full question object for favorites
      setCurrentQuestionObject(questionObject);
      setCurrentRef(ref);
      setQuestionType(ref.type);
      setShowHints(false);
      setBurstKey((k) => k + 1);
      setCardCount((n) => n + 1);
      cardPop.setValue(0.85);
      Animated.spring(cardPop, { toValue: 1, friction: 5, tension: 160, useNativeDriver: true }).start();

      const cleanedText = getLocalizedText(questionObject, language);
      logAction('QUESTION_GENERATED', {
        topicIndex: ref.topicIndex,
        questionType: ref.type,
        questionIndex: ref.questionIndex,
      });
      return cleanedText;
    } catch (e) {
      console.error('GameScreen: Error getting random question:', e);
      logAction('QUESTION_GENERATION_ERROR', { error: e.message });
      return translations[language]?.loading || 'Loading...';
    }
  };

  const triggerShake = () => {
    logAction('SHAKE_TRIGGERED');
    buzz();
    // Reset current states
    setShowHints(false);
    setShowChallenge(false);
    
    // Animate glass first, then get new question after animation
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: -1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Get new question after animation completes
      setCurrentQuestion(getRandomQuestion());
    });
  };

  const toggleFavorite = async () => {
    if (!currentQuestion || !currentQuestionObject) {
      return;
    }
    logAction('TOGGLING_FAVORITE', { questionLength: currentQuestion.length });
    const newFavorites = [...favorites];
    
    // Find existing favorite by checking if any stored question matches the current text
    const index = favorites.findIndex(f => {
      if (typeof f.question === 'string') {
        return f.question === currentQuestion;
      } else if (typeof f.question === 'object') {
        const storedText = getLocalizedText(f.question, language);
        return storedText === currentQuestion;
      }
      return false;
    });
    
    let isAdding = false;
    if (index > -1) {
      newFavorites.splice(index, 1);
      logAction('FAVORITE_REMOVED', { index });
    } else {
      if (favorites.length >= favoritesLimit(settings)) {
        logAction('FAVORITES_LIMIT_REACHED', { currentCount: favorites.length });
        navigation.navigate('Upgrade', { upgradeReason: 'favorites' });
        return;
      }
      
      // Create cleaned version of the question object for storage
      const cleanedQuestionObject = {};
      Object.keys(currentQuestionObject).forEach(lang => {
        cleanedQuestionObject[lang] = (currentQuestionObject[lang] || '').trim();
      });
      
      newFavorites.push({
        question: cleanedQuestionObject, // Store the full multilingual object
        timestamp: Date.now(),
      });
      logAction('FAVORITE_ADDED', { timestamp: Date.now() });
      isAdding = true;
    }

    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
      
      // Show toast notification
      if (isAdding) {
        showToastNotification(translations[language]?.favoriteAdded || 'Added to favorites!');
      }
    } catch (e) {
      console.error('GameScreen: Error updating favorites:', e);
      logAction('FAVORITE_UPDATE_ERROR', { error: e.message });
    }
  };

  const showToastNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);

    // Reset animation values
    toastOpacity.setValue(0);
    toastTranslateY.setValue(50);

    // Animate in
    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after 2 seconds
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowToast(false);
      });
    }, 2000);
  };



  latestRef.current = { getRandomQuestion, logAction };

  // Draw a question whenever the active deck changes (mount, mode change, cs<->other in Brno mode).
  // Waits for the persisted shuffle-bag state so progress survives restarts.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await initBag(deckInfo.key, deckInfo.refs.length);
      if (!cancelled) {
        logAction('GAME_MODE_INITIALIZED', { mode: gameMode, deck: deckInfo.key });
        setShowHints(false);
        const valid =
          startCard && deckInfo.data[startCard.topicIndex]?.[startCard.type]?.[startCard.questionIndex];
        setCurrentQuestion(getRandomQuestion(valid ? startCard : undefined));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [deckInfo.key]);

  // On language change, re-localize the question that's on screen instead of drawing a new one.
  useEffect(() => {
    if (currentQuestionObject) {
      setCurrentQuestion(getLocalizedText(currentQuestionObject, language));
    }
  }, [language]);

  // Check if current question is in favorites
  const isFavorite = currentQuestion && currentQuestionObject && favorites.some(f => {
    if (typeof f.question === 'string') {
      return f.question === currentQuestion;
    } else if (typeof f.question === 'object') {
      const storedText = getLocalizedText(f.question, language);
      return storedText === currentQuestion;
    }
    return false;
  });

  const [shareNote, setShareNote] = useState('');
  const handleShare = async () => {
    if (!currentQuestion) return;
    const result = await shareCard({
      text: currentQuestion,
      label: `${cardMeta.emoji} ${cardMeta.label}`,
      colors: cardMeta.colors,
      mode: gameMode === 'custom' ? null : gameMode,
      variant,
      card: gameMode === 'custom' ? null : currentRef,
      teaser:
        gameMode === 'adult'
          ? t('shareAdultTeaser', 'We’re playing Adult Fun on Paper Jar 🔥 Spicy truths & dares, 18+ only.')
          : null,
    });
    if (result === 'downloaded') setShareNote(t('shareDownloaded', 'Image saved, link copied 📋'));
    else if (result === 'copied') setShareNote(t('shareCopied', 'Link copied 📋'));
    else setShareNote('');
    if (result === 'downloaded' || result === 'copied') setTimeout(() => setShareNote(''), 2500);
  };

  useKeyboardShortcuts(
    {
      ' ': triggerShake,
      Enter: triggerShake,
      ArrowRight: triggerShake,
      h: () => setShowHints((v) => !v),
      f: toggleFavorite,
      s: handleShare,
      '?': () => setRulesOpen(true),
      Escape: () => navigation.goBack(),
    },
    !rulesOpen && isFocused
  );

  return (
    <View style={styles.container}>
      {/* Premium Background Gradient */}
      <LinearGradient
        colors={getCurrentGradient().colors}
        style={styles.backgroundGradient}
        start={isRTL(language) ? { x: 1, y: 0 } : getCurrentGradient().start}
        end={isRTL(language) ? { x: 0, y: 1 } : getCurrentGradient().end}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Back Button and Game Mode */}
        <View style={[styles.header, { flexDirection: isRTL(language) ? 'row-reverse' : 'row' }]}>
          <ModernBackButton 
            onPress={() => {
              logAction('BACK_BUTTON_PRESSED');
              navigation.goBack();
            }}
            size="md"
            style={isRTL(language) ? { transform: [{ scaleX: -1 }] } : null}
          />
          
          {/* Game Mode Display - Top Right */}
          {gameMode && (
            <View style={styles.headerPills}>
              <ModernCard variant="surface" size="sm" style={styles.modernGameModePill}>
                <Text style={styles.modernGameModeText}>{modeTitle}</Text>
              </ModernCard>
              {variant === 'drinks' && (
                <ModernCard variant="surface" size="sm" style={styles.drinksPill}>
                  <Text style={styles.modernGameModeText}>
                    {translations[language]?.drinksEdition || 'Drinks 🍻'}
                  </Text>
                </ModernCard>
              )}
              <Pressable
                onPress={() => setRulesOpen(true)}
                style={styles.rulesBtn}
                accessibilityRole="button"
                accessibilityLabel={t('howToPlay', 'How to play')}
              >
                <Text style={styles.rulesBtnText}>?</Text>
              </Pressable>
            </View>
          )}
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 70 },
            isWide && { justifyContent: 'center', minHeight: winHeight - 80 },
          ]}
        >
          <View style={[styles.column, { maxWidth: cardMaxWidth }]}>
          <ConfettiBurst burstKey={burstKey} />
          {deckLocked && (
            <View style={styles.sampleChip}>
              <Text style={styles.sampleChipText}>
                👑 {t('sampleLabel', 'Free sample')} · {Math.min(cardCount, FREE_SAMPLE_CARDS)}/{FREE_SAMPLE_CARDS}
              </Text>
            </View>
          )}
          {variant === 'drinks' && (
            <View style={styles.drinksRule}>
              <Text style={styles.drinksRuleText}>
                🍻 {translations[language]?.drinksRule || 'Don’t want to answer? Take a sip. Soft drinks count.'}
              </Text>
            </View>
          )}
          {/* Glass Image */}
          <Animated.Image
            source={glassImage}
            style={[
              styles.glassImage,
              { width: fs(130), height: fs(130) },
              {
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: ['-10deg', '0deg', '10deg'],
                    }),
                  },
                ],
              },
            ]}
            resizeMode="contain"
          />

          {/* Premium Question Box with Swipe Gesture */}
          <Animated.View
            style={[
              {
                width: '100%',
                marginBottom: tokens.spacing['4xl'],
                transform: [{ translateX: swipeTranslateX }],
                opacity: swipeOpacity,
              }
            ]}
            {...panResponder.panHandlers}
          >
            <Animated.View style={[styles.playingCard, { transform: [{ scale: cardPop }] }]}>
              <LinearGradient
                colors={cardMeta.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardBand}
              >
                <Text style={styles.cardBandText}>
                  {cardMeta.emoji}  {cardMeta.label}
                </Text>
                <Text style={styles.cardNumber}>
                  {translations[language]?.cardLabel || 'Card'} #{cardCount}
                </Text>
              </LinearGradient>
              <Text style={[
                styles.questionText,
                { fontSize: fs(22), lineHeight: fs(31) },
                {
                  writingDirection: isRTL(language) ? 'rtl' : 'ltr',
                  fontFamily: isRTL(language) ? 'NotoNaskhArabic_400Regular' : undefined,
                  letterSpacing: isRTL(language) ? 0 : styles.questionText.letterSpacing,
                }
              ]}>
                {currentQuestion || translations[language]?.loading || 'Loading...'}
              </Text>
              <Text style={[styles.cardCornerEmoji, { color: cardMeta.colors[1] }]}>{cardMeta.emoji}</Text>
            </Animated.View>
          </Animated.View>

          {showHints && (
            <ModernCard variant="surface" size="sm" style={styles.hintCard}>
              <Text style={styles.hintTitle}>
                {translations[language]?.hint || 'Hint'}
              </Text>
              <Text style={styles.hintBody}>
                {questionType === 'challenges'
                  ? translations[language]?.hintChallenge ||
                    'Do it together — laugh first, perfect later.'
                  : questionType === 'crazy_questions'
                    ? translations[language]?.hintCrazy ||
                      'There is no wrong answer. Go weird.'
                    : translations[language]?.hintQuestion ||
                      'Share a story, not just a one-word answer. Ask “why?” once.'}
              </Text>
            </ModernCard>
          )}

          {/* Action Buttons */}
          <View style={[styles.actionButtons, { flexDirection: isRTL(language) ? 'row-reverse' : 'row' }]}>
            <ModernButton
              shape="circle"
              variant="secondary"
              size="md"
              onPress={() => {
                logAction('HINT_BUTTON_PRESSED', { newState: !showHints });
                setShowHints(!showHints);
              }}
              style={[styles.modernActionButton, showHints && styles.activeActionButton]}
            >
              <HintIcon color={showHints ? '#fff' : 'rgba(255,255,255,0.8)'} />
            </ModernButton>

            <Pressable
              onPress={() => {
                logAction('NEXT_CARD_PRESSED');
                triggerShake();
              }}
              accessibilityRole="button"
              style={({ pressed }) => [styles.nextCardBtn, pressed && styles.nextCardBtnPressed]}
            >
              <Text style={styles.nextCardText}>
                🎲  {translations[language]?.nextCard || 'Next card'}
              </Text>
            </Pressable>

            <ModernButton
              shape="circle"
              variant="secondary"
              size="md"
              onPress={() => {
                logAction('FAVORITE_BUTTON_PRESSED', { isFavorite });
                toggleFavorite();
              }}
              style={[styles.modernActionButton, isFavorite && styles.favoriteActionButton]}
            >
              <HeartIcon color={isFavorite ? '#ff4757' : 'rgba(255,255,255,0.6)'} />
            </ModernButton>
          </View>

          <Pressable onPress={handleShare} accessibilityRole="button" style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>📤 {shareNote || t('shareCard', 'Share this card')}</Text>
          </Pressable>
          {isWide && Platform.OS === 'web' && (
            <Text style={styles.keysHint}>
              {t('keysHint', 'Space = next card · H = hint · F = favorite · S = share · Esc = back')}
            </Text>
          )}
          </View>

          {/* Toast Notification */}
          {showToast && (
            <Animated.View
              style={[
                styles.toastContainer,
                {
                  opacity: toastOpacity,
                  transform: [{ translateY: toastTranslateY }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(76, 175, 80, 0.95)', 'rgba(56, 142, 60, 0.95)']}
                style={styles.toastGradient}
              >
                <HeartIcon size={20} color="#fff" />
                <Text style={styles.toastText}>{toastMessage}</Text>
              </LinearGradient>
            </Animated.View>
          )}
        </ScrollView>

        
      </SafeAreaView>

      <RulesSheet
        visible={rulesOpen}
        mode={gameMode}
        variant={variant}
        title={modeTitle}
        language={language}
        t={t}
        onStart={() => {
          track('rules_start', { gameMode, variant });
          setRulesOpen(false);
        }}
        onClose={() => {
          setRulesOpen(false);
          if (cardCount <= 1) navigation.goBack();
        }}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
    alignItems: 'center',
  },
  gameModeDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  gameModeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  glassImage: {
    width: 130,
    height: 130,
    marginVertical: 10,
  },

  questionBoxGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  questionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  playingCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    overflow: 'hidden',
    minHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  cardBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  cardBandText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },
  cardNumber: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '800' },
  cardCornerEmoji: {
    position: 'absolute',
    right: 14,
    bottom: 8,
    fontSize: 22,
    opacity: 0.35,
  },
  drinksRule: {
    backgroundColor: '#FFD43B',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 6,
    borderBottomWidth: 3,
    borderBottomColor: '#E0A800',
  },
  drinksRuleText: { color: '#5C3B00', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  column: { width: '100%', alignItems: 'center', alignSelf: 'center' },
  rulesBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFD43B',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#E0A800',
  },
  rulesBtnText: { color: '#5C3B00', fontWeight: '900', fontSize: 18 },
  sampleChip: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 6,
  },
  sampleChipText: { color: '#FFE08A', fontWeight: '900', fontSize: 12 },
  shareBtn: {
    marginTop: -tokens.spacing.md,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  shareBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  keysHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 18,
    textAlign: 'center',
  },
  nextCardBtn: {
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 26,
    paddingVertical: 16,
    borderRadius: 30,
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(0,0,0,0.18)',
  },
  nextCardBtnPressed: {
    transform: [{ translateY: 3 }],
    borderBottomWidth: 2,
  },
  nextCardText: { color: '#22163F', fontSize: 19, fontWeight: '900', letterSpacing: 0.3 },
  questionText: {
    fontSize: 22,
    textAlign: 'center',
    color: '#22163F',
    lineHeight: 31,
    fontWeight: '800',
    letterSpacing: 0.2,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 36,
    ...(Platform.OS === 'android'
      ? {}
      : {
         // textShadowColor: 'rgba(0, 0, 0, 0.3)',
         // textShadowOffset: { width: 0, height: 2 },
         // textShadowRadius: 4,
        }),
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: tokens.spacing['2xl'],
  },
  actionButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeButtonGlass: {
    backgroundColor: 'rgba(100, 126, 234, 0.8)',
    borderColor: 'rgba(100, 126, 234, 0.9)',
  },
  favoriteButtonGlass: {
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
    borderColor: 'rgba(255, 107, 107, 0.9)',
  },
  mainActionButton: {
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  mainActionButtonGlass: {
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  mainButtonGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  swipeIndicatorContainer: {
    marginTop: tokens.spacing.md,
    alignItems: 'center',
  },
  swipeIndicatorGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  dotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  toastGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    gap: 10,
  },
  toastText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  gameModeDisplayHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  gameModeTextHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Modern action button styles
  modernActionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 0,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  modernMainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 0,
    //...tokens.shadows.lg,
  },
  activeActionButton: {
    backgroundColor: tokens.colors.surface.strong,
    borderColor: tokens.colors.border.strong,
    borderWidth: 3,
  },
  favoriteActionButton: {
    backgroundColor: 'rgba(255, 71, 87, 0.25)',
    borderColor: 'rgba(255, 71, 87, 0.6)',
    borderWidth: 2,
  },

  // Modern game mode pill styles
  headerPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
    maxWidth: '70%',
  },
  modernGameModePill: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.full,
    minHeight: 32,
    alignSelf: 'flex-start',
  },
  drinksPill: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.full,
    minHeight: 32,
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
    borderColor: 'rgba(251, 191, 36, 0.7)',
    borderWidth: 1,
  },
  modernGameModeText: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  // Question card tweaks for a single clean surface (no inner frame)
  questionCard: {
    borderWidth: 0,
    padding: tokens.spacing['2xl'],
   // ...tokens.shadows.lg,
  },
  hintCard: {
    width: '100%',
    marginTop: -tokens.spacing['2xl'],
    marginBottom: tokens.spacing.xl,
  },
  hintTitle: {
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.weights.bold,
    fontSize: tokens.typography.sizes.sm,
    marginBottom: 4,
    textAlign: 'center',
  },
  hintBody: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default GameScreen; 