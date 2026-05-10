
-- Roles for admin auth
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Trigger: first signup becomes admin, others become user
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Invitations
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  groom_name_uz TEXT NOT NULL DEFAULT '',
  groom_name_ru TEXT NOT NULL DEFAULT '',
  bride_name_uz TEXT NOT NULL DEFAULT '',
  bride_name_ru TEXT NOT NULL DEFAULT '',
  wedding_date TIMESTAMPTZ,
  venue_name_uz TEXT DEFAULT '',
  venue_name_ru TEXT DEFAULT '',
  venue_address_uz TEXT DEFAULT '',
  venue_address_ru TEXT DEFAULT '',
  venue_lat NUMERIC,
  venue_lng NUMERIC,
  welcome_text_uz TEXT DEFAULT '',
  welcome_text_ru TEXT DEFAULT '',
  cover_image TEXT,
  couple_photo TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  music_url TEXT,
  theme_color TEXT NOT NULL DEFAULT 'gold',
  pattern_style TEXT NOT NULL DEFAULT 'floral',
  font_pair TEXT NOT NULL DEFAULT 'classic',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active invitations" ON public.invitations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins full access invitations" ON public.invitations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Guests
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  rsvp_status TEXT NOT NULL DEFAULT 'pending' CHECK (rsvp_status IN ('pending','confirmed','declined','maybe')),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Public can submit RSVPs (insert) for active invitations
CREATE POLICY "Public can insert guest RSVPs" ON public.guests
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND is_active = true)
  );

CREATE POLICY "Admins full access guests" ON public.guests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER invitations_touch BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('invitation-images', 'invitation-images', true),
  ('invitation-music', 'invitation-music', true);

CREATE POLICY "Public read invitation-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'invitation-images');
CREATE POLICY "Admins write invitation-images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'invitation-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update invitation-images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'invitation-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete invitation-images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'invitation-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read invitation-music" ON storage.objects
  FOR SELECT USING (bucket_id = 'invitation-music');
CREATE POLICY "Admins write invitation-music" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'invitation-music' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update invitation-music" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'invitation-music' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete invitation-music" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'invitation-music' AND public.has_role(auth.uid(), 'admin'));
