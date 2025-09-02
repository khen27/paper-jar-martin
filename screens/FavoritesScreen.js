import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { ModernCard, ModernButton, ModernBackButton } from '../components/ui';
import { tokens, gradients } from '../theme/tokens';

const { width, height } = Dimensions.get('window');

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
      
      // Filter out invalid/empty favorites and ensure they have valid structure
      const validFavorites = favoritesData.filter(item => {
        // Check if item exists and has question data
        if (!item || !item.question) return false;
        
        // If question is a string (old format), try to keep it
        if (typeof item.question === 'string') {
          return item.question.trim().length > 0;
        }
        
        // If question is an object (new format), check if it has content
        if (typeof item.question === 'object') {
          const questionText = item.question[language] || 
                              item.question.en || 
                              item.question.cs || 
                              Object.values(item.question)[0];
          return questionText && questionText.trim().length > 0;
        }
        
        return false;
      });
      
      setFavorites(validFavorites);
      
      // If we filtered out items, update storage
      if (validFavorites.length !== favoritesData.length) {
        await AsyncStorage.setItem('favorites', JSON.stringify(validFavorites));
      }
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) {
      return translations[language]?.invalidDate || 'Invalid Date';
    }

    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Get localized day names
    const dayNames = {
      cs: ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'],
      en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      pt: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
      zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
      ur: ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
      bn: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার']
    };

    // Get localized month names
    const monthNames = {
      cs: ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čer', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      fr: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      pt: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
      zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      hi: ['जन', 'फर', 'मार', 'अप्र', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्ट', 'नव', 'दिस'],
      ur: ['جن', 'فر', 'مار', 'اپر', 'مئی', 'جون', 'جول', 'اگ', 'ست', 'اکت', 'نو', 'دس'],
      bn: ['জন', 'ফেব', 'মার', 'এপ্র', 'মে', 'জুন', 'জুল', 'আগ', 'সেপ', 'অক্ট', 'নভ', 'ডিস']
    };

    const days = dayNames[language] || dayNames.en;
    const months = monthNames[language] || monthNames.en;

    // If within the last week, show day of week
    if (diffDays <= 7) {
      return days[date.getDay()];
    }
    
    // If within the same year, show Month Day
    if (date.getFullYear() === now.getFullYear()) {
      return `${months[date.getMonth()]} ${date.getDate()}`;
    }
    
    // If different year, show Month Year
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getQuestionText = (questionItem) => {
    if (!questionItem || !questionItem.question) {
      return translations[language]?.noQuestion || 'No question';
    }

    // Handle old format (string)
    if (typeof questionItem.question === 'string') {
      return questionItem.question;
    }

    // Handle new format (object with multiple languages)
    if (typeof questionItem.question === 'object') {
      return questionItem.question[language] || 
             questionItem.question.en || 
             questionItem.question.cs || 
             Object.values(questionItem.question)[0] || 
             translations[language]?.noQuestion || 'No question';
    }

    return translations[language]?.noQuestion || 'No question';
  };

  const confirmRemove = (index) => {
    Alert.alert(
      translations[language]?.removeFavorite || translations.cs.removeFavorite,
      translations[language]?.removeFavoriteConfirm || translations.cs.removeFavoriteConfirm,
      [
        {
          text: translations[language]?.cancel || translations.cs.cancel,
          style: 'cancel',
        },
        {
          text: translations[language]?.remove || translations.cs.remove,
          style: 'destructive',
          onPress: () => removeFavorite(index),
        },
      ]
    );
  };

  const removeFavorite = async (index) => {
    try {
      const newFavorites = favorites.filter((_, i) => i !== index);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (e) {
      console.error('Error removing favorite:', e);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.primary.colors}
        style={styles.gradient}
        start={gradients.primary.start}
        end={gradients.primary.end}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <ModernBackButton 
              onPress={() => navigation.goBack()}
              size="md"
            />
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              {translations[language]?.favoritesTitle || translations.cs.favoritesTitle}
            </Text>
          </View>

          {/* Favorites List */}
          <FlatList
            data={favorites}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <ModernCard variant="surface" size="md" style={{ marginBottom: 16, position: 'relative' }}>
                <Text style={styles.favoriteText}>
                  {getQuestionText(item)}
                </Text>
                <Text style={styles.favoriteDate}>
                  {formatDate(item.timestamp)}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => confirmRemove(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </ModernCard>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <ModernCard variant="surface" size="md">
                  <Text style={styles.emptyText}>
                    {translations[language]?.noFavorites || translations.cs.noFavorites}
                  </Text>
                  <Text style={styles.emptySubtext}>
                    {translations[language]?.noFavoritesSubtext || translations.cs.noFavoritesSubtext}
                  </Text>
                </ModernCard>
              </View>
            )}
          />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Math.max(20, width * 0.05),
    paddingTop: Math.max(16, height * 0.02),
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
  titleSection: {
    paddingHorizontal: Math.max(20, width * 0.05),
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: Math.min(28, width * 0.07),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowOpacity: 1,
    textShadowRadius: 4,
  },
  listContent: {
    paddingHorizontal: Math.max(20, width * 0.05),
    paddingBottom: Math.max(40, height * 0.05),
  },
  
  favoriteText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 24,
    marginBottom: 8,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowOpacity: 1,
    textShadowRadius: 2,
    paddingRight: 40, // Space for remove button
  },
  favoriteDate: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.2,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 20,
    color: '#ff6b6b',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowOpacity: 1,
    textShadowRadius: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Math.max(60, height * 0.1),
    paddingHorizontal: Math.max(40, width * 0.1),
  },
  emptyMessageGlass: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    width: '100%',
    maxWidth: 320,
  },
  emptyMessageOverlay: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowOpacity: 1,
    textShadowRadius: 2,
  },
  emptySubtext: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
});

export default FavoritesScreen; 