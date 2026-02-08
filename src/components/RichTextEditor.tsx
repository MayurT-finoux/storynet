import React, { useState } from 'react';
import './RichTextEditor.css';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  IndentIncrease,
  IndentDecrease,
  Save,
  X
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onSave: (content: string) => void;
  onClose: () => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onSave, onClose }) => {
  const [editableContent, setEditableContent] = useState(content);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (contentRef.current) {
      contentRef.current.focus();
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Edit Page Content</h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          title="Close"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-1 mr-3">
          <button onClick={() => handleFormat('bold')} className="p-2 rounded hover:bg-gray-200 transition-colors" title="Bold">
            <Bold className="h-4 w-4 text-gray-700" />
          </button>
          <button onClick={() => handleFormat('italic')} className="p-2 rounded hover:bg-gray-200 transition-colors" title="Italic">
            <Italic className="h-4 w-4 text-gray-700" />
          </button>
          <button onClick={() => handleFormat('underline')} className="p-2 rounded hover:bg-gray-200 transition-colors" title="Underline">
            <Underline className="h-4 w-4 text-gray-700" />
          </button>
        </div>

        <div className="flex items-center gap-1 mr-3">
          <button onClick={() => handleFormat('justifyLeft')} className="p-2 rounded hover:bg-gray-200 transition-colors" title="Align Left">
            <AlignLeft className="h-4 w-4 text-gray-700" />
          </button>
          <button onClick={() => handleFormat('justifyCenter')} className="p-2 rounded hover:bg-gray-200 transition-colors" title="Align Center">
            <AlignCenter className="h-4 w-4 text-gray-700" />
          </button>
          <button onClick={() => handleFormat('justifyRight')} className="p-2 rounded hover:bg-gray-200 transition-colors" title="Align Right">
            <AlignRight className="h-4 w-4 text-gray-700" />
          </button>
        </div>

        <div className="flex items-center gap-1 mr-3">
          <button onClick={() => handleFormat('insertUnorderedList')} className="p-2 rounded hover:bg-gray-200 transition-colors" title="Bullet List">
            <List className="h-4 w-4 text-gray-700" />
          </button>
          <button onClick={() => handleFormat('insertOrderedList')} className="p-2 rounded hover:bg-gray-200 transition-colors" title="Numbered List">
            <ListOrdered className="h-4 w-4 text-gray-700" />
          </button>
        </div>

        <button 
          onClick={() => onSave(editableContent)} 
          className="ml-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" 
          title="Save"
        >
          <Save className="h-4 w-4" />
        </button>
      </div>

      {/* Editable content area */}
      <div
        className="flex-1 p-6 overflow-y-auto focus:outline-none"
        contentEditable
        ref={contentRef}
        tabIndex={0}
        dangerouslySetInnerHTML={{ __html: editableContent }}
        onInput={(e) => setEditableContent(e.currentTarget.innerHTML)}
        style={{
          minHeight: '300px',
          lineHeight: '1.6',
          fontSize: '16px',
          color: '#374151'
        }}
      />
    </div>
  );
};

export default RichTextEditor;
