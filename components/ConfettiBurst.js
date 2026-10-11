import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { appWidth, appHeight } from '../utils/layout';

const COLORS = ['#8B5CF6', '#A78BFA', '#F472B6', '#60A5FA', '#34D399', '#FBBF24', '#FF6B6B'];

/**
 * Short confetti burst. Remount with a new `burstKey` to replay.
 */
const ConfettiBurst = ({ burstKey = 0, count = 18 }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 40 + Math.random() * Math.min(appWidth, appHeight) * 0.22;
        return {
          id: `${burstKey}-${i}`,
          size: 5 + Math.random() * 7,
          color: COLORS[i % COLORS.length],
          delay: Math.random() * 120,
          duration: 700 + Math.random() * 500,
          dx: Math.cos(angle) * radius,
          dy: Math.sin(angle) * radius + 40 + Math.random() * 80,
          rotate: 180 + Math.random() * 360,
        };
      }),
    [burstKey, count]
  );

  const animsRef = useRef([]);

  useEffect(() => {
    animsRef.current = pieces.map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      o: new Animated.Value(0),
      r: new Animated.Value(0),
    }));

    const runs = pieces.map((p, i) => {
      const a = animsRef.current[i];
      return Animated.parallel([
        Animated.timing(a.x, {
          toValue: p.dx,
          duration: p.duration,
          delay: p.delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(a.y, {
          toValue: p.dy,
          duration: p.duration,
          delay: p.delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(a.r, {
          toValue: p.rotate,
          duration: p.duration,
          delay: p.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(a.o, {
            toValue: 1,
            duration: 120,
            delay: p.delay,
            useNativeDriver: true,
          }),
          Animated.timing(a.o, {
            toValue: 0,
            duration: 280,
            delay: Math.max(0, p.duration - 280),
            useNativeDriver: true,
          }),
        ]),
      ]);
    });
    Animated.stagger(12, runs).start();
  }, [burstKey, pieces]);

  // Force a re-render after anims are created for this burst
  const [, setTick] = React.useState(0);
  useEffect(() => {
    setTick((n) => n + 1);
  }, [burstKey]);

  const anims = animsRef.current;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p, i) => {
        const a = anims[i];
        if (!a) return null;
        return (
          <Animated.View
            key={p.id}
            style={{
              position: 'absolute',
              top: '42%',
              left: '50%',
              width: p.size,
              height: p.size * 1.5,
              borderRadius: 2,
              backgroundColor: p.color,
              opacity: a.o,
              transform: [
                { translateX: a.x },
                { translateY: a.y },
                {
                  rotate: a.r.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }}
          />
        );
      })}
    </View>
  );
};

export default ConfettiBurst;
