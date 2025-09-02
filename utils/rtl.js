import { I18nManager } from 'react-native';

export const RTL_LANGS = ['ur','ar','he','fa','ps','ckb','sd','ug','dv','ks','yi'];

export const isRTL = (lang) => RTL_LANGS.includes(lang) || I18nManager.isRTL === true;

export default { RTL_LANGS, isRTL };

