import { StickyNote, Type, Square, Circle, Image } from 'lucide-react';
import { Button } from './ui/button';

interface ToolbarProps {
  onAddElement: (type: 'sticky' | 'text' | 'rectangle' | 'circle' | 'image') => void;
}

export function Toolbar({ onAddElement }: ToolbarProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onAddElement('sticky')}
        title="Add Sticky Note"
      >
        <StickyNote className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onAddElement('text')}
        title="Add Text"
      >
        <Type className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onAddElement('rectangle')}
        title="Add Rectangle"
      >
        <Square className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onAddElement('circle')}
        title="Add Circle"
      >
        <Circle className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onAddElement('image')}
        title="Add Image"
      >
        <Image className="h-5 w-5" />
      </Button>
    </div>
  );
}
