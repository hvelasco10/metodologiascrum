
-- Drop old auto-role trigger so new users don't automatically get 'developer'
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- New profile-only trigger (no role auto-assignment)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Permissions table: one row per user
CREATE TABLE public.user_permissions (
  user_id uuid PRIMARY KEY,
  dashboard boolean NOT NULL DEFAULT false,
  board boolean NOT NULL DEFAULT false,
  sprints boolean NOT NULL DEFAULT false,
  backlog boolean NOT NULL DEFAULT false,
  team boolean NOT NULL DEFAULT false,
  reports boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own permissions"
ON public.user_permissions FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage permissions"
ON public.user_permissions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_user_permissions_updated_at
BEFORE UPDATE ON public.user_permissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Has-permission helper (admins always have all)
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _section text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result boolean;
BEGIN
  IF public.has_role(_user_id, 'admin'::app_role) THEN
    RETURN true;
  END IF;
  EXECUTE format('SELECT %I FROM public.user_permissions WHERE user_id = $1', _section)
    INTO result USING _user_id;
  RETURN COALESCE(result, false);
END;
$$;
