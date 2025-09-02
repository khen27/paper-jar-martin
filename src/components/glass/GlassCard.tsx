import React from "react";
import { ViewProps } from "react-native";
import { GlassView, GlassViewProps } from "../primitives/GlassView";

export interface GlassCardProps extends Omit<GlassViewProps, "variant"> {
  variant?: "surface" | "raised";
}
export function GlassCard(props: GlassCardProps) {
  const { variant = "raised", ...rest } = props;
  return <GlassView variant={variant} {...rest} />;
}
