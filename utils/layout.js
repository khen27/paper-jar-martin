import { Dimensions } from 'react-native';

// Legacy style math (paddings, title sizes) was tuned for phones, so it uses a
// "design width" capped at tablet size. Real layout should use useResponsive().
export const DESIGN_MAX_WIDTH = 600;

const win = Dimensions.get('window');

export const appWidth = Math.min(win.width, DESIGN_MAX_WIDTH);
export const appHeight = win.height;

export default { appWidth, appHeight, DESIGN_MAX_WIDTH };
