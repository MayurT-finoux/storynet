# Components Documentation

This document details the key components used in StoryNet.

## Component Architecture

### 1. InfiniteCanvas
The main container component that manages the infinite canvas space.

```jsx
src/components/Canvas/InfiniteCanvas.jsx
```

#### Props
- None (Root component)

#### State
```typescript
{
  pages: Array<{
    id: number,
    position: { x: number, y: number }
  }>,
  connections: Array<{
    from: number,
    to: number
  }>,
  pageCounter: number,
  connectingFrom: number | null
}
```

#### Key Methods
- `handleAddPage()`: Creates new page
- `startConnection()`: Initiates page connection
- `finishConnection()`: Completes page connection
- `handleDragEnd()`: Updates page position after drag

### 2. RichTextPage
Individual page component with rich text editing capabilities.

```jsx
src/components/Canvas/RichTextPage.jsx
```

#### Props
```typescript
{
  id: number,
  position: {
    x: number,
    y: number
  },
  onStartConnect: (id: number) => void,
  onConnectTarget: (id: number) => void
}
```

#### Features
- Rich text editing with TipTap
- Resizable container
- Connection management
- Drag and drop positioning
- **Status label**: each page displays a small **capsule‑shaped** label (`draft` by default) attached to the bottom-left border. Clicking the label opens a dropdown **below** it so you can choose `draft`, `idea`, or `done`; the menu stays open until an option is clicked. The capsule is black with white text.

### Styled Components

#### CanvasContainer
```jsx
const CanvasContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: #f5f5f7;
  // Additional styling
`;
```

#### PageContainer
```jsx
const PageContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  // Additional styling
`;
```

## Component Interactions

1. **Page Creation Flow**
   ```
   InfiniteCanvas
   └─ handleAddPage()
      └─ Creates new RichTextPage
   ```

2. **Connection Flow**
   ```
   RichTextPage (source)
   └─ onStartConnect()
      └─ InfiniteCanvas.startConnection()
         └─ RichTextPage (target)
            └─ onConnectTarget()
               └─ InfiniteCanvas.finishConnection()
   ```

## Usage Examples

### Adding a New Page
```jsx
const InfiniteCanvas = () => {
  const handleAddPage = () => {
    const newPage = {
      id: pageCounter,
      position: {
        x: 4000 - 150 + (Math.random() * 100 - 50),
        y: 4000 - 100 + (Math.random() * 100 - 50),
      },
    };
    setPages([...pages, newPage]);
  };
  // ...
};
```

### Creating Connections
```jsx
// In InfiniteCanvas
const startConnection = (fromId) => {
  setConnectingFrom(fromId);
};

const finishConnection = (toId) => {
  if (!connectingFrom || connectingFrom === toId) return;
  setConnections([...connections, { from: connectingFrom, to: toId }]);
};
```