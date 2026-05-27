-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Invites
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  guest_name TEXT NOT NULL,
  guest_type TEXT NOT NULL DEFAULT 'default',
  phone TEXT,
  show_church BOOLEAN NOT NULL DEFAULT true,
  show_party BOOLEAN NOT NULL DEFAULT true,
  table_number TEXT,
  plus_one BOOLEAN NOT NULL DEFAULT false,
  vip BOOLEAN NOT NULL DEFAULT false,
  custom_message TEXT,
  rsvp_status TEXT NOT NULL DEFAULT 'pending',
  attendee_count INT NOT NULL DEFAULT 1,
  rsvp_message TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invites TO authenticated;
GRANT ALL ON public.invites TO service_role;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins full invites" ON public.invites FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE, -- church | party | groom | bride | family | after
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  event_date DATE,
  event_time TEXT,
  location TEXT,
  maps_link TEXT,
  visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read events" ON public.events FOR SELECT TO anon, authenticated USING (visible = true);
CREATE POLICY "admin manage events" ON public.events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Gallery
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery TO anon, authenticated;
GRANT ALL ON public.gallery TO service_role;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read gallery" ON public.gallery FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage gallery" ON public.gallery FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Settings (singleton)
CREATE TABLE public.settings (
  id INT PRIMARY KEY DEFAULT 1,
  couple_names TEXT NOT NULL DEFAULT 'Merna & George',
  couple_names_ar TEXT DEFAULT 'ميرنا و جورج',
  wedding_date TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '180 days'),
  hero_tagline TEXT DEFAULT 'Together, forever begins',
  hero_tagline_ar TEXT DEFAULT 'معاً، إلى الأبد',
  hero_image_url TEXT,
  music_url TEXT,
  thank_you_message TEXT DEFAULT 'With love and gratitude, we cannot wait to celebrate with you.',
  thank_you_message_ar TEXT,
  CONSTRAINT singleton CHECK (id = 1)
);
GRANT SELECT ON public.settings TO anon, authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin update settings" ON public.settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.settings (id) VALUES (1);

-- Seed events
INSERT INTO public.events (key, title, title_ar, description, event_time, location, sort_order, visible) VALUES
('church', 'Church Ceremony', 'مراسم الكنيسة', 'Holy matrimony service', '4:00 PM', 'St. George Cathedral', 1, true),
('party', 'Wedding Reception', 'حفل الزفاف', 'Dinner, dancing & celebration', '7:30 PM', 'The Grand Ballroom', 2, true),
('after', 'After Party', 'حفلة ما بعد الزفاف', 'Late-night celebration', '11:00 PM', 'Skybar Lounge', 3, false);