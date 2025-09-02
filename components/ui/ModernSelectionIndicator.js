import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '../../theme/tokens';

/**
 * Modern Selection Indicator - Clean checkmark indicator
 */
const ModernSelectionIndicator = ({ 
  active = false,
  size = 'md',
  style,
  ...props 
}) => {
  if (!active) return null;

  return (
    <View style={[styles.container, styles[size], style]} {...props}>
      <View style={styles.checkWrapper}>
        <Text style={[styles.checkmark, styles[`checkmark_${size}`]]}>✓</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
    borderRadius: tokens.radius.full,
    overflow: 'hidden',
    backgroundColor: tokens.colors.text.primary,
    borderWidth: 2,
    borderColor: tokens.colors.primary.purple,
  },
  
  checkWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  checkmark: {
    color: tokens.colors.primary.purple,
    fontWeight: tokens.typography.weights.black,
  },
  
  // Size variants
  sm: {
    width: 20,
    height: 20,
  },
  
  md: {
    width: 28,
    height: 28,
  },
  
  lg: {
    width: 36,
    height: 36,
  },
  
  // Checkmark sizes
  checkmark_sm: {
    fontSize: 12,
  },
  
  checkmark_md: {
    fontSize: 16,
  },
  
  checkmark_lg: {
    fontSize: 20,
  },
});

export default ModernSelectionIndicator;
