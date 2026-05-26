import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  Switch, ScrollView, BackHandler,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/constants/theme';
import AppIcon from '@/components/ui/AppIcon';

// ─────────────────────────────────────────────────────────────────────────────
// Settings Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut, panicWipe } = useAuthStore();
  const { setConversations } = useChatStore();
  const [notifDisguise, setNotifDisguise] = useState(true);
  const [panicEnabled, setPanicEnabled] = useState(true);
  const [biometricVault, setBiometricVault] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Sign out of StealthChat?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(disguise)');
        },
      },
    ]);
  };

  const handleFullPanic = () => {
    Alert.alert(
      '🚨 PANIC DELETE',
      'This will:\n\n• Delete all local data\n• Sign you out immediately\n• Close the app\n\nThis cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'WIPE EVERYTHING',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            // Clear stores
            setConversations([]);
            // Wipe all SecureStore keys
            await panicWipe();
            // Force close app
            setTimeout(() => BackHandler.exitApp(), 500);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AppIcon name="back" size={24} color={Colors.blue} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <Animated.View entering={FadeInUp.delay(60).springify().damping(20).stiffness(160)}>
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>{user?.alias?.[0]?.toUpperCase() || '?'}</Text>
            </View>
            <View>
              <Text style={styles.profileAlias}>{user?.alias}</Text>
              <Text style={styles.profileUsername}>@{user?.username}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Security */}
        <Animated.View entering={FadeInUp.delay(140).springify().damping(20).stiffness(160)}>
          <Text style={styles.sectionLabel}>SECURITY</Text>
          <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconWrap}>
                <AppIcon name="bell" size={20} color={Colors.label} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Disguised Notifications</Text>
                <Text style={styles.settingDesc}>Show fake shopping notifications</Text>
              </View>
            </View>
            <Switch
              value={notifDisguise}
              onValueChange={setNotifDisguise}
              trackColor={{ true: Colors.blue }}
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconWrap}>
                <AppIcon name="alarm" size={20} color={Colors.red} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Panic Delete</Text>
                <Text style={styles.settingDesc}>Allow long-press panic button</Text>
              </View>
            </View>
            <Switch
              value={panicEnabled}
              onValueChange={setPanicEnabled}
              trackColor={{ true: Colors.red }}
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconWrap}>
                <AppIcon name="fingerprint" size={20} color={Colors.label} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Biometric Vault</Text>
                <Text style={styles.settingDesc}>Unlock vault with fingerprint/face</Text>
              </View>
            </View>
            <Switch
              value={biometricVault}
              onValueChange={setBiometricVault}
              trackColor={{ true: Colors.blue }}
            />
          </View>
          </View>
        </Animated.View>

        {/* Disguise Info */}
        <Animated.View entering={FadeInUp.delay(220).springify().damping(20).stiffness(160)}>
          <Text style={styles.sectionLabel}>DISGUISE</Text>
          <View style={styles.section}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconWrap}>
                <AppIcon name="cart" size={20} color={Colors.label} />
              </View>
              <View>
                <Text style={styles.settingTitle}>App Disguise Name</Text>
                <Text style={styles.settingDesc}>Appears as "ShopNow" publicly</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconWrap}>
                <AppIcon name="mask" size={20} color={Colors.label} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Change Alias</Text>
                <Text style={styles.settingDesc}>{user?.alias}</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View entering={FadeInUp.delay(300).springify().damping(20).stiffness(160)}>
          <Text style={styles.sectionLabel}>DANGER ZONE</Text>
          <View style={styles.section}>
          <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconWrap}>
                <AppIcon name="door" size={20} color={Colors.orange} />
              </View>
              <Text style={[styles.settingTitle, { color: Colors.orange }]}>Sign Out</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.settingRow, styles.panicRow]}
            onPress={handleFullPanic}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingIconWrap}>
                <AppIcon name="explosion" size={20} color={Colors.red} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: Colors.red }]}>Panic Wipe</Text>
                <Text style={styles.settingDesc}>Erase everything and close app</Text>
              </View>
            </View>
          </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Version */}
        <Text style={styles.versionText}>StealthChat v1.0.0 • Disguised as ShopNow</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: Spacing.screenPadding, paddingBottom: 12,
    backgroundColor: Colors.surface, borderBottomWidth: 0.5, borderBottomColor: Colors.separator,
  },
  backIcon: { fontSize: 24, color: Colors.blue },
  title: { ...Typography.title3, color: Colors.label },
  scroll: { padding: Spacing.screenPadding, paddingBottom: 60 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.surface, borderRadius: Radii.card,
    padding: 20, marginBottom: 24, ...Shadows.sm,
  },
  profileAvatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.blue, justifyContent: 'center', alignItems: 'center',
  },
  profileInitial: { color: '#fff', fontSize: 28, fontWeight: '700' },
  profileAlias: { ...Typography.title3, color: Colors.label },
  profileUsername: { ...Typography.subheadline, color: Colors.labelSecondary },

  sectionLabel: {
    ...Typography.caption1, fontWeight: '700', color: Colors.labelSecondary,
    marginBottom: 8, marginLeft: 4,
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: Colors.surface, borderRadius: Radii.card,
    marginBottom: 24, overflow: 'hidden', ...Shadows.sm,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingIconWrap: { width: 28, alignItems: 'center' },
  settingTitle: { ...Typography.subheadline, color: Colors.label, fontWeight: '600' },
  settingDesc: { ...Typography.caption1, color: Colors.labelSecondary, marginTop: 2 },
  divider: { height: 0.5, backgroundColor: Colors.separator, marginLeft: 56 },
  chevron: { fontSize: 20, color: Colors.labelTertiary },
  panicRow: { backgroundColor: 'rgba(255,59,48,0.04)' },

  versionText: {
    ...Typography.caption2, color: Colors.labelQuaternary,
    textAlign: 'center', marginTop: 8,
  },
});
