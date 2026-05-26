import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/services/supabase/client';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/constants/theme';
import AppIcon from '@/components/ui/AppIcon';

export default function ShopRegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

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
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="back" size={24} color={Colors.label} />
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <AppIcon name="person" size={42} color={Colors.shopAccent} />
          </View>
          <Text style={styles.title}>Create an Account</Text>
          <Text style={styles.subtitle}>Join ShopNow for faster checkout and exclusive offers.</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputRow}>
              <AppIcon name="mail" size={20} color={Colors.labelTertiary} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={Colors.labelTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputRow}>
              <AppIcon name="lock" size={20} color={Colors.labelTertiary} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={Colors.labelTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <AppIcon name={showPass ? 'eye-off' : 'eye'} size={20} color={Colors.labelTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputRow}>
              <AppIcon name="lock" size={20} color={Colors.labelTertiary} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={Colors.labelTertiary}
                value={confirmPass}
                onChangeText={setConfirmPass}
                secureTextEntry={!showConfirmPass}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
                <AppIcon name={showConfirmPass ? 'eye-off' : 'eye'} size={20} color={Colors.labelTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: Spacing.screenPadding, paddingTop: 60 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 20 },
  
  headerSection: { alignItems: 'center', marginBottom: 40 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.shopAccentLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  title: { ...Typography.title2, color: Colors.label, marginBottom: 8, fontWeight: '800' },
  subtitle: { ...Typography.body, color: Colors.labelSecondary, textAlign: 'center', paddingHorizontal: 20 },

  formSection: { flex: 1 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { ...Typography.subheadline, color: Colors.label, fontWeight: '600', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.separator,
    borderRadius: Radii.md, paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: Colors.surface, gap: 10,
  },
  input: { flex: 1, ...Typography.body, color: Colors.label },

  registerBtn: {
    backgroundColor: Colors.shopAccent, borderRadius: Radii.md,
    paddingVertical: 16, alignItems: 'center', marginTop: 12,
    ...Shadows.sm,
  },
  registerBtnDisabled: { opacity: 0.7 },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { ...Typography.subheadline, color: Colors.labelSecondary },
  loginLink: { ...Typography.subheadline, color: Colors.shopAccent, fontWeight: '700' },
});
