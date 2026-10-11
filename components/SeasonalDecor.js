import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import FunIcon from './FunIcon';

// Fixed layout so decorations don't jump between renders; values are fractions of the screen.
const SLOTS = [
  { x: 0.06, y: 0.12, size: 44, delay: 0 },
  { x: 0.86, y: 0.22, size: 38, delay: 600 },
  { x: 0.12, y: 0.55, size: 34, delay: 1200 },
  { x: 0.9, y: 0.62, size: 46, delay: 300 },
  { x: 0.48, y: 0.9, size: 36, delay: 900 },
  { x: 0.7, y: 0.04, size: 30, delay: 1500 },
];

const Floating = ({ name, slot }) => {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 2600, delay: slot.delay, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(t, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${slot.x * 100}%`,
        top: `${slot.y * 100}%`,
        opacity: 0.55,
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
          { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] }) },
        ],
      }}
    >
      <FunIcon name={name} size={slot.size} />
    </Animated.View>
  );
};

/** Floating seasonal icons behind screen content when a premium skin is active. */
const SeasonalDecor = () => {
  const { currentTheme } = useTheme();
  const decor = currentTheme?.decor;
  const items = useMemo(
    () => (decor ? SLOTS.map((slot, i) => ({ slot, name: decor[i % decor.length] })) : []),
    [decor]
  );
  if (!items.length) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map(({ slot, name }, i) => (
        <Floating key={`${currentTheme.id}-${i}`} name={name} slot={slot} />
      ))}
    </View>
  );
};

export default SeasonalDecor;
