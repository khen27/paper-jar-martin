import React from 'react';
import { Image, Pressable, View } from 'react-native';

const full = require('../assets/star-jar/layers-webp/00-full.webp');

export const JAR_MOUTH = { x: 51.98, y: 37.02 };

const StarJar = ({ size = 200, interactive = false, onPeak, onPopEnd, ariaLabel = 'Pull a card', style }) => {
  const box = { width: size, height: size, overflow: 'visible' };
  const art = <Image source={full} style={{ width: '100%', height: '100%' }} resizeMode="contain" />;

  if (!interactive) return <View style={[box, style]}>{art}</View>;

  return (
    <Pressable
      onPress={() => {
        onPeak && onPeak();
        onPopEnd && onPopEnd();
      }}
      accessibilityRole="button"
      accessibilityLabel={ariaLabel}
      style={[box, style]}
    >
      {art}
    </Pressable>
  );
};

export default StarJar;
