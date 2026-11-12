// Journey design system. Extrapolated from the app's existing UX framework:
// theme gradients (ThemeContext), the white playing-card with a gradient band
// and a chunky bottom edge (GameScreen), ChunkyButton, glass ModernCard
// surfaces, and useResponsive. Everything here scales gracefully from phone to
// iPad to a desktop "hero" so the new experience feels first-class on any size.

import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsive } from '../utils/responsive';
import SeasonalDecor from '../components/SeasonalDecor';
import FunIcon from '../components/FunIcon';

// Brand palette (matches the classic app: plum ink, violet accent, gold).
export const JC = {
  ink: '#22163F',
  inkSoft: 'rgba(34,22,63,0.66)',
  inkFaint: 'rgba(34,22,63,0.14)',
  accent: '#7C3AED',
  gold: '#FFD43B',
  goldInk: '#5C3B00',
  onDark: '#FFFFFF',
  onDarkSoft: 'rgba(255,255,255,0.82)',
  onDarkFaint: 'rgba(255,255,255,0.6)',
  cardShadow: '#1A0B33',
};

/** One hook for everything a journey screen needs to lay itself out. */
export const useJourney = () => {
  const { getCurrentGradient } = useTheme();
  const r = useResponsive();
  const heroSplit = r.device === 'desktop' || r.device === 'tv';
  const contentMax = r.isPhone ? 560 : heroSplit ? 460 : 640;
  return {
    g: getCurrentGradient(),
    ...r,
    heroSplit, // two-column hero on big screens
    contentMax, // width of the action column
    // a readable type scale that grows on big screens
    type: {
      hero: r.fs(heroSplit ? 46 : 32),
      title: r.fs(heroSplit ? 30 : 26),
      card: r.fs(r.isPhone ? 22 : 25),
      body: r.fs(r.isPhone ? 15 : 16),
      small: r.fs(13),
      eyebrow: r.fs(12),
    },
  };
};

/** Full-bleed themed background with the seasonal decor + a soft depth wash. */
export const JourneyBackground = ({ children }) => {
  const { g } = useJourney();
  return (
    <View style={styles.fill}>
      <LinearGradient colors={g.colors} start={g.start} end={g.end} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,255,255,0.14)', 'rgba(15,8,40,0.0)', 'rgba(15,8,40,0.32)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SeasonalDecor />
      {children}
    </View>
  );
};

/** Top chrome: brand wordmark, optional back, optional settings gear. */
export const JourneyChrome = ({ onBack, onGear, right, brand = true }) => {
  const { heroSplit } = useJourney();
  return (
    <View style={styles.chrome}>
      <View style={styles.chromeSide}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.circleBtn} accessibilityRole="button" accessibilityLabel="Back">
            <Text style={styles.circleGlyph}>‹</Text>
          </Pressable>
        ) : brand ? (
          <Text style={[styles.brand, heroSplit && styles.brandWide]}>Talk Trap</Text>
        ) : (
          <View style={styles.brandSpacer} />
        )}
      </View>
      <View style={styles.chromeRight}>
        {right}
        {onGear && (
          <Pressable
            onPress={onGear}
            hitSlop={8}
            style={styles.circleBtn}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Text style={styles.gearGlyph}>⚙</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

/**
 * Responsive hero scaffold. On desktop/TV it becomes two columns: an expressive
 * `hero` on the left and the `children` action column on the right. On phone and
 * tablet it stacks, hero on top. Pass `heroCentered` for screens (home, recap)
 * whose hero should sit centered above the content on narrow widths.
 */
export const JourneyScaffold = ({ chrome, hero, children, scroll = true, contentStyle, alignTop = false }) => {
  const { heroSplit, contentMax, pad } = useJourney();
  const Body = (
    <View style={[styles.body, heroSplit && styles.bodyRow, { paddingHorizontal: pad }]}>
      {hero ? <View style={[heroSplit ? styles.heroColRow : styles.heroColStack]}>{hero}</View> : null}
      <View style={[styles.actionCol, { maxWidth: contentMax }, contentStyle]}>{children}</View>
    </View>
  );
  return (
    <JourneyBackground>
      <SafeAreaView style={styles.safe}>
        {chrome}
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.scroll, alignTop && styles.scrollTop]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {Body}
          </ScrollView>
        ) : (
          <View style={[styles.scrollStatic, alignTop && styles.scrollTop]}>{Body}</View>
        )}
      </SafeAreaView>
    </JourneyBackground>
  );
};

/** Small uppercase label used above titles. */
export const Eyebrow = ({ children, tone = 'gold', style }) => {
  const { type } = useJourney();
  return (
    <Text
      style={[
        styles.eyebrow,
        { fontSize: type.eyebrow, color: tone === 'gold' ? JC.gold : JC.onDarkSoft },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

/** Frosted surface on the gradient (glass ModernCard language). */
export const GlassPanel = ({ children, style, tone = 'surface' }) => (
  <View
    style={[
      styles.glass,
      tone === 'gold' && styles.glassGold,
      tone === 'raised' && styles.glassRaised,
      style,
    ]}
  >
    {children}
  </View>
);

export const Chip = ({ children, style, icon }) => (
  <View style={[styles.chip, style]}>
    {!!icon && <FunIcon name={icon} size={16} />}
    <Text style={styles.chipText}>{children}</Text>
  </View>
);

/**
 * Chunky journey button with a 3D bottom edge (same feel as ChunkyButton).
 * variants: 'primary' (gold), 'light' (white), 'ghost' (outline on gradient).
 */
export const JourneyButton = ({ title, onPress, variant = 'primary', disabled = false, style, icon }) => {
  const v = BTN[variant] || BTN.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: v.bg, borderBottomColor: v.edge, borderWidth: v.border ? 1.5 : 0, borderColor: v.borderColor || 'transparent' },
        pressed && !disabled && styles.btnPressed,
        disabled && styles.btnDisabled,
        style,
      ]}
    >
      <View style={styles.btnInner}>
        {!!icon && <FunIcon name={icon} size={22} />}
        <Text style={[styles.btnText, { color: v.fg }]}>{title}</Text>
      </View>
    </Pressable>
  );
};

