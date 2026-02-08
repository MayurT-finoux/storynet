# Setup Guide for Infinite Canvas Application

This guide will help you recreate this application from scratch using the downloaded source files.

## Prerequisites Checklist

- [ ] Node.js 18 or higher installed
- [ ] npm or yarn package manager
- [ ] Code editor (VS Code recommended)
- [ ] All downloaded source files ready

## Step-by-Step Setup

### Step 1: Create New Vite Project

Open your terminal and run:

```bash
npm create vite@latest infinite-canvas -- --template react-ts
cd infinite-canvas
```

This creates a new React + TypeScript project with Vite.

### Step 2: Install Core Dependencies

```bash
npm install
npm install lucide-react
```

### Step 3: Install and Configure Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {}
    }
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Step 4: Install shadcn/ui CLI

```bash
npx shadcn-ui@latest init
```

When prompted, select:
- **Would you like to use TypeScript?** → Yes
- **Which style would you like to use?** → Default
- **Which color would you like to use as base color?** → Slate
- **Where is your global CSS file?** → src/styles/globals.css (or default)
- **Would you like to use CSS variables for colors?** → Yes
- **Where is your tailwind.config.js located?** → tailwind.config.js
- **Configure the import alias for components?** → @/components
- **Configure the import alias for utils?** → @/lib/utils

### Step 5: Install Required shadcn Components

Run these commands one by one:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add input
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add textarea
```

### Step 6: Set Up Project Structure

Create the necessary directories:

```bash
mkdir -p src/components
mkdir -p src/styles
```

### Step 7: Copy Downloaded Files

Copy the downloaded files to your project:

1. **Root Files:**
   - `README.md` → project root
   - `DOCUMENTATION.md` → project root
   - `SETUP_GUIDE.md` → project root

2. **Source Files:**
   - `App.tsx` → `src/App.tsx`
   - `globals.css` → `src/styles/globals.css`

3. **Component Files:**
   - `InfiniteCanvas.tsx` → `src/components/InfiniteCanvas.tsx`
   - `CanvasElement.tsx` → `src/components/CanvasElement.tsx`
   - `LeftSidebar.tsx` → `src/components/LeftSidebar.tsx`
   - `PageEditor.tsx` → `src/components/PageEditor.tsx`
   - `Toolbar.tsx` → `src/components/Toolbar.tsx`
   - `CodeDownloader.tsx` → `src/components/CodeDownloader.tsx`

4. **UI Components:**
   - shadcn will have created `src/components/ui/` with the necessary components

### Step 8: Update Entry Point

Replace `src/main.tsx` with:

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

### Step 9: Configure Path Aliases (Optional but Recommended)

Update `tsconfig.json` to include:

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
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Update `vite.config.ts`:

```ts
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### Step 10: Fix Import Paths

If you set up path aliases, update all imports in the component files:

From:
```tsx
import { Button } from './ui/button';
```

To:
```tsx
import { Button } from '@/components/ui/button';
```

OR keep the relative imports as they are (both work).

### Step 11: Install Additional Dependencies (if needed)

```bash
npm install tailwindcss-animate
npm install class-variance-authority
npm install clsx tailwind-merge
```

### Step 12: Run Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 13: Open in Browser

Open http://localhost:5173/ in your browser.

## Verification Checklist

After setup, verify everything works:

- [ ] Canvas loads without errors
- [ ] Can pan canvas by dragging
- [ ] Can zoom with Ctrl/Cmd + Scroll
- [ ] Left sidebar appears with buttons
- [ ] Can add text elements
- [ ] Can add page elements
- [ ] Can drag elements around
- [ ] Can double-click page to open editor
- [ ] Can create connections between pages
- [ ] Can add labels to pages
- [ ] Code download menu works

## Common Issues & Solutions

### Issue: "Cannot find module 'lucide-react'"

**Solution:**
```bash
npm install lucide-react
```

### Issue: "Cannot find module '@/components/ui/button'"

**Solution:** Either:
1. Run `npx shadcn-ui@latest add button`, or
2. Change imports to use relative paths: `'./ui/button'`

### Issue: Module not found errors for UI components

**Solution:** Install missing shadcn components:
```bash
npx shadcn-ui@latest add [component-name]
```

### Issue: TypeScript errors about paths

**Solution:** Make sure `tsconfig.json` has the correct paths configuration (see Step 9)

### Issue: Styles not applying

**Solution:** Verify:
1. `globals.css` is imported in `main.tsx`
2. Tailwind directives are at the top of `globals.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### Issue: "Failed to resolve import" for components

**Solution:** Check that all component files are in the correct directories:
- Main components in `src/components/`
- UI components in `src/components/ui/`

## File Structure After Setup

Your project should look like:

```
infinite-canvas/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/              (shadcn components)
│   │   ├── InfiniteCanvas.tsx
│   │   ├── CanvasElement.tsx
│   │   ├── LeftSidebar.tsx
│   │   ├── PageEditor.tsx
│   │   ├── Toolbar.tsx
│   │   └── CodeDownloader.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── README.md
├── DOCUMENTATION.md
└── SETUP_GUIDE.md
```

## Next Steps

After successful setup:

1. **Read DOCUMENTATION.md** - Understand the architecture
2. **Experiment** - Try adding elements and creating connections
3. **Customize** - Modify colors, sizes, or add new features
4. **Deploy** - Build for production with `npm run build`

## Building for Production

When ready to deploy:

```bash
npm run build
```

This creates a `dist/` folder with optimized files ready for deployment.

To preview the production build:

```bash
npm run preview
```

## Deployment Options

- **Vercel:** Connect your GitHub repo for automatic deployments
- **Netlify:** Drag and drop the `dist/` folder
- **GitHub Pages:** Use `gh-pages` package
- **Any static host:** Upload contents of `dist/` folder

## Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Review the DOCUMENTATION.md file
3. Verify all dependencies are installed
4. Make sure Node.js version is 18+
5. Try deleting `node_modules/` and running `npm install` again

## Package.json Reference

Your `package.json` should include these dependencies:

```json
{
  "name": "infinite-canvas",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "tailwindcss-animate": "latest",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

**Setup Time:** ~15-20 minutes  
**Difficulty:** Intermediate  
**Prerequisites:** Basic React and npm knowledge

Good luck with your setup! 🚀
