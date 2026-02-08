# Page Connection System - Quick Start Guide

## 🚀 Getting Started in 30 Seconds

### What's New?
Pages can now be connected to each other like a flowchart, showing relationships and narrative flows.

### Basic Usage

#### 1️⃣ Add Pages
- Click **"Add Page"** button (left toolbar)
- Add multiple pages to the canvas

#### 2️⃣ Create Connection
- **Hover** over a page
- **Click** the network icon on the left side (turns blue)
- Move cursor to target page
- **Click** target's network icon
- ✅ Connection created!

#### 3️⃣ Delete Connection
- **Click on the blue line** connecting pages
- ✅ Connection deleted!

#### 4️⃣ Cancel Connection
- Press **ESC** key
- ✅ Cancelled!

---

## 🎨 Visual Reference

### Connection Button States

| State | Look | What It Means |
|-------|------|---------------|
| 🔘 Gray | `○` | Click to start |
| 🔵 Blue | `⊙` | You selected this |
| ⏺️ Dashed | `◯` | Click to complete |

### Connection Types

| Type | Visual | Interaction |
|------|--------|-------------|
| **Completed** | Solid blue curved line with arrow | Click to delete |
| **In Progress** | Dashed blue line following cursor | Release to cancel |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **ESC** | Cancel active connection |

---

## 📋 Step-by-Step Examples

### Example 1: Simple Two-Page Connection
```
1. Click "Add Page" button twice (now you have 2 pages)
2. Hover over first page
3. Click left network icon (turns blue)
4. Move to second page
5. Click its left network icon
6. 🎉 Done! Blue line connects them
```

### Example 2: Multi-Step Flow
```
Page 1 ─→ Page 2 ─→ Page 3 ─→ Page 4

1. Add 4 pages
2. Connect 1→2 (following Example 1)
3. Connect 2→3
4. Connect 3→4
5. 🎉 You have a complete flow!
```

### Example 3: Branching Flow
```
      ├─→ Page 2
      │
Page 1─┤
      │
      └─→ Page 3

1. Add 3 pages
2. Connect 1→2
3. Connect 1→3 (same source, different target)
4. 🎉 Page 1 branches to 2 and 3
```

---

## ✨ Cool Features

### ✅ What You Can Do
- Connect any page to any other page
- Create branching flows (one page → multiple pages)
- Create cycles (A→B→C→A)
- See all connections at once
- Hover to find connection points
- Click lines to delete connections
- Drag pages while connections follow
- Zoom in/out while viewing connections

### ❌ What Won't Work (By Design)
- Connecting a page to itself
- Creating duplicate connections
- Connections appear instantly (no animation)

---

## 🎯 Common Tasks

### Task: Delete a Connection
```
1. Click on the blue line between pages
2. Done! ✅
```

### Task: Rearrange Pages
```
1. Drag pages around (left mouse button)
2. Connections follow automatically
3. Done! ✅
```

### Task: Start Over
```
1. Click delete button on page (trash icon)
2. All connections removed automatically
3. Done! ✅
```

### Task: Check What's Connected
```
1. Hover over page
2. Look for blue lines (connections)
3. Done! ✅
```

---

## 💡 Pro Tips

### Tip 1: Use Grid/Dots for Alignment
- Bottom right: Toggle between grid and dots
- Helps align pages nicely

### Tip 2: Center View
- Bottom right: Click maximize button
- Resets zoom and centers view

### Tip 3: Pan While Connecting
- You can't pan while making a connection
- Press ESC first, then pan

### Tip 4: Visual Feedback
- Source button = Blue (your selection)
- Target buttons = Dashed border (available targets)
- Connection line = Solid (established connection)

### Tip 5: Delete Safely
- Deleting a page removes its connections
- Clicking a line removes just that line
- No confirmation needed!

---

## 🐛 Troubleshooting

### "Connection button not showing"
- ✓ Solution: Hover over the page
- ✓ The button appears on the left side

### "Can't complete connection"
- ✓ Solution: Make sure it's a different page (no self-connections)
- ✓ Try pressing ESC and starting over

### "Connection stuck in blue"
- ✓ Solution: Press ESC to cancel
- ✓ Or click another page

### "Connection disappeared"
- ✓ Check: Did you click on the line? (deletes it)
- ✓ Check: Did you delete a page? (removes its connections)

### "Lines look overlapped"
- ✓ This is normal for complex flows
- ✓ Zoom in to see clearly
- ✓ Rearrange pages for better layout

---

## 📚 Documentation Files

For more details, see:
1. **IMPLEMENTATION_SUMMARY.md** - Overview of what was added
2. **CONNECTION_FEATURE.md** - Detailed feature documentation
3. **CONNECTION_VISUAL_GUIDE.md** - Visual diagrams and layouts
4. **CONNECTION_CODE_EXAMPLES.md** - Code snippets and examples

---

## 🎮 Interactive Demo

Try this sequence:
```
1. Open app
2. Click "Add Page" (adds Page 2)
3. Click "Add Page" (adds Page 3)
4. Hover page "Draft" → click left icon (blue)
5. Hover "Page 2" → click left icon (completed!)
6. Hover "Page 2" → click left icon (blue)
7. Hover "Page 3" → click left icon (completed!)
8. Result: Draft → Page 2 → Page 3
9. Click any blue line to delete
10. Press ESC to cancel
```

---

## ✅ Checklist Before Using

- [ ] Understand basic connection concept
- [ ] Know how to hover over pages
- [ ] Know where the button appears (left side)
- [ ] Know how to press ESC key
- [ ] Know how to click on lines

---

## 🎓 Learning Path

### Beginner
- Create a simple 2-page connection
- Delete a connection
- Create a 3-page flow

### Intermediate
- Create branching flows (multiple targets)
- Create cycles
- Manage complex flows with 5+ pages

### Advanced
- Design complex narrative structures
- Use grid/dots for precise alignment
- Export/share your flows (future feature)

---

## 📱 Works On

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Laptop (all browsers)
- ⚠️ Tablet (works but harder to use)
- ❌ Mobile (requires hover, not ideal)

---

## 🔄 What's Next?

Coming soon:
- [ ] Connection labels
- [ ] Different line styles
- [ ] Conditional indicators
- [ ] Export as image
- [ ] Save/load flows
- [ ] Undo/redo

---

## 📞 Questions?

See full documentation:
- Check .md files in project root
- Review code examples
- Test features yourself!

---

**You're all set! Start connecting pages!** 🚀
