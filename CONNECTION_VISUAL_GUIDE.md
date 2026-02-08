# Page Connection System - Visual Guide

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│   ┌────────────────┐                  ┌────────────────┐    │
│   │   Page 1       │ ────────────────>│   Page 2       │    │
│   │                │  (Connection)    │                │    │
│   └────────────────┘                  └────────────────┘    │
│   ○                                   ○                     │
│   │                                   │                     │
│   │ Connection                        │ Connection          │
│   │ Button                            │ Button              │
│   (Left Side)                        (Left Side)            │
│                                                               │
└─────────────────────────────────────────────────────────────┘

○ = Connection Button (Network icon)
→ = Curved connection line with arrow
```

## Button States

### Default State
```
┌─────────────────────────┐
│    Page                 │
│                         │
│  ○  (Gray Button)       │ <-- Connection Button (on hover)
│                         │
└─────────────────────────┘

Position: Left middle edge
Color: #f5f5f5 (Light Gray)
Icon: Network (light gray)
Action: Click to start connection
```

### Active State (Source)
```
┌─────────────────────────┐
│    Page 1               │
│                         │
│  ⊙  (Blue Button)       │ <-- Currently selected as source
│                         │
└─────────────────────────┘

Color: #2563eb (Blue)
Border: Solid
Icon: Network (white)
Status: Waiting for target selection
```

### Target State (During Connection)
```
┌─────────────────────────┐
│    Page 2               │
│                         │
│  ◯  (Dashed Button)     │ <-- Available as connection target
│                         │
└─────────────────────────┘

Color: #d4d4d8 (Light Gray)
Border: Dashed #71717a
Icon: Network (dark gray)
Action: Click to complete connection
```

## Connection Line Types

### Completed Connection
```
    From Page              To Page
       ┌──────┐              ┌──────┐
       │      │              │      │
    ○──┼──────┼──────────────┼─────>│
       │      │  Blue curved  │      │
       │      │  line w/arrow │      │
       └──────┘              └──────┘

Style: Solid blue (#2563eb), strokeWidth: 2
Shape: Curved bezier path
Endpoint: Arrow marker pointing to target
Interactive: Click to delete
```

### Temporary Connection (While Dragging)
```
    From Page              Mouse Position
       ┌──────┐              
       │      │              
    ○──┼──────┼────────┤ (cursor)
       │      │  Dashed blue
       │      │  line follows cursor
       └──────┘              

Style: Dashed blue (#2563eb), opacity: 0.7
Updates: In real-time as mouse moves
Appearance: Visual feedback during drag
```

## Step-by-Step Workflow

### Step 1: Hover Over Page
```
Mouse hovers over page
        ↓
Connection button appears on left side
(Gray with network icon)
        ↓
User can now click button
```

### Step 2: Click Connection Button
```
User clicks connection button
        ↓
Button becomes blue (active state)
All other pages show dashed target buttons
Temporary line follows cursor
        ↓
Page is now "source" of connection
```

### Step 3: Move to Target Page
```
User moves cursor to target page
        ↓
Dashed line follows cursor in real-time
Target page button highlights on hover
        ↓
Visual feedback shows where connection will go
```

### Step 4: Click Target
```
User clicks on target page's button
        ↓
Connection created between pages
Solid curved blue line appears
Arrow points from source to target
Connection button reverts to normal
        ↓
Connection is complete
```

### Step 5: Delete Connection (Optional)
```
User clicks on connection line
        ↓
Connection immediately deleted
Line disappears
No confirmation needed
```

## Cursor States

| Situation | Cursor |
|-----------|--------|
| On connection button | pointer |
| On connection line | pointer |
| Default canvas | default |
| During pan | grabbing |
| During drag element | grabbing |

## Color Scheme

```
Connection Elements:
├── Line/Arrow: #2563eb (Blue)
├── Active Button: #2563eb (Blue)
├── Hover Active: #1e40af (Dark Blue)
├── Default Button: #f5f5f5 (Light Gray)
├── Hover Default: #e5e5e5 (Medium Gray)
├── Target Button: #d4d4d8 (Pale Gray)
├── Hover Target: #a1a1aa (Medium Gray)
└── Border Target: #71717a (Dark Gray)
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ESC | Cancel active connection |
| (Hover) | Show connection button |
| (Click) | Start/Complete/Delete |

## Error Prevention

### What's Prevented:
- ✗ Connecting a page to itself
- ✗ Duplicate connections (same from/to)
- ✗ Orphaned connections (page deleted = connections deleted)

### What's Allowed:
- ✓ Multiple connections from one page
- ✓ Multiple connections to one page
- ✓ Bi-directional connections (A→B and B→A)
- ✓ Connection cycles

## Performance Notes

| Factor | Impact |
|--------|--------|
| 10 connections | No impact |
| 50 connections | Negligible |
| 100+ connections | Still smooth |
| 1000+ connections | May need optimization |

## Accessibility

- Clear visual states for color-blind users (border, dashes)
- Large clickable areas (36px circles)
- Keyboard escape option
- Tooltip text on buttons
- Clear instructions in panel

## Future Enhancements Possible

```
┌─────────────────────┐
│  Page with label    │
│                     │
│  ○─────Connection 1─→○ (Optional: label)
│  ○─────Connection 2─→○
│  ○                  │
│  Incoming │ Outgoing
│           │
└─────────────────────┘
```

Possible additions:
- Connection labels
- Different line styles
- Conditional logic indicators
- Connection counts
- Smart routing to avoid overlaps
