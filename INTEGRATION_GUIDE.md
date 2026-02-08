# Character Management System - Integration Guide

## Overview
This React application provides a rich text editor with character management functionality. Users can add characters with names, descriptions, and images, then see those characters highlighted in red when typing their names in the editor. Hovering over highlighted character names shows a Wikipedia-style tooltip with the character's image and description.

## Core Features
1. **Rich Text Editor** - Content-editable div with basic formatting
2. **Character Management** - Add, edit, delete, and preview characters
3. **Image Upload** - Upload and store character images as base64
4. **Real-time Highlighting** - Character names are highlighted in red as you type
5. **Hover Tooltips** - Wikipedia-style popups showing character info on hover

## Architecture Overview

### Component Structure
```
App.jsx (Main container)
├── TextEditor.jsx (Rich text editor with highlighting)
├── CharacterModal.jsx (Character CRUD operations)
└── CharacterTooltip.jsx (Hover popup component)
```

### Data Flow
1. **State Management**: Characters stored in App.jsx state
2. **Props Passing**: Characters passed down to TextEditor for highlighting
3. **Event Handling**: Modal operations bubble up to App.jsx
4. **Real-time Updates**: Text editor re-renders when characters change

## Detailed Component Analysis

### 1. App.jsx - Main Container
**Purpose**: Root component managing global state and layout

**Key State**:
```javascript
const [characters, setCharacters] = useState([])  // Array of character objects
const [isModalOpen, setIsModalOpen] = useState(false)  // Modal visibility
```

**Character Object Structure**:
```javascript
{
  id: timestamp,           // Unique identifier
  name: "Character Name",  // Display name for highlighting
  description: "...",      // Character description
  image: "data:image/..."  // Base64 encoded image
}
```

**Key Functions**:
- `addCharacter()`: Adds new character with auto-generated ID
- `updateCharacter()`: Updates existing character by ID
- `deleteCharacter()`: Removes character from array

**Integration Points**:
- Replace `useState` with your state management (Redux, Zustand, etc.)
- Add persistence layer (localStorage, API calls)
- Customize header layout and styling

### 2. TextEditor.jsx - Rich Text Editor
**Purpose**: Content-editable text area with real-time character highlighting

**Key Features**:
- **Content Editing**: Uses `contentEditable` div instead of textarea for rich formatting
- **Character Detection**: Regex-based matching of character names in text
- **Highlighting**: Wraps matched names in `<span>` with CSS class
- **Tooltip Triggers**: Mouse events on highlighted text show character info

**Core Algorithm - Character Highlighting**:
```javascript
const highlightCharacters = (text) => {
  if (!characters.length) return text
  
  // Sort by length (longest first) to avoid partial matches
  const characterNames = characters.map(char => char.name)
    .sort((a, b) => b.length - a.length)
  
  let highlightedText = text
  
  characterNames.forEach(name => {
    // Word boundary regex for exact matches only
    const regex = new RegExp(`\\b${name}\\b`, 'gi')
    highlightedText = highlightedText.replace(regex, 
      `<span class="highlighted-character" data-character="${name}">${name}</span>`
    )
  })
  
  return highlightedText
}
```

**Event Handling**:
- `onInput`: Captures text changes and updates state
- `onKeyDown`: Handles Enter key for line breaks
- `onMouseOver/Out`: Shows/hides character tooltips

**Integration Considerations**:
- **Performance**: For large texts, consider debouncing the highlighting
- **Cursor Position**: Current implementation has basic cursor preservation
- **Rich Formatting**: Can be extended with more formatting options
- **Undo/Redo**: Add command history for better UX

### 3. CharacterModal.jsx - Character Management
**Purpose**: Modal dialog for all character CRUD operations

**Modal States**:
1. **Add/Edit Form**: Input fields for character data
2. **Character List**: Shows all existing characters
3. **Preview Mode**: Full-screen character details

