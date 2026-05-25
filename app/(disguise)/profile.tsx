import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useShopStore } from '@/store/shopStore';
import { useAuthStore } from '@/store/authStore';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/constants/theme';

const MENU_ITEMS = [
  { icon: '📦', label: 'My Orders', route: '/(disguise)/orders' },
  { icon: '❤️', label: 'Wishlist', route: '/(disguise)/wishlist' },
  { icon: '📍', label: 'Saved Addresses', route: null },
  { icon: '💳', label: 'Payment Methods', route: null },
  { icon: '🎟️', label: 'Coupons & Offers', route: null },
  { icon: '🔔', label: 'Notification Settings', route: null },
  { icon: '❓', label: 'Help & Support', route: '/(disguise)/support' },
  { icon: '📄', label: 'Terms & Conditions', route: null },
  { icon: '🔒', label: 'Privacy Policy', route: null },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, getCartCount } = useShopStore();
  const { isAuthenticated, user, signOut } = useAuthStore();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar & Name */}
        <Animated.View entering={FadeInUp.springify()} style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.profileName}>
            {isAuthenticated && user ? user.username : profile.name}
          </Text>
          <Text style={styles.profileEmail}>
            {isAuthenticated && user ? `@${user.alias}` : (profile.email || 'Welcome to ShopNow!')}
          </Text>
          {isAuthenticated ? (
            <TouchableOpacity
              style={[styles.createAccountBtn, { backgroundColor: Colors.red }]}
              onPress={async () => {
                await signOut();
                router.replace('/(disguise)');
              }}
            >
              <Text style={styles.createAccountText}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.createAccountBtn}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.createAccountText}>Create Account</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInUp.delay(80).springify()} style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{getCartCount()}</Text>
            <Text style={styles.statLabel}>In Cart</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{useShopStore.getState().wishlist.length}</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{useShopStore.getState().orders.length}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
        </Animated.View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <Animated.View key={item.label} entering={FadeInUp.delay(120 + index * 30).springify()}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  if (item.route) router.push(item.route as any);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
              {index < MENU_ITEMS.length - 1 && <View style={styles.menuDivider} />}
            </Animated.View>
          ))}
        </View>

        <Text style={styles.version}>ShopNow v2.4.1</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding, paddingTop: 56, paddingBottom: 16,
    backgroundColor: Colors.surface, ...Shadows.sm,
  },
  backBtn: { width: 60 },
  backText: { ...Typography.body, color: Colors.blue },
  headerTitle: { ...Typography.title3, color: Colors.label },
  scroll: { padding: Spacing.screenPadding, paddingBottom: 40 },

  // Profile card
  profileCard: {
    backgroundColor: Colors.surface, borderRadius: Radii.card, padding: 24,
    alignItems: 'center', marginBottom: 16, ...Shadows.md,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.shopAccentLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarEmoji: { fontSize: 36 },
  profileName: { ...Typography.title3, color: Colors.label, marginBottom: 4 },
  profileEmail: { ...Typography.subheadline, color: Colors.labelSecondary, marginBottom: 16 },
  createAccountBtn: {
    backgroundColor: Colors.shopAccent, borderRadius: Radii.full,
    paddingVertical: 10, paddingHorizontal: 28, ...Shadows.sm,
  },
  createAccountText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Stats
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radii.card,
    padding: 16, marginBottom: 16, ...Shadows.sm,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { ...Typography.title2, color: Colors.shopAccent },
  statLabel: { ...Typography.caption1, color: Colors.labelSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.separator },

  // Menu
  menuCard: {
    backgroundColor: Colors.surface, borderRadius: Radii.card,
    paddingHorizontal: 16, ...Shadows.sm,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
  },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, ...Typography.body, color: Colors.label },
  menuArrow: { fontSize: 22, color: Colors.labelTertiary },
  menuDivider: { height: 1, backgroundColor: Colors.separator },

  version: {
    ...Typography.caption1, color: Colors.labelTertiary,
    textAlign: 'center', marginTop: 24,
  },
});
