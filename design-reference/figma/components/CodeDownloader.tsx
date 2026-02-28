import { Download, Code, FileCode } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

export function CodeDownloader() {
  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const response = await fetch(filePath);
      const content = await response.text();
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Failed to download ${fileName}:`, error);
    }
  };

  const downloadAllFiles = async () => {
    const files = [
      { path: '/README.md', name: 'README.md' },
      { path: '/DOCUMENTATION.md', name: 'DOCUMENTATION.md' },
      { path: '/SETUP_GUIDE.md', name: 'SETUP_GUIDE.md' },
      { path: '/App.tsx', name: 'App.tsx' },
      { path: '/components/InfiniteCanvas.tsx', name: 'InfiniteCanvas.tsx' },
      { path: '/components/CanvasElement.tsx', name: 'CanvasElement.tsx' },
      { path: '/components/LeftSidebar.tsx', name: 'LeftSidebar.tsx' },
      { path: '/components/PageEditor.tsx', name: 'PageEditor.tsx' },
      { path: '/components/Toolbar.tsx', name: 'Toolbar.tsx' },
      { path: '/components/CodeDownloader.tsx', name: 'CodeDownloader.tsx' },
      { path: '/styles/globals.css', name: 'globals.css' },
    ];

    // Download files one by one with a small delay
    for (let i = 0; i < files.length; i++) {
      setTimeout(() => {
        downloadFile(files[i].path, files[i].name);
      }, i * 300); // 300ms delay between downloads
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Download Source Code"
        >
          <Code className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-sm font-semibold">Documentation</div>
        <DropdownMenuItem onClick={() => downloadFile('/README.md', 'README.md')}>
          <FileCode className="h-4 w-4 mr-2" />
          README.md
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadFile('/DOCUMENTATION.md', 'DOCUMENTATION.md')}>
          <FileCode className="h-4 w-4 mr-2" />
          DOCUMENTATION.md
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadFile('/SETUP_GUIDE.md', 'SETUP_GUIDE.md')}>
          <FileCode className="h-4 w-4 mr-2" />
          SETUP_GUIDE.md
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-sm font-semibold">Source Code</div>
        <DropdownMenuItem onClick={() => downloadFile('/App.tsx', 'App.tsx')}>
          <FileCode className="h-4 w-4 mr-2" />
          App.tsx
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadFile('/components/InfiniteCanvas.tsx', 'InfiniteCanvas.tsx')}>
          <FileCode className="h-4 w-4 mr-2" />
          InfiniteCanvas.tsx
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadFile('/components/CanvasElement.tsx', 'CanvasElement.tsx')}>
          <FileCode className="h-4 w-4 mr-2" />
          CanvasElement.tsx
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadFile('/components/LeftSidebar.tsx', 'LeftSidebar.tsx')}>
          <FileCode className="h-4 w-4 mr-2" />
          LeftSidebar.tsx
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadFile('/components/PageEditor.tsx', 'PageEditor.tsx')}>
          <FileCode className="h-4 w-4 mr-2" />
          PageEditor.tsx
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadFile('/components/Toolbar.tsx', 'Toolbar.tsx')}>
          <FileCode className="h-4 w-4 mr-2" />
          Toolbar.tsx
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadFile('/components/CodeDownloader.tsx', 'CodeDownloader.tsx')}>
          <FileCode className="h-4 w-4 mr-2" />
          CodeDownloader.tsx
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-sm font-semibold">Styles</div>
        <DropdownMenuItem onClick={() => downloadFile('/styles/globals.css', 'globals.css')}>
          <FileCode className="h-4 w-4 mr-2" />
          globals.css
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={downloadAllFiles} className="bg-blue-50 hover:bg-blue-100">
          <Download className="h-4 w-4 mr-2" />
          <span className="flex-1">Download All Files</span>
          <span className="text-xs text-gray-500">(11 files)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
