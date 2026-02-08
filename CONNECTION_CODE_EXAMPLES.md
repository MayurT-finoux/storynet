# Page Connection System - Code Examples

## Example 1: Basic Setup

### App.tsx
```typescript
import { ConnectionData } from './types/canvas';

function App() {
  // ... elements state ...
  
  // New: Connection state
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  
  // New: Create connection
  const handleCreateConnection = (fromId: string, toId: string) => {
    if (connections.some(conn => conn.fromId === fromId && conn.toId === toId)) {
      return; // Prevent duplicates
    }
    
    setConnections(prev => [...prev, {
      id: `conn-${Date.now()}`,
      fromId,
      toId,
    }]);
  };
  
  // New: Delete connection
  const handleDeleteConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };
  
  // Pass to InfiniteCanvas
  return (
    <InfiniteCanvas
      connections={connections}
      onCreateConnection={handleCreateConnection}
      onDeleteConnection={handleDeleteConnection}
      // ... other props ...
    />
  );
}
```

## Example 2: Connection Data Model

### types/canvas.ts
```typescript
// Represents a connection between two pages
export interface ConnectionData {
  id: string;           // Unique identifier: "conn-1234567890"
  fromId: string;       // Source page ID: "page-1234567890"
  toId: string;         // Target page ID: "page-0987654321"
}

// Example:
const exampleConnection: ConnectionData = {
  id: 'conn-1700641234567',
  fromId: 'page-1700641000000',  // Source page
  toId: 'page-1700641100000',    // Target page
};
```

## Example 3: Connection Button Implementation

### InfiniteCanvas.tsx - Connection Button
```tsx
{/* Connection button - left middle edge */}
{element.type === 'page' && (
  <button
    style={{
      position: 'absolute',
      top: '50%',
      left: '-20px',
      transform: 'translateY(-50%)',
      backgroundColor: isConnecting && connectingFrom === element.id 
        ? '#2563eb'  // Blue when active
        : '#f5f5f5',  // Gray when inactive
      // ... more styles ...
    }}
    onClick={(e) => {
      if (isConnecting && connectingFrom === element.id) {
        handleCancelConnection(); // Toggle off
      } else {
        handleStartConnection(e, element.id); // Toggle on
      }
    }}
  >
    <Network size={16} color={...} />
  </button>
)}
```

## Example 4: Connection Rendering with SVG

### InfiniteCanvas.tsx - SVG Layer
```tsx
<svg
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    pointerEvents: 'none', // Don't block mouse events
    zIndex: 10,
  }}
>
  {/* Render all existing connections */}
  {connections.map(connection => {
    const fromCenter = getElementCenter(connection.fromId);
    const toCenter = getElementCenter(connection.toId);
    
    if (!fromCenter || !toCenter) return null;
    
    // Calculate bezier curve path
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const controlPoint = distance / 2;
    
    const pathData = `
      M ${fromCenter.x} ${fromCenter.y}
      C ${fromCenter.x + controlPoint} ${fromCenter.y},
        ${toCenter.x - controlPoint} ${toCenter.y},
        ${toCenter.x} ${toCenter.y}
    `;
    
    return (
      <g key={connection.id}>
        {/* Connection line */}
        <path
          d={pathData}
          stroke="#2563eb"
          strokeWidth="2"
          fill="none"
          pointerEvents="stroke"
          style={{ cursor: 'pointer' }}
          onClick={() => onDeleteConnection(connection.id)}
        />
        
        {/* Arrow marker */}
        <defs>
          <marker
            id={`arrowhead-${connection.id}`}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#2563eb" />
          </marker>
        </defs>
        
        {/* Apply arrow to line */}
        <path
          d={pathData}
          stroke="none"
          fill="none"
          markerEnd={`url(#arrowhead-${connection.id})`}
        />
      </g>
    );
  })}
  
  {/* Temporary line while connecting */}
  {isConnecting && connectingFrom && getElementCenter(connectingFrom) && (
    <line
      x1={getElementCenter(connectingFrom)!.x}
      y1={getElementCenter(connectingFrom)!.y}
      x2={(connectingCursor.x - offset.x) / scale}
      y2={(connectingCursor.y - offset.y) / scale}
      stroke="#2563eb"
      strokeWidth="2"
      strokeDasharray="5,5"  // Dashed appearance
      opacity="0.7"
    />
  )}
</svg>
```

## Example 5: Connection Helper Functions

### InfiniteCanvas.tsx
```typescript
// Get the center point of an element
const getElementCenter = (elementId: string) => {
  const element = elements.find(el => el.id === elementId);
  if (!element) return null;
  return {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2
  };
};

// Start connection mode from a page
const handleStartConnection = (e: React.MouseEvent, fromId: string) => {
  e.stopPropagation();
  setIsConnecting(true);
  setConnectingFrom(fromId);
};

