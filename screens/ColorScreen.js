import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModernCard, ModernBackButton, ModernSelectionIndicator } from '../components/ui';
import { tokens, gradients } from '../theme/tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 16;
const CARD_MARGIN = 8;
const NUM_COLUMNS = 2;
const MIN_CARD_WIDTH = 150;
const MAX_CARD_WIDTH = 180;

const CARD_WIDTH = Math.min(
  MAX_CARD_WIDTH,
  Math.max(
    MIN_CARD_WIDTH,
    (width - (COLUMN_GAP + CARD_MARGIN * 4)) / NUM_COLUMNS
  )
);

const COLOR_THEMES = [
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Coral to soft pink',
    colors: ['#FF6B6B', '#FF8E8E'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Turquoise to deep teal',
    colors: ['#4ECDC4', '#44A08D'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Olive to mint green',
    colors: ['#56AB2F', '#A8E6CF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Light purple to deep purple',
    colors: ['#667eea', '#764ba2'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    description: 'Peach to lavender',
    colors: ['#FF9A9E', '#FECFEF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  {
    id: 'deep-blue',
    name: 'Deep Blue',
    description: 'Dark blue to bright blue',
    colors: ['#2C3E50', '#3498DB'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
];

const ColorScreen = ({ navigation }) => {
  const [selectedTheme, setSelectedTheme] = useState('sunset-orange');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadSelectedTheme();
  }, []);

  const loadSelectedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedColorTheme');
      if (savedTheme) {
        setSelectedTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading selected theme:', error);
    }
  };

  const handleThemeSelect = async (themeId) => {
    try {
      setSelectedTheme(themeId);
      await AsyncStorage.setItem('selectedColorTheme', themeId);
      
      // Update the global gradient in tokens
      const selectedThemeData = COLOR_THEMES.find(theme => theme.id === themeId);
      if (selectedThemeData) {
        // This would need to be implemented to update the global theme
        console.log('Selected theme:', selectedThemeData);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const renderColorCard = (theme) => {
    const isSelected = selectedTheme === theme.id;
    
    return (
      <TouchableOpacity
        key={theme.id}
        style={[
          styles.colorCard,
          { width: CARD_WIDTH },
          isSelected && styles.selectedCard,
        ]}
        onPress={() => handleThemeSelect(theme.id)}
        activeOpacity={0.8}
      >
        <ModernCard style={styles.cardContent}>
          {/* Color Preview */}
          <View style={styles.colorPreview}>
            <LinearGradient
              colors={theme.colors}
              style={styles.gradientPreview}
              start={theme.start}
              end={theme.end}
            />
          </View>
          
          {/* Theme Info */}
          <View style={styles.themeInfo}>
            <Text style={styles.themeName}>{theme.name}</Text>
            <Text style={styles.themeDescription}>{theme.description}</Text>
          </View>
          
          {/* Selection Indicator */}
          {isSelected && (
            <ModernSelectionIndicator style={styles.selectionIndicator} />
          )}
        </ModernCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={gradients.primary.colors}
        style={styles.backgroundGradient}
        start={gradients.primary.start}
        end={gradients.primary.end}
      />
      
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <ModernBackButton
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.title}>Choose Theme</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Select your favorite color theme for the app
        </Text>

        {/* Color Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.colorGrid}>
            {COLOR_THEMES.map(renderColorCard)}
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  },
  backButton: {
    marginRight: tokens.spacing.sm,
  },
  title: {
    fontSize: tokens.typography.sizes['2xl'],
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40, // Same width as back button for centering
  },
  subtitle: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.medium,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: tokens.spacing.lg,
    marginBottom: tokens.spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: COLUMN_GAP,
  },
  colorCard: {
    marginBottom: tokens.spacing.lg,
  },
  selectedCard: {
    transform: [{ scale: 1.05 }],
  },
  cardContent: {
    padding: tokens.spacing.md,
    alignItems: 'center',
    minHeight: 140,
  },
  colorPreview: {
    width: '100%',
    height: 60,
    borderRadius: tokens.borderRadius.lg,
    marginBottom: tokens.spacing.md,
    overflow: 'hidden',
  },
  gradientPreview: {
    flex: 1,
    borderRadius: tokens.borderRadius.lg,
  },
  themeInfo: {
    alignItems: 'center',
    flex: 1,
  },
  themeName: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
    textAlign: 'center',
  },
  themeDescription: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.medium,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
  },
  selectionIndicator: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
  },
});

export default ColorScreen;
