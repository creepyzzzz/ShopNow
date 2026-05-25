-- ─────────────────────────────────────────────────────────────────────────────
-- RPC: update_presence
-- Toggles is_online and updates last_seen for the authenticated user.
-- Called by (app)/_layout.tsx on mount/unmount.
-- ─────────────────────────────────────────────────────────────────────────────
-- Execute this in Supabase Dashboard → SQL Editor

CREATE OR REPLACE FUNCTION public.update_presence(is_online_status boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET is_online = is_online_status,
      last_seen = now()
  WHERE id = auth.uid();
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.update_presence(boolean) TO authenticated;
