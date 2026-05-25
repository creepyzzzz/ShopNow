import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/services/supabase/client';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPass) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPass) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Registration Failed', error.message);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(onboarding)/welcome');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.bg}>
        <View style={styles.bgBlob1} />
        <View style={styles.bgBlob2} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🔐</Text>
          </View>
          <Text style={styles.appName}>Create Account</Text>
          <Text style={styles.tagline}>Join the private network</Text>
        </View>

        <BlurView intensity={80} tint="light" style={styles.card}>
          <Text style={styles.cardTitle}>Sign Up</Text>
          <Text style={styles.cardSubtitle}>Create your secure account</Text>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={Colors.labelTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.labelTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.showBtnText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.labelTertiary}
                value={confirmPass}
                onChangeText={setConfirmPass}
                secureTextEntry={!showConfirmPass}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPass(!showConfirmPass)}
                style={styles.showBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.showBtnText}>{showConfirmPass ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Create Account →</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A2E' },
  bg: { ...StyleSheet.absoluteFill },
  bgBlob1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(175,82,222,0.3)', top: -80, right: -80,
  },
  bgBlob2: {
    position: 'absolute', width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(0,122,255,0.25)', bottom: 100, left: -60,
  },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.screenPadding },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoIcon: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.purple,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12, ...Shadows.lg,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 28, fontWeight: '800', color: '#fff' },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  card: { borderRadius: Radii.sheet, padding: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', ...Shadows.lg },
  cardTitle: { ...Typography.title2, color: Colors.label, marginBottom: 4 },
  cardSubtitle: { ...Typography.subheadline, color: Colors.labelSecondary, marginBottom: 24 },
  inputWrapper: { marginBottom: 16 },
  inputLabel: { ...Typography.footnote, fontWeight: '600', color: Colors.labelSecondary, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.fillTertiary, borderRadius: Radii.md, paddingHorizontal: 14, paddingVertical: 14 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, ...Typography.body, color: Colors.label },
  showBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  showBtnText: { ...Typography.footnote, color: Colors.blue, fontWeight: '600' },
  btn: { backgroundColor: Colors.purple, borderRadius: Radii.lg, paddingVertical: 16, alignItems: 'center', marginTop: 8, ...Shadows.md },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { ...Typography.subheadline, color: Colors.labelSecondary },
  loginLink: { ...Typography.subheadline, color: Colors.blue, fontWeight: '600' },
});

