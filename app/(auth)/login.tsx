import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/constants/theme';
import AppIcon from '@/components/ui/AppIcon';

export default function ShopLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Login Failed', error.message);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Check if profile exists and load it into the store
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        if (profile) {
          useAuthStore.getState().setUser(profile);
          router.replace('/(app)/chats'); // Since they logged in, take them to the stealth app
        } else {
          router.replace('/(onboarding)/welcome');
        }
      }
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
            <AppIcon name="bag" size={42} color={Colors.shopAccent} />
          </View>
          <Text style={styles.title}>Welcome to ShopNow</Text>
          <Text style={styles.subtitle}>Sign in to access your orders, wishlists and special offers.</Text>
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
                placeholder="Enter your password"
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

          <TouchableOpacity style={styles.forgotPassBtn}>
            <Text style={styles.forgotPassText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
              <Text style={styles.registerLink}>Sign up</Text>
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

  forgotPassBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPassText: { ...Typography.footnote, color: Colors.shopAccent, fontWeight: '600' },

  loginBtn: {
    backgroundColor: Colors.shopAccent, borderRadius: Radii.md,
    paddingVertical: 16, alignItems: 'center',
    ...Shadows.sm,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { ...Typography.subheadline, color: Colors.labelSecondary },
  registerLink: { ...Typography.subheadline, color: Colors.shopAccent, fontWeight: '700' },
});
