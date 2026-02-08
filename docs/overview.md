# Project Overview

## About StoryNet

StoryNet is a React-based infinite canvas application inspired by Apple's Freeform. It provides a flexible space for creating, organizing, and connecting rich text cards in a freeform environment.

## Technical Stack

- **Frontend Framework**: React
- **Styling**: styled-components
- **Rich Text Editor**: TipTap
- **Canvas Interaction**: react-zoom-pan-pinch
- **Drag and Drop**: @dnd-kit/core

## Project Structure

```
storynet/
├── docs/                    # Documentation
├── public/                  # Static assets
└── src/
    ├── components/
    │   └── Canvas/         # Canvas-related components
    │       ├── InfiniteCanvas.jsx
    │       └── RichTextPage.jsx
    ├── App.jsx             # Main application component
    ├── main.jsx           # Entry point
    └── index.css          # Global styles
```

## Core Features

### 1. Infinite Canvas
- Boundless workspace
- Smooth zoom and pan
- Visual grid for orientation
- Centered viewport management

### 2. Rich Text Cards
- TipTap-powered rich text editing
- Resizable containers
- Draggable positioning
- Connection capabilities

### 3. Connections
- Visual relationships between cards
- Interactive connection creation
- Automatic path updates
- Direction indicators

## Development Roadmap

### Phase 1: Core Features ✅
- Infinite canvas implementation
- Basic card creation and editing
- Card connections
- Drag and drop functionality

### Phase 2: Enhanced Features 🚧
- Card templates
- Advanced text formatting
- Multiple connection types
- Undo/redo functionality

### Phase 3: Future Enhancements 📋
- Collaborative editing
- Export/import functionality
- Custom themes
- Mobile optimization

## Contributing

1. **Setup Development Environment**
   ```bash
   git clone <repository-url>
   cd storynet
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Design Principles

1. **Simplicity**
   - Intuitive user interface
   - Clear visual feedback
   - Minimal learning curve

2. **Flexibility**
   - Adaptable workspace
   - Customizable cards
   - Versatile connections

3. **Performance**
   - Efficient rendering
   - Smooth interactions
   - Scalable architecture

## License

[License information to be added]