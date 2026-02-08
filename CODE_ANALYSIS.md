# StoryNet - Complete Code Analysis

## Project Overview

**StoryNet** is a React + Vite-based infinite canvas application designed for creating and editing digital storyboards. It features an infinite pan-and-zoom canvas with draggable page elements and text boxes, similar to tools like Figma or Miro.

### Key Technologies
- **Framework**: React 19.1.1 (JSX/TSX)
- **Build Tool**: Vite 7.1.7
- **Styling**: Styled-components 6.1.19, inline CSS
- **Rich Text**: TipTap (ProseMirror) 3.10.2
- **Drag & Drop**: dnd-kit 6.3.1
- **Zoom/Pan**: react-zoom-pan-pinch 3.7.0
- **Icons**: Lucide-react 0.553.0
- **Language**: TypeScript

---

## Project Structure

```
src/
├── App.tsx              # Root component - manages canvas state
├── App.css              # Global app styles
├── main.tsx             # React entry point
├── index.css            # Base CSS styles
├── components/
│   ├── RichTextEditor.tsx      # Rich text editing component
│   ├── RichTextEditor.css      # Editor styles
│   └── Canvas/
│       ├── InfiniteCanvas.tsx   # Main canvas implementation
│       └── RichTextPage.jsx     # Page element component (with TipTap)
├── types/
│   └── canvas.ts        # TypeScript interfaces
└── constants/
    └── canvas.ts        # Canvas configuration constants
```

---

## Core Components

### 1. **App.tsx** - Root Application Component

**Purpose**: Manages application state and renders the infinite canvas.

**State Management**:
- `elements`: Array of CanvasElementData (pages and text boxes)
- Initial state includes one default page ("Draft")

**Key Functions**:
- `handleAddPage()`: Creates new page elements with auto-positioning
  - Pages are placed horizontally with 50px spacing
  - Uses `CANVAS_SIZE` constant for positioning
  
- `handleAddText()`: Creates new text elements with auto-positioning
  - Text elements are placed with 30px spacing
  - Located below pages by default

- `handleDeleteElement()`: Removes element by ID from the canvas

**Props Passed to InfiniteCanvas**:
- `elements`: All canvas elements
- `setElements`: State setter for element updates
- `onAddPage`, `onAddText`, `onDeleteElement`: Callback functions

**Layout**:
- Full-screen container (100vw × 100vh)
- No overflow (overflow: hidden)

---

### 2. **InfiniteCanvas.tsx** - Main Canvas Component

**Purpose**: Implements the infinite canvas with pan, zoom, dragging, and selection functionality.

**Key State Variables**:
```typescript
- scale: Current zoom level (0.1 - 3x)
- offset: Pan offset {x, y}
- isPanning: Whether user is currently panning
- panStart: Starting position for pan gesture
- selectedElement: Currently selected element ID
- isDraggingElement: Whether element is being dragged
- dragStart: Offset from element position to drag start
- editingElement: ID of element being edited (for modal)
- hoveredElement: Element being hovered over
- patternType: 'grid' or 'dots' background pattern
```

**Core Functionality**:

#### Pan & Zoom
- **Wheel Event Handler** (`handleWheel`):
  - Detects Ctrl/Cmd + Scroll for zoom
  - Regular scroll for panning
  - Zoom maintains mouse position as anchor point
  - Scales between MIN_SCALE (0.1) and MAX_SCALE (3.0)

- **Zoom Controls** (bottom right):
  - Zoom In/Out buttons: ±0.1 scale
  - Reset View: Returns to initial zoom/position
  - Pattern Toggle: Switches between grid and dots

#### Element Dragging
- **handleElementMouseDown**: Initiates drag on left-click
  - Calculates drag offset in canvas coordinates
  - Prevents canvas pan when clicking elements

- **Mouse Move Handler**: Updates element position during drag
  - Converts screen coordinates to canvas coordinates
  - Applies drag offset to maintain click point

