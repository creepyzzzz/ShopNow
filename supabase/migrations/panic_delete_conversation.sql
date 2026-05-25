-- ─────────────────────────────────────────────────────────────────────────────
-- RPC: panic_delete_conversation
-- Bilateral message wipe: soft-deletes all messages in a conversation and
-- resets the conversation preview. Caller must be a member.
-- Called by chat/[id].tsx panic delete feature.
-- ─────────────────────────────────────────────────────────────────────────────
-- Execute this in Supabase Dashboard → SQL Editor

CREATE OR REPLACE FUNCTION public.panic_delete_conversation(conv_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is a member of this conversation
  IF NOT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = conv_id
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this conversation';
  END IF;

  -- Soft-delete all messages (bilateral — affects both sides)
  UPDATE public.messages
  SET is_deleted = true,
      content = NULL,
      media_url = NULL
  WHERE conversation_id = conv_id;

  -- Reset the conversation preview
  UPDATE public.conversations
  SET last_message = NULL,
      last_message_at = NULL,
      last_message_type = NULL
  WHERE id = conv_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.panic_delete_conversation(uuid) TO authenticated;
