import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/services/supabase/client';
import { BUCKET_AVATARS } from '@/constants/config';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/constants/theme';

export default function AvatarScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleContinue = async () => {
    if (!imageUri) {
      // Skip avatar — use default
      router.push('/(onboarding)/permissions');
      return;
    }

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/(auth)/login'); return; }

    // Upload to Supabase Storage
    const ext = imageUri.split('.').pop() || 'jpg';
    const path = `${user.id}/avatar.${ext}`;
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });
    const arrayBuffer = decode(base64);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_AVATARS)
      .upload(path, arrayBuffer, { contentType: `image/${ext}`, upsert: true });

    if (uploadError) {
      setUploading(false);
      Alert.alert('Upload Failed', uploadError.message);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_AVATARS)
      .getPublicUrl(path);

    await (supabase.from('users') as any).update({ profile_image: publicUrl }).eq('id', user.id);
    setUploading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/(onboarding)/permissions');
  };

  return (
    <View style={styles.container}>
      <View style={styles.bg}>
        <View style={styles.blob} />
      </View>

      <View style={styles.content}>
        <View style={styles.progressRow}>
          {[1, 2, 3].map((step) => (
            <View key={step} style={[styles.progressDot, step <= 2 && styles.progressDotActive]} />
          ))}
        </View>

        <Text style={styles.title}>Add your{'\n'}profile photo</Text>
        <Text style={styles.subtitle}>
          Your alias protects your identity.{'\n'}Photo is optional.
        </Text>

        <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarIcon}>📷</Text>
              <Text style={styles.avatarPlaceholderText}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {imageUri && (
          <TouchableOpacity onPress={() => setImageUri(null)}>
            <Text style={styles.removeText}>Remove photo</Text>
          </TouchableOpacity>
        )}

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={[styles.btn, uploading && styles.btnDisabled]}
            onPress={handleContinue}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{imageUri ? 'Upload & Continue →' : 'Skip for now →'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08071A' },
  bg: { ...StyleSheet.absoluteFill },
  blob: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(52,199,89,0.12)', bottom: 80, left: -60,
  },
  content: { flex: 1, padding: Spacing.screenPadding, paddingTop: 80, alignItems: 'center' },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 40, alignSelf: 'flex-start' },
  progressDot: { width: 32, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressDotActive: { backgroundColor: Colors.blue, width: 64 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 12, lineHeight: 40, alignSelf: 'flex-start' },
  subtitle: { ...Typography.subheadline, color: 'rgba(255,255,255,0.6)', marginBottom: 48, alignSelf: 'flex-start' },

  avatarPicker: {
    width: 160, height: 160, borderRadius: 80, overflow: 'hidden',
    marginBottom: 20, ...Shadows.lg,
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', borderStyle: 'dashed', borderRadius: 80,
  },
  avatarIcon: { fontSize: 40, marginBottom: 8 },
  avatarPlaceholderText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  removeText: { color: Colors.red, fontSize: 14, marginBottom: 32 },

  btnGroup: { position: 'absolute', bottom: 50, left: Spacing.screenPadding, right: Spacing.screenPadding },
  btn: {
    backgroundColor: Colors.blue, borderRadius: Radii.lg,
    paddingVertical: 18, alignItems: 'center', ...Shadows.md,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
