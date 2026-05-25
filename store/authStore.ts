import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/services/supabase/client';
import type { AppUser } from '@/types/database';

// ─────────────────────────────────────────────────────────────────────────────
// Auth Store — manages session, unlock state, and user profile
// ─────────────────────────────────────────────────────────────────────────────

const UNLOCK_KEY = 'app_unlocked';

interface AuthState {
  user: AppUser | null;
  session: any | null;
  isUnlocked: boolean;          // Secret code entered this session
  isAuthenticated: boolean;     // Supabase session valid
  isLoading: boolean;
  unlockAttempts: number;

  // Actions
  setSession: (session: any | null) => void;
  setUser: (user: AppUser | null) => void;
  unlockApp: () => Promise<void>;
  lockApp: () => void;
  incrementUnlockAttempts: () => void;
  resetUnlockAttempts: () => void;
  signOut: () => Promise<void>;
  panicWipe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isUnlocked: false,
  isAuthenticated: false,
  isLoading: true,
  unlockAttempts: 0,

  setSession: (session) =>
    set({ session, isAuthenticated: !!session, isLoading: false }),

  setUser: (user) => set({ user }),

  unlockApp: async () => {
    await SecureStore.setItemAsync(UNLOCK_KEY, 'true');
    set({ isUnlocked: true, unlockAttempts: 0 });
  },

  lockApp: () => {
    set({ isUnlocked: false });
  },

  incrementUnlockAttempts: () =>
    set((s) => ({ unlockAttempts: s.unlockAttempts + 1 })),

  resetUnlockAttempts: () => set({ unlockAttempts: 0 }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false, isUnlocked: false });
  },

  panicWipe: async () => {
    // Clear all SecureStore data
    const keys = [UNLOCK_KEY, 'vault_password', 'supabase-session'];
    await Promise.all(keys.map((k) => SecureStore.deleteItemAsync(k).catch(() => {})));
    await supabase.auth.signOut();
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isUnlocked: false,
      unlockAttempts: 0,
    });
  },
}));
