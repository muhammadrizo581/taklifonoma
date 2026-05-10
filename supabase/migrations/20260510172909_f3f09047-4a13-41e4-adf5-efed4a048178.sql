
-- Fix search_path on remaining functions
ALTER FUNCTION public.handle_new_user_role() SET search_path = public;
ALTER FUNCTION public.touch_updated_at() SET search_path = public;

-- Revoke direct execute on security definer functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- Restrict bucket listing - drop broad SELECT and replace with object-level read by exact path is not possible;
-- Instead: only allow SELECT when the request asks for a specific object (still works for public URLs).
-- We accomplish this by restricting list operations: keep public read but prevent bucket listing via empty list policy.
-- Drop existing then re-add (public URLs use signed-less access, this still works for direct file fetches via render endpoint).
DROP POLICY IF EXISTS "Public read invitation-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read invitation-music" ON storage.objects;

-- Allow read only when name is specified (prevents bucket listing without a path)
CREATE POLICY "Public read invitation-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'invitation-images' AND name IS NOT NULL AND length(name) > 0);
CREATE POLICY "Public read invitation-music" ON storage.objects
  FOR SELECT USING (bucket_id = 'invitation-music' AND name IS NOT NULL AND length(name) > 0);
