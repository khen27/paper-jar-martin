import React from "react";
import { View, ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { glassRecipe } from "../../theme/recipes";
import { tokens } from "../../theme/tokens";

type Variant = "surface" | "raised" | "press" | "indicator";
type Size = "sm" | "md" | "lg";

export interface GlassViewProps extends ViewProps {
  variant?: Variant;
  size?: Size;
  children?: React.ReactNode;
}

export function GlassView({ variant = "surface", size = "md", style, children, ...rest }: GlassViewProps) {
  const s = glassRecipe({ variant, size });
  const intensity = tokens.blur.intensity[variant as keyof typeof tokens.blur.intensity] ?? 20;

  return (
    <View style={[s.container, style]} {...rest}>
      <BlurView style={s.blur} intensity={intensity} tint="light" />
      <View style={s.overlay}>{children}</View>
    </View>
  );
}
