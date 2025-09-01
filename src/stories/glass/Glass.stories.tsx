import React from "react";
import { View, Text } from "react-native";
import { GlassCard } from "../../components/glass/GlassCard";
import { GlassPressable } from "../../components/glass/GlassPressable";
import { GlassIndicator } from "../../components/glass/GlassIndicator";

export default { title: "Glass" };

export const CardVariants = () => (
  <View style={{ flex: 1, padding: 20, backgroundColor: '#667eea' }}>
    <GlassCard variant="surface" size="sm" style={{ marginBottom: 20 }}>
      <Text style={{ color: 'white', textAlign: 'center' }}>Surface Small</Text>
    </GlassCard>
    <GlassCard variant="raised" size="md" style={{ marginBottom: 20 }}>
      <Text style={{ color: 'white', textAlign: 'center' }}>Raised Medium</Text>
    </GlassCard>
    <GlassCard variant="raised" size="lg">
      <Text style={{ color: 'white', textAlign: 'center' }}>Raised Large</Text>
    </GlassCard>
  </View>
);

export const Pressable = () => (
  <View style={{ flex: 1, padding: 20, backgroundColor: '#667eea' }}>
    <GlassPressable onPress={() => {}} size="md" style={{ marginBottom: 20 }}>
      <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>Press Me</Text>
    </GlassPressable>
  </View>
);

export const Indicator = () => (
  <View style={{ flex: 1, padding: 20, backgroundColor: '#667eea' }}>
    <GlassIndicator active />
  </View>
);