**Key Features**:
- **Image Upload**: File input with FileReader API for base64 conversion
- **Form Validation**: Basic required field validation
- **Inline Editing**: Edit characters directly in the list
- **Preview Mode**: Dedicated view for character details

**Image Handling**:
```javascript
const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      setFormData({ ...formData, image: e.target.result })
    }
    reader.readAsDataURL(file)  // Converts to base64
  }
}
```

**Integration Points**:
- **File Storage**: Replace base64 with cloud storage (AWS S3, Cloudinary)
- **Validation**: Add more robust form validation
- **Bulk Operations**: Add import/export functionality
- **Search/Filter**: Add character search capabilities

### 4. CharacterTooltip.jsx - Hover Popup
**Purpose**: Wikipedia-style tooltip showing character information

**Positioning Logic**:
- Uses fixed positioning relative to viewport
- Centers horizontally on the hovered element
- Appears above the text with arrow pointer
- Transforms to avoid viewport edges

**Styling Features**:
- **Responsive Layout**: Flexbox for image and text
- **Visual Hierarchy**: Clear typography and spacing
- **Accessibility**: High contrast and readable fonts
- **Animation**: CSS transitions for smooth appearance

## CSS Architecture

### Key Style Classes

**Text Editor Styles**:
```css
.text-editor {
  /* Basic editor styling */
  background: white;
  border: 1px solid #ddd;
  min-height: 400px;
  padding: 1rem;
}

.highlighted-character {
  /* Character highlighting */
  background-color: #ffebee;
  color: #d32f2f;
  font-weight: bold;
  cursor: pointer;
}
```

**Tooltip Styles**:
```css
.character-tooltip {
  /* Positioning and layering */
  position: fixed;
  z-index: 1001;
  pointer-events: none;
}

.tooltip-content {
  /* Card-like appearance */
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}
```

**Modal Styles**:
```css
.modal-overlay {
  /* Full-screen overlay */
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal {
  /* Centered modal dialog */
  background: white;
  border-radius: 8px;
  max-width: 600px;
  max-height: 80vh;
}
```

## Integration Steps

### 1. Basic Integration
```javascript
// Install dependencies
npm install lucide-react

// Copy components
src/components/
├── TextEditor.jsx
├── CharacterModal.jsx
└── CharacterTooltip.jsx

// Copy styles
src/App.css (or integrate into your CSS system)
```

### 2. State Management Integration

**With Redux**:
```javascript
// actions/characters.js
export const addCharacter = (character) => ({
  type: 'ADD_CHARACTER',
  payload: character
})

// reducers/characters.js
const charactersReducer = (state = [], action) => {
  switch (action.type) {
    case 'ADD_CHARACTER':
      return [...state, { ...action.payload, id: Date.now() }]
    // ... other cases
  }
}

// In component
const characters = useSelector(state => state.characters)
const dispatch = useDispatch()
```

**With Context API**:
```javascript
// contexts/CharacterContext.js
const CharacterContext = createContext()

export const CharacterProvider = ({ children }) => {
  const [characters, setCharacters] = useState([])
  
  const addCharacter = (character) => {
    setCharacters(prev => [...prev, { ...character, id: Date.now() }])
  }
  
  return (
    <CharacterContext.Provider value={{ characters, addCharacter }}>
      {children}
    </CharacterContext.Provider>
  )
}
```

### 3. Backend Integration

**API Integration**:
```javascript
// services/characterService.js
export const characterService = {
  async getCharacters() {
    const response = await fetch('/api/characters')
    return response.json()
  },
  
  async createCharacter(character) {
    const response = await fetch('/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(character)
    })
    return response.json()
  },
  
  async uploadImage(file) {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    return response.json()
  }
}
```

**Database Schema** (Example with MongoDB):
```javascript
const characterSchema = {
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },  // URL instead of base64
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 4. Performance Optimizations

**Text Editor Optimizations**:
```javascript
// Debounce highlighting for better performance
import { useMemo, useCallback } from 'react'
import { debounce } from 'lodash'

