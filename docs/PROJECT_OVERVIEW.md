# StoryNet Project Overview

## What is StoryNet?
StoryNet is a React-based application providing an infinite, zoomable canvas for creating, editing and interconnecting rich-text "pages" and managing characters. Inspired by Apple's Freeform, it targets writers, architects, and storytellers who want to map out ideas, plot lines or user journeys in a freeform space.

## Technology Stack
- **Frontend Framework**: React 19 (mixed `.tsx`/`.jsx`, built with Vite — no full TS project setup, typing is informal)
- **Styling**: `styled-components` plus large inline style objects (no Tailwind — despite an older version of this doc claiming otherwise, there's no Tailwind config or usage anywhere in `src/`)
- **Rich Text**: TipTap is a dependency but currently unused in the live app — see [Text & Page Module](./TEXT_MODULE.md)
- **Drag & Drop**: `@dnd-kit/core` is a dependency but currently unused in the live app — same note as above; actual drag interactions use raw mouse/touch coordinate math
- **Icons**: `lucide-react`
- **Build Tool**: Vite
- **Backend**: no custom server — the client calls Postgres directly via Supabase RPC functions; see [Backend/Database Module](./BACKEND_MODULE.md)
- **Testing**: none currently set up (no Jest/Vitest/RTL/Cypress/Playwright)

## Repository Structure
```
/storynet
  /docs                      # documentation (module-based MD files, this folder)
  /public                    # static assets
  /src
    /components
      CharacterModal.tsx     # character management UI
      RichTextEditor.tsx     # unused — see TEXT_MODULE.md
      /Canvas
        InfiniteCanvas.tsx   # the main canvas: pan/zoom, elements, connections, dark mode, mobile
        RichTextPage.jsx     # unused — see TEXT_MODULE.md
      /home
        ProjectCard.tsx      # project tile on the Home grid
    /pages
      LoginPage.tsx
      HomePage.tsx
    /hooks
      useAuth.ts             # login/logout, session in localStorage
      useProjects.ts         # project CRUD via Supabase RPC
    /lib
      supabase.ts            # the one Supabase client instance
    /constants
      canvas.ts              # canvas size & scale constants
    /types
      canvas.ts              # element & connection interfaces
      character.ts            # character interface
      project.ts             # project/user interfaces
    /assets                  # images, etc.
    App.tsx                  # root component — view state machine, top-level state, auto-save
    main.tsx                 # entry point
  supabase-queries.sql        # schema + RPC functions (source of truth)
  supabase-fix.sql            # one-time patch, apply after supabase-queries.sql
```

## Core Modules
Each has its own doc in `docs/` — start there before reading source, and update the doc if behavior changes:

1. **[Canvas](./CANVAS_MODULE.md)** – pan/zoom surface, element management, dark mode, grid/dot background, JSON import/export, network generation, mobile/touch.
2. **[Text & Page](./TEXT_MODULE.md)** – how page/text content is actually edited (inline, not via the unused `RichTextPage`/`RichTextEditor` files).
3. **[Connections](./CONNECTIONS_MODULE.md)** – directional links between pages, rendered as curved SVG paths.
4. **[Characters](./CHARACTERS_MODULE.md)** – CRUD modal and inline highlighting/tooltip logic.
5. **[Auth & Projects/Home](./AUTH_HOME_MODULE.md)** – login, the project list, create/open/delete, auto-save.
6. **[Backend/Database](./BACKEND_MODULE.md)** – Supabase schema, RPC functions, security model.

## Getting Started
See [docs/README.md](./README.md) for install/run instructions.

---

This overview is a hub — click through the module docs above for the details relevant to whatever you're changing.
