# Text & Page Module

This module covers how page and text-block content is actually edited in the running app. **Important:** the app does not use `RichTextPage.jsx` or `RichTextEditor.tsx` — both exist in `src/` but are unused dead code (imported nowhere, or imported and never rendered). The real editing UX is implemented inline inside `InfiniteCanvas.tsx`, described below.

## Live implementation (in `src/components/Canvas/InfiniteCanvas.tsx`)

There are two distinct element types (`CanvasElementData.type`) with two distinct edit paths:

### Pages (`type: 'page'`)
- Double-clicking a page card sets `editingElement` to its id, which opens a full-screen modal.
- The modal renders a plain `contentEditable` `<div>` (`editorRef`) — there is no formatting toolbar; whatever the browser's native contenteditable/keyboard shortcuts provide is all you get (no bold/italic/list buttons).
- Edits are written to `elements` state live via the div's `onInput` handler — there is no explicit Save button, and the modal closes on outside-click.
- The modal also renders a second, invisible overlay `<div>` on top of the real editable one: it shows the output of `highlightCharacters()` (see [Characters Module](./CHARACTERS_MODULE.md)) with transparent text but visible highlighted spans, so character names appear highlighted without needing a real rich-text engine to support inline styled spans inside contenteditable.
- The modal also shows Previous/Next navigation cards, derived from `connections`, to jump between linked pages without leaving the modal.
- The collapsed page card on the canvas itself just renders `element.content` directly — highlighting is **only** visible while a page is open in the edit modal, not on the canvas at large.

### Text blocks (`type: 'text'`)
- Free-floating text elements, distinct from pages, edited inline directly on the canvas (`editingTextElement` state) via their own `contentEditable` div — no modal involved.
- Text blocks are the only element type that's resizable (via a custom drag handle), and are not valid connection targets.

## Unused / legacy files

### `RichTextPage.jsx`
Location: `src/components/Canvas/RichTextPage.jsx`

A draggable/resizable page component built on `@dnd-kit/core`'s `useDraggable` and a TipTap `EditorContent`, with its own connect button (`onStartConnect`/`onConnectTarget` props). It is not imported by `InfiniteCanvas.tsx`, `App.tsx`, or anything else — the only references to it are within its own file. It is a candidate for deletion; if you're touching page rendering/dragging/connecting, the real logic is in `InfiniteCanvas.tsx`, not here.

### `RichTextEditor.tsx`
Location: `src/components/RichTextEditor.tsx`

A modal with a WYSIWYG toolbar (bold/italic/underline/alignment/lists/headings/indent via `document.execCommand`), props `{ content, onSave, onClose }`. It **is** imported into `InfiniteCanvas.tsx` but never rendered as JSX — a dead import. If a real formatting toolbar is ever wanted for the page edit modal, this file is the closest existing starting point, but it isn't wired up today.

---

If you're asked to add rich-text formatting controls, note that today's page editor is a bare `contentEditable` div — there's no toolbar infrastructure currently active to extend; you'd either wire up `RichTextEditor.tsx` or build fresh into the `InfiniteCanvas.tsx` edit modal.
