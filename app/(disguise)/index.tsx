import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  AppState,
  BackHandler,
  StatusBar,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  FadeInUp,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radii, Shadows, Typography } from '@/constants/theme';
import AppIcon, { IconName } from '@/components/ui/AppIcon';
import { FAKE_PRODUCTS, FAKE_CATEGORIES, FAKE_BANNERS } from '@/constants/fakeData';
import {
  MAX_DISGUISE_TAPS,
  INACTIVITY_TIMEOUT_SECONDS,
} from '@/constants/config';
import { useShopStore } from '@/store/shopStore';
import { useAuthStore } from '@/store/authStore';

const { width: SCREEN_W } = Dimensions.get('window');
const BANNER_W = SCREEN_W - Spacing.screenPadding * 2;

// ─────────────────────────────────────────────────────────────────────────────
// Fake Shopping Home — the disguise layer
// ─────────────────────────────────────────────────────────────────────────────
export default function DisguiseHomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [searchText, setSearchText] = useState('');
  const [bannerIndex, setBannerIndex] = useState(0);

  // Shop store
  const { addToCart, getCartCount, toggleWishlist, isInWishlist, profile, products, fetchLiveProducts, isLoadingProducts } = useShopStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchLiveProducts();
  }, []);

  // ── Welcome Popup ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        Alert.alert(
          'Welcome to ShopNow!',
          'Create an account to track your orders and get personalized offers.',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Create Account', onPress: () => router.push('/(auth)/register') }
          ]
        );
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Security state
  const tapCount = useRef(0);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Inactivity timer ─────────────────────────────────────────────────────
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      BackHandler.exitApp();
    }, INACTIVITY_TIMEOUT_SECONDS * 1000);
  }, []);

  // ── Background detection ─────────────────────────────────────────────────
  useEffect(() => {
    resetInactivityTimer();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        BackHandler.exitApp();
      }
    });
    return () => {
      sub.remove();
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, []);

  // ── Banner auto-scroll ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setBannerIndex((i) => (i + 1) % FAKE_BANNERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  // ── Random tap counter (security) ────────────────────────────────────────
  const handleRandomTap = () => {
    resetInactivityTimer();
    tapCount.current += 1;
    if (tapCount.current >= MAX_DISGUISE_TAPS) {
      BackHandler.exitApp();
    }
  };

  // ── Hidden hotspot: customer care icon ────────────────────────────────────
  const hotspotTapCount = useRef(0);
  const hotspotTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHotspotPress = () => {
    resetInactivityTimer();
    hotspotTapCount.current += 1;

    if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
    if (hotspotTimer.current) clearTimeout(hotspotTimer.current);

    if (hotspotTapCount.current >= 10) {
      hotspotTapCount.current = 0;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/(auth)/stealth-login');
    } else {
      singleTapTimer.current = setTimeout(() => {
        if (hotspotTapCount.current < 10) {
          hotspotTapCount.current = 0;
          router.push('/(disguise)/support');
        }
      }, 600);

      hotspotTimer.current = setTimeout(() => {
        hotspotTapCount.current = 0;
      }, 1200);
    }
  };

  const filteredProducts = selectedCategory === '1'
    ? products
    : products.filter((p) => {
        const cat = FAKE_CATEGORIES.find((c) => c.id === selectedCategory);
        return p.category === cat?.name;
      });

  const searchFiltered = searchText
    ? filteredProducts.filter((p) => p.name.toLowerCase().includes(searchText.toLowerCase()))
    : filteredProducts;

  const cartCount = getCartCount();

  // Skeleton Animation
  const skeletonOpacity = useSharedValue(0.4);
  useEffect(() => {
    skeletonOpacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, []);
  const skeletonStyle = useAnimatedStyle(() => ({ opacity: skeletonOpacity.value }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Welcome back</Text>
          <Text style={styles.headerTitle}>{isAuthenticated && user ? user.alias : profile.name}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleHotspotPress}
            activeOpacity={0.7}
          >
            <AppIcon name="support" size={20} color={Colors.label} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => {
              resetInactivityTimer();
              router.push('/(disguise)/cart');
            }}
            activeOpacity={0.7}
          >
            <AppIcon name="cart" size={20} color={Colors.label} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={resetInactivityTimer}
      >
        {/* ── Search Bar ──────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => {
            resetInactivityTimer();
            router.push('/(disguise)/search');
          }}
          activeOpacity={0.8}
        >
          <AppIcon name="search" size={16} color={Colors.labelTertiary} />
          <Text style={styles.searchPlaceholder}>Search products, brands...</Text>
        </TouchableOpacity>

        {/* ── Banner Carousel ────────────────────────────────── */}
        <View style={styles.bannerContainer}>
          {FAKE_BANNERS.map((banner, index) =>
            index === bannerIndex ? (
              <Animated.View
                key={banner.id}
                entering={FadeIn.duration(380).springify().damping(20).stiffness(140)}
                exiting={FadeOut.duration(220)}
              >
                <TouchableOpacity
                  onPress={handleRandomTap}
                  activeOpacity={0.9}
                  style={[styles.bannerCard, { backgroundColor: banner.bg[0] }]}
                >
                  <View style={styles.bannerBadge}>
                    <Text style={styles.bannerBadgeText}>{banner.badge}</Text>
                  </View>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                  <View style={styles.bannerBtn}>
                    <Text style={styles.bannerBtnText}>Shop Now</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ) : null
          )}
          <View style={styles.dotsRow}>
            {FAKE_BANNERS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === bannerIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* ── Categories ──────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={FAKE_CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item.id && styles.categoryChipActive,
              ]}
              onPress={() => {
                resetInactivityTimer();
                setSelectedCategory(item.id);
              }}
            >
              <Animated.View
                layout={LinearTransition.springify().damping(18).stiffness(200)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <AppIcon name={item.icon as IconName} size={14} color={selectedCategory === item.id ? '#fff' : Colors.label} />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item.id && styles.categoryTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          )}
        />

        {/* ── Flash Sale Strip ─────────────────────────────────── */}
        <View style={styles.flashStrip}>
          <Text style={styles.flashTitle}>FLASH SALE</Text>
          <Text style={styles.flashTimer}>Ends in 02:34:18</Text>
        </View>

        {/* ── Product Grid ─────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>
          {selectedCategory === '1' ? 'Featured Products' : FAKE_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
        </Text>
        <View style={styles.productGrid}>
          {isLoadingProducts ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Animated.View key={idx} style={[styles.productCard, skeletonStyle, { height: 260, backgroundColor: Colors.fillSecondary }]} />
            ))
          ) : (
            searchFiltered.map((product, idx) => {
              const scale = useSharedValue(1);
              const animatedStyle = useAnimatedStyle(() => ({
                transform: [{ scale: scale.value }]
              }));

              return (
                <Animated.View
                  key={product.id}
                  entering={FadeInUp.delay(idx * 60).springify().damping(18).stiffness(180)}
                  style={animatedStyle}
                >
                  <TouchableOpacity
                    style={styles.productCard}
                    onPressIn={() => { scale.value = withSpring(0.96); }}
                    onPressOut={() => { scale.value = withSpring(1); }}
                    onPress={() => {
                      resetInactivityTimer();
                      handleRandomTap();
                    }}
                    activeOpacity={0.95}
                  >
                    <View style={styles.productImageWrapper}>
                      <Image
                        source={{ uri: product.imageUrl }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                      {product.badge && (
                        <View style={styles.productBadge}>
                          <Text style={styles.productBadgeText}>{product.badge}</Text>
                        </View>
                      )}
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{Math.floor(Math.random() * 40) + 10}% OFF</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.wishlistBtn}
                        onPress={() => {
                          toggleWishlist(product);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          resetInactivityTimer();
                        }}
                      >
                        <AppIcon name={isInWishlist(product.id) ? 'heart-solid' : 'heart'} size={16} color={isInWishlist(product.id) ? Colors.red : Colors.labelSecondary} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <View style={styles.ratingRow}>
                        <Text style={styles.ratingText}>⭐ {product.rating}</Text>
                        <Text style={styles.reviewsText}>({Math.floor(Math.random() * 500) + 10})</Text>
                      </View>
                      <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
                        <Text style={styles.originalPrice}>₹{Math.floor(product.price * 1.3).toLocaleString()}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.addToCartBtn}
                        onPress={() => {
                          addToCart(product);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          resetInactivityTimer();
                        }}
                      >
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })
          )}
        </View>

        {/* ── Bottom padding ────────────────────────────────────── */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom Nav ──────────────────────────────────────── */}
      <View style={styles.bottomNav}>
        {[
          { icon: 'house', label: 'Home', route: null },
          { icon: 'search', label: 'Search', route: '/(disguise)/search' },
          { icon: 'heart', label: 'Wishlist', route: '/(disguise)/wishlist' },
          { icon: 'package', label: 'Orders', route: '/(disguise)/orders' },
          { icon: 'person', label: 'Profile', route: '/(disguise)/profile' },
        ].map((tab, i) => (
          <TouchableOpacity
            key={i}
            style={styles.navItem}
            onPress={() => {
              resetInactivityTimer();
              if (tab.route) {
                router.push(tab.route as any);
              }
            }}
          >
            <AppIcon name={tab.icon as IconName} size={22} color={i === 0 ? Colors.shopAccent : Colors.labelTertiary} />
            <Text style={[styles.navLabel, i === 0 && styles.navLabelActive]}>{tab.label}</Text>
            {i === 0 && <View style={styles.navDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  headerGreeting: { ...Typography.footnote, color: Colors.labelSecondary },
  headerTitle: { ...Typography.title2, color: Colors.label },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.fillTertiary,
    justifyContent: 'center', alignItems: 'center',
  },
  iconBtnText: { fontSize: 18 },
  cartBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.shopAccentLight,
    justifyContent: 'center', alignItems: 'center',
  },
  cartIcon: { fontSize: 18 },
  cartBadge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: Colors.shopAccent, borderRadius: 10,
    minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Search
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.screenPadding,
    marginTop: 16, marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg, paddingHorizontal: 14, paddingVertical: 14,
    ...Shadows.sm,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchPlaceholder: { ...Typography.body, color: Colors.labelTertiary },

  // Banner
  bannerContainer: {
    marginHorizontal: Spacing.screenPadding,
    marginVertical: 16,
  },
  bannerCard: {
    width: BANNER_W, borderRadius: Radii.card,
    padding: 20, minHeight: 140,
    justifyContent: 'center',
    ...Shadows.md,
  },
  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radii.full, alignSelf: 'flex-start', marginBottom: 8,
  },
  bannerBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  bannerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  bannerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 16 },
  bannerBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: Radii.full, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  bannerBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.separatorOpaque },
  dotActive: { backgroundColor: Colors.shopAccent, width: 18 },

  // Categories
  sectionTitle: {
    ...Typography.headline,
    marginHorizontal: Spacing.screenPadding,
    marginTop: 8, marginBottom: 12, color: Colors.label,
  },
  categoriesRow: { paddingHorizontal: Spacing.screenPadding, gap: 8, paddingBottom: 4 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: Colors.surface, borderRadius: Radii.full,
    ...Shadows.sm,
  },
  categoryChipActive: { backgroundColor: Colors.shopAccent },
  categoryIcon: { fontSize: 14 },
  categoryText: { ...Typography.subheadline, color: Colors.labelSecondary, fontWeight: '600' },
  categoryTextActive: { color: '#fff' },

  // Flash sale
  flashStrip: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: Spacing.screenPadding, marginTop: 16, marginBottom: 8,
    backgroundColor: '#FFF3E0', borderRadius: Radii.md,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  flashTitle: { fontWeight: '800', fontSize: 14, color: Colors.shopAccent },
  flashTimer: { fontWeight: '600', fontSize: 14, color: Colors.shopAccent, fontVariant: ['tabular-nums'] },

  // Product grid
  productGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.screenPadding, gap: 12,
  },
  productCard: {
    width: (SCREEN_W - Spacing.screenPadding * 2 - 12) / 2,
    backgroundColor: Colors.surface, borderRadius: Radii.card,
    overflow: 'hidden', ...Shadows.md,
  },
  productImageWrapper: { width: '100%', height: 160, position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  productBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: Colors.blue, borderRadius: Radii.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  productBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  discountBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: Colors.red, borderRadius: Radii.xs,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  discountText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  wishlistBtn: {
    position: 'absolute', bottom: 8, right: 8,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.sm,
  },
  wishlistIcon: { fontSize: 16 },
  productInfo: { padding: 10 },
  productName: { ...Typography.footnote, color: Colors.label, fontWeight: '600', marginBottom: 4, minHeight: 32 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  ratingText: { fontSize: 12, color: Colors.shopGold, fontWeight: '700' },
  reviewsText: { fontSize: 11, color: Colors.labelSecondary },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  price: { fontSize: 16, fontWeight: '800', color: Colors.label },
  originalPrice: { fontSize: 12, color: Colors.labelTertiary, textDecorationLine: 'line-through' },
  addToCartBtn: {
    backgroundColor: Colors.shopAccent, borderRadius: Radii.sm,
    paddingVertical: 8, alignItems: 'center',
  },
  addToCartText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    paddingBottom: 24, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: Colors.separator,
    ...Shadows.lg,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 22 },
  navLabel: { ...Typography.caption2, color: Colors.labelTertiary },
  navLabelActive: { color: Colors.shopAccent, fontWeight: '600' },
  navDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.shopAccent },
});