// Complete connection to a target page
const handleConnectionTarget = (e: React.MouseEvent, toId: string) => {
  e.stopPropagation();
  if (connectingFrom && connectingFrom !== toId) {
    onCreateConnection(connectingFrom, toId); // Create in parent
    setIsConnecting(false);
    setConnectingFrom(null);
  }
};

// Cancel active connection
const handleCancelConnection = () => {
  setIsConnecting(false);
  setConnectingFrom(null);
};
```

## Example 6: Tracking Cursor During Connection

### InfiniteCanvas.tsx - Mouse Move Handler
```typescript
useEffect(() => {
  if (!isConnecting) return;

  const handleMouseMove = (e: MouseEvent) => {
    // Update temporary connection line endpoint
    setConnectingCursor({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    // Cancel if mouse released outside target
    if (isConnecting) {
      handleCancelConnection();
    }
  };

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
}, [isConnecting, connectingFrom]);
```

## Example 7: Keyboard Support

### InfiniteCanvas.tsx - ESC Key Handler
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isConnecting) {
      handleCancelConnection();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isConnecting, connectingFrom]);
```

## Example 8: Complete Connection Flow

```
User Action Sequence:
│
├─> User hovers page
│   └─> Connection button appears
│
├─> User clicks button
│   ├─> isConnecting = true
│   ├─> connectingFrom = "page-123"
│   └─> Button becomes blue
│
├─> User moves cursor
│   └─> connectingCursor updated in real-time
│   └─> Temporary dashed line follows cursor
│
├─> User hovers target page
│   └─> Target button shows dashed border
│
├─> User clicks target button
│   ├─> onCreateConnection("page-123", "page-456") called
│   ├─> Connection added to parent state
│   ├─> isConnecting = false
│   └─> Solid blue line appears
│
└─> Connection complete!
```

## Example 9: Connection Deletion

### Two Ways to Delete

**Method 1: Click on connection line**
```typescript
<path
  d={pathData}
  onClick={() => onDeleteConnection(connection.id)}
/>
```

**Method 2: Delete page (auto-cleanup)**
```typescript
const handleDeleteElement = (id: string) => {
  setElements(prev => prev.filter(el => el.id !== id));
  
  // Remove all connections related to this page
  setConnections(prev => 
    prev.filter(conn => conn.fromId !== id && conn.toId !== id)
  );
};
```

## Example 10: Complex Connection Scenario

```typescript
// Initial state: 3 pages
const elements = [
  { id: 'page-1', type: 'page', ... },
  { id: 'page-2', type: 'page', ... },
  { id: 'page-3', type: 'page', ... },
];

// Create connections: page-1 → page-2 → page-3
const connections = [
  {
    id: 'conn-1',
    fromId: 'page-1',
    toId: 'page-2',
  },
  {
    id: 'conn-2',
    fromId: 'page-2',
    toId: 'page-3',
  },
];

// Rendering:
// [Page 1] ─→ [Page 2] ─→ [Page 3]
//    ○            ○            ○
//    │            │            │
//    └────────────┴────────────┘ (connection buttons)
```

## Example 11: Visual States Cheat Sheet

```typescript
// Source button (active)
backgroundColor: '#2563eb'    // Blue
border: 'none'
icon color: '#fff'            // White

// Default button (inactive)
backgroundColor: '#f5f5f5'    // Light gray
border: 'none'
icon color: '#000'            // Black

// Target button (during connection)
backgroundColor: '#d4d4d8'    // Pale gray
border: '2px dashed #71717a'  // Dark gray dashed
icon color: '#52525b'         // Dark gray

// Connection line
stroke: '#2563eb'             // Blue
strokeWidth: 2
strokeDasharray: '5,5'        // Dashed for temporary
opacity: 0.7                  // For temporary only
```

## Example 12: Error Prevention

```typescript
// Prevent self-connections
const handleConnectionTarget = (e: React.MouseEvent, toId: string) => {
  e.stopPropagation();
  
  // Don't allow connecting to self
  if (connectingFrom && connectingFrom !== toId) {  // ← Check here
    onCreateConnection(connectingFrom, toId);
    setIsConnecting(false);
    setConnectingFrom(null);
  }
};

// Prevent duplicate connections
const handleCreateConnection = (fromId: string, toId: string) => {
  // Check if connection already exists
  if (connections.some(conn => conn.fromId === fromId && conn.toId === toId)) {
    return;  // Silently ignore
  }
  
  // Create new connection
  setConnections(prev => [...prev, {
    id: `conn-${Date.now()}`,
    fromId,
    toId,
  }]);
};
```

---

These examples demonstrate the complete connection system implementation and usage patterns.