const TextEditor = ({ characters }) => {
  const debouncedHighlight = useCallback(
    debounce((text) => {
      // Highlighting logic here
    }, 300),
    [characters]
  )
  
  const highlightedContent = useMemo(() => {
    return highlightCharacters(content)
  }, [content, characters])
}
```

**Image Optimization**:
```javascript
// Compress images before upload
const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}
```

### 5. Advanced Features

**Search and Filter**:
```javascript
const CharacterModal = ({ characters, searchTerm, onSearch }) => {
  const filteredCharacters = useMemo(() => {
    return characters.filter(char => 
      char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      char.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [characters, searchTerm])
  
  return (
    <div>
      <input 
        type="text"
        placeholder="Search characters..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
      {/* Render filtered characters */}
    </div>
  )
}
```

**Export/Import**:
```javascript
const exportCharacters = (characters) => {
  const dataStr = JSON.stringify(characters, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'characters.json'
  link.click()
}

const importCharacters = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const characters = JSON.parse(e.target.result)
      setCharacters(characters)
    } catch (error) {
      console.error('Invalid file format')
    }
  }
  reader.readAsText(file)
}
```

## Testing Considerations

### Unit Tests
```javascript
// TextEditor.test.js
import { render, screen } from '@testing-library/react'
import TextEditor from './TextEditor'

test('highlights character names in text', () => {
  const characters = [{ name: 'John', description: 'Hero' }]
  render(<TextEditor characters={characters} />)
  
  // Type text containing character name
  const editor = screen.getByRole('textbox')
  fireEvent.input(editor, { target: { innerText: 'John is brave' } })
  
  // Check if character name is highlighted
  expect(screen.getByText('John')).toHaveClass('highlighted-character')
})
```

### Integration Tests
```javascript
// App.test.js
test('complete character workflow', async () => {
  render(<App />)
  
  // Open modal
  fireEvent.click(screen.getByText('Add Character'))
  
  // Add character
  fireEvent.change(screen.getByLabelText('Character Name'), {
    target: { value: 'Test Character' }
  })
  fireEvent.click(screen.getByText('Add Character'))
  
  // Verify character appears in editor highlighting
  const editor = screen.getByRole('textbox')
  fireEvent.input(editor, { target: { innerText: 'Test Character walks' } })
  
  expect(screen.getByText('Test Character')).toHaveClass('highlighted-character')
})
```

## Customization Options

### Styling Customization
- **Color Schemes**: Modify CSS variables for consistent theming
- **Typography**: Adjust font families and sizes
- **Layout**: Change modal sizes and positioning
- **Animations**: Add CSS transitions and animations

### Functional Customization
- **Character Matching**: Modify regex patterns for different matching rules
- **Tooltip Behavior**: Change trigger events (click vs hover)
- **Editor Features**: Add formatting toolbar, spell check, etc.
- **Data Validation**: Add custom validation rules

### Integration Patterns
- **Micro-frontend**: Package as standalone widget
- **Plugin System**: Create extensible architecture
- **Theme Integration**: Match existing design systems
- **Accessibility**: Add ARIA labels and keyboard navigation

## Troubleshooting

### Common Issues
1. **Cursor Jumping**: Occurs when highlighting interferes with cursor position
2. **Performance**: Large character lists can slow down highlighting
3. **Image Size**: Base64 images increase bundle size significantly
4. **Browser Compatibility**: ContentEditable behavior varies across browsers

### Solutions
1. **Cursor Management**: Implement proper range preservation
2. **Virtualization**: Use virtual scrolling for large lists
3. **Image Optimization**: Implement proper image compression and cloud storage
4. **Polyfills**: Add necessary polyfills for older browsers

This integration guide provides a complete understanding of the character management system and how to adapt it for different applications and requirements.