import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GlassView } from "../primitives/GlassView";

export function GlassIndicator({ active = false }: { active?: boolean }) {
  return (
    <View style={styles.container}>
      <GlassView variant="indicator" size="sm" style={styles.badge}>
        <Text style={styles.check}>✓</Text>
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  badge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '800',
  },
});
