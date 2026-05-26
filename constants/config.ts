// ─────────────────────────────────────────────────────────────────────────────
// Stealth App Config — DO NOT expose in public repositories
// ─────────────────────────────────────────────────────────────────────────────

// Secret code split across segments to prevent simple grep discovery.
// Default code: 7749 (change before distribution)
const _s1 = '77';
const _s2 = '49';
export const SECRET_UNLOCK_CODE = _s1 + _s2;

// Max failed unlock attempts before app closes
export const MAX_UNLOCK_ATTEMPTS = 3;

// Inactivity timeout in seconds (disguise layer only)
export const INACTIVITY_TIMEOUT_SECONDS = 10;

// Max random taps on disguise layer before auto-close
export const MAX_DISGUISE_TAPS = 5;

// Supabase — public credentials (anon key is safe to bundle)
export const SUPABASE_URL = 'https://imtbguwxqrxbfolmufbd.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltdGJndXd4cXJ4YmZvbG11ZmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1Mzk0MzUsImV4cCI6MjA5NTExNTQzNX0.XRuzW3HCjHM4Xxqny0KncED7mKP7O9kkoOGpVLxIiwo';

// Storage bucket names
export const BUCKET_AVATARS = 'avatars';
export const BUCKET_MEDIA = 'media';
export const BUCKET_VAULT = 'vault';

// Tenor GIF API key (replace with your own from tenor.com/developers)
export const TENOR_API_KEY = 'LIVDSRZULELA';

// Fake notification copy pool
export const FAKE_NOTIFICATION_POOL = [
  { title: 'ShopNow', body: 'Flash Sale: 80% off! Limited time only.' },
  { title: 'ShopNow', body: 'You left something in cart #4821 see it...!' },
  { title: 'ShopNow', body: '100% discount unlocked just for you.' },
  { title: 'ShopNow', body: 'New arrivals just dropped. Shop now!' },
  { title: 'ShopNow', body: 'Exclusive deal: Buy 2, Get 1 FREE today.' },
  { title: 'ShopNow', body: 'Your wishlist item is back in stock!' },
  { title: 'ShopNow', body: 'Order #3310 delivered successfully.' },
  { title: 'ShopNow', body: 'Earn 500 coins on your next purchase.' },
];

// App version
export const APP_VERSION = '1.0.0';
