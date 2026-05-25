import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// Color Palette
// ─────────────────────────────────────────────────────────────────────────────
export const Colors = {
  // iOS 26 system colors
  blue: '#007AFF',
  green: '#34C759',
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  purple: '#AF52DE',
  pink: '#FF2D55',
  teal: '#5AC8FA',
  indigo: '#5856D6',

  // Background
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceSecondary: 'rgba(255,255,255,0.72)',
  surfaceTertiary: 'rgba(242,242,247,0.8)',

  // Message bubbles
  bubbleOutgoing: '#007AFF',
  bubbleIncoming: '#E9E9EB',
  bubbleOutgoingText: '#FFFFFF',
  bubbleIncomingText: '#000000',

  // Text hierarchy
  label: '#000000',
  labelSecondary: 'rgba(60,60,67,0.6)',
  labelTertiary: 'rgba(60,60,67,0.3)',
  labelQuaternary: 'rgba(60,60,67,0.18)',

  // Separators
  separator: 'rgba(60,60,67,0.12)',
  separatorOpaque: '#C6C6C8',

  // Fill
  fillPrimary: 'rgba(120,120,128,0.2)',
  fillSecondary: 'rgba(120,120,128,0.16)',
  fillTertiary: 'rgba(118,118,128,0.12)',

  // Fake shopping accent
  shopAccent: '#FF6B35',
  shopAccentLight: '#FFF0EB',
  shopGold: '#F5A623',

  // Dark overlay
  overlay: 'rgba(0,0,0,0.4)',
  overlayLight: 'rgba(0,0,0,0.1)',

  // Status
  online: '#34C759',
  away: '#FF9500',
  offline: '#8E8E93',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────────────────────────────────────
export const Typography = {
  // iOS SF Pro-like sizes
  largeTitle: { fontSize: 34, fontWeight: '700' as const, letterSpacing: 0.37 },
  title1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: 0.36 },
  title2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: 0.35 },
  title3: { fontSize: 20, fontWeight: '600' as const, letterSpacing: 0.38 },
  headline: { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.41 },
  body: { fontSize: 17, fontWeight: '400' as const, letterSpacing: -0.41 },
  callout: { fontSize: 16, fontWeight: '400' as const, letterSpacing: -0.32 },
  subheadline: { fontSize: 15, fontWeight: '400' as const, letterSpacing: -0.24 },
  footnote: { fontSize: 13, fontWeight: '400' as const, letterSpacing: -0.08 },
  caption1: { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0 },
  caption2: { fontSize: 11, fontWeight: '400' as const, letterSpacing: 0.07 },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Spacing
// ─────────────────────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screenPadding: 20,
  tabBarHeight: 83,
  navBarHeight: Platform.OS === 'ios' ? 96 : 64,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Border Radii
// ─────────────────────────────────────────────────────────────────────────────
export const Radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  full: 9999,
  // iOS 26 liquid glass
  card: 20,
  sheet: 28,
  bubble: 18,
  bubbleTail: 4,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Shadows
// ─────────────────────────────────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Animation Presets (for Reanimated)
// ─────────────────────────────────────────────────────────────────────────────
export const SpringConfig = {
  gentle: { damping: 20, stiffness: 120 },
  bouncy: { damping: 12, stiffness: 180 },
  snappy: { damping: 25, stiffness: 300 },
} as const;
