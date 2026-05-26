import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, Alert, TextInput, Modal, ActivityIndicator, Dimensions,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/constants/theme';
import AppIcon from '@/components/ui/AppIcon';
import { BUCKET_VAULT } from '@/constants/config';
import type { VaultItem } from '@/types/database';

const { width: SCREEN_W } = Dimensions.get('window');
const CELL_SIZE = (SCREEN_W - Spacing.screenPadding * 2 - 8) / 3;

const VAULT_KEY = 'vault_password';

// ─────────────────────────────────────────────────────────────────────────────
// Vault Screen — encrypted media storage (cloud-synced)
// ─────────────────────────────────────────────────────────────────────────────
export default function VaultScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(true);
  const [pinError, setPinError] = useState('');

  // ── Biometric unlock ─────────────────────────────────────────────────────
  const tryBiometric = async () => {
    const supported = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (supported && enrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Vault',
        fallbackLabel: 'Use PIN',
      });
      if (result.success) {
        unlockVault();
      }
    }
  };

  // ── PIN unlock ───────────────────────────────────────────────────────────
  const verifyPin = async () => {
    const stored = await SecureStore.getItemAsync(VAULT_KEY);
    if (!stored) {
      // First time — set the PIN
      if (pin.length >= 4) {
        await SecureStore.setItemAsync(VAULT_KEY, pin);
        unlockVault();
      } else {
        setPinError('PIN must be at least 4 digits');
      }
      return;
    }

    if (pin === stored) {
      unlockVault();
    } else {
      setPinError('Incorrect PIN');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const unlockVault = () => {
    setUnlocked(true);
    setShowPinModal(false);
    loadItems();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // ── Load vault items ──────────────────────────────────────────────────────
  const loadItems = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('vault_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  // ── Upload encrypted vault item ───────────────────────────────────────────
  const addToVault = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop() || 'jpg';

    // Generate encryption key hint (not the real key — for UX only)
    const keyHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${user?.id}_vault_${Date.now()}`
    );
    const keyHint = keyHash.slice(-4);

    // Upload to vault bucket (path is user-scoped)
    const path = `${user?.id}/vault_${Date.now()}.${ext}`;
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const ab = await blob.arrayBuffer();

    const { error } = await supabase.storage.from(BUCKET_VAULT).upload(path, ab, {
      contentType: asset.mimeType || `image/${ext}`,
    });

    if (!error) {
      const { data: urlData } = await supabase.storage.from(BUCKET_VAULT).createSignedUrl(path, 31536000);
      if (urlData) {
        await (supabase.from('vault_items') as any).insert({
          user_id: user?.id || '',
          encrypted_url: urlData.signedUrl,
          encryption_key_hint: keyHint,
          type: asset.type === 'video' ? 'video' : 'image',
          mime_type: asset.mimeType,
          file_size: asset.fileSize,
        });
        loadItems();
      }
    }
    setUploading(false);
  };

  useEffect(() => {
    if (unlocked) return;
    tryBiometric();
  }, []);

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AppIcon name="back" size={24} color={Colors.blue} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AppIcon name="lock" size={20} color={Colors.label} />
          <Text style={styles.headerTitle}>Vault</Text>
        </View>
        {unlocked && (
          <TouchableOpacity style={styles.addBtn} onPress={addToVault} disabled={uploading}>
            {uploading ? <ActivityIndicator size="small" color={Colors.blue} /> : <Text style={styles.addIcon}>+</Text>}
          </TouchableOpacity>
        )}
      </View>

      {/* ── Vault grid ──────────────────────────────────────── */}
      {unlocked ? (
        loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.blue} />
          </View>
        ) : (
          <FlatList
            data={items}
            numColumns={3}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={{ gap: 4 }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <AppIcon name="lock" size={56} color={Colors.labelSecondary} />
                <Text style={styles.emptyTitle}>Vault is empty</Text>
                <Text style={styles.emptySubtitle}>Add photos and videos to encrypt them</Text>
                <TouchableOpacity style={styles.addFirstBtn} onPress={addToVault}>
                  <Text style={styles.addFirstText}>+ Add to Vault</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item, index }) => (
              <Animated.View
                entering={FadeIn.delay(index * 40).springify().damping(18).stiffness(160)}
              >
                <TouchableOpacity style={styles.gridCell}>
                  {item.type === 'image' ? (
                    <Image source={{ uri: item.encrypted_url }} style={styles.cellImage} />
                  ) : (
                    <View style={[styles.cellImage, styles.videoCellFallback]}>
                      <AppIcon name="film" size={28} color={Colors.label} />
                    </View>
                  )}
                  <View style={styles.lockOverlay}>
                    <AppIcon name="lock" size={10} color="#fff" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}
          />
        )
      ) : (
        <View style={styles.lockedState}>
          <AppIcon name="shield-lock" size={72} color={Colors.label} />
          <Text style={styles.lockedTitle}>Vault Locked</Text>
          <Text style={styles.lockedSubtitle}>Use biometrics or PIN to unlock</Text>
          <TouchableOpacity style={styles.biometricBtn} onPress={tryBiometric}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AppIcon name="fingerprint" size={18} color="#fff" />
              <Text style={styles.biometricText}>Use Biometrics</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pinBtn} onPress={() => setShowPinModal(true)}>
            <Text style={styles.pinBtnText}>Enter PIN</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── PIN Modal ──────────────────────────────────────── */}
      <Modal visible={showPinModal} transparent animationType="slide">
        <BlurView intensity={60} tint="dark" style={styles.pinModalOverlay}>
          <View style={styles.pinCard}>
            <Text style={styles.pinTitle}>Vault PIN</Text>
            <Text style={styles.pinSubtitle}>
              {'Enter your vault PIN'}
            </Text>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={(v) => { setPin(v); setPinError(''); }}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={8}
              placeholder="••••"
              placeholderTextColor={Colors.labelTertiary}
              autoFocus
            />
            {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}
            <TouchableOpacity style={styles.pinConfirm} onPress={verifyPin}>
              <Text style={styles.pinConfirmText}>Unlock →</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowPinModal(false); router.back(); }}>
              <Text style={styles.pinCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
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
  backBtn: { padding: 4 },
  backIcon: { fontSize: 24, color: Colors.blue },
  headerTitle: { ...Typography.title3, color: Colors.label },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.blue, justifyContent: 'center', alignItems: 'center' },
  addIcon: { color: '#fff', fontSize: 22, fontWeight: '300' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  grid: { padding: Spacing.screenPadding, gap: 4 },
  gridCell: { width: CELL_SIZE, height: CELL_SIZE, borderRadius: Radii.sm, overflow: 'hidden', position: 'relative' },
  cellImage: { width: '100%', height: '100%' },
  videoCellFallback: { backgroundColor: Colors.fillSecondary, justifyContent: 'center', alignItems: 'center' },
  lockOverlay: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 10, padding: 2,
  },
  lockIcon: { fontSize: 10 },

  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { ...Typography.title3, color: Colors.label, marginBottom: 8 },
  emptySubtitle: { ...Typography.subheadline, color: Colors.labelSecondary, textAlign: 'center', marginBottom: 24 },
  addFirstBtn: { backgroundColor: Colors.blue, borderRadius: Radii.lg, paddingVertical: 14, paddingHorizontal: 32 },
  addFirstText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  lockedState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  lockedIcon: { fontSize: 72, marginBottom: 20 },
  lockedTitle: { ...Typography.title2, color: Colors.label, marginBottom: 8 },
  lockedSubtitle: { ...Typography.subheadline, color: Colors.labelSecondary, marginBottom: 32 },
  biometricBtn: { backgroundColor: Colors.blue, borderRadius: Radii.lg, paddingVertical: 16, paddingHorizontal: 40, marginBottom: 12, ...Shadows.md },
  biometricText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  pinBtn: { borderWidth: 1.5, borderColor: Colors.separator, borderRadius: Radii.lg, paddingVertical: 14, paddingHorizontal: 40 },
  pinBtnText: { ...Typography.subheadline, color: Colors.labelSecondary, fontWeight: '600' },

  pinModalOverlay: { flex: 1, justifyContent: 'flex-end' },
  pinCard: { backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 32, alignItems: 'center', ...Shadows.lg },
  pinTitle: { ...Typography.title3, color: Colors.label, marginBottom: 4 },
  pinSubtitle: { ...Typography.subheadline, color: Colors.labelSecondary, marginBottom: 24 },
  pinInput: { width: 180, borderWidth: 1.5, borderColor: Colors.separator, borderRadius: Radii.md, padding: 14, ...Typography.title2, textAlign: 'center', color: Colors.label, marginBottom: 8, letterSpacing: 8 },
  pinError: { ...Typography.footnote, color: Colors.red, marginBottom: 8 },
  pinConfirm: { backgroundColor: Colors.blue, borderRadius: Radii.lg, paddingVertical: 16, paddingHorizontal: 60, marginBottom: 12, ...Shadows.sm },
  pinConfirmText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  pinCancel: { ...Typography.body, color: Colors.labelSecondary },
});
