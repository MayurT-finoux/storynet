# Connections Module

Connections allow pages to be linked with directional arrows. The logic is mainly contained in `InfiniteCanvas.tsx` but is documented separately for clarity.

## Data Model
```ts
interface ConnectionData {
  id: string;
  fromId: string;
  toId: string;
}
```
Connections are stored in a top‑level array (prop `connections`) and drawn as SVG `<path>` elements.

## UI Elements
- **Source button**: a small `+` icon inside the page header. Clicking it starts a connection.
- **Target hint**: when connecting, other pages display a dashed gray border on their header.
- **Temporary line**: a blue dashed line follows the cursor until a target is chosen.
- **Final line**: a solid blue curved path with an arrow marker.

### Appearance
- Color: `#2563eb` for active/solid lines
- Dashed preview line during drag
- Arrowhead defined in `<defs>` inside the SVG

## State Variables
- `isConnecting` (boolean) – whether a connection is being created
- `connectingFrom` (string|null) – the id of the source page
- `connectingCursor` ({x, y}) – current mouse location while dragging

## Workflow
1. User clicks the `ConnectButton` on a page header (`onStartConnect` event).
2. `InfiniteCanvas` sets `isConnecting = true` and records `connectingFrom`.
3. Mouse movements update `connectingCursor` via a global `mousemove` handler.
4. Pages other than the source render as valid targets (visual hint).
5. Clicking another page header triggers `onConnectTarget`; `onCreateConnection` is called if the target is not the source.
6. `isConnecting` resets and `connections` array updates.

### Canceling
- Pressing **Esc** at any time clears connection mode.

### Deletion
- Clicking a rendered connection path calls `onDeleteConnection(connection.id)`.
- Deleting a page automatically filters out associated connections in the parent state.

## Technical Details
- `getElementCenter()` computes the center of a page in canvas coordinates.
- `getConnectionPoints()` determines the best start/end points on the page edges for a smooth curve.
- Bezier control points are calculated to give a gentle arc between pages.
- Coordinates are transformed into the SVG coordinate space accounting for current `scale` and `offset`.
- SVG has `pointer-events: none` on the container, with events enabled only on path elements.

## Keyboard Shortcuts
- **Esc** – abort active connection operation

## Future Considerations (seen in docs but not yet implemented)
- Bidirectional connections
- Labels on edges
- Different line styles
- Smart routing to avoid collisions

---

See `src/components/Canvas/InfiniteCanvas.tsx` for the full implementation. This module is cross‑cutting; the visual button lives in `RichTextPage.jsx`.