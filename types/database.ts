// Auto-generated type definitions for the Stealth Chat App Supabase schema
// ─────────────────────────────────────────────────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          alias: string;
          profile_image: string | null;
          push_token: string | null;
          is_online: boolean;
          last_seen: string;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          alias: string;
          profile_image?: string | null;
          push_token?: string | null;
          is_online?: boolean;
          last_seen?: string;
          created_at?: string;
        };
        Update: {
          username?: string;
          alias?: string;
          profile_image?: string | null;
          push_token?: string | null;
          is_online?: boolean;
          last_seen?: string;
        };
      };
      friend_requests: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
        };
        Update: {
          status?: 'pending' | 'accepted' | 'rejected';
        };
      };
      friendships: {
        Row: {
          id: string;
          user_one: string;
          user_two: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_one: string;
          user_two: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      conversations: {
        Row: {
          id: string;
          created_at: string;
          last_message: string | null;
          last_message_at: string | null;
          last_message_type: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          last_message?: string | null;
          last_message_at?: string | null;
          last_message_type?: string | null;
        };
        Update: {
          last_message?: string | null;
          last_message_at?: string | null;
          last_message_type?: string | null;
        };
      };
      conversation_members: {
        Row: {
          conversation_id: string;
          user_id: string;
          is_pinned: boolean;
          is_muted: boolean;
          joined_at: string;
        };
        Insert: {
          conversation_id: string;
          user_id: string;
          is_pinned?: boolean;
          is_muted?: boolean;
          joined_at?: string;
        };
        Update: {
          is_pinned?: boolean;
          is_muted?: boolean;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          message_type: 'text' | 'image' | 'gif' | 'sticker' | 'voice' | 'file';
          content: string | null;
          media_url: string | null;
          is_deleted: boolean;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          message_type?: 'text' | 'image' | 'gif' | 'sticker' | 'voice' | 'file';
          content?: string | null;
          media_url?: string | null;
          is_deleted?: boolean;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          content?: string | null;
          media_url?: string | null;
          is_deleted?: boolean;
          is_read?: boolean;
        };
      };
      vault_items: {
        Row: {
          id: string;
          user_id: string;
          encrypted_url: string;
          encryption_key_hint: string | null;
          type: 'image' | 'video' | 'note' | 'document';
          mime_type: string | null;
          file_size: number | null;
          thumbnail_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          encrypted_url: string;
          encryption_key_hint?: string | null;
          type?: 'image' | 'video' | 'note' | 'document';
          mime_type?: string | null;
          file_size?: number | null;
          thumbnail_url?: string | null;
          created_at?: string;
        };
        Update: {
          encrypted_url?: string;
          type?: 'image' | 'video' | 'note' | 'document';
        };
      };
      settings: {
        Row: {
          user_id: string;
          disguise_timeout: number;
          tap_limit: number;
          panic_enabled: boolean;
          wallpaper: string | null;
          notification_disguise: boolean;
          biometric_vault: boolean;
          theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          disguise_timeout?: number;
          tap_limit?: number;
          panic_enabled?: boolean;
          wallpaper?: string | null;
          notification_disguise?: boolean;
          biometric_vault?: boolean;
          theme?: string;
        };
        Update: {
          disguise_timeout?: number;
          tap_limit?: number;
          panic_enabled?: boolean;
          wallpaper?: string | null;
          notification_disguise?: boolean;
          biometric_vault?: boolean;
          theme?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      accept_friend_request: { Args: { request_id: string }; Returns: void };
      panic_delete_conversation: { Args: { conv_id: string }; Returns: void };
      update_presence: { Args: { is_online_status: boolean }; Returns: void };
    };
    Enums: Record<string, never>;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience type aliases
// ─────────────────────────────────────────────────────────────────────────────
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type AppUser = Tables<'users'>;
export type FriendRequest = Tables<'friend_requests'>;
export type Friendship = Tables<'friendships'>;
export type Conversation = Tables<'conversations'>;
export type ConversationMember = Tables<'conversation_members'>;
export type Message = Tables<'messages'>;
export type VaultItem = Tables<'vault_items'>;
export type Settings = Tables<'settings'>;

// Extended types with joins
export interface ConversationWithPartner extends Conversation {
  partner: AppUser;
  unread_count?: number;
}

export interface MessageWithSender extends Message {
  sender?: AppUser;
}
