import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList,
  StyleSheet, StatusBar, Animated as RNAnimated,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SUPPORT_FAQS } from '@/constants/fakeData';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/constants/theme';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  text: string;
}

export default function SupportScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'bot',
      text: 'Hello! 👋 Welcome to ShopNow Customer Support.\nHow can we help you today?',
    },
  ]);
  const [showFAQs, setShowFAQs] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const handleFAQPress = (question: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: question,
    };

    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      type: 'bot',
      text: 'Please wait patiently, our customer representative will answer you as soon as possible. 🙏',
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setShowFAQs(true);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Customer Support</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
        <View style={{ width: 50 }} />
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.msgRow,
              msg.type === 'user' ? styles.msgRowUser : styles.msgRowBot,
            ]}
          >
            {msg.type === 'bot' && (
              <View style={styles.botAvatar}>
                <Text style={styles.botAvatarText}>🛍️</Text>
              </View>
            )}
            <View
              style={[
                styles.bubble,
                msg.type === 'user' ? styles.bubbleUser : styles.bubbleBot,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  msg.type === 'user' ? styles.bubbleTextUser : styles.bubbleTextBot,
                ]}
              >
                {msg.text}
              </Text>
            </View>
          </View>
        ))}

        {/* FAQ Chips */}
        {showFAQs && (
          <View style={styles.faqSection}>
            <Text style={styles.faqTitle}>Select a topic:</Text>
            <View style={styles.faqGrid}>
              {SUPPORT_FAQS.map((faq) => (
                <TouchableOpacity
                  key={faq.id}
                  style={styles.faqChip}
                  onPress={() => handleFAQPress(faq.question)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqIcon}>{faq.icon}</Text>
                  <Text style={styles.faqText}>{faq.question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding, paddingTop: 56, paddingBottom: 14,
    backgroundColor: Colors.surface, ...Shadows.sm,
  },
  backBtn: { width: 50 },
  backText: { ...Typography.body, color: Colors.blue },
  headerCenter: { alignItems: 'center' },
  headerTitle: { ...Typography.headline, color: Colors.label },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
  onlineText: { ...Typography.caption2, color: Colors.green },

  // Chat
  chatArea: { flex: 1 },
  chatContent: { padding: Spacing.screenPadding, paddingBottom: 40 },

  msgRow: { flexDirection: 'row', marginBottom: 12, maxWidth: '85%' },
  msgRowUser: { alignSelf: 'flex-end' },
  msgRowBot: { alignSelf: 'flex-start' },

  botAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.shopAccentLight,
    justifyContent: 'center', alignItems: 'center', marginRight: 8, alignSelf: 'flex-end',
  },
  botAvatarText: { fontSize: 16 },

  bubble: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10, maxWidth: '100%' },
  bubbleBot: { backgroundColor: Colors.surface, ...Shadows.sm },
  bubbleUser: { backgroundColor: Colors.shopAccent },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextBot: { color: Colors.label },
  bubbleTextUser: { color: '#fff' },

  // FAQ
  faqSection: { marginTop: 16 },
  faqTitle: { ...Typography.footnote, color: Colors.labelSecondary, marginBottom: 10 },
  faqGrid: { gap: 8 },
  faqChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: Radii.lg,
    paddingHorizontal: 14, paddingVertical: 12, ...Shadows.sm,
    borderWidth: 1, borderColor: Colors.separator,
  },
  faqIcon: { fontSize: 18 },
  faqText: { ...Typography.subheadline, color: Colors.label, flex: 1 },
});
