# Canvas Module (InfiniteCanvas)

`InfiniteCanvas` is the heart of StoryNet — the pan/zoom surface, all element rendering and editing, connections, dark mode, JSON import/export, and mobile/touch support all live in this one component.

## Location
`src/components/Canvas/InfiniteCanvas.tsx` (~1900 lines — everything below lives in this single file; there is no `RichTextPage`/`RichTextEditor` split in the live app, see [Text & Page Module](./TEXT_MODULE.md)).

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
  onDarkModeChange?: (darkMode: boolean) => void;
  darkMode?: boolean;
  onBackToHome?: () => void;
  projectName?: string;
}
```
`onAddText` is declared but not actually called — the toolbar's "Add Text" button creates the text element directly via `setElements`, bypassing the prop entirely.

## State Variables (highlights)
- `scale`, `offset` – zoom level and pan offset
- `patternType` – `'grid'` or `'dots'` background
- `isPanning`, `panStart` – mouse-driven panning
- `selectedElement`, `isDraggingElement`, `dragStart` – drag state
- `editingElement` – id of a **page** open in the full-screen edit modal
- `editingTextElement` – id of a **text block** being edited inline (separate from `editingElement` — pages and text blocks have two different edit paths, see [Text & Page Module](./TEXT_MODULE.md))
- `resizingElement`, `resizeStart` – resize state (text elements only — pages are not resizable)
- `hoveredElement` – id under cursor
- `charTooltip` – hover state for the character tooltip shown over highlighted names
- `draggedItemType` – tracks native HTML5 drag-and-drop when placing a new page/text from the toolbar
- **Connection state**: `isConnecting`, `connectingFrom`, `connectingCursor`
- `showJsonModal`, `jsonInput`, `isImportMode` – JSON import/export modal
- `tagMenuFor` – controls the status dropdown for pages
- `darkMode` – light/dark theme toggle, drives a `dm` color-lookup object used throughout the component's inline styles
- `isMobile`, plus touch-only refs `lastTouchDist`, `lastTouchMid`, `touchDragId`, `touchDragStart`, `touchTapTimer`, `touchTapCount` – detected via UA sniff + `matchMedia('(pointer: coarse)')`, drives the touch interaction paths below

## Features & Behavior

### Pan & Zoom
- Drag anywhere not on an element to pan.
- Ctrl/Cmd + scroll wheel to zoom, anchored to the mouse position.
- Zoom buttons in the toolbar (`ZoomIn`, `ZoomOut`, `Maximize2`).
- **Touch**: one-finger drag pans, two-finger pinch zooms (distance/midpoint tracked via the touch refs above).

### Background Pattern
Toggle between grid and dots via the `Grid3x3` toolbar icon.

### Dark Mode
A toggle button (Sun/Moon icon) switches `darkMode`, which feeds a `dm` color map consumed by nearly every inline style in the component (canvas background, page cards, connection lines, modals, tooltip). `onDarkModeChange` reports the change up to `App.tsx`.

### Element Management
- Pages and text blocks both live in the `elements` array (`type: 'page' | 'text'`).
- New elements can be added via the toolbar buttons, or dragged and dropped onto the canvas from the toolbar using native HTML5 drag events.
- Dragging an element repositions it; it snaps to nearby elements within `SNAP_DISTANCE`.
- Only **text elements** are resizable, via a custom drag handle (`data-resize-handle`) — pages have no resize capability.
- Delete via the toolbar trash icon; deleting an element also removes any connections attached to it (handled in `App.tsx`'s `handleDeleteElement`).

### Editing & Selection
Pages and text blocks have two distinct edit paths — see [Text & Page Module](./TEXT_MODULE.md) for the full breakdown:
- Double-clicking a **page** opens a full-screen edit modal (`editingElement`), which also shows Previous/Next navigation cards derived from `connections`.
- Double-clicking a **text** block edits it inline in place (`editingTextElement`), directly on the canvas.

### Status Tags
- Pages show a small status label (`draft`/`idea`/`done`). **Hovering** (not clicking) the tag reveals a dropdown to change it.
- `updateStatus()` calls `onUpdateStatus`.

### Project Navigation
A "Home / {projectName}" breadcrumb lets the user leave the canvas back to the project list (`onBackToHome`).

### Character Tooltip
Hovering a highlighted character name (rendered via `highlightCharacters`, see [Characters Module](./CHARACTERS_MODULE.md)) shows a tooltip with that character's avatar, name, and description.

### JSON Import/Export
- The toolbar has a button to open a modal for exporting the current `elements` + `connections` as JSON.
- Import mode accepts pasted JSON to replace the current canvas contents.

### Network Generation & Import
- `onGenerateNetwork` produces a simplified page-graph object; `onImportNetwork` loads one back in. The generation logic itself lives in `App.tsx`, not this component.

### Connection Interactions
Delegates to the logic documented in [Connections Module](./CONNECTIONS_MODULE.md) — connection state (`isConnecting`, `connectingFrom`, `connectingCursor`) and the SVG overlay both live in this file.

### Mobile / Touch Support
Fully implemented (not just planned):
- Two-finger pinch-zoom and one-finger pan on the canvas container.
- Per-element touch drag, double-tap to edit, and tap-to-connect.
- A dedicated touch connection-start button, plus a mobile-only full-card overlay highlighting valid connection targets while connecting (desktop has no equivalent visual — see [Connections Module](./CONNECTIONS_MODULE.md)).
- A "Tap a page to connect" banner shown while in mobile connection mode.
- A small "mobile"/"desktop" indicator badge reflecting the detected mode.

### Keyboard Shortcuts
- `Esc` cancels an active connection.

### Utility Hooks
- `useEffect` centers the view on mount and when elements are added.
- Global `mousemove`/`mouseup` (and touch equivalents) drive drag/pan/connect interactions outside the component's own DOM nodes.

## SVG Layer for Connections
Connections render in an absolutely-positioned `<svg>` above the canvas elements, recalculated every render. See [Connections Module](./CONNECTIONS_MODULE.md) for path/color details.

## Example Usage
See `src/App.tsx` for how the component is wired to top-level state and callbacks, and [Auth & Home Module](./AUTH_HOME_MODULE.md) for how the app reaches canvas view in the first place.

---

_Refer to the source file for full implementation detail — this doc favors the "what and why," the file has the "how."_
