import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useResponsive } from '../utils/responsive';
import FunIcon, { hasFunIcon } from './FunIcon';

const StyleOption = ({ icon, title, desc, chips, colors, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.96, friction: 6, tension: 300, useNativeDriver: true }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }).start()
      }
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Animated.View style={[styles.optionWrap, { transform: [{ scale }] }]}>
        <View style={[styles.optionBase, { backgroundColor: colors[1] }]} />
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.option}>
          <FunIcon name={icon} size={58} style={styles.optionIcon} />
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>{title}</Text>
            <Text style={styles.optionDesc}>{desc}</Text>
            <View style={styles.chips}>
              {chips.map((c) => (
                <View key={c} style={styles.chip}>
                  <Text style={styles.chipText}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

/**
 * Bottom sheet that asks how to play a mode: Classic (talk & challenges) or Drinks.
 */
const StylePickerSheet = ({ visible, modeEmoji, modeIcon, modeTitle, t, onPick, onClose, lockedVariants = [] }) => {
  const slide = useRef(new Animated.Value(0)).current;
  const { isWide } = useResponsive();
  const lockMark = (v) => (lockedVariants.includes(v) ? ' 👑' : '');

  useEffect(() => {
    if (visible) {
      slide.setValue(0);
      Animated.spring(slide, { toValue: 1, friction: 8, tension: 70, useNativeDriver: true }).start();
    }
  }, [visible]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [isWide ? 40 : 500, 0] });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, isWide && styles.backdropCenter]}
        onPress={onClose}
        accessibilityLabel={t('back', 'Back')}
      >
        <Animated.View
          style={[
            styles.sheet,
            isWide && styles.sheetWide,
            { opacity: isWide ? slide : 1, transform: [{ translateY }] },
          ]}
        >
          <Pressable>
            {!isWide && <View style={styles.handle} />}
            {hasFunIcon(modeIcon) ? (
              <FunIcon name={modeIcon} size={64} style={styles.modeIcon} />
            ) : (
              <Text style={styles.modeEmoji}>{modeEmoji}</Text>
            )}
            <Text style={styles.title}>{modeTitle}</Text>
            <Text style={styles.subtitle}>{t('stylePickerTitle', 'How do you want to play?')}</Text>

            <StyleOption
              icon="classic"
              title={t('classicTitle', 'Classic') + lockMark('classic')}
              desc={t('classicDesc', 'Talk, laugh and do funny challenges.')}
              chips={[
                `💬 ${t('typeQuestion', 'Question')}`,
                `🤪 ${t('typeWild', 'Wild card')}`,
                `🎯 ${t('typeDare', 'Dare')}`,
              ]}
              colors={['#7C5CFF', '#4B32C3']}
              onPress={() => onPick('classic')}
            />

            <StyleOption
              icon="drinks"
              title={t('drinksTitle', 'Drinks') + lockMark('drinks')}
              desc={t('drinksDesc', 'Answer or drink. Vote together — the winner drinks.')}
              chips={[
                `🍻 ${t('typeAnswerOrDrink', 'Answer or drink')}`,
                `🗳️ ${t('typeVote', 'Vote')}`,
                `🎯 ${t('typeDoOrDrink', 'Do it or drink')}`,
              ]}
              colors={['#FFB020', '#E86A00']}
              onPress={() => onPick('drinks')}
            />

            <Text style={styles.footer}>
              {t('drinksFooter', '18+ for alcohol. Soft drinks count too — drink responsibly.')}
            </Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 6, 30, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#1E1638',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
  },
  backdropCenter: { justifyContent: 'center', padding: 24 },
  sheetWide: { maxWidth: 560, borderRadius: 32, paddingTop: 24 },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: 12,
  },
  modeEmoji: { fontSize: 44, textAlign: 'center' },
  title: { color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  optionWrap: { marginBottom: 18 },
  optionBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 6,
    bottom: -6,
    borderRadius: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  optionIcon: { marginRight: 12 },
  modeIcon: { alignSelf: 'center' },
  optionText: { flex: 1 },
  optionTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  optionDesc: { color: 'rgba(255,255,255,0.95)', fontSize: 14, fontWeight: '600', marginTop: 2, lineHeight: 19 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  chipText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  footer: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default StylePickerSheet;
