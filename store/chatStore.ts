import { create } from 'zustand';
import type { ConversationWithPartner, Message } from '@/types/database';

// ─────────────────────────────────────────────────────────────────────────────
// Chat Store — manages conversations, messages, typing, presence
// ─────────────────────────────────────────────────────────────────────────────

interface TypingState {
  [conversationId: string]: { userId: string; timeout: ReturnType<typeof setTimeout> } | undefined;
}

interface ChatState {
  conversations: ConversationWithPartner[];
  messages: { [conversationId: string]: Message[] };
  typingUsers: TypingState;
  activeConversationId: string | null;

  // Actions
  setConversations: (convs: ConversationWithPartner[]) => void;
  upsertConversation: (conv: ConversationWithPartner) => void;
  setMessages: (convId: string, msgs: Message[]) => void;
  appendMessage: (convId: string, msg: Message) => void;
  updateMessage: (convId: string, msgId: string, update: Partial<Message>) => void;
  removeMessages: (convId: string) => void;
  removeConversation: (convId: string) => void;
  setActiveConversation: (id: string | null) => void;
  setTyping: (convId: string, userId: string) => void;
  clearTyping: (convId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  typingUsers: {},
  activeConversationId: null,

  setConversations: (convs) => set({ conversations: convs }),

  upsertConversation: (conv) =>
    set((s) => {
      const exists = s.conversations.findIndex((c) => c.id === conv.id);
      if (exists >= 0) {
        const updated = [...s.conversations];
        updated[exists] = conv;
        return { conversations: updated.sort((a, b) =>
          new Date(b.last_message_at || b.created_at).getTime() -
          new Date(a.last_message_at || a.created_at).getTime()
        )};
      }
      return { conversations: [conv, ...s.conversations] };
    }),

  setMessages: (convId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [convId]: msgs } })),

  appendMessage: (convId, msg) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [convId]: [...(s.messages[convId] || []), msg],
      },
    })),

  updateMessage: (convId, msgId, update) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [convId]: (s.messages[convId] || []).map((m) =>
          m.id === msgId ? { ...m, ...update } : m
        ),
      },
    })),

  removeMessages: (convId) =>
    set((s) => {
      const updated = { ...s.messages };
      delete updated[convId];
      return { messages: updated };
    }),

  removeConversation: (convId) =>
    set((s) => {
      const updated = { ...s.messages };
      delete updated[convId];
      return {
        conversations: s.conversations.filter((c) => c.id !== convId),
        messages: updated,
      };
    }),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setTyping: (convId, userId) =>
    set((s) => {
      // Clear existing timeout
      const existing = s.typingUsers[convId];
      if (existing) clearTimeout(existing.timeout);

      const timeout = setTimeout(() => {
        get().clearTyping(convId);
      }, 3000);

      return { typingUsers: { ...s.typingUsers, [convId]: { userId, timeout } } };
    }),

  clearTyping: (convId) =>
    set((s) => {
      const updated = { ...s.typingUsers };
      delete updated[convId];
      return { typingUsers: updated };
    }),
}));
