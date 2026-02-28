# Infinite Canvas Web Application

An infinite canvas web application inspired by Freeform on iPad, built with React, TypeScript, and Tailwind CSS.

## Features

✅ **Infinite Canvas** - Unlimited pannable and zoomable workspace  
✅ **Pages & Text Elements** - Create and organize content freely  
✅ **Flowchart Connections** - Connect pages with orthogonal lines  
✅ **Rich Text Editor** - Full-screen editor for pages  
✅ **Label System** - Categorize pages with custom labels  
✅ **Responsive UI** - Smooth interactions and animations  

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Create a new Vite + React + TypeScript project:**
```bash
npm create vite@latest infinite-canvas -- --template react-ts
cd infinite-canvas
```

2. **Install dependencies:**
```bash
npm install
npm install lucide-react
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. **Install shadcn/ui:**
```bash
npx shadcn-ui@latest init
```

When prompted, choose:
- Style: Default
- Base color: Slate
- CSS variables: Yes

4. **Install required shadcn components:**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add input
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add textarea
```

5. **Copy the downloaded files:**
   - Place `App.tsx` in `src/`
   - Place all `.tsx` component files in `src/components/`
   - Place `globals.css` in `src/styles/`
   - Place `DOCUMENTATION.md` in root directory

6. **Update your `src/main.tsx`:**
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

7. **Run the development server:**
```bash
npm run dev
```

## Project Structure

```
src/
├── App.tsx                      # Main application
├── components/
│   ├── InfiniteCanvas.tsx      # Canvas with pan/zoom
│   ├── CanvasElement.tsx       # Element renderer
│   ├── LeftSidebar.tsx         # Sidebar navigation
│   ├── PageEditor.tsx          # Full-screen editor
│   ├── Toolbar.tsx             # Toolbar component
│   ├── CodeDownloader.tsx      # Download code files
│   └── ui/                     # shadcn/ui components
├── styles/
│   └── globals.css             # Global styles
└── main.tsx                    # Entry point
```

## Usage

### Canvas Navigation
- **Pan:** Click and drag on empty space
- **Zoom:** Hold Ctrl/Cmd and scroll
- **Reset View:** Click the maximize icon in bottom-right

### Creating Elements
- **Add Text:** Click the "T" icon in left sidebar
- **Add Page:** Click the page icon in left sidebar

### Working with Pages
- **Move:** Click and drag a page
- **Edit:** Double-click to open full-screen editor
- **Connect:** Hover on a page, drag the connector icon to another page
- **Label:** Click the tag icon to add labels (Draft, Idea, or Custom)
- **Delete:** Click the trash icon when hovering

### Page Editor
- **Format:** Use toolbar buttons for bold, italic, underline
- **Align:** Left, center, right, or justify
- **Lists:** Create bulleted or numbered lists
- **Headers:** Apply H1, H2, or H3 styles
- **Save:** Click "Save" or "Close" button
- **Cancel:** Press ESC key

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Vite** - Build tool
- **lucide-react** - Icons
- **Radix UI** - Accessible primitives (via shadcn/ui)
- **shadcn/ui** - Component library

## Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "latest",
    "tailwindcss": "^4.0.0"
  }
}
```

## Configuration Files

### tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### tsconfig.json
Make sure you have:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Components Overview

### App.tsx
Main application component that manages:
- Canvas state (scale, offset)
- Elements (pages, text)
- Connections between pages
- Page editor modal

### InfiniteCanvas.tsx
Handles:
- Pan and zoom interactions
- Background patterns (grid/dots)
- Zoom controls UI
- Coordinate transformations

### CanvasElement.tsx
Renders individual elements:
- Pages (with labels, connectors)
- Text boxes
- Drag interactions
- Delete functionality

### PageEditor.tsx
Full-screen editor with:
- Rich text toolbar
- Text formatting options
- Content editing
- Save/close actions

### LeftSidebar.tsx
Navigation sidebar with:
- Add Text button
- Add Page button
- Code download menu

## Customization

### Changing Colors
Edit the color palette in `src/styles/globals.css`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... more CSS variables */
}
```

### Grid Spacing
In `InfiniteCanvas.tsx`, modify the background size:
```tsx
backgroundSize: `${40 * scale}px ${40 * scale}px`
// Change 40 to your preferred spacing
```

### Page Dimensions
In `App.tsx`, modify the default page size:
```tsx
width: 180,  // Change width
height: 254, // Change height
```

## Troubleshooting

### Issue: Components not found
**Solution:** Make sure you've installed all shadcn components:
```bash
npx shadcn-ui@latest add button dropdown-menu input badge textarea
```

### Issue: Styles not applying
**Solution:** Ensure `globals.css` is imported in `main.tsx`:
```tsx
import './styles/globals.css'
```

### Issue: TypeScript errors
**Solution:** Update your `tsconfig.json` with the configuration above

### Issue: Canvas not panning
**Solution:** Make sure you're clicking on empty space, not on elements

## Performance Tips

1. **Limit elements:** For best performance, keep under 100 elements on canvas
2. **Use zoom wisely:** Higher zoom levels render more detail
3. **Close editor:** Close the page editor when not in use
4. **Browser:** Use Chrome or Edge for best performance

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ⚠️ Mobile browsers (limited support)

## Future Enhancements

Planned features:
- [ ] Local storage persistence
- [ ] Export as PNG/PDF
- [ ] More element types (sticky notes, images)
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] Mobile touch support
- [ ] Collaboration features
- [ ] Templates

## Documentation

For detailed technical documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md)

## License

MIT License - feel free to use this code for your projects!

## Support

For issues or questions:
1. Check the [DOCUMENTATION.md](./DOCUMENTATION.md)
2. Review the code comments
3. Check browser console for errors

## Contributing

This is a demonstration project. Feel free to:
- Fork and modify
- Add new features
- Improve performance
- Fix bugs

## Acknowledgments

- Inspired by Apple Freeform
- Built with React and TypeScript
- UI components from shadcn/ui
- Icons from Lucide

---

**Version:** 1.0  
**Last Updated:** November 9, 2025  
**Built with:** React + TypeScript + Tailwind CSS
