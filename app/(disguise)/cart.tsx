import React from 'react';
import {
  View, Text, TouchableOpacity, Image, FlatList,
  StyleSheet, StatusBar, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useShopStore } from '@/store/shopStore';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/constants/theme';
import AppIcon from '@/components/ui/AppIcon';

export default function CartScreen() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useShopStore();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(disguise)/checkout');
  };

  const renderItem = ({ item, index }: any) => (
    <Animated.View entering={FadeInUp.delay(index * 60).springify()}>
      <View style={styles.cartItem}>
        <Image source={{ uri: item.product.imageUrl }} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
          <Text style={styles.itemPrice}>₹{item.product.price.toLocaleString()}</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => {
                updateQuantity(item.product.id, item.quantity - 1);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => {
                updateQuantity(item.product.id, item.quantity + 1);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => {
                removeFromCart(item.product.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <AppIcon name="trash" size={18} color={Colors.red} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.itemTotal}>
          ₹{(item.product.price * item.quantity).toLocaleString()}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 60 }} />
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyState}>
          <AppIcon name="cart" size={64} color={Colors.labelSecondary} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add items to your cart to see them here</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.back()}>
            <Text style={styles.shopBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.product.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {/* Bottom Checkout */}
          <View style={styles.checkoutBar}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>₹{getCartTotal().toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
              <Text style={styles.checkoutBtnText}>Checkout ({cart.length} items)</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding, paddingTop: 56, paddingBottom: 16,
    backgroundColor: Colors.surface, ...Shadows.sm,
  },
  backBtn: { width: 60 },
  backText: { ...Typography.body, color: Colors.blue },
  headerTitle: { ...Typography.title3, color: Colors.label },
  list: { padding: Spacing.screenPadding, paddingBottom: 120 },
  cartItem: {
    flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radii.card,
    padding: 12, marginBottom: 12, ...Shadows.sm,
  },
  itemImage: { width: 80, height: 80, borderRadius: Radii.md },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { ...Typography.footnote, color: Colors.label, fontWeight: '600', marginBottom: 4 },
  itemPrice: { ...Typography.caption1, color: Colors.shopAccent, fontWeight: '700', marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.fillTertiary,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: { fontSize: 18, color: Colors.label, fontWeight: '600' },
  qtyText: { fontSize: 16, fontWeight: '700', color: Colors.label, minWidth: 20, textAlign: 'center' },
  removeBtn: { marginLeft: 'auto' },
  removeText: { fontSize: 18 },
  itemTotal: { ...Typography.headline, color: Colors.label, alignSelf: 'center' },

  // Empty
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { ...Typography.title3, color: Colors.label, marginBottom: 8 },
  emptySubtitle: { ...Typography.subheadline, color: Colors.labelSecondary, textAlign: 'center', marginBottom: 24 },
  shopBtn: { backgroundColor: Colors.shopAccent, borderRadius: Radii.full, paddingVertical: 14, paddingHorizontal: 32 },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // Checkout
  checkoutBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surface, paddingHorizontal: Spacing.screenPadding,
    paddingTop: 16, paddingBottom: 36, ...Shadows.lg,
    borderTopWidth: 1, borderTopColor: Colors.separator,
  },
  totalLabel: { ...Typography.caption1, color: Colors.labelSecondary },
  totalPrice: { ...Typography.title2, color: Colors.label },
  checkoutBtn: {
    backgroundColor: Colors.shopAccent, borderRadius: Radii.full,
    paddingVertical: 14, paddingHorizontal: 28, ...Shadows.md,
  },
  checkoutBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
