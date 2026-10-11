import React from 'react';
import { View, StyleSheet } from 'react-native';
import { tokens } from '../../theme/tokens';

/**
 * Modern Card Component - Clean, consistent card styling
 */
const ModernCard = ({ 
  children, 
  variant = 'surface', 
  size = 'md', 
  selected = false,
  style,
  ...props 
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    styles[size],
    selected && styles.selected,
    style,
  ];

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    backgroundColor: tokens.colors.surface.light,
    borderColor: tokens.colors.border.light,
    // Slight lift so cards feel tappable without heavy shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  
  // Variants
  surface: {
    backgroundColor: tokens.colors.surface.light,
    borderColor: tokens.colors.border.light,
  },
  
  elevated: {
    backgroundColor: tokens.colors.surface.medium,
    borderColor: tokens.colors.border.medium,
    ...tokens.shadows.md,
  },
  
  strong: {
    backgroundColor: tokens.colors.surface.strong,
    borderColor: tokens.colors.border.strong,
    ...tokens.shadows.lg,
  },
  
  // Sizes
  sm: {
    padding: tokens.components.card.sm.padding,
    minHeight: tokens.components.card.sm.minHeight,
  },
  
  md: {
    padding: tokens.components.card.md.padding,
    minHeight: tokens.components.card.md.minHeight,
  },
  
  lg: {
    padding: tokens.components.card.lg.padding,
    minHeight: tokens.components.card.lg.minHeight,
  },
  
  // Selected state
  selected: {
    backgroundColor: tokens.colors.surface.selected,
    borderColor: tokens.colors.border.strong,
    borderWidth: 3,
  },
});

export default ModernCard;
