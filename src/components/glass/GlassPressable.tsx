import React from "react";
import { Pressable, PressableProps } from "react-native";
import { GlassView } from "../primitives/GlassView";

type Size = "sm" | "md" | "lg";
export interface GlassPressableProps extends Omit<PressableProps, "style"> {
  size?: Size;
}
export function GlassPressable({ size = "md", children, ...rest }: GlassPressableProps) {
  return (
    <Pressable {...rest}>
      <GlassView variant="press" size={size}>{children}</GlassView>
    </Pressable>
  );
}
