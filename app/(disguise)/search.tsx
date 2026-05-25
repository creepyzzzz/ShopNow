import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, FlatList,
  StyleSheet, StatusBar, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { FAKE_PRODUCTS } from '@/constants/fakeData';
import { useShopStore } from '@/store/shopStore';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

const RECENT_SEARCHES = ['Wireless earbuds', 'Summer dress', 'Smart watch', 'Backpack'];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { addToCart } = useShopStore();

  const results = query.length > 0
    ? FAKE_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands..."
            placeholderTextColor={Colors.labelTertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.length === 0 ? (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          {RECENT_SEARCHES.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.recentItem}
              onPress={() => setQuery(s)}
            >
              <Text style={styles.recentIcon}>🕐</Text>
              <Text style={styles.recentText}>{s}</Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Popular Categories</Text>
          <View style={styles.categoryGrid}>
            {['👗 Fashion', '📱 Electronics', '💄 Beauty', '🏡 Home', '⚽ Sports', '📚 Books'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.categoryChip}
                onPress={() => setQuery(cat.split(' ')[1])}
              >
                <Text style={styles.categoryChipText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>Try a different search term</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInUp.delay(index * 40).springify()}>
              <TouchableOpacity style={styles.resultCard} activeOpacity={0.85}>
                <Image source={{ uri: item.imageUrl }} style={styles.resultImage} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.resultCategory}>{item.category}</Text>
                  <View style={styles.resultPriceRow}>
                    <Text style={styles.resultPrice}>₹{item.price.toLocaleString()}</Text>
                    <Text style={styles.resultOrigPrice}>₹{item.originalPrice.toLocaleString()}</Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{item.discount}% OFF</Text>
                    </View>
                  </View>
                  <Text style={styles.resultRating}>⭐ {item.rating} ({item.reviews.toLocaleString()})</Text>
                </View>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => {
                    addToCart(item);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={styles.addBtnText}>+</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: Spacing.screenPadding, paddingTop: 56, paddingBottom: 12,
    backgroundColor: Colors.surface, ...Shadows.sm,
  },
  backBtn: { paddingRight: 4 },
  backText: { fontSize: 24, color: Colors.label },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.fillTertiary, borderRadius: Radii.lg,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, ...Typography.body, color: Colors.label },
  clearBtn: { fontSize: 14, color: Colors.labelSecondary, paddingLeft: 8 },

  // Recent
  recentSection: { padding: Spacing.screenPadding },
  sectionTitle: { ...Typography.headline, color: Colors.label, marginBottom: 12 },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  recentIcon: { fontSize: 16 },
  recentText: { ...Typography.body, color: Colors.labelSecondary },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    backgroundColor: Colors.surface, borderRadius: Radii.full,
    paddingHorizontal: 16, paddingVertical: 10, ...Shadows.sm,
  },
  categoryChipText: { ...Typography.subheadline, color: Colors.label, fontWeight: '600' },

  // Empty
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { ...Typography.title3, color: Colors.label, marginBottom: 8 },
  emptySubtitle: { ...Typography.subheadline, color: Colors.labelSecondary },

  // Results
  resultsList: { padding: Spacing.screenPadding },
  resultCard: {
    flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radii.card,
    padding: 12, marginBottom: 10, ...Shadows.sm,
  },
  resultImage: { width: 80, height: 80, borderRadius: Radii.md },
  resultInfo: { flex: 1, marginLeft: 12 },
  resultName: { ...Typography.footnote, color: Colors.label, fontWeight: '600', marginBottom: 2 },
  resultCategory: { ...Typography.caption1, color: Colors.labelTertiary, marginBottom: 4 },
  resultPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  resultPrice: { fontSize: 15, fontWeight: '800', color: Colors.label },
  resultOrigPrice: { fontSize: 12, color: Colors.labelTertiary, textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: Colors.red, borderRadius: Radii.xs, paddingHorizontal: 4, paddingVertical: 1 },
  discountText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  resultRating: { ...Typography.caption2, color: Colors.shopGold },
  addBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.shopAccent,
    justifyContent: 'center', alignItems: 'center', alignSelf: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
});
