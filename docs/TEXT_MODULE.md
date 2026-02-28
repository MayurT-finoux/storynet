# Text & Page Module

This module covers the components responsible for the editable pages and the rich‑text editor dialog.

## `RichTextPage` Component
Location: `src/components/Canvas/RichTextPage.jsx`

### Description
A draggable, resizable container representing a "page". It embeds a TipTap editor and a header with controls.

### Props
```ts
{
  id: string | number;
  position: { x: number; y: number };
  onStartConnect: (id: string) => void;
  onConnectTarget: (id: string) => void;
  style?: React.CSSProperties; // inherited from parent
}
```

### Appearance & Behavior
- Styled with `styled-components` to mimic a paper page (curl effect, shadows).
- Header (`PageHeader`) contains page title and a `ConnectButton` (`+`) for linking.
- Uses `@dnd-kit/core`'s `useDraggable` for drag interactions and `resize: both` CSS for resizing.
- Clicking inside the editor does not propagate to the canvas.
- `EditorContent` from TipTap holds the rich text; initial content is "Start writing here...".

### Events
- `handleResizeEnd` updates the component's internal size state.
- `handleStartConnect`/`handleClick` manage connection interactions with the parent canvas.

## `RichTextEditor` Component
Location: `src/components/RichTextEditor.tsx`

### Description
A modal dialog with a WYSIWYG toolbar that appears when editing page content in a larger overlay.

### Props
```ts
interface RichTextEditorProps {
  content: string;
  onSave: (content: string) => void;
  onClose: () => void;
}
```

### Features
- Content editable `<div>` with formatting commands executed via `document.execCommand`.
- Toolbar buttons for bold, italic, underline, alignment, lists, headings, indent, save, and close.
- Automatically focuses on open and updates state via `onInput` events.
- Styled using utility classes and icons from `lucide-react`.

### Lifecycle
- `useEffect` moves focus to the content area on mount.
- `handleFormat` dispatches formatting commands.
- `onSave` passes the edited HTML back to the parent and is typically used to update the corresponding canvas element.

## Interaction Flow
1. User double‑clicks or selects a page to edit (handled by parent component setting `editingElement`).
2. `RichTextEditor` appears with the current HTML, allowing comprehensive formatting.
3. Clicking Save closes the modal and updates the canvas element's `content`.

---

Refer to the source files for full styling details and any future updates. This module is key for the user’s core writing experience.