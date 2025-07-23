import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from './contexts/LanguageContext';
import { translations } from './translations';
import BackIcon from './components/BackIcon';

const FavoritesScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      const favoritesData = stored ? JSON.parse(stored) : [];
      setFavorites(favoritesData);
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
  };

  const removeFavorite = async (questionToRemove) => {
    try {
      const newFavorites = favorites.filter(f => f.question !== questionToRemove);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (e) {
      console.error('Error removing favorite:', e);
    }
  };

  const confirmRemove = (question) => {
    Alert.alert(
      translations[language]?.removeFavorite || 'Remove Favorite',
      translations[language]?.removeFavoriteConfirm || 'Are you sure you want to remove this question from favorites?',
      [
        {
          text: translations[language]?.cancel || 'Cancel',
          style: 'cancel',
        },
        {
          text: translations[language]?.remove || 'Remove',
          style: 'destructive',
          onPress: () => removeFavorite(question),
        },
      ]
    );
  };

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonGlass}>
              <BackIcon size={32} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>
            {translations[language]?.favoritesTitle || 'Favorite Questions'}
          </Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {favorites.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyMessageGlass}>
                <Text style={styles.emptyText}>
                  {translations[language]?.noFavorites || 'No favorite questions yet'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {translations[language]?.noFavoritesSubtext || 'Start playing and add questions to your favorites!'}
                </Text>
              </View>
            </View>
          ) : (
            favorites.map((favorite, index) => (
              <View key={index} style={styles.favoriteItem}>
                <View style={styles.favoriteItemGlass}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)']}
                    style={styles.favoriteItemGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Text style={styles.favoriteText}>{favorite.question}</Text>
                  <Text style={styles.favoriteDate}>
                    {new Date(favorite.timestamp).toLocaleDateString()}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => confirmRemove(favorite.question)}
                  >
                    <View style={styles.removeButtonGlass}>
                      <Text style={styles.removeButtonText}>✕</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 16,
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    letterSpacing: -0.3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyMessageGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  emptySubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  favoriteItem: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  favoriteItemGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  favoriteItemGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  favoriteText: {
    fontSize: 18,
    color: '#fff',
    lineHeight: 26,
    marginBottom: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    paddingRight: 40,
  },
  favoriteDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  removeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  removeButtonGlass: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FavoritesScreen;
