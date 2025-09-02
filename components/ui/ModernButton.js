import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens, gradients } from '../../theme/tokens';

/**
 * Modern Button Component - Clean, consistent button styling
 */
const ModernButton = ({ 
  children,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onPress,
  style,
  textStyle,
  shape,
  ...props 
}) => {
  const buttonContent = title ? (
    <Text style={[styles.text, styles[`text_${size}`], textStyle]}>
      {title}
    </Text>
  ) : children;

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        style={[styles.base, styles[size], disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        {...props}
      >
        <LinearGradient
          colors={gradients.primary.colors}
          start={gradients.primary.start}
          end={gradients.primary.end}
          style={styles.gradient}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const platformAdjustments = Platform.select({
    android: shape === 'circle' ? { borderWidth: 0, borderColor: 'transparent', borderRadius: tokens.radius.full } : null,
    ios: null,
  });

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        platformAdjustments,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      {...props}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  
  // Variants
  primary: {
    backgroundColor: tokens.colors.surface.strong,
    borderColor: tokens.colors.border.strong,
  },
  
  secondary: {
    backgroundColor: tokens.colors.surface.medium,
    borderColor: tokens.colors.border.medium,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderColor: tokens.colors.border.strong,
  },
  
  // Gradient variant styles
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.lg - 2, // Subtract border width
  },
  
  // Sizes
  sm: {
    padding: tokens.components.button.sm.padding,
    minHeight: tokens.components.button.sm.minHeight,
  },
  
  md: {
    padding: tokens.components.button.md.padding,
    minHeight: tokens.components.button.md.minHeight,
  },
  
  lg: {
    padding: tokens.components.button.lg.padding,
    minHeight: tokens.components.button.lg.minHeight,
  },
  
  // Text styles
  text: {
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.weights.semibold,
    textAlign: 'center',
  },
  
  text_sm: {
    fontSize: tokens.typography.sizes.sm,
  },
  
  text_md: {
    fontSize: tokens.typography.sizes.base,
  },
  
  text_lg: {
    fontSize: tokens.typography.sizes.lg,
  },
  
  // Disabled state
  disabled: {
    opacity: 0.5,
  },
});

export default ModernButton;
