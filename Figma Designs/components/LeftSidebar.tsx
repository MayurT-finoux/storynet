import { Type, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { CodeDownloader } from './CodeDownloader';

interface LeftSidebarProps {
  onAddText: () => void;
  onAddPage: () => void;
}

export function LeftSidebar({ onAddText, onAddPage }: LeftSidebarProps) {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onAddText}
        title="Add Text"
      >
        <Type className="h-5 w-5" />
      </Button>
      <div className="w-full h-px bg-gray-200" />
      <Button
        variant="ghost"
        size="icon"
        onClick={onAddPage}
        title="Add Page"
      >
        <FileText className="h-5 w-5" />
      </Button>
      <div className="w-full h-px bg-gray-200" />
      <CodeDownloader />
    </div>
  );
}
