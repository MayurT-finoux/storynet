# Canvas Module (InfiniteCanvas)

The `InfiniteCanvas` component is the heart of StoryNet. It manages the large virtual drawing surface, element state, pan/zoom behavior, grid background, and connections.

## Location
`src/components/Canvas/InfiniteCanvas.tsx`

## Props
```ts
interface InfiniteCanvasProps {
  elements: CanvasElementData[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElementData[]>>;
  connections: ConnectionData[];
  onAddPage: () => void;
  onAddText: () => void;
  onDeleteElement: (id: string) => void;
  onCreateConnection: (fromId: string, toId: string) => void;
  onDeleteConnection: (connectionId: string) => void;
  onOpenCharacterModal: () => void;
  characters: Character[];
  onGenerateNetwork: () => Record<string, any>;
  onImportNetwork: (elements: CanvasElementData[], connections: ConnectionData[]) => void;
  onUpdateStatus: (elementId: string, status: 'draft'|'idea'|'done') => void;
}
```

## State Variables (highlights)
- `scale` – current zoom level (min/max from constants)
- `offset` – pan offset in pixels
- `patternType` – `'grid'` or `'dots'` background
- `isPanning`, `panStart` – track mouse for panning
- `selectedElement` – id of element currently being dragged
- `isDraggingElement`, `dragStart` – drag state
- `editingElement` – id of element being edited (for rich‑text editor focus)
- `hoveredElement` – id under cursor (for UI feedback)
- **Connection state**: `isConnecting`, `connectingFrom`, `connectingCursor`
- `showJsonModal`, `jsonInput`, `isImportMode` – JSON import/export modal
- `tagMenuFor` – controls status dropdown for pages

## Features & Behavior

### Pan & Zoom
- Drag anywhere not on a page to pan (`mouseDown` + move).
- Scroll wheel with Ctrl/Cmd for zoom; handles zoom toward mouse position.
- Zoom buttons in toolbar (`ZoomIn`, `ZoomOut`, `Maximize2`).

### Background Pattern
Toggle between grid and dots with `Grid3x3` icon.

### Element Management
- Pages and text blocks stored in `elements` array.
- `onAddPage` and `onAddText` callbacks to create new items.
- Drag a page to reposition; snap to nearby pages when within `SNAP_DISTANCE`.
- Resize pages using CSS `resize: both` (handled in `RichTextPage`).
- Delete elements via toolbar trash icon.

### Editing & Selection
- Clicking a page selects it and allows dragging.
- Double‑click or a separate editor may put the element into `editingElement` state.
- `RichTextPage` handles editing internally with TipTap and notifies parent.

### Status Tags
- Pages have a small status label (`draft`/`idea`/`done`); clicking opens a dropdown.
- `updateStatus()` helper calls `onUpdateStatus`.

### JSON Import/Export
- The toolbar includes a button to open a modal for exporting current `elements`+`connections` as JSON.
- Import mode allows pasting valid JSON to replace current canvas.

### Network Generation & Import
- Callbacks to generate a simplified network object based on characters/text.
- `onImportNetwork` can load a previously exported set of nodes/edges.

### Connection Interactions
- Delegates to functions documented in `CONNECTIONS_MODULE.md`.

### Character Highlighting
A helper `highlightCharacters(text)` scans page content and wraps occurrences of character names/aliases with styled `<span>`s.

### Keyboard Shortcuts
- `Esc` cancels active connection mode.

### Utility Hooks
- `useEffect` for centering view on mount and on new elements.
- Mouse event listeners for move/up to handle drag/pan/connecting globally.

## SVG Layer for Connections
Connections are drawn in an absolutely‑positioned `<svg>` above the canvas elements. Bezier paths are recalculated on every render and scale with zoom.

## Example Usage
See `App.tsx` for how the component is integrated with top‑level state and callbacks.


---

_Refer to the source file for the full implementation and comments._