#### Rendering
- **Background Pattern**:
  - Grid: Perpendicular lines every 40px
  - Dots: Radial gradients every 40px
  - Pattern adjusts with zoom and pan offset

- **Canvas Transform**:
  ```css
  transform: translate(${offset.x}px, ${offset.y}px) scale(${scale})
  transformOrigin: 0 0
  ```
  - Creates infinite canvas effect
  - Elements scale with zoom

#### Element Rendering
Each element renders as a styled div with:
- Absolute positioning with x, y coordinates
- Different styling for pages vs text
- Selection highlight (blue border when selected)
- Hover buttons (delete, connect)
- Content display with innerHTML

#### UI Elements

**Left Toolbar** (Fixed at left center):
- Add Text button (Type icon)
- Add Page button (FileText icon)

**Right Controls** (Fixed at bottom right):
- Zoom In/Out buttons
- Reset View button
- Grid/Dots toggle
- Current zoom percentage

**Instructions Panel** (Fixed at bottom left):
- Pan: Drag Canvas
- Zoom: Ctrl/Cmd + Scroll

**Delete & Connect Buttons** (On hover):
- Delete (black circle, top right)
- Connect (gray circle, right middle)

---

### 3. **RichTextEditor.tsx** - Rich Text Editing Component

**Purpose**: Provides formatted text editing interface.

**Features**:
- **Formatting Toolbar**:
  - Bold, Italic, Underline
  - Text alignment (Left, Center, Right)
  - Bullet lists, Numbered lists
  - Save/Close buttons

- **Contenteditable Div**:
  - Uses browser's native rich text capabilities
  - `document.execCommand()` for formatting
  - Full HTML support

**Props**:
- `content`: Initial HTML content
- `onSave`: Callback with edited content
- `onClose`: Close editor callback

**Styling**:
- Modal overlay with backdrop blur
- White container with shadow
- Responsive max-width: 4xl
- Max-height: 80vh with scrollable content

---

### 4. **RichTextPage.jsx** - Advanced Page Component

**Purpose**: Alternative page implementation using TipTap editor (currently not actively used in main canvas).

**Features**:
- Styled page container with book/page curl effects
- TipTap editor for advanced text editing
- Draggable pages using dnd-kit
- Resizable pages
- Connection buttons for linking pages
- Hover effects and transitions

**Styling**:
- Book page shadow effects
- Serif font (Georgia)
- Line guide background
- Code block styling
- Blockquote styling

**Note**: This component has advanced styling but is separate from the main InfiniteCanvas implementation.

---

## Data Models

### CanvasElementData Interface

```typescript
interface CanvasElementData {
  id: string;              // Unique identifier
  type: 'page' | 'text';  // Element type
  x: number;              // X position in canvas coordinates
  y: number;              // Y position in canvas coordinates
  width: number;          // Element width
  height: number;         // Element height
  content?: string;       // HTML content (optional)
  label?: string;         // Page label (optional)
}
```

---

## Constants

### canvas.ts
```typescript
CANVAS_SIZE: 8000        // Total virtual canvas size
MIN_SCALE: 0.1          // Minimum zoom level (10%)
MAX_SCALE: 3            // Maximum zoom level (300%)
INIT_SCALE: 1           // Initial zoom level (100%)
```

---

## Workflow / User Interactions

### 1. **Adding Elements**
- User clicks "Add Page" or "Add Text" button
- New element created with unique timestamp-based ID
- Auto-positioned relative to existing elements
- Element immediately visible on canvas

### 2. **Panning**
- User clicks and drags empty canvas area
- Pan offset updated in real-time
- Background pattern moves with pan
- Element positions remain constant (part of transformed container)

### 3. **Zooming**
- User holds Ctrl/Cmd and scrolls
- Scale updated (constrained to MIN/MAX)
- View centered on mouse position
- Background pattern scales with zoom

### 4. **Dragging Elements**
- User clicks on element (page or text)
- Element becomes selected (blue highlight)
- Dragging updates element's x, y position
- Cursor changes to "grabbing"
- Released on mouseup

