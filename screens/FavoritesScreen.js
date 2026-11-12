import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../translations';
import { ModernBackButton, AppDialog } from '../components/ui';
import { getLocalizedText, stripTags } from '../utils/i18n';
import { useResponsive } from '../utils/responsive';
import FunIcon from '../components/FunIcon';
import SeasonalDecor from '../components/SeasonalDecor';

const FavoritesScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { getCurrentGradient } = useTheme();
  const { fs } = useResponsive();
  const [favorites, setFavorites] = useState([]);
  const [removeIndex, setRemoveIndex] = useState(null);
  const t = (k, f) => translations[language]?.[k] || f;

  useEffect(() => {
    loadFavorites();
  }, [language]);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      const favoritesData = stored ? JSON.parse(stored) : [];
      const validFavorites = favoritesData.filter((item) => {
        if (!item || !item.question) return false;
        if (typeof item.question === 'string') return item.question.trim().length > 0;
        if (typeof item.question === 'object') {
          const questionText =
            item.question[language] || item.question.en || item.question.cs || Object.values(item.question)[0];
          return questionText && String(questionText).trim().length > 0;
        }
        return false;
      });
      setFavorites(validFavorites);
      if (validFavorites.length !== favoritesData.length) {
        await AsyncStorage.setItem('favorites', JSON.stringify(validFavorites));
      }
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) return t('invalidDate', 'Invalid Date');
    const date = new Date(timestamp);
    return date.toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-GB', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getQuestionText = (questionItem) => {
    if (!questionItem || !questionItem.question) return t('noQuestion', 'No question');
    if (typeof questionItem.question === 'string') return stripTags(questionItem.question);
    if (typeof questionItem.question === 'object') {
      return getLocalizedText(questionItem.question, language) || t('noQuestion', 'No question');
    }
    return t('noQuestion', 'No question');
  };

  const removeFavorite = async (index) => {
    try {
      const next = favorites.filter((_, i) => i !== index);
      await AsyncStorage.setItem('favorites', JSON.stringify(next));
      setFavorites(next);
    } catch (e) {
      console.error('Error removing favorite:', e);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getCurrentGradient().colors}
        style={StyleSheet.absoluteFill}
        start={getCurrentGradient().start}
        end={getCurrentGradient().end}
      />
      <SeasonalDecor />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ModernBackButton onPress={() => navigation.goBack()} size="md" />
        </View>

        <View style={styles.hero}>
          <FunIcon name="sparkles" size={64} />
          <Text style={[styles.title, { fontSize: fs(28) }]}>{t('favoritesTitle', 'Favorite cards')}</Text>
          <Text style={styles.sub}>
            {favorites.length
              ? t('favoritesCount', '{n} saved for later').replace('{n}', String(favorites.length))
              : t('noFavoritesSubtext', 'Tap the heart on a card you love.')}
          </Text>
        </View>

        <FlatList
          data={favorites}
          keyExtractor={(_, index) => String(index)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <LinearGradient colors={['#7C5CFF', '#5A3FE0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.band}>
                <FunIcon name="sparkles" size={18} />
                <Text style={styles.bandText}>{formatDate(item.timestamp)}</Text>
              </LinearGradient>
              <Text style={styles.favoriteText}>{getQuestionText(item)}</Text>
              <Pressable
                style={styles.removeButton}
                onPress={() => setRemoveIndex(index)}
                accessibilityRole="button"
                accessibilityLabel={t('remove', 'Remove')}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <FunIcon name="gift" size={72} />
              <Text style={styles.emptyText}>{t('noFavorites', 'No favorites yet')}</Text>
              <Text style={styles.emptySubtext}>
                {t('noFavoritesSubtext', 'Tap the heart on a card you love. It will wait for you here.')}
              </Text>
            </View>
          )}
        />
      </SafeAreaView>

      <AppDialog
        visible={removeIndex !== null}
        title={t('removeFavorite', 'Remove favorite?')}
        message={t('removeFavoriteConfirm', 'This card leaves your list. You can heart it again anytime.')}
        buttons={[
          { text: t('cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('remove', 'Remove'),
            style: 'destructive',
            onPress: () => removeFavorite(removeIndex),
          },
        ]}
        onRequestClose={() => setRemoveIndex(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8 },
  hero: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 12 },
  title: { color: '#fff', fontWeight: '900', marginTop: 8, textAlign: 'center' },
  sub: { color: 'rgba(255,255,255,0.82)', fontWeight: '600', fontSize: 14, marginTop: 6, textAlign: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bandText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  favoriteText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#22163F',
    lineHeight: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    paddingRight: 44,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: { fontSize: 18, color: '#fff', fontWeight: '800' },
  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 28 },
  emptyText: { color: '#fff', fontWeight: '900', fontSize: 20, marginTop: 14, textAlign: 'center' },
  emptySubtext: {
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '600',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default FavoritesScreen;
