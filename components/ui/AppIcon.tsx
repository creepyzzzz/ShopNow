import React from 'react';
import { Colors } from '@/constants/theme';
import {
  Home, Search, Heart, ShoppingCart, User, Package, MapPin, CreditCard,
  Tag, Bell, HelpCircle, FileText, Lock, Unlock, Zap, Flame, Gift, ShoppingBag,
  Star, LayoutGrid, Shirt, Smartphone, Sparkles, Trophy, Book, Gamepad2,
  RefreshCcw, CircleDollarSign, XCircle, Clipboard, Truck, Clock, Mail, Key,
  ShieldCheck, ShieldAlert, Fingerprint, Eye, EyeOff, MessageCircle, Mic, Square,
  Image as ImageIcon, Camera, Film, Video, Smile, Trash2, Send, Paperclip, Hand, Ban,
  Settings, BellRing, VenetianMask, DoorOpen, Bomb, AlertTriangle, Check, CheckCircle2,
  ChevronLeft, X, Circle
} from 'lucide-react-native';

// ─────────────────────────────────────────────────────────────────────────────
// Centralized icon component — replaces all emojis with proper vector icons
// Uses lucide-react-native for premium, consistent vector iconography
// ─────────────────────────────────────────────────────────────────────────────

export type IconName =
  // Navigation & common
  | 'home' | 'search' | 'heart' | 'heart-outline' | 'cart' | 'person'
  | 'orders' | 'chat' | 'settings' | 'back' | 'close'
  // Shopping
  | 'location' | 'card' | 'coupon' | 'bell' | 'help' | 'document' | 'lock'
  | 'lock-open' | 'flash' | 'fire' | 'gift' | 'bag' | 'star'
  // Categories
  | 'all' | 'fashion' | 'phone' | 'beauty' | 'house' | 'sports' | 'book' | 'game'
  // Support / FAQ
  | 'package' | 'refresh' | 'money' | 'cancel' | 'clipboard' | 'truck' | 'clock'
  // Auth & security
  | 'mail' | 'key' | 'shield' | 'shield-lock' | 'fingerprint' | 'eye' | 'eye-off'
  // Chat & messaging
  | 'mic' | 'stop' | 'image' | 'camera' | 'film' | 'smile' | 'trash'
  | 'send' | 'attach' | 'wave' | 'blocked' | 'video-camera'
  // Settings
  | 'alarm' | 'mask' | 'door' | 'explosion' | 'warning'
  // Vault
  | 'sparkles'
  // Misc
  | 'check' | 'check-circle' | 'delete';

interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  fill?: string;
}

export default function AppIcon({ name, size = 20, color = Colors.label, fill = 'none' }: AppIconProps) {
  const props = { size, color, fill };

  switch (name) {
    // ── Navigation & common ──────────────────────────────────
    case 'home':
      return <Home {...props} />;
    case 'search':
      return <Search {...props} />;
    case 'heart':
      return <Heart {...props} fill={color} />; // filled heart
    case 'heart-outline':
      return <Heart {...props} />;
    case 'cart':
      return <ShoppingCart {...props} />;
    case 'person':
      return <User {...props} />;
    case 'back':
      return <ChevronLeft {...props} />;
    case 'close':
      return <X {...props} />;

    // ── Shopping ─────────────────────────────────────────────
    case 'orders':
    case 'package':
      return <Package {...props} />;
    case 'location':
      return <MapPin {...props} />;
    case 'card':
      return <CreditCard {...props} />;
    case 'coupon':
      return <Tag {...props} />;
    case 'bell':
      return <Bell {...props} />;
    case 'help':
      return <HelpCircle {...props} />;
    case 'document':
      return <FileText {...props} />;
    case 'lock':
      return <Lock {...props} />;
    case 'lock-open':
      return <Unlock {...props} />;
    case 'flash':
      return <Zap {...props} />;
    case 'fire':
      return <Flame {...props} />;
    case 'gift':
      return <Gift {...props} />;
    case 'bag':
      return <ShoppingBag {...props} />;
    case 'star':
      return <Star {...props} fill={color} />;

    // ── Categories ───────────────────────────────────────────
    case 'all':
      return <LayoutGrid {...props} />;
    case 'fashion':
      return <Shirt {...props} />;
    case 'phone':
      return <Smartphone {...props} />;
    case 'beauty':
      return <Sparkles {...props} />;
    case 'house':
      return <Home {...props} />;
    case 'sports':
      return <Trophy {...props} />;
    case 'book':
      return <Book {...props} />;
    case 'game':
      return <Gamepad2 {...props} />;

    // ── Support / FAQ ────────────────────────────────────────
    case 'refresh':
      return <RefreshCcw {...props} />;
    case 'money':
      return <CircleDollarSign {...props} />;
    case 'cancel':
      return <XCircle {...props} />;
    case 'clipboard':
      return <Clipboard {...props} />;
    case 'truck':
      return <Truck {...props} />;
    case 'clock':
      return <Clock {...props} />;

    // ── Auth & security ──────────────────────────────────────
    case 'mail':
      return <Mail {...props} />;
    case 'key':
      return <Key {...props} />;
    case 'shield':
      return <ShieldCheck {...props} />;
    case 'shield-lock':
      return <ShieldAlert {...props} />;
    case 'fingerprint':
      return <Fingerprint {...props} />;
    case 'eye':
      return <Eye {...props} />;
    case 'eye-off':
      return <EyeOff {...props} />;

    // ── Chat & messaging ─────────────────────────────────────
    case 'chat':
      return <MessageCircle {...props} />;
    case 'mic':
      return <Mic {...props} />;
    case 'stop':
      return <Square {...props} fill={color} />;
    case 'image':
      return <ImageIcon {...props} />;
    case 'camera':
      return <Camera {...props} />;
    case 'film':
      return <Film {...props} />;
    case 'video-camera':
      return <Video {...props} />;
    case 'smile':
      return <Smile {...props} />;
    case 'trash':
    case 'delete':
      return <Trash2 {...props} />;
    case 'send':
      return <Send {...props} />;
    case 'attach':
      return <Paperclip {...props} />;
    case 'wave':
      return <Hand {...props} />;
    case 'blocked':
      return <Ban {...props} />;

    // ── Settings ─────────────────────────────────────────────
    case 'settings':
      return <Settings {...props} />;
    case 'alarm':
      return <BellRing {...props} />;
    case 'mask':
      return <VenetianMask {...props} />;
    case 'door':
      return <DoorOpen {...props} />;
    case 'explosion':
      return <Bomb {...props} />;
    case 'warning':
      return <AlertTriangle {...props} />;

    // ── Vault ────────────────────────────────────────────────
    case 'sparkles':
      return <Sparkles {...props} />;

    // ── Misc ─────────────────────────────────────────────────
    case 'check':
      return <Check {...props} />;
    case 'check-circle':
      return <CheckCircle2 {...props} />;

    default:
      return <Circle {...props} />;
  }
}
