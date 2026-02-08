import { useRef, useState, useEffect, ReactNode } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Grid3x3, Circle } from 'lucide-react';
import { Button } from './ui/button';

interface InfiniteCanvasProps {
  children: ReactNode;
  scale: number;
  onScaleChange: (scale: number) => void;
  offset: { x: number; y: number };
  onOffsetChange: (offset: { x: number; y: number }) => void;
}

export function InfiniteCanvas({ 
  children, 
  scale, 
  onScaleChange, 
  offset, 
  onOffsetChange 
}: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [patternType, setPatternType] = useState<'grid' | 'dots'>('grid');

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      const newScale = Math.max(0.1, Math.min(3, scale + delta * scale));
      onScaleChange(newScale);
    } else {
      onOffsetChange({
        x: offset.x - e.deltaX,
        y: offset.y - e.deltaY,
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Allow panning with left-click, middle-click, or Shift+left-click
    if (e.button === 0 || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  useEffect(() => {
    if (!isPanning) return;

    const handleMouseMove = (e: MouseEvent) => {
      onOffsetChange({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, panStart, onOffsetChange]);

  const handleZoomIn = () => {
    onScaleChange(Math.min(3, scale + 0.1));
  };

  const handleZoomOut = () => {
    onScaleChange(Math.max(0.1, scale - 0.1));
  };

  const handleResetView = () => {
    onScaleChange(1);
    onOffsetChange({ x: 0, y: 0 });
  };

  const togglePattern = () => {
    setPatternType(prev => prev === 'grid' ? 'dots' : 'grid');
  };

  const getBackgroundStyle = () => {
    if (patternType === 'grid') {
      return {
        backgroundImage: `
          linear-gradient(to right, #e5e7eb 1px, transparent 1px),
          linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
        `,
        backgroundSize: `${40 * scale}px ${40 * scale}px`,
        backgroundPosition: `${offset.x}px ${offset.y}px`,
      };
    } else {
      return {
        backgroundImage: `radial-gradient(circle, #e5e7eb 1.5px, transparent 1.5px)`,
        backgroundSize: `${40 * scale}px ${40 * scale}px`,
        backgroundPosition: `${offset.x}px ${offset.y}px`,
      };
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      className="w-full h-screen overflow-hidden relative bg-gray-50"
      style={{
        cursor: isPanning ? 'grabbing' : 'default',
      }}
    >
      {/* Grid or Dots pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={getBackgroundStyle()}
      />

      {/* Canvas content */}
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>

      {/* Zoom controls */}
      <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-2">
        <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleResetView} title="Reset View">
          <Maximize2 className="h-5 w-5" />
        </Button>
        <div className="w-full h-px bg-gray-200" />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={togglePattern} 
          title={patternType === 'grid' ? 'Switch to Dots' : 'Switch to Grid'}
        >
          {patternType === 'grid' ? <Circle className="h-5 w-5" /> : <Grid3x3 className="h-5 w-5" />}
        </Button>
        <div className="text-center text-xs text-gray-600 px-2">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-sm text-gray-600">
        <div><strong>Pan:</strong> Drag Canvas</div>
        <div><strong>Zoom:</strong> Ctrl/Cmd + Scroll</div>
      </div>
    </div>
  );
}
