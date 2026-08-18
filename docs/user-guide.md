# User Guide

An end-user walkthrough of StoryNet. For implementation details, see the module docs linked from [docs/README.md](./README.md) instead — this file is for using the app, not building it.

## Getting Started

1. **Sign in** on the login screen with your username and password (there's no self-service sign-up — an account has to be created for you first).
2. You'll land on the **Home** screen: a searchable grid of your projects. Create a new one or open an existing one.
3. Opening or creating a project takes you into the **canvas** — the infinite, zoomable space where you map out pages, connections, and characters.
4. Use the "Home / {project name}" breadcrumb at the top of the canvas to go back to your project list at any time. Your work is auto-saved roughly 30 seconds after your last edit, and also saved once more the moment you navigate back to Home.

### Canvas Navigation

- **Pan**: click and drag on empty canvas space (or one-finger drag on touch devices).
- **Zoom**: Ctrl/Cmd + scroll wheel, the zoom buttons in the toolbar, or a two-finger pinch on touch devices.
- **Dark mode**: toggle via the sun/moon icon in the toolbar.
- **Background**: switch between a dot grid and a line grid via the toolbar.

### Working with Pages

1. **Creating a page** — click "Add Page" in the toolbar (or drag it onto the canvas). A new card appears.
2. **Editing a page** — double-click it to open the full-screen editor. There's no formatting toolbar today (no bold/italic/lists) — it's plain text editing, saved automatically as you type, no separate Save button.
3. **Moving a page** — click and drag it anywhere on the canvas.
4. **Status** — hover a page's status tag (draft/idea/done) to change it from the dropdown that appears.
5. Pages aren't resizable — only free-floating **text blocks** (added separately from pages) can be resized, via a drag handle on the corner.

### Creating Connections

1. Click the connect button on a page's header to start a connection.
2. Click (or, on touch devices, tap) another page to complete it — a curved line appears linking the two. A page can't connect to itself.
3. Each page allows at most **5 outgoing and 5 incoming connections** — once either limit is hit, further attempts from/to that page are simply ignored.
4. The exact same connection (same two pages, same direction) can't be created twice.
5. Connections automatically update their curve when either page is moved, and are removed automatically if either page is deleted.

### Characters

- Open the Characters panel to add named characters with an optional image and comma-separated aliases.
- While editing a page, any text matching a character's name or alias is automatically highlighted — hover a highlighted name to see that character's avatar and description.
- Highlighting is only visible while a page is open for editing, not in its collapsed card view on the canvas.

### Tips

- Use zoom for an overview, pan closer for detailed work.
- Organize related pages into visual clusters; use connections to show relationships between them.
- Mobile/touch is fully supported: pinch to zoom, drag to pan/move, tap-and-tap to connect two pages, double-tap to edit.

### Keyboard Shortcuts

- **Escape** — cancel an in-progress connection.

That's currently the only keyboard shortcut — there's no undo/redo or Delete-key removal yet; deleting a page or text block is done via the toolbar's trash icon.

### Troubleshooting

- **Login fails with correct-looking credentials** — accounts are created directly in the database; if you're not sure your account exists yet, check with whoever manages the project's Supabase instance.
- **A save doesn't seem to have taken** — saves are silent (no confirmation toast today); give it ~30 seconds after your last edit, or navigate back to Home, which forces an immediate save.
- **Editor seems unresponsive** — click outside the page's edit modal and back in to reset focus.
