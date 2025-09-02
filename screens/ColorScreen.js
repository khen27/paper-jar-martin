import React from 'react';
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
import { tokens } from '../theme/tokens';
import { useTheme } from '../contexts/ThemeContext';

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

const ColorScreen = ({ navigation }) => {
  const { currentTheme, allThemes, changeTheme, getCurrentGradient } = useTheme();
  const insets = useSafeAreaInsets();

  const handleThemeSelect = async (themeId) => {
    await changeTheme(themeId);
  };

  const renderColorCard = (theme) => {
    const isSelected = currentTheme.id === theme.id;
    
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
          <ModernSelectionIndicator 
            active={isSelected} 
            size="md"
            style={styles.selectionIndicator}
          />
        </ModernCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={getCurrentGradient().colors}
        style={styles.backgroundGradient}
        start={getCurrentGradient().start}
        end={getCurrentGradient().end}
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
            {allThemes.map(renderColorCard)}
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
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.md,
    overflow: 'hidden',
  },
  gradientPreview: {
    flex: 1,
    borderRadius: tokens.radius.lg,
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
