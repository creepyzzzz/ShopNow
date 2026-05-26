import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useShopStore } from '@/store/shopStore';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/constants/theme';
import AppIcon from '@/components/ui/AppIcon';

export default function CheckoutScreen() {
  const router = useRouter();
  const { getCartTotal, clearCart } = useShopStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const total = getCartTotal();

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    clearCart();
    Alert.alert('Order Confirmed! 🎉', 'Your order is being processed.', [
      { text: 'Back to Home', onPress: () => router.replace('/(disguise)') }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { step === 1 ? router.back() : setStep((s) => (s - 1) as 1 | 2 | 3); }}>
          <AppIcon name="back" size={24} color={Colors.blue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <View style={styles.stepLabels}>
          <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Address</Text>
          <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Payment</Text>
          <Text style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}>Confirm</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <View style={styles.card}>
              <TextInput style={styles.input} placeholder="Full Name" defaultValue="John Doe" />
              <TextInput style={styles.input} placeholder="Address Line 1" defaultValue="123 Shopping Avenue" />
              <TextInput style={styles.input} placeholder="City" defaultValue="Mumbai" />
              <TextInput style={styles.input} placeholder="PIN Code" defaultValue="400001" keyboardType="number-pad" />
            </View>
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.paymentOption}>
                <AppIcon name="card" size={20} color={Colors.blue} />
                <Text style={styles.paymentText}>Credit / Debit Card</Text>
                <AppIcon name="check-circle" size={20} color={Colors.shopAccent} />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.paymentOption}>
                <AppIcon name="money" size={20} color={Colors.label} />
                <Text style={styles.paymentText}>Cash on Delivery</Text>
                <View style={styles.radioEmpty} />
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <TextInput style={styles.input} placeholder="Card Number" defaultValue="**** **** **** 1234" keyboardType="number-pad" />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="MM/YY" defaultValue="12/25" />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="CVV" defaultValue="***" secureTextEntry />
              </View>
            </View>
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
            <View style={styles.successIcon}>
              <AppIcon name="check-circle" size={64} color={Colors.shopAccent} />
            </View>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.card}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{total.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>₹50</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>₹{(total + 50).toLocaleString()}</Text>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={step === 3 ? handleComplete : handleNext}
        >
          <Text style={styles.actionBtnText}>{step === 3 ? 'Place Order' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: Spacing.screenPadding, paddingBottom: 16,
    backgroundColor: Colors.surface, ...Shadows.sm,
  },
  headerTitle: { ...Typography.title3, color: Colors.label },
  progressContainer: { padding: 20, backgroundColor: Colors.surface },
  progressBar: { height: 6, backgroundColor: Colors.separator, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.shopAccent },
  stepLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  stepLabel: { ...Typography.caption1, color: Colors.labelTertiary },
  stepLabelActive: { color: Colors.shopAccent, fontWeight: '600' },
  content: { flex: 1, padding: Spacing.screenPadding },
  sectionTitle: { ...Typography.headline, color: Colors.label, marginBottom: 12 },
  card: { backgroundColor: Colors.surface, borderRadius: Radii.card, padding: 16, marginBottom: 16, ...Shadows.sm },
  input: { borderWidth: 1, borderColor: Colors.separator, borderRadius: Radii.md, padding: 14, marginBottom: 12, ...Typography.body },
  paymentOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  paymentText: { flex: 1, marginLeft: 12, ...Typography.body, color: Colors.label },
  radioEmpty: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.separator },
  divider: { height: 1, backgroundColor: Colors.separator, marginVertical: 12 },
  successIcon: { alignItems: 'center', marginVertical: 24 },
  summaryTitle: { ...Typography.headline, color: Colors.label, marginBottom: 12, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { ...Typography.subheadline, color: Colors.labelSecondary },
  summaryValue: { ...Typography.subheadline, color: Colors.label },
  summaryTotalLabel: { ...Typography.title3, color: Colors.label },
  summaryTotalValue: { ...Typography.title3, color: Colors.shopAccent },
  footer: { padding: 24, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.separator, ...Shadows.lg },
  actionBtn: { backgroundColor: Colors.shopAccent, borderRadius: Radii.lg, paddingVertical: 16, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
