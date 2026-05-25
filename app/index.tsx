import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

// ─────────────────────────────────────────────────────────────────────────────
// Entry point — always starts at disguise layer
// Real app only accessible after secret code entry
// ─────────────────────────────────────────────────────────────────────────────
export default function Index() {
  return <Redirect href="/(disguise)" />;
}
