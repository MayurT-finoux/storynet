# Connections Module

Connections link pages with directional curves. The interactive/state logic and the SVG rendering both live in `InfiniteCanvas.tsx`; the rules for what's allowed to connect live in `App.tsx`. Documented separately here for clarity.

## Data Model
```ts
interface ConnectionData {
  id: string;
  fromId: string;
  toId: string;
}
```
Connections are stored in a top-level array (prop `connections`, owned by `App.tsx`) and drawn as SVG `<path>` elements inside `InfiniteCanvas.tsx`.

## UI Elements
- **Source button**: a small `+`/network icon inside the page header. Clicking (or tapping, on touch) it starts a connection.
- **Temporary line**: a dashed line follows the cursor/finger until a target is chosen, in the current theme's text color (`dm.text` — black in light mode, white in dark mode; **not** a fixed blue).
- **Final line**: a plain bezier `<path>`, same `dm.text` color, no arrowhead marker.
- **Desktop target hint**: none — there is no visual change on other pages while connecting. A connection completes on `mouseup` over any valid target page.
- **Mobile target hint**: while connecting, non-source pages get a dashed **blue** (`#2563eb`) full-card overlay to make tap targets obvious (there is no per-page hint at all on desktop, so this is mobile-only, not a shared behavior).

### Appearance notes (things that look plausible but aren't true)
- There is **no arrowhead**. A bezier-with-arrowhead style was added in commit `50bfff2` and reverted immediately after in `fcc0019` — connections currently render as plain unmarked curves.
- Lines are **not** solid blue — see above, they follow `dm.text`. Blue (`#2563eb`) only appears on the connect button's active state and the mobile full-card overlay.

## State Variables
- `isConnecting` (boolean) – whether a connection is being created
- `connectingFrom` (string | null) – id of the source page
- `connectingCursor` ({x, y}) – current mouse/touch location while dragging, converted from screen space back into canvas coordinates for the temporary line

## Workflow
1. User clicks/taps the connect button on a page header → `isConnecting = true`, `connectingFrom` set to that page's id.
2. Mouse/touch movement updates `connectingCursor` via global listeners.
3. On desktop, releasing the mouse (`onMouseUp`) over another **page** element (text blocks are not valid targets) calls `onCreateConnection(connectingFrom, element.id)` directly — there's no separate "target" callback (an earlier version of this doc referenced an `onConnectTarget` handler; that name belongs to the unused `RichTextPage.jsx`, not the live code path). On mobile, tapping a highlighted target card does the same via `onTouchStart`.
4. A page can't connect to itself — the code explicitly skips the create call when `connectingFrom === element.id`.
5. `isConnecting` resets and `connections` updates (if the connection was accepted — see limits below).

### Connection limits (enforced in `App.tsx`, `handleCreateConnection`)
- **Duplicates are silently ignored**: an identical `fromId`+`toId` pair won't be added twice.
- **Max 5 outgoing per source page** and **max 5 incoming per target page** — once either cap is hit, further attempts from/to that page are silently dropped (no error shown to the user).

### Canceling
- **Esc** clears connection mode at any time.

### Deletion
- Clicking a rendered connection path calls `onDeleteConnection(connection.id)`.
- Deleting a page removes its connections too, via `App.tsx`'s `handleDeleteElement` filtering `connections` on both `fromId` and `toId`.

## Technical Details
- `getElementCenter()` computes a page's center in canvas coordinates.
- `getConnectionPoints()` picks start/end points on the page edges for a smooth curve.
- `getConnectionPath()` builds the bezier control points for the arc between pages.
- The **temporary** drag line manually converts screen coordinates into canvas space (`(x - offset.x) / scale`); the **final rendered** paths don't need that conversion because the whole content `<div>` already carries a CSS `transform: translate(...) scale(...)`.
- The SVG container has `pointer-events: none`; individual paths re-enable events (`pointer-events: stroke`) so only the line itself is clickable, not the empty space around it.

## Keyboard Shortcuts
- **Esc** – abort the active connection

## Future Considerations (not implemented)
- Bidirectional connections
- Labels on edges
- Different line styles / an arrowhead (previously tried, reverted — see Appearance notes above)
- Smart routing to avoid overlapping curves

---

See `src/components/Canvas/InfiniteCanvas.tsx` for the rendering/interaction code and `src/App.tsx`'s `handleCreateConnection`/`handleDeleteElement` for the connection rules.
