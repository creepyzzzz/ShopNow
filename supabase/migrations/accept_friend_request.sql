-- ─────────────────────────────────────────────────────────────────────────────
-- RPC: accept_friend_request
-- Accepts a pending friend request, creates a friendship record, and
-- auto-creates a 1:1 conversation with both users as members.
-- Called by the chat list friend request accept button.
-- ─────────────────────────────────────────────────────────────────────────────
-- Execute this in Supabase Dashboard → SQL Editor

CREATE OR REPLACE FUNCTION public.accept_friend_request(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req RECORD;
  new_conv_id uuid;
BEGIN
  -- Fetch the request (only the receiver can accept)
  SELECT * INTO req
  FROM public.friend_requests
  WHERE id = request_id
    AND receiver_id = auth.uid()
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or already processed';
  END IF;

  -- Update request status to accepted
  UPDATE public.friend_requests
  SET status = 'accepted'
  WHERE id = request_id;

  -- Create friendship record
  INSERT INTO public.friendships (user_one, user_two)
  VALUES (req.sender_id, req.receiver_id);

  -- Auto-create a 1:1 conversation
  INSERT INTO public.conversations (id, created_at)
  VALUES (gen_random_uuid(), now())
  RETURNING id INTO new_conv_id;

  -- Add both users as conversation members
  INSERT INTO public.conversation_members (conversation_id, user_id)
  VALUES
    (new_conv_id, req.sender_id),
    (new_conv_id, req.receiver_id);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.accept_friend_request(uuid) TO authenticated;
