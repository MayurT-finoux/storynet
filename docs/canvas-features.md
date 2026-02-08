# Canvas Features

## Infinite Canvas

The infinite canvas implementation in StoryNet provides a boundless space for organizing and connecting content. It's built using React and several key libraries.

### Core Features

1. **Canvas Properties**
   - Dimensions: 8000x8000 pixels
   - Dot grid background for visual reference
   - Smooth zoom and pan capabilities
   - Centered viewport

2. **Navigation**
   - Zoom: Use mouse wheel or pinch gestures
   - Pan: Click and drag on empty canvas area
   - Auto-centering on initialization

### Rich Text Cards

Cards are the primary content containers on the canvas.

1. **Card Features**
   - Rich text editing with TipTap
   - Resizable containers
   - Draggable positioning
   - Connection capabilities

2. **Card Interactions**
   - Click and drag header to move
   - Drag corner to resize
   - Click '+' button to create connections
   - Rich text formatting options

### Connections

Cards can be connected to create relationships and flows.

1. **Connection Creation**
   - Click '+' button on source card
   - Click target card to establish connection
   - Visual feedback during connection process

2. **Connection Visualization**
   - SVG-based connection lines
   - Automatic path updates during card movement
   - Direction indicators

## Implementation Details

### Key Components

1. **InfiniteCanvas.jsx**
   ```jsx
   const InfiniteCanvas = () => {
     // Main canvas implementation
     // Handles page management and connections
   };
   ```

2. **RichTextPage.jsx**
   ```jsx
   const RichTextPage = ({ id, position, ...props }) => {
     // Individual page implementation
     // Handles text editing and interactions
   };
   ```

### Styling

The canvas uses styled-components for styling:

```jsx
const CanvasContent = styled.div`
  width: 8000px;
  height: 8000px;
  background-image: radial-gradient(...);
  // Additional styling
`;
```

## Usage Examples

1. **Adding a New Card**
   - Click the "Add Page" button
   - New card appears near canvas center
   - Start typing to add content

2. **Creating Connections**
   - Click '+' on source card
   - Click target card
   - Connection is established

3. **Organizing Content**
   - Drag cards to desired positions
   - Resize as needed
   - Create connections to show relationships