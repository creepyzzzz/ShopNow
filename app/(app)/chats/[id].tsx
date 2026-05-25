import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Image, KeyboardAvoidingView, Platform,
  Alert, Modal, Dimensions, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/constants/theme';
import { BUCKET_MEDIA } from '@/constants/config';
import AnimatedBubble from '@/components/ui/AnimatedBubble';
import type { Message, AppUser } from '@/types/database';

const { width: SCREEN_W } = Dimensions.get('window');
const MAX_BUBBLE_W = SCREEN_W * 0.72;

// ─────────────────────────────────────────────────────────────────────────────
// Chat Screen — real-time iMessage-style messaging
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { messages, setMessages, appendMessage, removeConversation } = useChatStore();

  const [text, setText] = useState('');
  const [partner, setPartner] = useState<AppUser | null>(null);
  const [sending, setSending] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);
  const [typingVisible, setTypingVisible] = useState(false);

  const flatRef = useRef<FlatList>(null);
  const convMessages = messages[conversationId] || [];

  // Animated send button
  const sendScale = useSharedValue(1);
  const sendAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  // ── Load partner + messages ──────────────────────────────────────────────
  useEffect(() => {
    if (!user || !conversationId) return;

    // Get partner
    const loadPartner = async () => {
      const { data } = await supabase
        .from('conversation_members')
        .select('users (id, username, alias, profile_image, is_online, last_seen)')
        .eq('conversation_id', conversationId)
        .neq('user_id', user.id)
        .maybeSingle();
      if (data) setPartner((data as any).users);
    };

    // Load messages
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(50);
      if (data) setMessages(conversationId, data);
    };

    loadPartner();
    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id !== user.id) {
          appendMessage(conversationId, msg);
          flatRef.current?.scrollToEnd({ animated: true });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user]);

  // ── Scroll on new messages ───────────────────────────────────────────────
  useEffect(() => {
    if (convMessages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [convMessages.length]);

  // ── Send text message ────────────────────────────────────────────────────
  const sendMessage = async (content: string, type: Message['message_type'] = 'text', mediaUrl?: string) => {
    if (!user || !conversationId) return;
    if (type === 'text' && !content.trim()) return;

    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const optimisticMsg: Message = {
      id: `temp_${Date.now()}`,
      conversation_id: conversationId,
      sender_id: user.id,
      message_type: type,
      content: content || null,
      media_url: mediaUrl || null,
      is_deleted: false,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    appendMessage(conversationId, optimisticMsg);
    setText('');

    const { data, error } = await (supabase.from('messages') as any).insert({
      conversation_id: conversationId,
      sender_id: user.id,
      message_type: type,
      content: content || null,
      media_url: mediaUrl || null,
    }).select().single();

    if (!error && data) {
      // Update conversation last message
      await (supabase.from('conversations') as any).update({
        last_message: type === 'text' ? content : `📎 ${type}`,
        last_message_at: (data as any).created_at,
        last_message_type: type,
      }).eq('id', conversationId);
    }
    setSending(false);
    flatRef.current?.scrollToEnd({ animated: true });
  };

  // ── Upload media ─────────────────────────────────────────────────────────
  const pickAndSendMedia = async () => {
    setShowAttach(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop() || 'jpg';
    const path = `${user?.id}/${Date.now()}.${ext}`;

    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const ab = await blob.arrayBuffer();

    const { error } = await supabase.storage.from(BUCKET_MEDIA).upload(path, ab, {
      contentType: asset.mimeType || `image/${ext}`,
    });

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from(BUCKET_MEDIA).getPublicUrl(path);
      await sendMessage('', 'image', publicUrl);
    }
  };

  // ── Voice recording ──────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {
      Alert.alert('Error', 'Could not start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    if (uri) {
      const path = `${user?.id}/voice_${Date.now()}.m4a`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const ab = await blob.arrayBuffer();

      const { error } = await supabase.storage.from(BUCKET_MEDIA).upload(path, ab, {
        contentType: 'audio/m4a',
      });

      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from(BUCKET_MEDIA).getPublicUrl(path);
        await sendMessage('', 'voice', publicUrl);
      }
    }
  };

  // ── Panic Delete ─────────────────────────────────────────────────────────
  const handlePanicDelete = async () => {
    setShowPanicConfirm(false);
    await (supabase.rpc as any)('panic_delete_conversation', { conv_id: conversationId });
    removeConversation(conversationId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    router.back();
  };

  // ── Message bubble ───────────────────────────────────────────────────────
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMine = item.sender_id === user?.id;
    const isDeleted = item.is_deleted;
    const timestamp = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <AnimatedBubble
        isMine={isMine}
        index={index}
        timestamp={timestamp}
        isRead={item.is_read}
      >
        {isDeleted ? (
          <Text style={styles.deletedText}>🚫 Message deleted</Text>
        ) : item.message_type === 'image' && item.media_url ? (
          <Image source={{ uri: item.media_url }} style={styles.mediaImage} resizeMode="cover" />
        ) : item.message_type === 'voice' && item.media_url ? (
          <TouchableOpacity style={styles.voiceRow}>
            <Text style={styles.voiceIcon}>🎤</Text>
            <Text style={[styles.voiceText, isMine && styles.voiceTextMine]}>Voice note</Text>
            <Text style={styles.voicePlayIcon}>▶</Text>
          </TouchableOpacity>
        ) : item.message_type === 'gif' && item.media_url ? (
          <Image source={{ uri: item.media_url }} style={styles.mediaImage} resizeMode="contain" />
        ) : (
          <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
            {item.content}
          </Text>
        )}
      </AnimatedBubble>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <BlurView intensity={72} tint="light" style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.partnerInfo}>
          <View style={styles.headerAvatarWrap}>
            {partner?.profile_image ? (
              <Image source={{ uri: partner.profile_image }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatarFallback}>
                <Text style={styles.headerAvatarInitial}>{partner?.alias?.[0]}</Text>
              </View>
            )}
            {partner?.is_online && <View style={styles.onlineDot} />}
          </View>
          <View>
            <Text style={styles.headerAlias}>{partner?.alias || '...'}</Text>
            <Text style={styles.headerStatus}>
              {partner?.is_online ? 'Online' : 'Offline'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Panic button */}
        <TouchableOpacity
          style={styles.panicBtn}
          onLongPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setShowPanicConfirm(true);
          }}
        >
          <Text style={styles.panicIcon}>🗑</Text>
        </TouchableOpacity>
      </BlurView>

      {/* ── Typing indicator ──────────────────────────────── */}
      {typingVisible && (
        <View style={styles.typingBar}>
          <Text style={styles.typingText}>{partner?.alias} is typing...</Text>
        </View>
      )}

      {/* ── Messages ─────────────────────────────────────── */}
      <FlatList
        ref={flatRef}
        data={convMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatIcon}>👋</Text>
            <Text style={styles.emptyChatText}>Say hello to {partner?.alias}!</Text>
          </View>
        }
      />

      {/* ── Input Bar ─────────────────────────────────────── */}
      <BlurView intensity={60} tint="light" style={styles.inputBar}>
        <TouchableOpacity
          style={styles.attachBtn}
          onPress={() => setShowAttach(!showAttach)}
        >
          <Text style={styles.attachIcon}>+</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="iMessage..."
          placeholderTextColor={Colors.labelTertiary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
          returnKeyType="default"
        />

        {text.trim() ? (
          <Animated.View style={sendAnimStyle}>
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={() => {
                sendScale.value = withSpring(0.8, { damping: 12, stiffness: 400 });
                setTimeout(() => {
                  sendScale.value = withSpring(1, { damping: 12, stiffness: 400 });
                }, 100);
                sendMessage(text.trim());
              }}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sendIcon}>↑</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <TouchableOpacity
            style={[styles.sendBtn, styles.voiceBtn, isRecording && styles.voiceBtnActive]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <Text style={styles.sendIcon}>{isRecording ? '⏹' : '🎤'}</Text>
          </TouchableOpacity>
        )}
      </BlurView>

      {/* ── Attach panel ─────────────────────────────────── */}
      {showAttach && (
        <View style={styles.attachPanel}>
          {[
            { icon: '🖼️', label: 'Photo/Video', action: pickAndSendMedia },
            { icon: '📷', label: 'Camera', action: () => { setShowAttach(false); } },
            { icon: '🎞️', label: 'GIF', action: () => { setShowAttach(false); } },
            { icon: '😀', label: 'Sticker', action: () => { setShowAttach(false); } },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.attachItem} onPress={item.action}>
              <Text style={styles.attachItemIcon}>{item.icon}</Text>
              <Text style={styles.attachItemLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Panic confirm ─────────────────────────────────── */}
      <Modal visible={showPanicConfirm} transparent animationType="fade">
        <View style={styles.panicOverlay}>
          <View style={styles.panicCard}>
            <Text style={styles.panicTitle}>⚠️ Panic Delete</Text>
            <Text style={styles.panicDesc}>
              This will permanently delete ALL messages in this conversation for both sides.
              This cannot be undone.
            </Text>
            <TouchableOpacity style={styles.panicConfirmBtn} onPress={handlePanicDelete}>
              <Text style={styles.panicConfirmText}>DELETE EVERYTHING</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.panicCancelBtn} onPress={() => setShowPanicConfirm(false)}>
              <Text style={styles.panicCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 10,
    borderBottomWidth: 0.5, borderBottomColor: Colors.separator,
    gap: 12,
  },
  backBtn: { padding: 6 },
  backIcon: { fontSize: 24, color: Colors.blue, fontWeight: '300' },
  partnerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatarWrap: { position: 'relative' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerAvatarFallback: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.blue, justifyContent: 'center', alignItems: 'center',
  },
  headerAvatarInitial: { color: '#fff', fontSize: 18, fontWeight: '700' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.online, borderWidth: 2, borderColor: Colors.surface,
  },
  headerAlias: { ...Typography.headline, color: Colors.label },
  headerStatus: { ...Typography.caption1, color: Colors.labelSecondary },
  panicBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.fillSecondary, justifyContent: 'center', alignItems: 'center',
  },
  panicIcon: { fontSize: 17 },

  // Typing
  typingBar: { paddingHorizontal: 20, paddingVertical: 4, backgroundColor: Colors.background },
  typingText: { ...Typography.caption1, color: Colors.labelSecondary, fontStyle: 'italic' },

  // Messages
  messagesContent: { padding: 12, paddingBottom: 20, flexGrow: 1 },
  msgRow: { flexDirection: 'row', marginVertical: 3, maxWidth: MAX_BUBBLE_W },
  msgRowRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgRowLeft: { alignSelf: 'flex-start' },
  senderAvatarInline: { marginBottom: 4 },
  senderAvatarImg: { width: 28, height: 28, borderRadius: 14 },
  senderAvatarFallback: { backgroundColor: Colors.blue, justifyContent: 'center', alignItems: 'center' },
  senderAvatarInitial: { color: '#fff', fontSize: 12, fontWeight: '700' },

  bubble: {
    borderRadius: Radii.bubble, padding: 10,
    maxWidth: MAX_BUBBLE_W, ...Shadows.sm,
  },
  bubbleMine: {
    backgroundColor: Colors.bubbleOutgoing,
    borderBottomRightRadius: Radii.bubbleTail,
  },
  bubbleTheirs: {
    backgroundColor: Colors.bubbleIncoming,
    borderBottomLeftRadius: Radii.bubbleTail,
  },
  mediaBubble: { padding: 4, overflow: 'hidden' },
  bubbleText: { ...Typography.body, color: Colors.bubbleIncomingText },
  bubbleTextMine: { color: Colors.bubbleOutgoingText },
  bubbleTime: {
    ...Typography.caption2, color: 'rgba(0,0,0,0.4)',
    marginTop: 4, alignSelf: 'flex-end',
  },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.6)' },
  deletedText: { ...Typography.subheadline, color: Colors.labelTertiary, fontStyle: 'italic' },
  mediaImage: { width: 220, height: 180, borderRadius: Radii.md },
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  voiceIcon: { fontSize: 18 },
  voiceText: { ...Typography.subheadline, color: Colors.label },
  voiceTextMine: { color: '#fff' },
  voicePlayIcon: { fontSize: 12 },

  // Empty
  emptyChat: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyChatIcon: { fontSize: 48, marginBottom: 12 },
  emptyChatText: { ...Typography.subheadline, color: Colors.labelSecondary },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 8, paddingBottom: 28,
    borderTopWidth: 0.5, borderTopColor: Colors.separator, gap: 8,
  },
  attachBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.fillSecondary, justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },
  attachIcon: { fontSize: 20, color: Colors.blue, fontWeight: '300' },
  textInput: {
    flex: 1, ...Typography.body, color: Colors.label,
    backgroundColor: Colors.fillTertiary, borderRadius: 20,
    paddingHorizontal: 14, paddingTop: 8, paddingBottom: 8,
    maxHeight: 120,
  },
  sendBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.blue, justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },
  voiceBtn: { backgroundColor: Colors.fillSecondary },
  voiceBtnActive: { backgroundColor: Colors.red },
  sendIcon: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // Attach panel
  attachPanel: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: Colors.surface, paddingVertical: 16, paddingBottom: 28,
    borderTopWidth: 0.5, borderTopColor: Colors.separator,
  },
  attachItem: { alignItems: 'center', gap: 6 },
  attachItemIcon: { fontSize: 32 },
  attachItemLabel: { ...Typography.caption2, color: Colors.labelSecondary },

  // Panic
  panicOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  panicCard: {
    backgroundColor: Colors.surface, borderRadius: Radii.sheet,
    padding: 28, alignItems: 'center', ...Shadows.lg, width: '100%',
  },
  panicTitle: { fontSize: 22, fontWeight: '800', color: Colors.label, marginBottom: 12 },
  panicDesc: { ...Typography.subheadline, color: Colors.labelSecondary, textAlign: 'center', marginBottom: 24 },
  panicConfirmBtn: {
    backgroundColor: Colors.red, borderRadius: Radii.lg,
    paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 10,
  },
  panicConfirmText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  panicCancelBtn: { paddingVertical: 10 },
  panicCancelText: { color: Colors.blue, fontSize: 16, fontWeight: '600' },
});
