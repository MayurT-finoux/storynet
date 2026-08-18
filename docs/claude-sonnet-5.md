# Project Understanding — Claude Sonnet 5

_Written 2026-08-18 after a first-pass exploration of the repository._

## What StoryNet is

StoryNet is a React SPA implementing an infinite, zoomable canvas for visual story mapping — inspired by Apple's Freeform. Writers, architects, and storytellers use it to map plots, ideas, or user journeys as a network of interconnected "pages." The domain model:

- **Projects** — user-owned containers persisted to Supabase, each holding the full canvas state as a JSON blob.
- **Pages** — rich-text nodes on the canvas (`PG-XXXX-XXXX` ids), each with a workflow status (`draft` / `idea` / `done`).
- **Connections** — directional bezier-curve links between pages, capped at 5 outgoing / 5 incoming per page.
- **Characters** — named entities (with aliases/images) that get auto-highlighted inside page text.
- **Text elements** — free-floating text blocks distinct from "pages."

## Tech stack

- React 19.1.1 + TypeScript/JSX, built with Vite 7.1.7 (no root `tsconfig.json` — typing is informal).
- Styling: `styled-components` + large inline style objects (no Tailwind/CSS modules in the live app).
- Rich text: TipTap 3 (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`).
- Drag & drop: `@dnd-kit/core`; pan/zoom helper `react-zoom-pan-pinch` (canvas also has custom pan/zoom logic).
- Backend-as-a-service: Supabase (`@supabase/supabase-js`) — Postgres + RPC functions, not Supabase Auth (custom username/password login hashed with bcrypt server-side).
- No test framework (no Jest/Vitest/RTL/Cypress/Playwright anywhere).
- ESLint 9 flat config for linting.

## Structure

```
src/
  main.tsx, App.tsx           # AppView state machine: 'login' | 'home' | 'canvas'
  components/
    CharacterModal.tsx
    RichTextEditor.tsx
    Canvas/InfiniteCanvas.tsx  # ~1882 lines, core canvas logic
    Canvas/RichTextPage.jsx    # draggable/resizable page w/ TipTap
    home/ProjectCard.tsx
  pages/LoginPage.tsx, HomePage.tsx
  hooks/useAuth.ts, useProjects.ts   # thin wrappers over supabase.rpc(...)
  lib/supabase.ts
  types/canvas.ts, character.ts, project.ts
  constants/canvas.ts
docs/                          # module-level docs (already thorough, see below)
supabase-queries.sql           # RPC functions: login, get_projects, create_project, save_project, delete_project
mcp-servers/supabase/          # separate Node/TS MCP server exposing Supabase tools to Copilot
design-reference/figma/        # unused Tailwind-based design reference, not part of the build
```

Not a monorepo in the formal sense (no workspaces/Turborepo/Nx) — it's a single Vite SPA plus two small side-projects (`mcp-servers/supabase`, `design-reference/figma`) that don't participate in the app build.

## Architecture notes

- **State**: plain `useState`/`useEffect`, no Redux/Zustand/Context. Top-level state lives in `App.tsx` and is prop-drilled into `InfiniteCanvas`, which itself holds most canvas-local state.
- **Persistence**: all reads/writes go through Postgres RPC functions rather than direct table queries; canvas state auto-saves every 30s and on return to Home.
- **Routing**: no router library — a manual `AppView` switch in `App.tsx`.
- **Connections rendering**: absolutely-positioned SVG overlay above HTML page elements, recomputed every render to stay pan/zoom-correct.

## Existing docs (already good, worth reading before changing related code)

`docs/` already has solid module docs: `PROJECT_OVERVIEW.md`, `CANVAS_MODULE.md`, `TEXT_MODULE.md`, `CONNECTIONS_MODULE.md`, `CHARACTERS_MODULE.md`, `DEVELOPER_GUIDELINES.md` (explicitly asks contributors/AI assistants to read docs first and keep them in sync), plus `CHANGELOG.md`, `mobile-support.md` (an open spec, not yet fully implemented), `user-guide.md`, `QUICK_START.md`.

## Recent activity (from git log)

Active work on connection-branch styling (bezier preview, arrowhead, stroke width matching main branch — one such change was just reverted), home page split-panel layout, `ProjectCard` grid, and login page full-height right panel.

## Open questions / things to verify before deep changes

- Whether the mobile touch-support spec in `mobile-support.md` has been implemented or is still aspirational.
- Whether new code should be `.tsx` (guidelines prefer it) even though `RichTextPage.jsx` is still `.jsx`.
- No automated tests exist, so UI changes need manual verification in the running app per `DEVELOPER_GUIDELINES.md`.
