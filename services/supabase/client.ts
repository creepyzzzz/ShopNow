import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/config';
import type { Database } from '@/types/database';

import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

// ─────────────────────────────────────────────────────────────────────────────
// Encrypted Storage Adapter for Supabase session persistence
// Fixes the SecureStore 2048-byte limit warning by encrypting large payloads
// and storing them in AsyncStorage.
// ─────────────────────────────────────────────────────────────────────────────
const ENCRYPTION_KEY_ID = 'supabase_aes_key';

const getOrGenerateKey = async () => {
  let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_ID);
  if (!key) {
    key = CryptoJS.lib.WordArray.random(256 / 8).toString();
    await SecureStore.setItemAsync(ENCRYPTION_KEY_ID, key);
  }
  return key;
};

const EncryptedStorageAdapter = {
  getItem: async (key: string) => {
    try {
      const encryptedData = await AsyncStorage.getItem(key);
      if (!encryptedData) return null;
      const secretKey = await getOrGenerateKey();
      const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.warn('Failed to decrypt session:', e);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      const secretKey = await getOrGenerateKey();
      const encryptedData = CryptoJS.AES.encrypt(value, secretKey).toString();
      await AsyncStorage.setItem(key, encryptedData);
    } catch (e) {
      console.warn('Failed to encrypt session:', e);
    }
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Supabase client (typed)
// ─────────────────────────────────────────────────────────────────────────────
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: EncryptedStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
