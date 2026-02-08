import { useEffect, useRef, useState } from 'react';
import { X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Heading1, Heading2, Strikethrough } from 'lucide-react';
import { Button } from './ui/button';

interface PageEditorProps {
  content: string;
  onClose: () => void;
  onSave: (content: string) => void;
}

export function PageEditor({ content, onClose, onSave }: PageEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorContent, setEditorContent] = useState(content);

  useEffect(() => {
    if (editorRef.current && content) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSave = () => {
    if (editorRef.current) {
      onSave(editorRef.current.innerHTML);
    }
    onClose();
  };

  const handleInput = () => {
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleSave}
      />

      {/* Editor container */}
      <div className="relative z-10 bg-white rounded-lg shadow-2xl w-[900px] max-w-[90vw] max-h-[90vh] flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-1 flex-1 flex-wrap">
            {/* Text formatting */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => executeCommand('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => executeCommand('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => executeCommand('underline')}
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => executeCommand('strikeThrough')}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Headings */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => executeCommand('formatBlock', '<h1>')}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => executeCommand('formatBlock', '<h2>')}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Alignment */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => executeCommand('justifyLeft')}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => executeCommand('justifyCenter')}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => executeCommand('justifyRight')}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Lists */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => executeCommand('insertUnorderedList')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => executeCommand('insertOrderedList')}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-auto"
            onClick={handleSave}
            title="Close (Esc)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-auto p-8 bg-gray-100">
          <div className="bg-white shadow-lg mx-auto" style={{ width: '816px', minHeight: '1056px' }}>
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              className="w-full h-full p-16 outline-none"
              style={{
                minHeight: '1056px',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
              suppressContentEditableWarning
            />
          </div>
        </div>
      </div>
    </div>
  );
}
