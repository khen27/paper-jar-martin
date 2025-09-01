import { Platform, StyleSheet } from "react-native";
import { tokens } from "./tokens";

type Variant = "surface" | "raised" | "press" | "indicator";
type Size = "sm" | "md" | "lg";

export function glassRecipe({ variant = "surface", size = "md" }: {variant?: Variant; size?: Size}) {
  const radius = { sm: tokens.radius.sm, md: tokens.radius.md, lg: tokens.radius.lg }[size];
  const padding = { sm: tokens.spacing.sm, md: tokens.spacing.md, lg: tokens.spacing.lg }[size];

  const base = {
    borderRadius: radius,
    padding: variant === "indicator" ? 0 : padding,
    borderWidth: tokens.border.width.hairline,
    borderColor: tokens.color.glass.border,
    backgroundColor: tokens.color.glass[variant],
  };

  const elevation = Platform.select({
    ios: tokens.shadow.ios.mid,
    android: { elevation: tokens.shadow.android.mid },
  });

  return StyleSheet.create({
    container: { overflow: "hidden", borderRadius: radius, ...(elevation as object) },
    blur: StyleSheet.absoluteFillObject,
    overlay: base,
  });
}
