import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { dataset } from '../full_dataset';
import { HintIcon, RefreshIcon } from '../components/GameIcons';
import { HeartIcon } from '../components/GameModeIcons';
import AdBanner, { BANNER_HEIGHT } from '../components/AdBanner';
import { ModernCard, ModernButton, ModernBackButton } from '../components/ui';
import { tokens, gradients } from '../theme/tokens';

const { width, height } = Dimensions.get('window');
const glassImage = require('../assets/glass.png');

const GameScreen = ({ route, navigation }) => {
  const { language } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionObject, setCurrentQuestionObject] = useState(null); // Store the full question object
  const [showHints, setShowHints] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [gameMode, setGameMode] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(50)).current;
  
  // Swipe gesture handling
  const swipeTranslateX = useRef(new Animated.Value(0)).current;
  const swipeOpacity = useRef(new Animated.Value(1)).current;

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
    console.log('🎮 PAPER JAR GAME - USER ACTION:', logEntry);
    
    // Additional logging for debugging
    if (__DEV__) {
      console.log('🔍 DEBUG - GameScreen State:', {
        gameMode,
        currentQuestion,
        showHints,
        showChallenge,
        favoritesCount: favorites.length,
      });
    }
  }, [language, gameMode, currentQuestion, favorites.length]);

  // PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Activate swipe if horizontal movement > 20 and vertical movement < 80
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 80;
      },
      onPanResponderGrant: () => {
        logAction('SWIPE_STARTED');
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
          logAction('SWIPE_COMPLETED', { direction, distance: Math.abs(gestureState.dx) });
          
          // Animate the current question out
          Animated.parallel([
            Animated.timing(swipeTranslateX, {
              toValue: gestureState.dx > 0 ? width : -width,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(swipeOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Generate new question immediately without shake animation
            const newQuestion = getRandomQuestion();
            setCurrentQuestion(newQuestion);
            
            // Reset animation values
            swipeTranslateX.setValue(0);
            swipeOpacity.setValue(1);
          });
        } else {
          // Not enough swipe - animate back to original position
          logAction('SWIPE_CANCELLED', { distance: Math.abs(gestureState.dx) });
          Animated.parallel([
            Animated.spring(swipeTranslateX, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(swipeOpacity, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  // Initialize game mode from route params
  useEffect(() => {
    const mode = route.params?.gameMode || 'partner';
    setGameMode(mode);
    logAction('GAME_MODE_INITIALIZED', { mode });
  }, [route.params?.gameMode, logAction]);

  // Load favorites on mount
  useEffect(() => {
    logAction('LOADING_FAVORITES');
    loadFavorites();
  }, [logAction]);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      const favoritesData = stored ? JSON.parse(stored) : [];
      console.log('GameScreen: Loaded favorites:', favoritesData.length, 'items');
      setFavorites(favoritesData);
      logAction('FAVORITES_LOADED', { count: favoritesData.length });
    } catch (e) {
      console.error('GameScreen: Error loading favorites:', e);
      logAction('FAVORITES_LOAD_ERROR', { error: e.message });
    }
  };

  const cleanText = (text) => {
    // Remove language prefix like [EN], [CS], etc. and number suffix like (19)
    return text.replace(/\[[A-Z]{2}\]\s*/, '').replace(/\s*\(\d+\)\??$/, '');
  };

  const getRandomQuestion = () => {
    try {
      logAction('GETTING_RANDOM_QUESTION', { gameMode });
      console.log('GameScreen: Getting random question for language:', language);
      console.log('GameScreen: Dataset length:', dataset.length);
      
      // Get random topic
      const randomTopicIndex = Math.floor(Math.random() * dataset.length);
      const topic = dataset[randomTopicIndex];
      console.log('GameScreen: Selected topic index:', randomTopicIndex);

      // Randomly choose between normal, crazy, or challenge questions
      const questionTypes = ['questions', 'crazy_questions', 'challenges'];
      const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      console.log('GameScreen: Selected question type:', randomType);
      
      // Get random question from chosen type
      const questions = topic[randomType];
      const randomQuestionIndex = Math.floor(Math.random() * questions.length);
      const questionObject = questions[randomQuestionIndex];
      console.log('GameScreen: Selected question index:', randomQuestionIndex);
      console.log('GameScreen: Raw question object:', questionObject);

      // Store the full question object for favorites
      setCurrentQuestionObject(questionObject);

      // Return question in current language or fallback, with prefixes removed
      console.log('GameScreen: Attempting to get text for language:', language);
      console.log('GameScreen: Available languages in question:', Object.keys(questionObject));
      const text = questionObject[language] || questionObject.en || questionObject.cs;
      console.log('GameScreen: Selected text source:', 
        questionObject[language] ? `${language} (primary)` : 
        questionObject.en ? 'en (fallback 1)' : 'cs (fallback 2)');
      console.log('GameScreen: Raw text before cleaning:', text);
      const cleanedText = cleanText(text);
      console.log('GameScreen: Cleaned text:', cleanedText);
      
      logAction('QUESTION_GENERATED', { 
        topicIndex: randomTopicIndex,
        questionType: randomType,
        questionIndex: randomQuestionIndex,
        textLength: cleanedText.length
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
    console.log('GameScreen: Triggering shake animation');
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
      const newQuestion = getRandomQuestion();
      console.log('GameScreen: Setting new question:', newQuestion);
      setCurrentQuestion(newQuestion);
    });
  };

  const toggleFavorite = async () => {
    if (!currentQuestion || !currentQuestionObject) {
      console.log('GameScreen: No current question to toggle favorite');
      return;
    }
    logAction('TOGGLING_FAVORITE', { questionLength: currentQuestion.length });
    console.log('GameScreen: Toggling favorite for question:', currentQuestion);
    const newFavorites = [...favorites];
    
    // Find existing favorite by checking if any stored question matches the current text
    const index = favorites.findIndex(f => {
      if (typeof f.question === 'string') {
        return f.question === currentQuestion;
      } else if (typeof f.question === 'object') {
        const storedText = f.question[language] || f.question.en || f.question.cs || Object.values(f.question)[0];
        return cleanText(storedText || '') === currentQuestion;
      }
      return false;
    });
    
    let isAdding = false;
    if (index > -1) {
      console.log('GameScreen: Removing from favorites');
      newFavorites.splice(index, 1);
      logAction('FAVORITE_REMOVED', { index });
    } else {
      // Check if user has reached the free limit of 5 favorites
      if (favorites.length >= 5) {
        console.log('GameScreen: Free limit reached, redirecting to upgrade');
        logAction('FAVORITES_LIMIT_REACHED', { currentCount: favorites.length });
        navigation.navigate('Upgrade', { upgradeReason: 'favorites' });
        return;
      }
      
      console.log('GameScreen: Adding to favorites');
      // Create cleaned version of the question object for storage
      const cleanedQuestionObject = {};
      Object.keys(currentQuestionObject).forEach(lang => {
        cleanedQuestionObject[lang] = cleanText(currentQuestionObject[lang] || '');
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
      console.log('GameScreen: Updated favorites count:', newFavorites.length);
      
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

  const handleAdPress = (adData) => {
    logAction('AD_BANNER_CLICKED', { 
      adId: adData.id, 
      headline: adData.headline 
    });
    showToastNotification(`Fake ad clicked: ${adData.headline}`);
  };

  // Initialize first question only once when component mounts
  useEffect(() => {
    console.log('GameScreen: Initializing first question');
    const initialQuestion = getRandomQuestion();
    setCurrentQuestion(initialQuestion);
  }, []); // Empty dependency array - only run once on mount

  // Auto-generate new question when language changes
  useEffect(() => {
    if (currentQuestion) { // Only update if we already have a question (not on initial mount)
      console.log('GameScreen: Language changed to:', language);
      logAction('LANGUAGE_CHANGED', { newLanguage: language });
      
      // Get new question in the new language
      const newQuestion = getRandomQuestion();
      setCurrentQuestion(newQuestion);
      console.log('GameScreen: Updated question for new language:', newQuestion);
    }
  }, [language]); // Only depend on language changes // Remove logAction from dependencies to prevent loops

  // Check if current question is in favorites
  const isFavorite = currentQuestion && currentQuestionObject && favorites.some(f => {
    if (typeof f.question === 'string') {
      return f.question === currentQuestion;
    } else if (typeof f.question === 'object') {
      const storedText = f.question[language] || f.question.en || f.question.cs || Object.values(f.question)[0];
      return cleanText(storedText || '') === currentQuestion;
    }
    return false;
  });

  console.log('GameScreen: Rendering with current question:', currentQuestion);
  console.log('GameScreen: Current language:', language);
  console.log('GameScreen: Is favorite:', isFavorite);

  return (
    <View style={styles.container}>
      {/* Premium Background Gradient */}
      <LinearGradient
        colors={gradients.primary.colors}
        style={styles.backgroundGradient}
        start={gradients.primary.start}
        end={gradients.primary.end}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Back Button and Game Mode */}
        <View style={styles.header}>
          <ModernBackButton 
            onPress={() => {
              logAction('BACK_BUTTON_PRESSED');
              navigation.goBack();
            }}
            size="md"
          />
          
          {/* Game Mode Display - Top Right */}
          {gameMode && (
            <View style={styles.gameModeDisplayHeader}>
              <Text style={styles.gameModeTextHeader}>
                {translations[language]?.[`${gameMode}Mode`] || `${gameMode} Mode`}
              </Text>
            </View>
          )}
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: BANNER_HEIGHT + 70 }]}>
          {/* Glass Image */}
          <Animated.Image
            source={glassImage}
            style={[
              styles.glassImage,
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
              styles.questionBoxContainer,
              {
                transform: [{ translateX: swipeTranslateX }],
                opacity: swipeOpacity,
              }
            ]}
            {...panResponder.panHandlers}
          >
            <ModernCard variant="surface" size="lg">
              <Text style={styles.questionText}>
                {currentQuestion || translations[language]?.loading || 'Loading...'}
              </Text>
            </ModernCard>
          </Animated.View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton]}
              onPress={() => {
                logAction('HINT_BUTTON_PRESSED', { newState: !showHints });
                setShowHints(!showHints);
              }}
            >
              <View style={[styles.actionButtonGlass, showHints && styles.activeButtonGlass]}>
                <HintIcon color={showHints ? '#fff' : 'rgba(255,255,255,0.8)'} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.mainActionButton]}
              onPress={() => {
                logAction('REFRESH_BUTTON_PRESSED');
                triggerShake();
              }}
            >
              <View style={styles.mainActionButtonGlass}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.mainButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <RefreshIcon color="#fff" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton]}
              onPress={() => {
                logAction('FAVORITE_BUTTON_PRESSED', { isFavorite });
                toggleFavorite();
              }}
            >
              <View style={[styles.actionButtonGlass, isFavorite && styles.favoriteButtonGlass]}>
                <HeartIcon color={isFavorite ? '#ff4757' : 'rgba(255,255,255,0.6)'} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Swipe Indicator */}
          <View style={styles.swipeIndicatorContainer}>
            <View style={styles.swipeIndicatorGlass}>
              <View style={styles.carouselDots}>
                <View style={[styles.dot, styles.dotSmall]} />
                <View style={[styles.dot, styles.dotMedium]} />
                <View style={[styles.dot, styles.dotLarge]} />
                <View style={[styles.dot, styles.dotMedium]} />
                <View style={[styles.dot, styles.dotSmall]} />
              </View>
            </View>
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

        {/* Premium Ad Banner */}
        <AdBanner onPress={handleAdPress} />
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
    padding: 20,
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
    width: 180,
    height: 180,
    marginVertical: 15,
  },
  questionBoxContainer: {
    width: '100%',
    marginBottom: 40,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
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
  questionText: {
    fontSize: 22,
    textAlign: 'center',
    color: '#fff',
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: 0.3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
    gap: 20,
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
    marginTop: 10,
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
  },
  dot: {
    borderRadius: 5,
    marginHorizontal: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotSmall: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotMedium: {
    width: 10,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  dotLarge: {
    width: 14,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 2,
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
});

export default GameScreen; 