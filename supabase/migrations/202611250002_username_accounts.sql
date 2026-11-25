-- USERNAME ACCOUNTS v0.2.1 -- apply after 202611250001_base.sql.
-- A technical Auth email alias exists, but it is never supplied by a human.
-- Never store passwords in public tables; Supabase Auth manages password hashing.
ALTER TABLE public.user_profiles ADD COLUMN username text;
ALTER TABLE public.user_profiles
  ADD CONSTRAINT username_pattern CHECK (
    username IS NULL OR (username ~ '^[a-z][a-z0-9._-]{2,31}$' AND username NOT LIKE '%..%' AND username NOT LIKE '%.')
  );
CREATE UNIQUE INDEX user_profiles_username_unique ON public.user_profiles (lower(username)) WHERE username IS NOT NULL;

-- Creation is a separate audited RPC. Existing admin_save_profile is retained
-- for updates; changes to login names are deliberately disallowed in this version.
CREATE FUNCTION public.admin_register_profile(p_id uuid,p_username text,p_name text,p_role text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_actor uuid;
BEGIN
 v_actor:=public.require_active_user(true);
 IF p_id IS NULL OR p_username IS NULL OR p_username !~ '^[a-z][a-z0-9._-]{2,31}$'
    OR p_username LIKE '%..%' OR p_username LIKE '%.'
    OR p_name IS NULL OR length(p_name)>120 OR p_role NOT IN ('admin','staff') THEN
  RAISE EXCEPTION 'Invalid account data';
 END IF;
 IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id=p_id) THEN
  RAISE EXCEPTION 'Profile already exists';
 END IF;
 INSERT INTO public.user_profiles(id,username,display_name,role,active)
 VALUES(p_id,p_username,p_name,p_role,true);
 INSERT INTO public.administration_events(actor_id,event_type,subject_id,previous_value,next_value)
 VALUES(v_actor,'user_created',p_id,NULL,jsonb_build_object('username',p_username,'name',p_name,'role',p_role,'active',true));
 RETURN p_id;
END $$;
REVOKE ALL ON FUNCTION public.admin_register_profile(uuid,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_register_profile(uuid,text,text,text) TO authenticated;
