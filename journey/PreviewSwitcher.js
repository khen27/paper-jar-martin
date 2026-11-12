// Path dock so Martin can see — and tap — all three doors without hunting.
// No duplicate “change how you play” label: the three tiles ARE the switcher.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../translations';
import FunIcon from '../components/FunIcon';
import { applyPath } from '../utils/experiment';
import { JC } from './ui';

const DOORS = [
  {
    path: 'group',
    icon: 'party',
    colors: ['#FF9F1C', '#FF4E50'],
    labelKey: 'previewGroup',
    label: 'Group',
  },
  {
    path: 'coupleClassic',
    icon: 'handshake',
    colors: ['#8F6BFF', '#5B3FD9'],
    labelKey: 'previewDuo',
    label: 'Couple',
  },
  {
    path: 'coupleJourney',
    icon: 'candle',
    colors: ['#FF5E8A', '#E0245E'],
    labelKey: 'previewJourney',
    label: '14 nights',
  },
];

const currentPath = (settings) => {
  if (settings.experimentJob === 'group') return 'group';
  if (settings.experimentJob === 'couple' && settings.experimentArm === 'journey') return 'coupleJourney';
  if (settings.experimentJob === 'couple') return 'coupleClassic';
  return null;
};

const PreviewSwitcher = () => {
  const { language } = useLanguage();
  const { settings, updateSettings } = useSettings();
  const t = (k, f) => translations[language]?.[k] || f;
  if (!settings.experimentUx) return null;
  const active = currentPath(settings);

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>{t('previewPlaying', 'Switch path anytime')}</Text>
      <View style={styles.row}>
        {DOORS.map((c) => {
          const on = active === c.path;
          return (
            <Pressable
              key={c.path}
              onPress={() => applyPath(updateSettings, c.path)}
              style={[styles.door, on && styles.doorOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={t(c.labelKey, c.label)}
            >
              {on ? (
                <LinearGradient colors={c.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.doorFill}>
                  <FunIcon name={c.icon} size={28} />
                  <Text style={styles.doorTextOn} numberOfLines={2}>
                    {t(c.labelKey, c.label)}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.doorFill}>
                  <FunIcon name={c.icon} size={28} />
                  <Text style={styles.doorText} numberOfLines={2}>
                    {t(c.labelKey, c.label)}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { width: '100%', paddingBottom: 6 },
  kicker: {
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 8 },
  door: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.18)',
    minHeight: 86,
  },
  doorOn: {
    borderColor: 'rgba(255,255,255,0.55)',
    borderBottomColor: 'rgba(0,0,0,0.28)',
  },
  doorFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 4,
  },
  doorText: {
    color: JC.onDark,
    fontWeight: '800',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  doorTextOn: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default PreviewSwitcher;
