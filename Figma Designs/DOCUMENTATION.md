# Infinite Canvas Web Application - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [File Structure](#file-structure)
4. [Core Features](#core-features)
5. [Component Breakdown](#component-breakdown)
6. [State Management](#state-management)
7. [User Interactions](#user-interactions)
8. [Styling & Design System](#styling--design-system)
9. [Technical Implementation Details](#technical-implementation-details)
10. [Future Enhancements](#future-enhancements)

---

## Project Overview

This is an **Infinite Canvas Web Application** inspired by Freeform on iPad. It provides users with an unlimited workspace where they can create, organize, and connect pages and text elements in a flexible, visual manner. The application emphasizes a clean, intuitive interface with powerful interaction capabilities.

### Key Objectives
- Provide an infinite, pannable, and zoomable canvas workspace
- Support multiple element types (pages and text)
- Enable visual connections between pages with flowchart-style connectors
- Offer a full-featured rich text editor for pages
- Maintain a clean, minimal design aesthetic
- Ensure smooth, responsive interactions

---

## Architecture & Technology Stack

### Core Technologies
- **React 18** - UI framework with hooks-based state management
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Vite** - Fast build tool and dev server

### Key Libraries
- **lucide-react** - Icon system
- **Radix UI** (via shadcn/ui) - Accessible UI primitives
- **shadcn/ui** - Pre-built, customizable components

### Component Architecture
The application follows a **component-based architecture** with clear separation of concerns:
- Main application state lives in `App.tsx`
- Feature-specific logic is encapsulated in dedicated components
- UI primitives are reusable and accessible
- State flows unidirectionally (props down, callbacks up)

---

## File Structure

```
├── App.tsx                          # Main application component & state
├── components/
│   ├── InfiniteCanvas.tsx          # Canvas with pan/zoom functionality
│   ├── CanvasElement.tsx           # Individual canvas element renderer
│   ├── LeftSidebar.tsx             # Sidebar with Add Text/Page buttons
│   ├── PageEditor.tsx              # Full-screen rich text editor
│   ├── Toolbar.tsx                 # (If exists) Toolbar component
│   ├── figma/
│   │   └── ImageWithFallback.tsx   # Image component with fallback
│   └── ui/                         # shadcn/ui components (40+ components)
│       ├── button.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       └── ...
├── styles/
│   └── globals.css                 # Global styles & Tailwind config
└── DOCUMENTATION.md                # This file
```

---

## Core Features

### 1. **Infinite Canvas**
- Unlimited scrollable workspace in all directions
- No boundaries or edge constraints
- Smooth panning and zooming capabilities
- Visual feedback during interactions

### 2. **Pan & Zoom Controls**
- **Pan:** Click and drag anywhere on the canvas background
- **Zoom:** Ctrl/Cmd + Scroll to zoom in/out
- **Zoom Range:** 10% to 300% (0.1x to 3x)
- **Reset View:** Button to return to default 100% zoom and centered position
- **Visual Indicators:** Current zoom percentage displayed in UI

### 3. **Background Patterns**
- **Two Pattern Types:**
  - **Grid:** Traditional grid lines (40px spacing)
  - **Dots:** Dotted pattern for a cleaner look
- **Toggle Button:** Switch between patterns with one click
- **Responsive:** Patterns scale and move with zoom/pan
- **Color:** Subtle gray (#e5e7eb) for minimal distraction

### 4. **Canvas Elements**

#### **Pages**
- **Visual Design:** Book-like rectangles with curved edges
- **Dimensions:** 180px × 254px (portrait aspect ratio)
- **Shadow & Border:** Elevated appearance with subtle shadows
- **Color:** White background (#ffffff)
- **Labels:** Customizable badges displayed on pages
- **Interactions:**
  - Single tap to select
  - Drag to reposition
  - Double-tap to open in editor
  - Delete button when selected
  - Label menu for categorization

#### **Text Elements**
- **Visual Design:** Simple text boxes
- **Dimensions:** 250px × 100px (default)
- **Editable:** Double-click to edit content
- **Styling:** Clean typography with minimal borders

### 5. **Page Connections**
- **Connector Icon:** Appears on hover at the middle-right edge of pages
- **Visibility:** Only shown when 2+ pages exist
- **Drag-to-Connect:** Click and drag connector to another page
- **Line Style:** Flowchart-style orthogonal paths (right-angle bends)
- **Visual Feedback:**
  - Solid blue lines for established connections
  - Dashed lines while dragging
  - Arrow markers pointing to target
- **Bidirectional Prevention:** Can't create duplicate connections
- **Auto-deletion:** Connections removed when pages are deleted

### 6. **Page Editor (Full-Screen Mode)**
- **Activation:** Double-tap on any page
- **Layout:**
  - Blurred canvas background (backdrop-blur)
  - Centered white page (similar to MS Word)
  - Toolbar above the page
- **Rich Text Toolbar:**
  - **Text Formatting:** Bold, Italic, Underline
  - **Alignment:** Left, Center, Right, Justify
  - **Lists:** Bulleted and numbered lists
  - **Headers:** H1, H2, H3 options
  - **Indentation:** Indent/outdent controls
  - **Actions:** Save and Close buttons
- **Auto-save:** Content automatically saved on close
- **Escape Key:** Close editor quickly with ESC

### 7. **Page Labeling System**
- **Label Types:**
  - **No Label:** Default state (no badge displayed)
  - **Draft:** Predefined label for work-in-progress
  - **Idea:** Predefined label for brainstorming
  - **Custom:** User-defined text labels
- **UI Implementation:**
  - Tag icon button in element toolbar
  - Dropdown menu with all options
  - Visual indicator (bold text) for active selection
  - Input field for custom labels with "Add" button
  - Enter key submits custom label
  - Escape key closes menu
- **Badge Display:**
  - Positioned at top-left of page
  - Color-coded styling
  - Rounded corners
  - High z-index for visibility

### 8. **Left Sidebar Navigation**
- **Position:** Fixed to left side of screen
- **Buttons:**
  - **Add Text:** Creates text element at viewport center
  - **Add Page:** Creates page element at viewport center
- **Styling:** Clean, minimal design with icons
- **Always Visible:** Remains accessible regardless of zoom/pan

---

## Component Breakdown

### **App.tsx** (Main Application)
**Purpose:** Root component managing global state and composition

**State:**
- `scale` - Current zoom level (0.1 to 3)
- `offset` - Canvas pan position {x, y}
- `elements` - Array of all canvas elements
- `connections` - Array of page connections
- `draggingConnection` - Active connection being created
- `editingPageId` - ID of page currently in editor

**Key Functions:**
- `handleAddText()` - Creates new text element at viewport center
- `handleAddPage()` - Creates new page element at viewport center
- `handleUpdateElement()` - Updates element properties
- `handleDeleteElement()` - Removes element and its connections
- `handleStartConnection()` - Initiates connection creation
- `handleDragConnection()` - Updates dragging connection position
- `handleEndConnection()` - Finalizes or cancels connection
- `handleOpenPageEditor()` - Opens full-screen editor for a page
- `handleClosePageEditor()` - Closes editor and returns to canvas

**Render Structure:**
```tsx
<div>
  <LeftSidebar />
  <InfiniteCanvas>
    <svg> {/* Connection lines */} </svg>
    {elements.map(element => <CanvasElement />)}
  </InfiniteCanvas>
  {editingPage && <PageEditor />}
</div>
```

---

### **InfiniteCanvas.tsx**
**Purpose:** Manages canvas viewport, pan, zoom, and background

**Props:**
- `children` - Canvas elements to render
- `scale` - Current zoom level
- `onScaleChange` - Callback for zoom changes
- `offset` - Current pan position
- `onOffsetChange` - Callback for pan changes

**State:**
- `isPanning` - Whether user is currently panning
- `panStart` - Starting position of pan gesture
- `patternType` - Current background ('grid' or 'dots')

**Key Features:**
- **Wheel Event Handling:**
  - Ctrl/Cmd + Wheel = Zoom
  - Regular Wheel = Pan
- **Mouse Event Handling:**
  - Left-click drag = Pan
  - Middle-click drag = Pan
- **Transform Application:**
  - CSS transforms for smooth performance
  - `transform: translate() scale()`
  - Transform origin at top-left (0, 0)
- **Background Rendering:**
  - Dynamic background-image (linear-gradient or radial-gradient)
  - Responsive to scale and offset
  - Optimized with CSS instead of canvas drawing

**Zoom Controls UI:**
- Zoom In (+0.1)
- Zoom Out (-0.1)
- Reset View (1.0, offset 0,0)
- Pattern Toggle
- Zoom Percentage Display

---

### **CanvasElement.tsx**
**Purpose:** Renders individual canvas elements with interactions

**Props:**
- `element` - Element data (type, position, content, etc.)
- `scale` - Current canvas scale (for coordinate conversion)
- `onUpdate` - Callback to update element
- `onDelete` - Callback to delete element
- `totalPageCount` - For connector visibility logic
- `onStartConnection` - Callback to start connection
- `onDragConnection` - Callback during connection drag
- `onEndConnection` - Callback to finalize connection
- `isDraggingConnection` - Whether this element is source
- `onOpenPageEditor` - Callback to open full-screen editor

**State:**
- `isDragging` - Element is being dragged
- `isEditing` - Text content is being edited
- `isHovered` - Mouse is hovering over element
- `isDraggingConnector` - Connector is being dragged
- `isLabelMenuOpen` - Label dropdown is open
- `customLabelInput` - Custom label input value

**Element Types Rendering:**

1. **Page:**
   ```tsx
   <div style={rounded corners, shadow, white background}>
     {label && <Badge>{label}</Badge>}
     <textarea>{content}</textarea>
   </div>
   ```

2. **Text:**
   ```tsx
   <div style={border, padding}>
     <textarea>{content}</textarea>
   </div>
   ```

**Hover Toolbar:**
- Grip icon (visual indicator)
- Tag icon (label menu) - Pages only
- Delete button
- Appears at top when selected/hovered

**Connector Icon:**
- Blue circular button
- Positioned at middle-right edge
- Only visible when:
  - Element is hovered
  - Element is a page
  - Not currently dragging
  - Total page count > 1

**Interaction Handling:**
- **Single Click:** Select element
- **Double Click:** 
  - Text: Enter edit mode
  - Page: Open full-screen editor
- **Drag:** Move element position
- **Connector Drag:** Create connection line
- **Delete:** Remove element

**Coordinate Conversion:**
- Screen coordinates → Canvas coordinates
- Accounts for scale and offset
- Ensures accurate positioning during drag

---

### **PageEditor.tsx**
**Purpose:** Full-screen rich text editor for pages

**Props:**
- `content` - Initial page content
- `onClose` - Callback when editor closes
- `onSave` - Callback to save content changes

**State:**
- `editorContent` - Current text content
- `textFormat` - Current formatting state (bold, italic, etc.)

**Layout Structure:**
```tsx
<div className="fixed inset-0 z-[100]">
  {/* Blurred background */}
  <div className="backdrop-blur-md bg-black/20" onClick={onClose} />
  
  {/* Editor container */}
  <div className="centered">
    {/* Toolbar */}
    <div className="toolbar">
      <FormatButtons />
      <AlignmentButtons />
      <ListButtons />
      <HeaderButtons />
      <IndentButtons />
      <SaveButton />
      <CloseButton />
    </div>
    
    {/* Page */}
    <div className="page-container">
      <textarea contentEditable />
    </div>
  </div>
</div>
```

**Toolbar Features:**
1. **Text Formatting:**
   - Bold, Italic, Underline toggles
   - Visual active state

2. **Text Alignment:**
   - Left, Center, Right, Justify
   - Single selection mode

3. **Lists:**
   - Bulleted (unordered)
   - Numbered (ordered)

4. **Heading Levels:**
   - H1, H2, H3
   - Visual hierarchy

5. **Indentation:**
   - Increase/Decrease indent
   - For nested content

6. **Actions:**
   - Save (primary button)
   - Close (secondary button)

**Keyboard Shortcuts:**
- ESC - Close editor
- Ctrl/Cmd + S - Save (if implemented)

**Styling:**
- A4-like page proportions
- White background (#ffffff)
- Subtle shadow for depth
- Max-width for readability
- Vertical scrolling if content overflows

---

### **LeftSidebar.tsx**
**Purpose:** Provides quick access to add elements

**Props:**
- `onAddText` - Callback to add text element
- `onAddPage` - Callback to add page element

**Layout:**
```tsx
<div className="fixed left-0 top-0 h-screen">
  <div className="flex flex-col gap-2">
    <Button onClick={onAddText}>
      <Type icon />
      Add Text
    </Button>
    <Button onClick={onAddPage}>
      <FileText icon />
      Add Page
    </Button>
  </div>
</div>
```

**Features:**
- Fixed positioning (always visible)
- Vertical button stack
- Icons from lucide-react
- Consistent with global styling

---

## State Management

### Data Structures

**CanvasElementData:**
```typescript
interface CanvasElementData {
  id: string;                    // Unique identifier (timestamp)
  type: 'text' | 'page' | ...;   // Element type
  x: number;                      // Canvas X position
  y: number;                      // Canvas Y position
  width: number;                  // Element width
  height: number;                 // Element height
  content?: string;               // Text/HTML content
  color?: string;                 // (Reserved for future use)
  imageUrl?: string;              // (Reserved for future use)
  label?: string;                 // Page label text
}
```

**Connection:**
```typescript
interface Connection {
  id: string;       // Unique identifier
  from: string;     // Source element ID
  to: string;       // Target element ID
}
```

### State Flow

1. **User Action** (e.g., click "Add Page")
   ↓
2. **Event Handler** (e.g., `handleAddPage()`)
   ↓
3. **State Update** (e.g., `setElements([...elements, newElement])`)
   ↓
4. **React Re-render** (affected components update)
   ↓
5. **UI Update** (new page appears on canvas)

### Coordinate Systems

**Screen Coordinates:**
- Mouse position: `e.clientX`, `e.clientY`
- Relative to browser viewport

**Canvas Coordinates:**
- Element position: `element.x`, `element.y`
- Relative to infinite canvas (not viewport)

**Conversion Formula:**
```typescript
canvasX = (screenX - offset.x) / scale
canvasY = (screenY - offset.y) / scale

screenX = (canvasX * scale) + offset.x
screenY = (canvasY * scale) + offset.y
```

---

## User Interactions

### Canvas Interactions

| Action | Input | Behavior |
|--------|-------|----------|
| Pan | Click + Drag (empty space) | Move viewport |
| Zoom In | Ctrl/Cmd + Scroll Up | Increase scale by 10% |
| Zoom Out | Ctrl/Cmd + Scroll Down | Decrease scale by 10% |
| Reset View | Click reset button | Return to 100%, center |
| Toggle Pattern | Click pattern button | Switch grid ↔ dots |

### Element Interactions

| Action | Input | Behavior |
|--------|-------|----------|
| Select | Click element | Show toolbar, highlight |
| Move | Drag element | Update position |
| Edit Text | Double-click text | Enable editing mode |
| Open Editor | Double-click page | Open full-screen editor |
| Delete | Click delete button | Remove element |
| Label | Click tag button | Open label menu |

### Connection Interactions

| Action | Input | Behavior |
|--------|-------|----------|
| Start | Click + Drag connector icon | Begin connection |
| Preview | Drag to another page | Show dashed line |
| Create | Release on target page | Establish connection |
| Cancel | Release on empty space | Abort connection |

### Editor Interactions

| Action | Input | Behavior |
|--------|-------|----------|
| Format Text | Click toolbar buttons | Apply formatting |
| Type | Keyboard input | Edit content |
| Save | Click Save / Close | Update page content |
| Cancel | ESC / Click background | Close without saving |

---

## Styling & Design System

### Color Palette

**Canvas:**
- Background: `#f9fafb` (gray-50)
- Grid/Dots: `#e5e7eb` (gray-200)

**Elements:**
- Page Background: `#ffffff` (white)
- Text Background: `#ffffff` (white)
- Border: `#d1d5db` (gray-300)
- Shadow: `0 4px 6px rgba(0,0,0,0.1)`

**Interactive:**
- Primary Blue: `#3b82f6` (blue-500)
- Hover Blue: `#2563eb` (blue-600)
- Connector Icon: Blue-500
- Connection Lines: Blue-500

**Labels:**
- Draft: Blue tones
- Idea: Purple/Indigo tones
- Custom: Gray/Neutral tones

### Typography

**Default Styles (from globals.css):**
- System font stack for performance
- Responsive sizing based on HTML elements
- No manual font-size classes needed
- Tailwind v4 typography variables

**Text Hierarchy:**
- H1: Largest, for main titles
- H2: Subtitles
- H3: Section headers
- Body: Default paragraph text

### Spacing

**Grid:**
- Base unit: 40px
- Consistent across zoom levels (scales)

**Element Padding:**
- Pages: 16px (p-4)
- Text boxes: 8px (p-2)
- Toolbar: 8px (p-2)

**Element Margins:**
- Sidebar buttons: 8px gap
- Toolbar icons: 4px gap

### Shadows & Depth

**Elevation Levels:**
1. Canvas elements: `shadow-md`
2. Hover toolbar: `shadow-lg`
3. Page editor: `shadow-2xl`
4. Dropdown menus: `shadow-lg`

### Border Radius

- Pages: `rounded-lg` (8px)
- Buttons: `rounded-md` (6px)
- Connector icon: `rounded-full` (50%)
- Input fields: `rounded-md` (6px)

---

## Technical Implementation Details

### Performance Optimizations

1. **CSS Transforms for Canvas:**
   - Hardware-accelerated transforms
   - No DOM re-layout on pan/zoom
   - `will-change` hints (if needed)

2. **Background Patterns:**
   - CSS gradients (not canvas drawing)
   - No redraw on pan/zoom
   - Efficient rendering

3. **Event Delegation:**
   - Window-level mouse events during drag
   - Cleanup on unmount
   - Prevents memory leaks

4. **Conditional Rendering:**
   - Connector icon only when needed
   - Toolbar only on hover/select
   - Editor only when editing

5. **React Best Practices:**
   - Unique keys for lists
   - Proper dependency arrays
   - Memoization where beneficial (future)

### Connection Line Algorithm

**Flowchart-style Orthogonal Paths:**

```typescript
// Start point: right edge center of source page
const x1 = fromElement.x + fromElement.width;
const y1 = fromElement.y + fromElement.height / 2;

// End point: left edge center of target page
const x2 = toElement.x;
const y2 = toElement.y + toElement.height / 2;

// Midpoint for right-angle bend
const midX = x1 + (x2 - x1) / 2;

// SVG path: horizontal → vertical → horizontal
const path = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
```

**Visual Result:**
```
[Page A] ──────┐
               │
               │
               └────→ [Page B]
```

### Label System Implementation

**Data Storage:**
- Stored in `element.label` (string | undefined)
- undefined = "No label" state
- String value = displayed label text

**Dropdown Menu:**
- Radix UI dropdown (accessible)
- Controlled open state
- High z-index (9999) for proper layering
- Event propagation stopped to prevent canvas interactions

**Custom Input:**
- Separate input field in dropdown
- Add button for explicit confirmation
- Enter key submits
- Escape key closes menu
- Prevents dropdown auto-close while typing

**Badge Rendering:**
- Conditional rendering based on label existence
- Positioned absolutely on page
- Color-coded by label type
- High contrast for visibility

### Z-Index Hierarchy

```
100 - Page Editor (modal)
9999 - Label Dropdown Menu
50 - Zoom Controls
50 - Instructions Panel
40 - Left Sidebar
10 - Element Hover Toolbar
5 - Selected Element
1 - Default Elements
0 - Connection Lines
-1 - Canvas Background
```

### Accessibility Considerations

1. **Keyboard Navigation:**
   - Tab through interactive elements
   - Enter/Space to activate buttons
   - Escape to close modals/menus

2. **ARIA Labels:**
   - Buttons have descriptive labels
   - Icons paired with text
   - Screen reader friendly

3. **Focus Management:**
   - Focus trapped in editor when open
   - Focus returns to canvas on close
   - Visible focus indicators

4. **Color Contrast:**
   - WCAG AA compliant
   - Text readable on backgrounds
   - Icons clearly visible

5. **Touch Support:**
   - Click handlers work with touch
   - Hover states have touch alternatives
   - Mobile-responsive (future enhancement)

---

## Future Enhancements

### Planned Features

1. **Additional Element Types:**
   - Sticky notes (colored)
   - Images (upload/URL)
   - Shapes (rectangles, circles, arrows)
   - Freehand drawing

2. **Advanced Connections:**
   - Curved connection lines (Bezier)
   - Connection labels
   - Conditional connectors (different colors)
   - Connection deletion UI

3. **Collaboration:**
   - Real-time multi-user editing
   - Cursor presence
   - Change history/undo
   - Comments and annotations

4. **Export & Import:**
   - Export as image (PNG/SVG)
   - Export as PDF
   - Save/Load canvas state (JSON)
   - Import from other tools

5. **Organization:**
   - Folders/Groups
   - Search functionality
   - Filter by label
   - Minimap navigation

6. **Rich Content:**
   - Embed videos/iframes
   - LaTeX math equations
   - Code snippets with syntax highlighting
   - Tables

7. **Templates:**
   - Predefined page layouts
   - Quick insert templates
   - Custom template creation

8. **Mobile Support:**
   - Touch gestures (pinch-zoom)
   - Mobile-optimized UI
   - Responsive layout

9. **Persistence:**
   - Local storage auto-save
   - Cloud sync (Supabase integration)
   - Version history

10. **Advanced Editing:**
    - Copy/paste elements
    - Duplicate elements
    - Align/distribute tools
    - Snap to grid

### Technical Improvements

1. **Performance:**
   - Virtual rendering (only visible elements)
   - Canvas-based rendering for many elements
   - Web Workers for heavy computations
   - Progressive loading

2. **Testing:**
   - Unit tests for components
   - Integration tests for interactions
   - E2E tests for user flows
   - Visual regression tests

3. **Documentation:**
   - Interactive tutorial
   - Help tooltips
   - Video tutorials
   - API documentation

4. **Developer Experience:**
   - Plugin system
   - Custom element types
   - Theming API
   - Event hooks

---

## Conclusion

This Infinite Canvas application provides a solid foundation for a visual workspace tool. The clean architecture, performant interactions, and intuitive design create an excellent user experience. The component-based structure makes it easy to extend with new features while maintaining code quality.

**Current State:**
✅ Infinite pan/zoom canvas  
✅ Multiple element types (pages, text)  
✅ Flowchart-style connections  
✅ Full-screen rich text editor  
✅ Label system with custom options  
✅ Responsive interactions  
✅ Clean, minimal design  

**Next Steps:**
- Implement persistence (localStorage or Supabase)
- Add more element types
- Enhance collaboration features
- Mobile optimization

---

*Document Version: 1.0*  
*Last Updated: November 7, 2025*  
*Created with: React + TypeScript + Tailwind CSS*
