import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsive } from '../utils/responsive';

/**
 * Wraps a phone-designed screen for big displays: the theme gradient fills the
 * whole window and the screen itself sits in a centered, readable column.
 */
export const withScreenFrame = (Screen, maxWidth = 680) => {
  const Framed = (props) => {
    const { getCurrentGradient } = useTheme();
    const { isWide } = useResponsive();
    if (!isWide) return <Screen {...props} />;
    const g = getCurrentGradient();
    return (
      <View style={styles.fill}>
        <LinearGradient colors={g.colors} start={g.start} end={g.end} style={StyleSheet.absoluteFill} />
        <View style={[styles.column, { maxWidth }]}>
          <Screen {...props} />
        </View>
      </View>
    );
  };
  Framed.displayName = `Framed(${Screen.displayName || Screen.name || 'Screen'})`;
  return Framed;
};

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center' },
  column: { flex: 1, width: '100%' },
});

export default withScreenFrame;
