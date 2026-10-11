import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

/**
 * Big white "game" button with a 3D bottom edge that squishes when pressed.
 */
const ChunkyButton = ({ title, onPress, disabled = false, style }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    style={({ pressed }) => [
      styles.btn,
      pressed && !disabled && styles.pressed,
      disabled && styles.disabled,
      style,
    ]}
  >
    <Text style={styles.text}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 17,
    paddingHorizontal: 28,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(0,0,0,0.18)',
  },
  pressed: { transform: [{ translateY: 3 }], borderBottomWidth: 2 },
  disabled: { opacity: 0.5 },
  text: { color: '#22163F', fontSize: 19, fontWeight: '900', letterSpacing: 0.3 },
});

export default ChunkyButton;
