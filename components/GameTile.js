import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const tap = () => {
  try {
    Vibration.vibrate(12);
  } catch (e) {
    // Not supported (e.g. iOS Safari)
  }
};

/**
 * Chunky, colorful game-menu tile with a 3D "pressable" base and a springy press.
 */
const GameTile = ({
  emoji,
  title,
  subtitle,
  colors,
  badge,
  corner,
  locked = false,
  wide = false,
  width,
  textScale = 1,
  onPress,
  accessibilityLabel,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const press = useRef(new Animated.Value(0)).current;
  const [focused, setFocused] = useState(false);

  const hover = (on) =>
    Animated.spring(scale, { toValue: on ? 1.03 : 1, friction: 6, tension: 200, useNativeDriver: true }).start();

  const pressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.95, friction: 6, tension: 300, useNativeDriver: true }),
      Animated.timing(press, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const pressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }),
      Animated.timing(press, { toValue: 0, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const translateY = press.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });

  return (
    <Pressable
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={() => {
        tap();
        onPress && onPress();
      }}
      onHoverIn={() => hover(true)}
      onHoverOut={() => hover(false)}
      onFocus={() => {
        setFocused(true);
        hover(true);
      }}
      onBlur={() => {
        setFocused(false);
        hover(false);
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      style={[styles.wrap, width ? { width } : wide ? styles.wide : styles.half]}
    >
      <Animated.View style={[styles.fill, focused && styles.focused, { transform: [{ scale }] }]}>
        <View style={[styles.base, { backgroundColor: colors[1] }]} />
        <Animated.View style={[styles.fill, { transform: [{ translateY }] }]}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.tile, wide && styles.tileWide, locked && styles.locked]}
          >
            <View style={styles.shine} />
            {!!corner && (
              <View style={styles.corner}>
                <Text style={styles.cornerText}>{corner}</Text>
              </View>
            )}
            <View style={wide ? styles.wideRow : null}>
              <Text style={[styles.emoji, wide && styles.emojiWide, textScale !== 1 && { fontSize: (wide ? 52 : 40) * textScale }]}>
                {locked ? '🔒' : emoji}
              </Text>
              <View style={wide ? styles.wideText : null}>
                <Text
                  style={[styles.title, wide && styles.titleWide, textScale !== 1 && { fontSize: (wide ? 24 : 19) * textScale }]}
                  numberOfLines={2}
                >
                  {title}
                </Text>
                {!!subtitle && (
                  <Text
                    style={[styles.subtitle, textScale !== 1 && { fontSize: 13 * textScale, lineHeight: 18 * textScale }]}
                    numberOfLines={wide ? 2 : 3}
                  >
                    {subtitle}
                  </Text>
                )}
                {!!badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const RADIUS = 24;

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  fill: { flex: 1 },
  focused: { borderRadius: RADIUS + 4, borderWidth: 4, borderColor: '#FFD43B', margin: -4 },
  half: { width: '48%' },
  wide: { width: '100%' },
  base: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 6,
    bottom: -6,
    borderRadius: RADIUS,
    opacity: 0.9,
  },
  tile: {
    flex: 1,
    borderRadius: RADIUS,
    padding: 16,
    minHeight: 158,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  tileWide: { minHeight: 0, paddingVertical: 18 },
  locked: { opacity: 0.75 },
  shine: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  corner: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  cornerText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  wideRow: { flexDirection: 'row', alignItems: 'center' },
  wideText: { flex: 1, marginLeft: 14 },
  emoji: { fontSize: 40, marginBottom: 8 },
  emojiWide: { fontSize: 52, marginBottom: 0 },
  title: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
  titleWide: { fontSize: 24 },
  subtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
});

export default GameTile;
