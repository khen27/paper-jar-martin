import React from "react";
import { View } from "react-native";
import { GlassView } from "../primitives/GlassView";

export function GlassIndicator({ active = false }: { active?: boolean }) {
  return (
    <GlassView variant="indicator" size="sm">
      <View />
    </GlassView>
  );
}
