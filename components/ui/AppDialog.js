import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '../../theme/tokens';

/**
 * Cross-platform replacement for Alert.alert (which is a no-op in browsers).
 *
 * <AppDialog
 *   visible={bool}
 *   title="..." message="..."
 *   buttons={[{ text, style: 'default'|'cancel'|'destructive', onPress }]}
 *   onRequestClose={() => ...}
 * />
 */
const AppDialog = ({ visible, title, message, buttons = [], onRequestClose }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
    <View style={styles.backdrop}>
      <View style={styles.card}>
        {!!title && <Text style={styles.title}>{title}</Text>}
        {!!message && <Text style={styles.message}>{message}</Text>}
        <View style={styles.buttonRow}>
          {buttons.map((btn, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.button,
                btn.style === 'cancel' && styles.cancelButton,
                btn.style === 'destructive' && styles.destructiveButton,
              ]}
              onPress={() => {
                onRequestClose && onRequestClose();
                btn.onPress && btn.onPress();
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.buttonText,
                  btn.style === 'cancel' && styles.cancelText,
                  btn.style === 'destructive' && styles.destructiveText,
                ]}
              >
                {btn.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#4a4a5e',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f5',
  },
  destructiveButton: {
    backgroundColor: '#ff4757',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelText: {
    color: '#4a4a5e',
  },
  destructiveText: {
    color: '#fff',
  },
});

export default AppDialog;
