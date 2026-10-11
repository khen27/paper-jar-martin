import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getGameRules } from '../utils/gameRules';
import { useResponsive } from '../utils/responsive';
import ChunkyButton from './ChunkyButton';

/**
 * "How to play" card shown before a game starts.
 */
const RulesSheet = ({ visible, mode, variant, title, language, t, onStart, onClose }) => {
  const { isWide, isTV, fs, height } = useResponsive();
  const slide = useRef(new Animated.Value(0)).current;
  const rules = getGameRules(mode, variant, language);

  useEffect(() => {
    if (visible) {
      slide.setValue(0);
      Animated.spring(slide, { toValue: 1, friction: 8, tension: 70, useNativeDriver: true }).start();
    }
  }, [visible]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [isWide ? 40 : 500, 0] });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, isWide && styles.backdropCenter]}>
        <Animated.View
          style={[
            styles.sheet,
            isWide && styles.sheetWide,
            isTV && { maxWidth: 900 },
            { maxHeight: height * 0.92, opacity: isWide ? slide : 1, transform: [{ translateY }] },
          ]}
        >
          <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
            {!isWide && <View style={styles.handle} />}
            <Text style={[styles.emoji, { fontSize: fs(48) }]}>{rules.emoji}</Text>
            <Text style={styles.eyebrow}>{t('howToPlay', 'How to play')}</Text>
            <Text style={[styles.title, { fontSize: fs(26) }]}>
              {title}
              {variant === 'drinks' ? ` · ${t('drinksTitle', 'Drinks')} 🍻` : ''}
            </Text>

            <View style={styles.steps}>
              {rules.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <LinearGradient colors={['#7C5CFF', '#4B32C3']} style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </LinearGradient>
                  <Text style={[styles.stepText, { fontSize: fs(15) }]}>{step}</Text>
                </View>
              ))}
            </View>

            {rules.drinkSteps.length > 0 && (
              <View style={styles.drinksBox}>
                {rules.drinkSteps.map((s, i) => (
                  <Text key={i} style={[styles.drinksText, { fontSize: fs(14) }]}>
                    {s}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.pact}>
              <Text style={styles.pactTitle}>🤝 {t('funPactTitle', 'Fun pact')}</Text>
              <Text style={[styles.pactText, { fontSize: fs(14) }]}>{rules.funPact}</Text>
            </View>

            <ChunkyButton title={`${t('letsGo', "Let's go!")} 🎉`} onPress={onStart} style={styles.cta} />
            <Pressable onPress={onClose} accessibilityRole="button" style={styles.backLink}>
              <Text style={styles.backLinkText}>{t('back', 'Back')}</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 6, 30, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdropCenter: { justifyContent: 'center', padding: 24 },
  sheet: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#1E1638',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  sheetWide: { maxWidth: 640, borderRadius: 32 },
  inner: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 28 },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: 10,
  },
  emoji: { textAlign: 'center', marginTop: 6 },
  eyebrow: {
    color: '#FFD43B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 6,
  },
  title: { color: '#fff', fontWeight: '900', textAlign: 'center', marginTop: 2, marginBottom: 18 },
  steps: { gap: 12, marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  stepText: { flex: 1, color: 'rgba(255,255,255,0.92)', fontWeight: '600', lineHeight: 22 },
  drinksBox: {
    backgroundColor: 'rgba(255,176,32,0.14)',
    borderColor: 'rgba(255,176,32,0.5)',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 14,
    gap: 8,
    marginBottom: 14,
  },
  drinksText: { color: '#FFE3A3', fontWeight: '700', lineHeight: 20 },
  pact: {
    backgroundColor: '#FFD43B',
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#E0A800',
    transform: [{ rotate: '-1deg' }],
  },
  pactTitle: { color: '#5C3B00', fontWeight: '900', fontSize: 15, marginBottom: 4 },
  pactText: { color: '#5C3B00', fontWeight: '700', lineHeight: 20 },
  cta: { marginBottom: 6 },
  backLink: { alignSelf: 'center', padding: 10 },
  backLinkText: { color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: 14 },
});

export default RulesSheet;
