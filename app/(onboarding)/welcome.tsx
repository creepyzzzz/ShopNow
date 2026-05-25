import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/constants/theme';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, delay: 200, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Icon cluster */}
        <View style={styles.iconCluster}>
          <View style={[styles.iconBubble, styles.iconBubbleLg, { backgroundColor: Colors.blue }]}>
            <Text style={styles.iconText}>💬</Text>
          </View>
          <View style={[styles.iconBubble, styles.iconBubbleSm, { backgroundColor: Colors.purple, top: -10, right: -20 }]}>
            <Text style={{ fontSize: 16 }}>🔒</Text>
          </View>
          <View style={[styles.iconBubble, styles.iconBubbleSm, { backgroundColor: Colors.green, bottom: 0, left: -20 }]}>
            <Text style={{ fontSize: 16 }}>✨</Text>
          </View>
        </View>

        <Text style={styles.title}>Welcome to{'\n'}StealthChat</Text>
        <Text style={styles.subtitle}>
          Your private, encrypted messaging space.{'\n'}
          Disguised. Secure. Yours.
        </Text>

        {/* Feature pills */}
        <View style={styles.pills}>
          {['🔐 End-to-end encrypted', '🎭 Disguised interface', '💨 Real-time messaging'].map((f) => (
            <View key={f} style={styles.pill}>
              <Text style={styles.pillText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/(onboarding)/username');
          }}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaBtnText}>Get Started →</Text>
        </TouchableOpacity>

        <Text style={styles.privacyNote}>
          Your messages are never stored in plaintext.{'\n'}Your identity is always protected.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08071A', justifyContent: 'center' },
  blob1: {
    position: 'absolute', width: 350, height: 350, borderRadius: 175,
    backgroundColor: 'rgba(0,122,255,0.15)', top: -80, left: -80,
  },
  blob2: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(175,82,222,0.12)', bottom: 40, right: -60,
  },
  blob3: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(52,199,89,0.08)', top: height * 0.4, left: 60,
  },
  content: { paddingHorizontal: Spacing.screenPadding, alignItems: 'center' },

  iconCluster: { width: 110, height: 110, position: 'relative', marginBottom: 40 },
  iconBubble: {
    position: 'absolute', justifyContent: 'center', alignItems: 'center',
    ...Shadows.lg,
  },
  iconBubbleLg: { width: 90, height: 90, borderRadius: 28 },
  iconBubbleSm: { width: 46, height: 46, borderRadius: 16 },
  iconText: { fontSize: 40 },

  title: {
    fontSize: 36, fontWeight: '800', color: '#fff',
    textAlign: 'center', marginBottom: 16, lineHeight: 44,
  },
  subtitle: {
    ...Typography.body, color: 'rgba(255,255,255,0.65)',
    textAlign: 'center', lineHeight: 24, marginBottom: 28,
  },

  pills: { gap: 8, marginBottom: 40, alignItems: 'flex-start', width: '100%', paddingHorizontal: 8 },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radii.full, paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  pillText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },

  ctaBtn: {
    backgroundColor: Colors.blue, borderRadius: Radii.full,
    paddingVertical: 18, paddingHorizontal: 56,
    ...Shadows.lg, marginBottom: 20,
  },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  privacyNote: {
    ...Typography.caption1, color: 'rgba(255,255,255,0.4)',
    textAlign: 'center', lineHeight: 18,
  },
});
