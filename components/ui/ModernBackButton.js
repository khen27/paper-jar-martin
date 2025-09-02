import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import BackIcon from '../BackIcon';
import { tokens } from '../../theme/tokens';

/**
 * Modern Back Button Component - Consistent back button styling
 */
const ModernBackButton = ({ 
  onPress,
  size = 'md',
  iconSize,
  style,
  ...props 
}) => {
  const iconSizeValue = iconSize || tokens.components.icon[size];

  return (
    <TouchableOpacity
      style={[styles.button, styles[size], style]}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.container}>
        <BackIcon size={iconSizeValue} color={tokens.colors.text.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
  },
  
  container: {
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.colors.surface.light,
    borderWidth: 2,
    borderColor: tokens.colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Size variants
  sm: {
    // Container padding will be adjusted by tokens
  },
  
  md: {
    // Default size
  },
  
  lg: {
    // Container padding will be adjusted by tokens
  },
});

export default ModernBackButton;
