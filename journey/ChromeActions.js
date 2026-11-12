// Same 48px language / theme / settings controls as classic Home,
// so Job Select and Journey chrome match the heart/lang/theme buttons.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LanguageIcon from '../components/LanguageIcon';
import { ColorIcon } from '../components/GameModeIcons';
import { ModernButton } from '../components/ui';
import { tokens } from '../theme/tokens';

const ChromeActions = ({ navigation }) => (
  <View style={styles.row}>
    <ModernButton
      variant="secondary"
      size="sm"
      onPress={() => navigation.navigate('Language')}
      style={styles.btn}
      accessibilityRole="button"
      accessibilityLabel="Language"
    >
      <LanguageIcon size={tokens.components.icon.md} color="#fff" />
    </ModernButton>
    <ModernButton
      variant="secondary"
      size="sm"
      onPress={() => navigation.navigate('Color')}
      style={styles.btn}
      accessibilityRole="button"
      accessibilityLabel="Theme"
    >
      <ColorIcon size={tokens.components.icon.md} color="#fff" />
    </ModernButton>
    <ModernButton
      variant="secondary"
      size="sm"
      onPress={() => navigation.navigate('Settings')}
      style={styles.btn}
      accessibilityRole="button"
      accessibilityLabel="Settings"
    >
      <Text style={styles.gear}>⚙</Text>
    </ModernButton>
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btn: { width: 48, height: 48, borderRadius: 24 },
  gear: { color: '#fff', fontSize: 22, fontWeight: '600' },
});

export default ChromeActions;
