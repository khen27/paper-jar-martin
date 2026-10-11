import { Platform, useWindowDimensions } from 'react-native';

// Breakpoints by window width. TV = big screens (TV browsers, casting) or native TV builds.
const TABLET = 700;
const DESKTOP = 1100;
const TV = 1700;

export const getDeviceClass = (width) => {
  if (Platform.isTV || width >= TV) return 'tv';
  if (width >= DESKTOP) return 'desktop';
  if (width >= TABLET) return 'tablet';
  return 'phone';
};

const CONFIG = {
  phone: { columns: 2, maxWidth: 560, cardMaxWidth: 560, pad: 20, scale: 1 },
  tablet: { columns: 3, maxWidth: 900, cardMaxWidth: 680, pad: 32, scale: 1.15 },
  desktop: { columns: 4, maxWidth: 1180, cardMaxWidth: 760, pad: 40, scale: 1.2 },
  tv: { columns: 4, maxWidth: 1600, cardMaxWidth: 1100, pad: 64, scale: 1.6 },
};

/**
 * Screen-size aware layout values. Re-renders on window resize / rotation.
 */
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const device = getDeviceClass(width);
  const cfg = CONFIG[device];
  const contentWidth = Math.min(width - cfg.pad * 2, cfg.maxWidth);
  return {
    width,
    height,
    device,
    isPhone: device === 'phone',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
    isTV: device === 'tv',
    isWide: device !== 'phone',
    isLandscape: width > height,
    columns: cfg.columns,
    pad: cfg.pad,
    maxWidth: cfg.maxWidth,
    scale: cfg.scale,
    contentWidth,
    cardMaxWidth: Math.min(cfg.cardMaxWidth, width - cfg.pad * 2),
    /** Scale a phone-sized font/spacing value for the current screen. */
    fs: (n) => Math.round(n * cfg.scale),
  };
};

export default useResponsive;
