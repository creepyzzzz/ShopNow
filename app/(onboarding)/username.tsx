import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/services/supabase/client';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/constants/theme';

export default function UsernameScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [alias, setAlias] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkUsername = async (val: string) => {
    setUsername(val);
    if (val.length < 3) { setAvailable(null); return; }
    setChecking(true);
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('username', val.toLowerCase())
      .maybeSingle();
    setChecking(false);
    setAvailable(!data);
  };

  const handleContinue = async () => {
    if (!username || !alias) { Alert.alert('Error', 'Fill in both fields'); return; }
    if (!available) { Alert.alert('Error', 'Username not available'); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/(auth)/login'); return; }

    const { error } = await (supabase.from('users') as any).insert({
      id: user.id,
      username: username.toLowerCase(),
      alias,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/(onboarding)/avatar');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.bg}>
        <View style={styles.blob} />
      </View>

      <View style={styles.content}>
        <View style={styles.progressRow}>
          {[1, 2, 3].map((step) => (
            <View key={step} style={[styles.progressDot, step === 1 && styles.progressDotActive]} />
          ))}
        </View>

        <Text style={styles.title}>Create your{'\n'}identity</Text>
        <Text style={styles.subtitle}>
          Username is public. Alias is shown in chats.
        </Text>

        {/* Username */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputRow}>
            <Text style={styles.prefix}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="uniquehandle"
              placeholderTextColor={Colors.labelTertiary}
              value={username}
              onChangeText={checkUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {checking && <ActivityIndicator size="small" color={Colors.blue} />}
            {!checking && available === true && <Text style={styles.check}>✅</Text>}
            {!checking && available === false && <Text style={styles.cross}>❌</Text>}
          </View>
          <Text style={styles.hint}>
            {available === false ? 'Username taken' : 'Minimum 3 characters, no spaces'}
          </Text>
        </View>

        {/* Alias */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Display Alias</Text>
          <TextInput
            style={[styles.inputRow, styles.aliasInput]}
            placeholder="How you appear in chats"
            placeholderTextColor={Colors.labelTertiary}
            value={alias}
            onChangeText={setAlias}
          />
          <Text style={styles.hint}>This hides your real name. Can be anything.</Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, (!available || loading) && styles.btnDisabled]}
          onPress={handleContinue}
          disabled={!available || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Continue →</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08071A' },
  bg: { ...StyleSheet.absoluteFill },
  blob: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(0,122,255,0.15)', top: -50, right: -80,
  },
  content: { flex: 1, padding: Spacing.screenPadding, paddingTop: 80, justifyContent: 'center' },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 40 },
  progressDot: { width: 32, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressDotActive: { backgroundColor: Colors.blue, width: 64 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 12, lineHeight: 40 },
  subtitle: { ...Typography.subheadline, color: 'rgba(255,255,255,0.6)', marginBottom: 36 },

  fieldGroup: { marginBottom: 24 },
  label: { ...Typography.footnote, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radii.md, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  prefix: { ...Typography.body, color: Colors.blue, fontWeight: '700', marginRight: 4 },
  input: { flex: 1, ...Typography.body, color: '#fff' },
  aliasInput: { ...Typography.body, color: '#fff', paddingHorizontal: 16, paddingVertical: 14 },
  check: { fontSize: 16 },
  cross: { fontSize: 16 },
  hint: { ...Typography.caption1, color: 'rgba(255,255,255,0.4)', marginTop: 6 },

  btn: {
    backgroundColor: Colors.blue, borderRadius: Radii.lg,
    paddingVertical: 18, alignItems: 'center', marginTop: 16,
    ...Shadows.md,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
