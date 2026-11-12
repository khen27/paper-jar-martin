import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';

const full = require('../assets/star-jar/layers-webp/00-full.webp');
const glassBack = require('../assets/star-jar/layers-webp/01-glass-back.webp');
const starsImg = require('../assets/star-jar/layers-webp/02-stars.webp');
const glassFront = require('../assets/star-jar/layers-webp/03-glass-front.webp');
const lidImg = require('../assets/star-jar/layers-webp/04-lid.webp');
const heroImg = require('../assets/star-jar/layers-webp/05-hero-star.webp');
const sparkImg = require('../assets/star-jar/layers-webp/06-spark-star.webp');

export const JAR_MOUTH = { x: 51.98, y: 37.02 };

const Layer = ({ source, style, animStyle }) => (
  <Animated.Image source={source} style={[styles.layer, style, animStyle]} resizeMode="contain" />
);

const StarJar = ({
  size = 200,
  interactive = false,
  autoPopEvery,
  onPeak,
  onPopEnd,
  variant = 'layered',
  ariaLabel = 'Pull a card',
  style,
}) => {
  const popping = useRef(false);
  const bob = useRef(new Animated.Value(0)).current;
  const squash = useRef(new Animated.Value(0)).current;
  const lid = useRef(new Animated.Value(0)).current;
  const hero = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (variant === 'static' || variant === 'loop') return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob, variant]);

  const pop = useCallback(() => {
    if (popping.current) return;
    popping.current = true;
    squash.setValue(0);
    lid.setValue(0);
    hero.setValue(0);
    Animated.parallel([
      Animated.timing(squash, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lid, { toValue: 1, duration: 1050, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(hero, { toValue: 1, duration: 1050, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(({ finished }) => {
      popping.current = false;
      if (finished) onPopEnd && onPopEnd();
    });
    setTimeout(() => onPeak && onPeak(), 470);
  }, [hero, lid, onPeak, onPopEnd, squash]);

  useEffect(() => {
    if (!interactive || !autoPopEvery) return undefined;
    const id = setInterval(pop, autoPopEvery);
    return () => clearInterval(id);
  }, [interactive, autoPopEvery, pop]);

  const box = { width: size, height: size, overflow: 'visible' };

  if (variant === 'static' || variant === 'loop') {
    return (
      <View style={[box, style]} accessibilityLabel={ariaLabel}>
        <Image source={full} style={styles.layer} resizeMode="contain" />
      </View>
    );
  }

  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.015] });
  const bodyScaleX = squash.interpolate({ inputRange: [0, 0.18, 0.38, 0.58, 1], outputRange: [1, 1.06, 0.95, 1.02, 1] });
  const bodyScaleY = squash.interpolate({ inputRange: [0, 0.18, 0.38, 0.58, 1], outputRange: [1, 0.9, 1.08, 0.98, 1] });
  const lidX = lid.interpolate({ inputRange: [0, 0.15, 0.42, 0.62, 0.72, 0.8, 1], outputRange: [0, 0, -size * 0.04, -size * 0.01, 0, 0, 0] });
  const lidY = lid.interpolate({ inputRange: [0, 0.15, 0.42, 0.62, 0.72, 0.8, 1], outputRange: [0, size * 0.01, -size * 0.16, -size * 0.04, 0, -size * 0.03, 0] });
  const lidR = lid.interpolate({ inputRange: [0, 0.15, 0.42, 0.62, 0.72, 0.8, 1], outputRange: ['0deg', '0deg', '-24deg', '-4deg', '0deg', '-2deg', '0deg'] });
  const heroY = hero.interpolate({ inputRange: [0, 0.15, 0.45, 0.7, 0.82, 1], outputRange: [0, size * 0.02, -size * 0.2, size * 0.01, -size * 0.03, 0] });
  const heroR = hero.interpolate({ inputRange: [0, 0.15, 0.45, 0.7, 1], outputRange: ['0deg', '0deg', '260deg', '360deg', '360deg'] });
  const heroS = hero.interpolate({ inputRange: [0, 0.15, 0.45, 0.7, 0.82, 1], outputRange: [1, 0.94, 1.2, 0.97, 1.02, 1] });

  const inner = (
    <Animated.View style={[box, { transform: [{ translateY: bobY }] }]}>
      <Animated.View
        style={[
          styles.fill,
          { transform: [{ scaleX: bodyScaleX }, { scaleY: bodyScaleY }] },
        ]}
      >
        <Layer source={glassBack} />
        <Layer source={starsImg} />
        <Layer source={glassFront} />
      </Animated.View>
      <Layer
        source={lidImg}
        animStyle={{ transform: [{ translateX: lidX }, { translateY: lidY }, { rotate: lidR }] }}
      />
      <Layer
        source={heroImg}
        animStyle={{ transform: [{ translateY: heroY }, { rotate: heroR }, { scale: heroS }] }}
      />
      <Layer source={sparkImg} />
    </Animated.View>
  );

  if (!interactive) {
    return <View style={[box, style, { overflow: 'visible' }]}>{inner}</View>;
  }

  return (
    <Pressable
      onPress={pop}
      accessibilityRole="button"
      accessibilityLabel={ariaLabel}
      style={[box, style, { overflow: 'visible' }]}
    >
      {inner}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
  layer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: '100%', height: '100%' },
});

export default StarJar;
