-- Run this entire block in Supabase SQL Editor at once

CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.login(p_username TEXT, p_password TEXT)
RETURNS TABLE(id UUID, username TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username FROM public.users u
  WHERE u.username = lower(trim(p_username))
    AND u.password_hash = extensions.crypt(p_password, u.password_hash);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_projects(p_user_id UUID)
RETURNS TABLE(id UUID, user_id UUID, name TEXT, data JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.user_id, p.name, p.data, p.created_at, p.updated_at
  FROM public.projects p WHERE p.user_id = p_user_id ORDER BY p.updated_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_project(p_user_id UUID, p_name TEXT)
RETURNS TABLE(id UUID, user_id UUID, name TEXT, data JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.projects (user_id, name) VALUES (p_user_id, trim(p_name))
  RETURNING projects.id, projects.user_id, projects.name, projects.data, projects.created_at, projects.updated_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_project(p_project_id UUID, p_user_id UUID, p_data JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE rows_updated INT;
BEGIN
  UPDATE public.projects SET data = p_data, updated_at = NOW()
  WHERE id = p_project_id AND user_id = p_user_id;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_project(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE rows_deleted INT;
BEGIN
  DELETE FROM public.projects WHERE id = p_project_id AND user_id = p_user_id;
  GET DIAGNOSTICS rows_deleted = ROW_COUNT;
  RETURN rows_deleted > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_user(p_username TEXT, p_password TEXT)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE new_id UUID;
BEGIN
  INSERT INTO public.users (username, password_hash)
  VALUES (lower(trim(p_username)), extensions.crypt(p_password, extensions.gen_salt('bf', 10)))
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Update existing admin user's password hash using correct crypt
UPDATE public.users
SET password_hash = extensions.crypt(password_hash, extensions.gen_salt('bf', 10))
WHERE username = 'admin' AND password_hash NOT LIKE '$2a$%';

GRANT EXECUTE ON FUNCTION public.login(TEXT, TEXT)               TO anon;
GRANT EXECUTE ON FUNCTION public.get_projects(UUID)              TO anon;
GRANT EXECUTE ON FUNCTION public.create_project(UUID, TEXT)      TO anon;
GRANT EXECUTE ON FUNCTION public.save_project(UUID, UUID, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.delete_project(UUID, UUID)      TO anon;
GRANT EXECUTE ON FUNCTION public.add_user(TEXT, TEXT)            TO service_role;
