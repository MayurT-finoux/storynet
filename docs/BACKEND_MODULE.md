# Backend / Database Module

StoryNet has no custom backend server — the client talks directly to Postgres via Supabase RPC functions. This module covers the schema, the RPC functions, and the security model. See [Auth & Projects/Home Module](./AUTH_HOME_MODULE.md) for how the frontend calls into this.

## Files
- `supabase-queries.sql` — the full schema + all RPC functions (source of truth; run this on a fresh project).
- `supabase-fix.sql` — a **patch to apply after** `supabase-queries.sql`, not an alternative schema. It has no `CREATE TABLE`/RLS section and would fail on a fresh DB.
- `src/lib/supabase.ts` — the single `createClient(...)` instance used by the whole app.
- `.env.example` — the two env vars the client needs.

## Schema
```sql
public.users (
  id uuid PRIMARY KEY default gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz default now()
)
-- + index idx_users_username

public.projects (
  id uuid PRIMARY KEY default gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  data jsonb NOT NULL default '{"elements":[],"connections":[],"characters":[]}',
  created_at timestamptz,
  updated_at timestamptz
)
-- + index idx_projects_user_id
```
A project's entire canvas state (`elements`, `connections`, `characters`) lives in one `jsonb` column — there's no normalized per-page/per-connection table.

## Security model
Row Level Security is **explicitly disabled** on both tables (there's no Supabase-Auth JWT to check against, since auth is custom — see below). Instead:
- `REVOKE ALL` on both tables `FROM anon` — the anon key cannot query the tables directly at all.
- `GRANT EXECUTE` is given individually per RPC function.
- All client-facing functions are `SECURITY DEFINER` with `SET search_path = public`, so they run with the definer's privileges regardless of caller.
- The real authorization boundary is the `WHERE ... AND user_id = p_user_id` clause hand-written into `save_project`/`delete_project` — **not** RLS. Any change to those functions needs to preserve that ownership check manually.

## RPC functions

| Function | Signature | Touches | Notes |
|---|---|---|---|
| `login` | `(p_username TEXT, p_password TEXT) RETURNS TABLE(id, username)` | `users` (read) | `WHERE username = lower(trim(p_username)) AND password_hash = crypt(p_password, password_hash)`. Empty result on any mismatch — wrong username and wrong password are indistinguishable, matching the client's generic error message. |
| `get_projects` | `(p_user_id UUID) RETURNS TABLE(...)` | `projects` (read) | `WHERE user_id = p_user_id ORDER BY updated_at DESC`. |
| `create_project` | `(p_user_id UUID, p_name TEXT) RETURNS TABLE(...)` | `projects` (insert) | `INSERT ... RETURNING` the full row; name is trimmed. |
| `save_project` | `(p_project_id, p_user_id, p_data JSONB) RETURNS BOOLEAN` | `projects` (update) | `UPDATE ... WHERE id = p_project_id AND user_id = p_user_id`; returns whether a row was actually updated. |
| `delete_project` | `(p_project_id, p_user_id UUID) RETURNS BOOLEAN` | `projects` (delete) | Same ownership-check pattern as `save_project`. |
| `add_user` | `(p_username TEXT, p_password TEXT) RETURNS UUID` | `users` (insert) | `crypt(p_password, gen_salt('bf', 10))` — bcrypt via pgcrypto. **Granted to `service_role` only, not `anon`** — there is no signup flow in the app; new accounts are created by running SQL directly with the service key. |

## Password hashing
Entirely server-side via Postgres `pgcrypto` (`crypt`/`gen_salt('bf', ...)`). The password hash never leaves the database, and the client never hashes anything itself — `bcryptjs`/`@types/bcryptjs` are listed in `package.json` but are unused dead dependencies (no imports anywhere in `src/`).

## `supabase-fix.sql`
A one-time patch, applied after the main file, fixing a `pgcrypto`-outside-`public`-schema issue: it installs the extension into an `extensions` schema and rewrites each function to call `extensions.crypt(...)`/`extensions.gen_salt(...)` with `SET search_path = public, extensions`. It also contains one extra repair statement, **not idempotent — do not re-run**:
```sql
UPDATE public.users
SET password_hash = extensions.crypt(password_hash, extensions.gen_salt('bf', 10))
WHERE username = 'admin' AND password_hash NOT LIKE '$2a$%';
```
This re-hashes the `admin` row's `password_hash`, treating its current (presumably plaintext) value as the input — a one-time bootstrap fix. Running it again, or against an already-bcrypt-hashed value, will scramble the password.

## `src/lib/supabase.ts`
A single `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)`, throwing at import time if either env var is missing. This is the only Supabase client instance in the app.

## Environment variables
`.env.local` (gitignored) needs:
```
VITE_SUPABASE_URL=<your project URL>
VITE_SUPABASE_ANON_KEY=<the anon/public key — NOT service_role>
```
`.env.example` should only ever hold placeholder values — it's tracked in git (`!.env.example` in `.gitignore`), unlike every other `.env*` file. **Never put a real key in it**, even temporarily — the `service_role` key in particular bypasses all authorization and must never leave the DB console / server-side scripts. If real credentials ever land in `.env.example`, restore it from git (`git checkout -- .env.example`) before committing anything.

---

If you're asked to add a new persisted field, a new RPC function, or debug an "invalid username or password"/"project won't save" report, this file plus [Auth & Projects/Home Module](./AUTH_HOME_MODULE.md) is the entire surface area.
