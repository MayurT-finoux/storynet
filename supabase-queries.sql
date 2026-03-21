-- ================================================================
-- StoryNet — Supabase SQL Queries
-- ================================================================
-- HOW TO USE:
--   Run each SECTION separately in Supabase → SQL Editor.
--   Sections are clearly marked. Run them in order (1 → 6).
--   Section 7 onwards are utility queries you run as needed.
-- ================================================================


-- ================================================================
-- SECTION 1: Extensions
-- ================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ================================================================
-- SECTION 2: Tables
-- ================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);

-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  data        JSONB       NOT NULL DEFAULT '{"elements":[],"connections":[],"characters":[]}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects (user_id);


-- ================================================================
-- SECTION 3: Row Level Security
-- ================================================================
-- NOTE: We disable RLS on both tables and rely on the
-- SECURITY DEFINER functions below to enforce access control.
-- This is the correct approach when NOT using Supabase Auth JWT.
-- ================================================================

ALTER TABLE public.users   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- Revoke direct table access from the anon browser key
REVOKE ALL ON public.users    FROM anon;
REVOKE ALL ON public.projects FROM anon;

-- Grant access back only through functions (see Section 4)
GRANT USAGE ON SCHEMA public TO anon;


-- ================================================================
-- SECTION 4: Functions
-- ================================================================

-- ----------------------------------------------------------------
-- login(username, password)
-- Validates credentials server-side. Password hash never leaves DB.
-- Returns user id + username on success, empty set on failure.
-- Called via: supabase.rpc('login', { p_username, p_password })
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.login(p_username TEXT, p_password TEXT)
RETURNS TABLE(id UUID, username TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username
  FROM public.users u
  WHERE u.username = lower(trim(p_username))
    AND u.password_hash = crypt(p_password, u.password_hash);
END;
$$;

-- ----------------------------------------------------------------
-- get_projects(user_id)
-- Returns all projects for a given user, ordered by last updated.
-- Called via: supabase.rpc('get_projects', { p_user_id })
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_projects(p_user_id UUID)
RETURNS TABLE(
  id         UUID,
  user_id    UUID,
  name       TEXT,
  data       JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.user_id, p.name, p.data, p.created_at, p.updated_at
  FROM public.projects p
  WHERE p.user_id = p_user_id
  ORDER BY p.updated_at DESC;
END;
$$;

-- ----------------------------------------------------------------
-- create_project(user_id, name)
-- Creates a new empty project for a user.
-- Called via: supabase.rpc('create_project', { p_user_id, p_name })
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_project(p_user_id UUID, p_name TEXT)
RETURNS TABLE(
  id         UUID,
  user_id    UUID,
  name       TEXT,
  data       JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.projects (user_id, name)
  VALUES (p_user_id, trim(p_name))
  RETURNING
    projects.id, projects.user_id, projects.name,
    projects.data, projects.created_at, projects.updated_at;
END;
$$;

-- ----------------------------------------------------------------
-- save_project(project_id, user_id, data)
-- Updates project canvas data. user_id check prevents cross-user writes.
-- Called via: supabase.rpc('save_project', { p_project_id, p_user_id, p_data })
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.save_project(
  p_project_id UUID,
  p_user_id    UUID,
  p_data       JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_updated INT;
BEGIN
  UPDATE public.projects
  SET data = p_data, updated_at = NOW()
  WHERE id = p_project_id AND user_id = p_user_id;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$;

-- ----------------------------------------------------------------
-- delete_project(project_id, user_id)
-- Deletes a project. user_id check prevents cross-user deletes.
-- Called via: supabase.rpc('delete_project', { p_project_id, p_user_id })
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_project(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_deleted INT;
BEGIN
  DELETE FROM public.projects
  WHERE id = p_project_id AND user_id = p_user_id;

  GET DIAGNOSTICS rows_deleted = ROW_COUNT;
  RETURN rows_deleted > 0;
END;
$$;


-- ================================================================
-- SECTION 5: Grant function access to anon key
-- ================================================================

GRANT EXECUTE ON FUNCTION public.login(TEXT, TEXT)              TO anon;
GRANT EXECUTE ON FUNCTION public.get_projects(UUID)             TO anon;
GRANT EXECUTE ON FUNCTION public.create_project(UUID, TEXT)     TO anon;
GRANT EXECUTE ON FUNCTION public.save_project(UUID, UUID, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.delete_project(UUID, UUID)     TO anon;


-- ================================================================
-- SECTION 6: Add User (run once per user you want to create)
-- ================================================================
-- This function is for admin use only (service_role key).
-- Run it in the SQL editor to create login accounts.
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.add_user(p_username TEXT, p_password TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.users (username, password_hash)
  VALUES (lower(trim(p_username)), crypt(p_password, gen_salt('bf', 10)))
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_user(TEXT, TEXT) TO service_role;

-- ----------------------------------------------------------------
-- CREATE YOUR USERS — edit and run this:
-- ----------------------------------------------------------------
-- SELECT add_user('your_username', 'your_password');


-- ================================================================
-- SECTION 7: Verify setup (run to confirm everything is correct)
-- ================================================================

-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('users', 'projects');

-- Check functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('login', 'get_projects', 'create_project', 'save_project', 'delete_project', 'add_user');

-- Check users (passwords not shown)
SELECT id, username, created_at FROM public.users;

-- Check projects
SELECT id, user_id, name, created_at, updated_at FROM public.projects;


-- ================================================================
-- SECTION 8: Utility queries (run as needed)
-- ================================================================

-- List all projects for a specific user:
-- SELECT id, name, created_at, updated_at FROM public.projects
-- WHERE user_id = '<paste-user-uuid-here>'
-- ORDER BY updated_at DESC;

-- Reset a user's password:
-- UPDATE public.users
-- SET password_hash = crypt('new_password', gen_salt('bf', 10))
-- WHERE username = 'username_here';

-- Delete a user (cascades to their projects):
-- DELETE FROM public.users WHERE username = 'username_here';

-- Delete a specific project:
-- DELETE FROM public.projects WHERE id = '<project-uuid>';

-- View raw canvas data for a project:
-- SELECT name, data FROM public.projects WHERE id = '<project-uuid>';

-- Count pages per project:
-- SELECT name, jsonb_array_length(data->'elements') AS element_count
-- FROM public.projects;
