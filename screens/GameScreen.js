import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { dataset } from '../full_dataset';
import { HintIcon, RefreshIcon, StarIcon } from '../components/GameIcons';
import BackIcon from '../components/BackIcon';

const glassImage = require('../assets/glass.png');

const GameScreen = ({ navigation, route }) => {
  const { language } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [gameMode, setGameMode] = useState(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

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
      const question = questions[randomQuestionIndex];
      console.log('GameScreen: Selected question index:', randomQuestionIndex);
      console.log('GameScreen: Raw question object:', question);

      // Return question in current language or fallback, with prefixes removed
      const text = question[language] || question.en || question.cs;
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
    
    // Get new question
    const newQuestion = getRandomQuestion();
    console.log('GameScreen: Setting new question:', newQuestion);
    setCurrentQuestion(newQuestion);

    // Animate glass
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
    ]).start();
  };

  const toggleFavorite = async () => {
    if (!currentQuestion) return;
    
    try {
      logAction('TOGGLING_FAVORITE', { questionLength: currentQuestion.length });
      console.log('GameScreen: Toggling favorite for question:', currentQuestion);
      const newFavorites = [...favorites];
      const index = favorites.findIndex(f => f.question === currentQuestion);
      
      if (index >= 0) {
        console.log('GameScreen: Removing from favorites');
        newFavorites.splice(index, 1);
        logAction('FAVORITE_REMOVED', { index });
      } else {
        console.log('GameScreen: Adding to favorites');
        newFavorites.push({
          question: currentQuestion,
          timestamp: Date.now(),
        });
        logAction('FAVORITE_ADDED', { timestamp: Date.now() });
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
      console.log('GameScreen: Updated favorites count:', newFavorites.length);
    } catch (e) {
      console.error('GameScreen: Error updating favorites:', e);
      logAction('FAVORITE_UPDATE_ERROR', { error: e.message });
    }
  };

  // Initialize first question
  useEffect(() => {
    console.log('GameScreen: Language changed to:', language);
    logAction('LANGUAGE_CHANGED', { newLanguage: language });
    triggerShake();
  }, [language, logAction]);

  const isFavorite = currentQuestion && favorites.some(f => f.question === currentQuestion);

  console.log('GameScreen: Rendering with current question:', currentQuestion);
  console.log('GameScreen: Current language:', language);
  console.log('GameScreen: Is favorite:', isFavorite);

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
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              logAction('BACK_BUTTON_PRESSED');
              navigation.goBack();
            }}
          >
            <View style={styles.backButtonGlass}>
              <BackIcon size={32} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Game Mode Display */}
          {gameMode && (
            <View style={styles.gameModeDisplay}>
              <Text style={styles.gameModeText}>
                {translations[language]?.[`${gameMode}Mode`] || `${gameMode} Mode`}
              </Text>
            </View>
          )}

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

          {/* Premium Question Box */}
          <View style={styles.questionBoxContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.questionBoxGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.questionBox}>
              <Text style={styles.questionText}>
                {currentQuestion || translations[language]?.loading || 'Loading...'}
              </Text>
            </View>
          </View>

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
                <StarIcon color={isFavorite ? '#fff' : 'rgba(255,255,255,0.8)'} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Favorites Button */}
          <TouchableOpacity
            style={styles.favoritesButton}
            onPress={() => {
              logAction('FAVORITES_NAVIGATION');
              navigation.navigate('Favorites');
            }}
          >
            <View style={styles.favoritesButtonGlass}>
              <Text style={styles.favoritesButtonText}>
                {translations[language]?.showFavorites || 'Favorites'}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
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
    width: 200,
    height: 200,
    marginVertical: 20,
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
  favoritesButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  favoritesButtonGlass: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  favoritesButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default GameScreen; 