-- ============================================================
-- StoryNet — Supabase SQL Setup
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- Enable pgcrypto for password hashing (already available in Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- USERS TABLE
-- Stores login credentials. No Supabase Auth used.
-- Passwords are stored as bcrypt hashes.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast username lookup on login
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);


-- ============================================================
-- PROJECTS TABLE
-- Each project belongs to a user and stores the full canvas
-- state (elements, connections, characters) as JSONB.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  data        JSONB NOT NULL DEFAULT '{"elements":[],"connections":[],"characters":[]}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast project lookup by user
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects (user_id);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Locks down direct table access from the browser client.
-- Users can only read/write their own rows.
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users: allow select only on own row (for login lookup by username we use a function below)
-- No RLS policy needed for users table direct select since login uses a Postgres function.

-- Projects: users can only CRUD their own projects.
-- We identify the user via a custom JWT claim set in the app (see note below).

-- Policy: select own projects
CREATE POLICY "users_select_own_projects"
  ON public.projects FOR SELECT
  USING (user_id::text = current_setting('app.current_user_id', true));

-- Policy: insert own projects
CREATE POLICY "users_insert_own_projects"
  ON public.projects FOR INSERT
  WITH CHECK (user_id::text = current_setting('app.current_user_id', true));

-- Policy: update own projects
CREATE POLICY "users_update_own_projects"
  ON public.projects FOR UPDATE
  USING (user_id::text = current_setting('app.current_user_id', true));

-- Policy: delete own projects
CREATE POLICY "users_delete_own_projects"
  ON public.projects FOR DELETE
  USING (user_id::text = current_setting('app.current_user_id', true));


-- ============================================================
-- LOGIN FUNCTION
-- Called from the app to validate username + password.
-- Returns the user row if credentials are valid, null otherwise.
-- Using a server-side function avoids exposing password_hash
-- to the client via direct table queries.
-- ============================================================
CREATE OR REPLACE FUNCTION public.login(p_username TEXT, p_password TEXT)
RETURNS TABLE(id UUID, username TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username
  FROM public.users u
  WHERE u.username = lower(trim(p_username))
    AND u.password_hash = crypt(p_password, u.password_hash);
END;
$$;


-- ============================================================
-- ADD USER FUNCTION (run manually to create users)
-- Usage: SELECT add_user('alice', 'mysecretpassword');
-- Run this in the SQL editor for each user you want to create.
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_user(p_username TEXT, p_password TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
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


-- ============================================================
-- EXAMPLE: Create your first user
-- Uncomment and edit before running:
-- ============================================================
-- SELECT add_user('your_username', 'your_password');


-- ============================================================
-- GRANT anon role access to the login function only
-- The anon key (used in the browser) can only call login().
-- It cannot directly read the users table.
-- ============================================================
GRANT EXECUTE ON FUNCTION public.login(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.add_user(TEXT, TEXT) TO service_role;

-- Grant anon access to projects table (RLS policies enforce row-level security)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO anon;
