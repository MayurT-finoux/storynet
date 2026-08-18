# Auth & Projects/Home Module

Covers everything before the canvas: logging in, the project list, and creating/opening/deleting/auto-saving projects. This is the frontend half of persistence — see [Backend/Database Module](./BACKEND_MODULE.md) for the Supabase/RPC side.

## Files
- `src/pages/LoginPage.tsx`
- `src/pages/HomePage.tsx`
- `src/components/home/ProjectCard.tsx`
- `src/hooks/useAuth.ts`
- `src/hooks/useProjects.ts`
- `src/types/project.ts`
- `src/App.tsx` (owns the view state machine that ties these together)

## View routing (`App.tsx`)
No router library — a plain state machine: `type AppView = 'login' | 'home' | 'canvas'`. The initial view is derived synchronously from whether a session already exists in `localStorage` (`user ? 'home' : 'login'`), so a returning user skips the login screen without a network round-trip.

## `useAuth.ts`
Session key: `localStorage['storynet_user']`, storing `{ id, username }` — never the password or its hash.

- `login(username, password)` — trims/lowercases the username, calls `supabase.rpc('login', { p_username, p_password })`. An empty/errored RPC result and a thrown exception both resolve to the same generic message ("Invalid username or password" / "Something went wrong. Try again.") — the app deliberately doesn't reveal whether a username exists.
- `logout()` — purely local: clears the localStorage key and in-memory `user` state. There's no server-side session/token to invalidate, since auth is a one-time DB check at login, not an ongoing session.

## `useProjects.ts`
Thin wrappers around the RPC functions documented in [Backend/Database Module](./BACKEND_MODULE.md):
- `fetchProjects` → `get_projects` (server returns rows sorted `updated_at DESC`).
- `createProject(name)` → `create_project`; prepends the new row to local state and returns it.
- `deleteProject` → `delete_project`; filters the deleted row out of local state on success.
- `saveProject(projectId, projectData)` → `save_project`; optimistically patches local `data`/`updated_at` on success (the `updated_at` shown is a client timestamp, not the server's).

**Note:** `App.tsx` and `HomePage.tsx` each call `useProjects()` independently — there are two separate `projects` arrays in memory at once. Not a bug (App only ever uses its instance's `saveProject`), but worth knowing if you're debugging why a change in one doesn't seem to reflect in the other.

## `LoginPage.tsx`
Props: `{ onLogin: (username, password) => Promise<boolean>; loading: boolean; error: string | null }`. Split-panel layout — a ~480px form panel plus a decorative right panel with a `requestAnimationFrame`-driven canvas animation of floating page nodes (purely visual, not real data). No signup UI, matching the backend (there's no client-exposed signup RPC — see [Backend/Database Module](./BACKEND_MODULE.md)).

## `HomePage.tsx`
Props: `{ user: AppUser; onLogout: () => void; onOpenProject: (project) => void }`. Owns its own `useProjects(user.id)`. Local state: `showNewModal`, `newName`, `creating`, `search`.
- Search is a pure client-side case-insensitive substring filter over the already-fetched list — no server round trip per keystroke.
- Empty states differ by cause: "No projects yet" (with a create CTA) vs. "No results found" (search active, no CTA).
- Creating a project immediately calls `onOpenProject` — there's no intermediate "created" state, you land straight in canvas view.
- Delete is gated by a native `window.confirm()` dialog before the RPC call — not a custom modal.

## `ProjectCard.tsx`
Presentational only: `{ project, onOpen, onDelete }`. Derives `pageCount` (elements where `type === 'page'`) and `connCount` (`connections.length`) from `project.data`, defaulting safely if either is missing. Clicking the card opens the project; the trash icon stops propagation and deletes instead.

## Auto-save (`App.tsx`)
- A `setInterval` only runs while `view === 'canvas' && activeProject` is set, calling `saveProject(activeProject.id, { elements, connections, characters })` every 30 seconds.
- The effect's dependency array includes `elements`/`connections`/`characters`, so the interval is torn down and recreated on every edit — in practice this behaves like a **30-second debounce after the last edit**, not a fixed-interval save.
- Leaving canvas view (`handleBackToHome`) does one additional explicit `await saveProject(...)` before switching views, so no work is lost by navigating away right after an edit.
- Save failures are silent in both places — the return value isn't checked, so there's currently no user-visible "save failed" state.

## `src/types/project.ts`
- `ProjectData { elements, connections, characters }` — the exact JSON shape persisted server-side.
- `Project { id, user_id, name, created_at, updated_at, data }` — mirrors the RPC row shape.
- `AppUser { id, username }` — never carries the password hash.

---

If you're debugging "my project didn't save" or "login says invalid but I know the password's right," this module plus [Backend/Database Module](./BACKEND_MODULE.md) is the whole surface area — no other file touches auth or persistence.
