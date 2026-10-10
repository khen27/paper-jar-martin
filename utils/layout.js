import { Dimensions, Platform } from 'react-native';

// On desktop browsers the app renders in a phone-width column (see App.js),
// so all layout math must use the clamped width, not the full browser width.
export const MAX_APP_WIDTH = 480;

const win = Dimensions.get('window');

export const appWidth = Platform.OS === 'web' ? Math.min(win.width, MAX_APP_WIDTH) : win.width;
export const appHeight = win.height;

export default { appWidth, appHeight, MAX_APP_WIDTH };
