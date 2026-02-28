# StoryNet Project Overview

## What is StoryNet?
StoryNet is a React‑based application providing an infinite, zoomable canvas for creating, editing and interconnecting rich‑text "pages" and managing characters. Inspired by Apple's Freeform, it targets writers, architects, and storytellers who want to map out ideas, plot lines or user journeys in a freeform space.

## Technology Stack
- **Frontend Framework**: React (with TypeScript/JSX)
- **Styling**: styled-components and Tailwind CSS utilities
- **Rich Text Editing**: TipTap
- **Drag & Drop**: @dnd-kit/core
- **Icons**: lucide-react
- **Build Tool**: Vite

## Repository Structure
```
/storynet
  /docs                    # documentation (module‑based MD files)
  /public                  # static assets
  /src
    /components
      CharacterModal.tsx   # character management UI
      RichTextEditor.tsx   # standalone rich‑text editor dialog
      /Canvas
        InfiniteCanvas.tsx # main canvas component with state
        RichTextPage.jsx   # individual page element
    /constants
      canvas.ts            # canvas size & scale constants
    /types
      canvas.ts            # element & connection interfaces
      character.ts         # character interface
    /assets                # images, etc.
    App.tsx                # root application component
    main.tsx               # entry point (ReactDOM.render)
```

## Core Modules
1. **Canvas** – pan/zoom surface, element management, grid/dot background, JSON import/export, network generation.
2. **Pages / Text** – draggable/resizable pages with rich‑text content and editing toolbar.
3. **Connections** – directional links between pages rendered as curved SVG paths.
4. **Characters** – modal for CRUD operations on characters and text highlighting logic.
5. **Utilities** – constants, type definitions, snapping helpers, etc.

## Getting Started
Refer to `docs/QUICK_START.md` or the updated `docs/README.md` for installation and running instructions.

---

This overview is a central hub; click through the module files in the `docs/` directory for detailed information on each part of the codebase.