### 5. **Deleting Elements**
- User hovers over element (delete button appears)
- Click delete button
- Element removed from canvas
- UI updates immediately

### 6. **Editing Content**
- Currently not fully implemented in InfiniteCanvas
- RichTextEditor modal exists but edit trigger commented out
- Content editable via `dangerouslySetInnerHTML`

---

## Coordinate Systems

### Canvas Coordinates vs Screen Coordinates

**Canvas Coordinates**: Position within the virtual 8000×8000 canvas
```
x_canvas = (x_screen - offset.x) / scale
y_canvas = (y_screen - offset.y) / scale
```

**Screen Coordinates**: Position on the browser window

**Conversion Examples**:
- Pan by updating `offset`
- Zoom by updating `scale`
- Element position: Always in canvas coordinates
- Element rendering: Transformed by offset and scale

---

## Styling Approach

### Inline Styles
- Majority of styling is inline via `style` prop
- Enables dynamic styling based on state
- Example: Selection highlight, hover effects

### CSS Classes
- Some components use Tailwind-like class names
- RichTextEditor uses CSS classes for modular styling
- RichTextPage uses styled-components

### Color Palette
```
Primary Blue: #2563eb
Text: #000 / #666 / #a3a3b2
Background: #f5f5f7 (canvas), #fff (elements)
Border: #e5e7eb, #ececf0
Shadow: rgba(0,0,0,0.08 - 0.15)
```

---

## Event Handling

### Mouse Events
- **mousedown**: Pan start, element selection, drag start
- **mousemove**: Pan update, element drag update
- **mouseup**: Pan/drag end, deselect element
- **doubleClick**: Disabled for elements (commented out)

### Wheel Event
- **wheel**: Pan or zoom (conditional based on modifiers)

### Keyboard
- Currently not implemented
- Could support delete key, arrow keys for navigation

---

## Performance Considerations

1. **Transform Rendering**:
   - Uses CSS 3D transforms (GPU accelerated)
   - Single transformed container for all elements

2. **Background Pattern**:
   - CSS-based gradient pattern (no canvas)
   - Updates position/size based on zoom level

3. **Event Listeners**:
   - Added/removed dynamically during pan/drag
   - Cleans up on component unmount

4. **Re-renders**:
   - Element updates trigger full component re-render
   - Could be optimized with useMemo for large canvases

---

## Known Limitations & Future Improvements

### Current Limitations
1. **No persistence**: Data lost on page refresh
2. **Limited editing**: RichTextEditor modal not fully integrated
3. **No collaborative features**: Single-user only
4. **No undo/redo**: No history system
5. **Limited zoom animation**: Instant changes
6. **No keyboard shortcuts**: Only mouse/trackpad

### Potential Improvements
1. Add LocalStorage/Database persistence
2. Implement proper editor integration (TipTap)
3. Add keyboard navigation and shortcuts
4. Implement connection lines between elements
5. Add grouping and multi-select
6. Implement snap-to-grid functionality
7. Add copy/paste
8. Export to PDF/SVG
9. Collaborative editing (WebSockets)
10. History/Undo-Redo system

---

## Build & Development

### Scripts
```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Development Features
- Hot Module Replacement (HMR) for instant updates
- React strict mode for development checks
- Console logging for element updates

---

## Summary

StoryNet is a modern, interactive canvas application built with React and Vite. It provides core functionality for infinite canvas navigation (pan/zoom) and element manipulation (create/drag/delete). The architecture is component-based with clear separation of concerns:

- **App.tsx**: State management
- **InfiniteCanvas.tsx**: Canvas rendering and interaction
- **RichTextEditor.tsx**: Text editing
- **RichTextPage.jsx**: Alternative page implementation

The application uses canvas coordinates for element positioning and applies CSS transforms for the pan/zoom effect, resulting in a smooth, GPU-accelerated user experience. Future development could focus on persistence, advanced editing, and collaborative features.
