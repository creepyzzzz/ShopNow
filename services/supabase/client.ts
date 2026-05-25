import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/config';
import type { Database } from '@/types/database';

// ─────────────────────────────────────────────────────────────────────────────
// SecureStore adapter for Supabase session persistence
// ─────────────────────────────────────────────────────────────────────────────
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// ─────────────────────────────────────────────────────────────────────────────
// Supabase client (typed)
// ─────────────────────────────────────────────────────────────────────────────
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
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
