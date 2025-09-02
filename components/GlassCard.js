/*
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

const isIOS = Platform.OS === 'ios';

const GlassCard = ({ children, style }) => {
  if (isIOS) {
    return (
      <BlurView intensity={22} tint="light" style={[styles.glassBase, styles.iosGlass, style]}>
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[styles.glassBase, styles.androidGlass, style]}>
      {children}
    </View>
  );
};

export const AndroidGlassOverlay = () => (
  <View pointerEvents="none" style={StyleSheet.absoluteFill}>
   </View>
);

const styles = StyleSheet.create({
  glassBase: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  iosGlass: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  androidGlass: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
});

export default GlassCard;
*/


