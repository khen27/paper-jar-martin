import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FunIcon from './FunIcon';

/**
 * Big white "game" button with a 3D bottom edge that squishes when pressed.
 */
const ChunkyButton = ({ title, onPress, disabled = false, style, icon }) => (
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
    <View style={styles.inner}>
      {!!icon && <FunIcon name={icon} size={22} />}
      <Text style={styles.text}>{title}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
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
