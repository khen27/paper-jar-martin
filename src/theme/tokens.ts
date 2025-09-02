export const tokens = {
  color: {
    glass: {
      surface: "rgba(255,255,255,0.12)",
      raised:  "rgba(255,255,255,0.18)",
      press:   "rgba(255,255,255,0.24)",
      border:  "rgba(255,255,255,0.30)",
    },
  },
  radius: { xs: 8, sm: 12, md: 16, lg: 20, xl: 28 },
  spacing:{ xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  shadow: {
    ios: {
      low:  { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8,  shadowOffset:{width:0,height:2}},
      mid:  { shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset:{width:0,height:6}},
      high: { shadowColor: "#000", shadowOpacity: 0.24, shadowRadius: 18, shadowOffset:{width:0,height:10}},
    },
    android: { low: 2, mid: 6, high: 10 },
  },
  blur: { intensity: { surface: 20, raised: 30, press: 40 } },
  border: { width: { hairline: 1 }, style: "solid" },
} as const;
export type Tokens = typeof tokens;
