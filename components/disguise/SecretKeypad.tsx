import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  BackHandler,
  Vibration,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Colors, Radii, Shadows, Typography } from '@/constants/theme';
import { SECRET_UNLOCK_CODE, MAX_UNLOCK_ATTEMPTS } from '@/constants/config';
import { useAuthStore } from '@/store/authStore';

// ─────────────────────────────────────────────────────────────────────────────
// Secret Keypad — modal number pad that validates the developer secret code
// ─────────────────────────────────────────────────────────────────────────────

interface SecretKeypadProps {
  visible: boolean;
  onClose: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export default function SecretKeypad({ visible, onClose }: SecretKeypadProps) {
  const router = useRouter();
  const { isAuthenticated, unlockApp, incrementUnlockAttempts, unlockAttempts } = useAuthStore();
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    setShake(true);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => setShake(false));
    Vibration.vibrate(300);
  };

  const handleKey = (key: string) => {
    if (key === '⌫') {
      setInput((prev) => prev.slice(0, -1));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    if (key === '') return;

    const next = input + key;
    setInput(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Auto-check when reached code length
    if (next.length === SECRET_UNLOCK_CODE.length) {
      if (next === SECRET_UNLOCK_CODE) {
        // SUCCESS
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setInput('');
        onClose();
        // Navigate to real app or auth
        setTimeout(() => {
          unlockApp();
          if (isAuthenticated) {
            router.replace('/(app)/chats');
          } else {
            router.push('/(auth)/login');
          }
        }, 300);
      } else {
        // FAILED
        triggerShake();
        incrementUnlockAttempts();
        setInput('');
        // Close and exit app after max attempts
        if (unlockAttempts + 1 >= MAX_UNLOCK_ATTEMPTS) {
          onClose();
          setTimeout(() => BackHandler.exitApp(), 500);
        }
      }
    }
  };

  const dots = Array.from({ length: SECRET_UNLOCK_CODE.length }).map((_, i) => (
    <View
      key={i}
      style={[
        styles.dot,
        i < input.length && styles.dotFilled,
        shake && styles.dotError,
      ]}
    />
  ));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={60} tint="dark" style={styles.overlay}>
        <TouchableOpacity style={styles.dismiss} onPress={onClose} activeOpacity={1}>
          <View />
        </TouchableOpacity>

        <Animated.View
          style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}
        >
          {/* Header */}
          <Text style={styles.title}>Customer Support</Text>
          <Text style={styles.subtitle}>Enter support PIN</Text>

          {/* Dots */}
          <View style={styles.dotsRow}>{dots}</View>

          {/* Attempts warning (subtle) */}
          {unlockAttempts > 0 && (
            <Text style={styles.attemptsText}>
              Incorrect PIN ({MAX_UNLOCK_ATTEMPTS - unlockAttempts} attempts left)
            </Text>
          )}

          {/* Keypad */}
          <View style={styles.keypad}>
            {KEYS.map((key, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.key, key === '' && styles.keyEmpty]}
                onPress={() => handleKey(key)}
                disabled={key === ''}
                activeOpacity={0.7}
              >
                <Text style={[styles.keyText, key === '⌫' && styles.keyBackspace]}>
                  {key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancel */}
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  dismiss: { flex: 1 },
  card: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 40,
    alignItems: 'center',
    ...Shadows.lg,
  },
  title: { ...Typography.title3, color: Colors.label, marginBottom: 4 },
  subtitle: { ...Typography.subheadline, color: Colors.labelSecondary, marginBottom: 28 },

  // Dots
  dotsRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  dot: {
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2, borderColor: Colors.separatorOpaque,
  },
  dotFilled: { backgroundColor: Colors.blue, borderColor: Colors.blue },
  dotError: { backgroundColor: Colors.red, borderColor: Colors.red },
  attemptsText: {
    ...Typography.caption1, color: Colors.red, marginBottom: 16, marginTop: 4,
  },

  // Keypad
  keypad: { flexDirection: 'row', flexWrap: 'wrap', width: 240, gap: 0, marginTop: 16 },
  key: {
    width: 80, height: 68,
    justifyContent: 'center', alignItems: 'center',
  },
  keyEmpty: { opacity: 0 },
  keyText: {
    fontSize: 26, fontWeight: '300', color: Colors.label,
  },
  keyBackspace: { fontSize: 22, fontWeight: '400' },
  cancelBtn: { marginTop: 16, paddingVertical: 8, paddingHorizontal: 32 },
  cancelText: { ...Typography.body, color: Colors.blue },
});
