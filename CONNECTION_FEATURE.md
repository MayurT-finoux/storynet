# StoryNet - Page Connection Feature

## Overview
Pages can now be connected to each other using a flowchart-style connector system. Users can create directional connections between pages to map out narrative flows, user journeys, or story structures.

## Features Implemented

### 1. **Connection Data Model**
```typescript
interface ConnectionData {
  id: string;        // Unique identifier
  fromId: string;    // Source page ID
  toId: string;      // Target page ID
}
```

### 2. **Visual Connection Indicators**

#### Connection Button (Left Side of Page)
- **Position**: Left middle edge of each page
- **Appearance**: Circular button with network icon
- **States**:
  - **Default**: Gray (#f5f5f5) - Click to initiate connection
  - **Active**: Blue (#2563eb) with border - Currently selected as source
  - **Target Mode**: Dashed border (#71717a) - Available as connection target

#### Connection Line
- **Style**: Curved bezier path (not straight lines)
- **Color**: Blue (#2563eb) with arrow pointing to destination
- **Interactive**: Click to delete the connection
- **Temporary**: Dashed line shown while dragging to target

### 3. **User Interactions**

#### Creating a Connection
1. Hover over a page to reveal the connection button on the left side
2. Click the network icon to start connection mode
3. Button becomes blue and the page is "selected as source"
4. Other pages show dashed border buttons as connection targets
5. Click the target page's button to complete the connection
6. A curved blue line with arrow appears between the pages

#### Canceling a Connection
- Press **ESC** key during connection mode
- Button reverts to gray state
- Connection mode is cancelled

#### Deleting a Connection
- Click on any connection line to delete it
- Line immediately disappears

#### Deleting a Page
- When a page is deleted, all connected connections are also deleted
- This prevents orphaned connections

### 4. **Visual Feedback**

**Connection Mode Indicators**:
- Source page button: Solid blue with white icon
- Target pages: Gray with dashed border
- Temporary connection: Dashed blue line following cursor

**Hover States**:
- Connection buttons highlight on hover
- Active connection buttons show dark blue on hover
- Target buttons show darker gray on hover

### 5. **Technical Implementation**

#### SVG Layer
- Connections are rendered on an SVG layer above elements
- Bezier curves used for aesthetic curved connections
- Defs element contains arrow markers
- Pointer events set to "none" for SVG, except on paths

#### Coordinate System
- Connections use canvas coordinates (same as elements)
- Transform applied to SVG container for pan/zoom
- Automatic scaling with zoom level

#### State Management
- Connections stored separately from elements in App.tsx
- Each page has independent connection buttons
- Connection mode tracked with global state variables

### 6. **Code Structure**

**New State Variables** (InfiniteCanvas):
```typescript
const [isConnecting, setIsConnecting] = useState(false);
const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
const [connectingCursor, setConnectingCursor] = useState({ x: 0, y: 0 });
```

**New Handler Functions**:
- `getElementCenter(elementId)` - Gets center coordinates of element
- `handleStartConnection(e, fromId)` - Initiates connection mode
- `handleConnectionTarget(e, toId)` - Completes connection
- `handleCancelConnection()` - Cancels active connection

**Props Added to InfiniteCanvas**:
- `connections: ConnectionData[]` - Array of all connections
- `onCreateConnection(fromId, toId)` - Callback to create connection
- `onDeleteConnection(connectionId)` - Callback to delete connection

### 7. **Usage Example**

**Creating a story flow:**
1. Add multiple pages (click Add Page button)
2. Arrange pages on the canvas
3. Hover over first page and click connection button
4. Click target on next page
5. Repeat to create complex flows
6. Click connections to delete them

**Visual result**: Pages connected with curved lines showing narrative flow

### 8. **Keyboard Shortcuts**
- **ESC**: Cancel active connection operation

### 9. **Instructions Updated**
The instructions panel now includes:
- Pan: Drag Canvas
- Zoom: Ctrl/Cmd + Scroll
- Connect: Click icon on page
- Cancel: Press Esc

## Design Notes

### Why Curved Lines?
- More visually appealing than straight lines
- Bezier curves prevent overlapping with elements
- Professional flowchart appearance

### Why Left Side?
- Left side is convention for input/source
- Right side could be reserved for outputs in future
- Less intrusive than right side which had other buttons

### Why Network Icon?
- Universally recognizable for connections
- Consistent with Figma and other design tools
- Stands out visually from other controls

## Future Enhancements

1. **Bidirectional Connections**: Allow connections in both directions
2. **Connection Labels**: Add text labels to connections
3. **Connection Styling**: Different line styles (solid, dashed, etc.)
4. **Connection Types**: Different connection categories
5. **Smart Routing**: Avoid crossing connections
6. **Conditional Branches**: Show decision points
7. **Serialization**: Save/load connection maps
8. **Export**: Export as flowchart image

## Browser Compatibility

- Works in all modern browsers supporting:
  - SVG rendering
  - CSS transforms
  - ES6+ JavaScript
  - React 19+

## Performance Notes

- Connection rendering optimized with SVG (GPU accelerated)
- No performance impact with typical connection counts
- Large canvases (1000+ connections) may require optimization
- Arrow markers cached by ID to prevent duplication