const BTN = {
  primary: { bg: JC.gold, fg: JC.goldInk, edge: 'rgba(92,59,0,0.32)' },
  light: { bg: '#FFFFFF', fg: JC.ink, edge: 'rgba(0,0,0,0.18)' },
  ghost: { bg: 'rgba(255,255,255,0.1)', fg: JC.onDark, edge: 'rgba(0,0,0,0.0)', border: true, borderColor: 'rgba(255,255,255,0.4)' },
};

/** Plain tappable text link on the gradient. */
export const LinkText = ({ children, onPress, style }) => (
  <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
    <Text style={[styles.link, style]}>{children}</Text>
  </Pressable>
);

/**
 * The signature white playing card: a gradient band header (label + optional
 * right slot) and a lifted body with the chunky bottom edge. This is the same
 * visual DNA as the classic game's question card.
 */
export const PlayingCard = ({ band, bandRight, children, style }) => {
  const { type } = useJourney();
  return (
    <View style={[styles.card, style]}>
      {band && (
        <LinearGradient
          colors={band.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardBand}
        >
          <View style={styles.cardBandLeft}>
            {!!band.icon && <FunIcon name={band.icon} size={18} />}
            <Text style={[styles.cardBandText, { fontSize: type.small }]}>{band.label}</Text>
          </View>
          {!!bandRight && <Text style={styles.cardBandRight}>{bandRight}</Text>}
        </LinearGradient>
      )}
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
};

/** Big centered question text, matching the classic card. */
export const CardQuestion = ({ children, style }) => {
  const { type } = useJourney();
  return (
    <Text style={[styles.question, { fontSize: type.card, lineHeight: Math.round(type.card * 1.34) }, style]}>
      {children}
    </Text>
  );
};

export const CardChallenge = ({ label, children }) => (
  <View style={styles.challengeWrap}>
    {!!label && <Text style={styles.challengeLabel}>{label}</Text>}
    <Text style={styles.challengeText}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingVertical: 12, justifyContent: 'center' },
  scrollTop: { justifyContent: 'flex-start', paddingTop: 12, paddingBottom: 40 },
  scrollStatic: { flex: 1, justifyContent: 'center' },

  chrome: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  chromeSide: { minWidth: 48, justifyContent: 'center' },
  chromeRight: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0 },
  brand: { color: JC.onDark, fontWeight: '900', fontSize: 17, letterSpacing: 0.4 },
  brandWide: { fontSize: 20 },
  brandSpacer: { width: 4, height: 48 },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    flexShrink: 0,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleGlyph: { color: JC.onDark, fontSize: 28, fontWeight: '900', marginTop: -2 },
  gearGlyph: { color: '#fff', fontSize: 22, fontWeight: '600' },

  body: { flexGrow: 1, width: '100%', alignSelf: 'center', alignItems: 'center', maxWidth: 1180 },
  bodyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 56 },
  heroColRow: { flex: 1, maxWidth: 520, justifyContent: 'center' },
  heroColStack: { width: '100%', maxWidth: 640, alignItems: 'center' },
  actionCol: { width: '100%', alignSelf: 'center' },

  eyebrow: { fontWeight: '900', letterSpacing: 1.4, textTransform: 'uppercase' },

  glass: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    padding: 16,
  },
  glassRaised: { backgroundColor: 'rgba(255,255,255,0.18)' },
  glassGold: { backgroundColor: 'rgba(255,212,59,0.16)', borderColor: 'rgba(255,212,59,0.42)' },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: { color: JC.onDark, fontWeight: '800', fontSize: 13 },

  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btn: {
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 26,
    alignItems: 'center',
    borderBottomWidth: 5,
  },
  btnPressed: { transform: [{ translateY: 3 }], borderBottomWidth: 2 },
  btnDisabled: { opacity: 0.45 },
  btnText: { fontSize: 18, fontWeight: '900', letterSpacing: 0.3 },
  link: {
    color: JC.onDarkSoft,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: JC.cardShadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.26,
    shadowRadius: 26,
    elevation: 12,
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  cardBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  cardBandLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  cardBandText: { color: '#fff', fontWeight: '900', letterSpacing: 0.6, textTransform: 'uppercase' },
  cardBandRight: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '800' },
  cardBody: { padding: 22 },
  question: {
    color: JC.ink,
    fontWeight: '800',
    letterSpacing: 0.2,
    ...(Platform.OS === 'android' ? {} : { fontVariant: ['lining-nums'] }),
  },
  challengeWrap: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(34,22,63,0.1)',
  },
  challengeLabel: {
    color: JC.accent,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  challengeText: { color: JC.inkSoft, fontSize: 14, fontWeight: '700', lineHeight: 20 },
});

export default {
  JC,
  useJourney,
  JourneyBackground,
  JourneyChrome,
  JourneyScaffold,
  Eyebrow,
  GlassPanel,
  Chip,
  JourneyButton,
  LinkText,
  PlayingCard,
  CardQuestion,
  CardChallenge,
};
