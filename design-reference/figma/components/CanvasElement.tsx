import { useState, useRef, useEffect } from 'react';
import { Trash2, GripVertical, Minus, Tag } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

export interface CanvasElementData {
  id: string;
  type: 'sticky' | 'text' | 'rectangle' | 'circle' | 'image' | 'page';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  color?: string;
  imageUrl?: string;
  label?: string;
}

interface CanvasElementProps {
  element: CanvasElementData;
  scale: number;
  onUpdate: (id: string, updates: Partial<CanvasElementData>) => void;
  onDelete: (id: string) => void;
  totalPageCount?: number;
  onStartConnection?: (fromId: string, x: number, y: number) => void;
  onDragConnection?: (x: number, y: number) => void;
  onEndConnection?: (toId: string | null) => void;
  isDraggingConnection?: boolean;
  onOpenPageEditor?: (pageId: string) => void;
}

export function CanvasElement({ 
  element, 
  scale, 
  onUpdate, 
  onDelete, 
  totalPageCount = 0,
  onStartConnection,
  onDragConnection,
  onEndConnection,
  isDraggingConnection = false,
  onOpenPageEditor,
}: CanvasElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDraggingConnector, setIsDraggingConnector] = useState(false);
  const [isLabelMenuOpen, setIsLabelMenuOpen] = useState(false);
  const [customLabelInput, setCustomLabelInput] = useState('');
  const dragStartPos = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
    
    // Stop propagation to prevent canvas panning
    e.stopPropagation();
    
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      elementX: element.x,
      elementY: element.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - dragStartPos.current.x) / scale;
      const deltaY = (e.clientY - dragStartPos.current.y) / scale;
      
      onUpdate(element.id, {
        x: dragStartPos.current.elementX + deltaX,
        y: dragStartPos.current.elementY + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, element.id, scale, onUpdate]);

  // Handle connector dragging
  useEffect(() => {
    if (!isDraggingConnector) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (onDragConnection) {
        // Convert screen coordinates to canvas coordinates
        const canvasX = (e.clientX - dragStartPos.current.x) / scale + element.x + element.width;
        const canvasY = (e.clientY - dragStartPos.current.y) / scale + element.y + element.height / 2;
        onDragConnection(canvasX, canvasY);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDraggingConnector(false);
      
      // Check if mouse is over another page element
      const targetElement = document.elementFromPoint(e.clientX, e.clientY);
      const pageElement = targetElement?.closest('[data-element-type="page"]');
      
      if (pageElement && onEndConnection) {
        const targetId = pageElement.getAttribute('data-element-id');
        onEndConnection(targetId);
      } else if (onEndConnection) {
        onEndConnection(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingConnector, element, scale, onDragConnection, onEndConnection]);

  const handleDoubleClick = () => {
    // Double-click no longer opens the page editor or triggers editing.
    // Kept intentionally empty to prevent accidental editor opens.
  };

  const getElementStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      cursor: isDragging ? 'grabbing' : 'grab',
    };

    switch (element.type) {
      case 'sticky':
        return {
          ...baseStyle,
          backgroundColor: element.color || '#fef08a',
          border: '1px solid #fde047',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        };
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'page':
        return {
          ...baseStyle,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)',
        };
      case 'rectangle':
        return {
          ...baseStyle,
          backgroundColor: element.color || '#93c5fd',
          border: '2px solid #3b82f6',
          borderRadius: '4px',
        };
      case 'circle':
        return {
          ...baseStyle,
          backgroundColor: element.color || '#d8b4fe',
          border: '2px solid #a855f7',
          borderRadius: '50%',
        };
      case 'image':
        return {
          ...baseStyle,
          borderRadius: '4px',
          overflow: 'hidden',
        };
      default:
        return baseStyle;
    }
  };

  const handleConnectorMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingConnector(true);
    
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      elementX: element.x,
      elementY: element.y,
    };

    if (onStartConnection) {
      onStartConnection(element.id, element.x + element.width, element.y + element.height / 2);
    }
  };

  return (
    <div
      ref={elementRef}
      style={getElementStyle()}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group ${isDragging ? 'ring-2 ring-blue-500' : ''} ${isHovered ? 'ring-2 ring-blue-300' : ''}`}
      data-element-id={element.id}
      data-element-type={element.type}
    >
      {isHovered && !isDragging && (
        <div className="absolute -top-10 right-0 flex gap-1 bg-white rounded-md shadow-lg border border-gray-200 p-1">
          <div className="flex items-center px-2">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          
          {/* Label menu for pages */}
          {element.type === 'page' && (
            <DropdownMenu open={isLabelMenuOpen} onOpenChange={setIsLabelMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Tag className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 z-[9999]"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(element.id, { label: undefined });
                    setIsLabelMenuOpen(false);
                  }}
                >
                  <span className={!element.label ? 'font-semibold' : ''}>No label</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(element.id, { label: 'Draft' });
                    setIsLabelMenuOpen(false);
                  }}
                >
                  <span className={element.label === 'Draft' ? 'font-semibold' : ''}>Draft</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(element.id, { label: 'Idea' });
                    setIsLabelMenuOpen(false);
                  }}
                >
                  <span className={element.label === 'Idea' ? 'font-semibold' : ''}>Idea</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                  className="flex-col items-start gap-2 p-2"
                >
                  <span className="text-sm">Custom</span>
                  <div className="flex gap-2 w-full">
                    <Input
                      placeholder="Enter label..."
                      value={customLabelInput}
                      onChange={(e) => {
                        e.stopPropagation();
                        setCustomLabelInput(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter' && customLabelInput.trim()) {
                          onUpdate(element.id, { label: customLabelInput.trim() });
                          setCustomLabelInput('');
                          setIsLabelMenuOpen(false);
                        } else if (e.key === 'Escape') {
                          setIsLabelMenuOpen(false);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="h-7 flex-1"
                    />
                    <Button
                      size="sm"
                      className="h-7 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (customLabelInput.trim()) {
                          onUpdate(element.id, { label: customLabelInput.trim() });
                          setCustomLabelInput('');
                          setIsLabelMenuOpen(false);
                        }
                      }}
                      disabled={!customLabelInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* delete removed from the toolbar here; single delete button appears above the page */}
        </div>
      )}

      {/* Connector icon for pages - middle right edge */}
      {element.type === 'page' && isHovered && !isDragging && totalPageCount > 1 && (
        <div 
          className="absolute top-1/2 -right-4 -translate-y-1/2 bg-blue-500 rounded-full p-2 shadow-lg cursor-pointer hover:bg-blue-600 transition-colors"
          onMouseDown={handleConnectorMouseDown}
        >
          <Minus className="h-4 w-4 text-white rotate-90" />
        </div>
      )}

      {/* Label badge for pages */}
      {element.type === 'page' && element.label && (
        <div className="absolute -top-2 right-2 pointer-events-none">
          <Badge variant="secondary" className="text-xs px-2 py-0.5 shadow-sm">
            {element.label}
          </Badge>
        </div>
      )}

      {element.type === 'page' && (
        <div 
          className="w-full h-full p-3 overflow-hidden text-xs pointer-events-none"
          dangerouslySetInnerHTML={{ __html: element.content || '<p class="text-gray-400">Double-click to edit...</p>' }}
        />
      )}

      {element.type === 'image' && element.imageUrl && (
        <img
          src={element.imageUrl}
          alt="Canvas element"
          className="w-full h-full object-cover"
          draggable={false}
        />
      )}

      {isHovered && !isDragging && element.type === 'page' && (
        <button
          className="absolute -top-4 -right-4 w-9 h-9 flex items-center justify-center bg-black rounded-full shadow-md cursor-pointer hover:bg-gray-900 border border-transparent"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(element.id);
          }}
          title="Delete page"
          role="button"
          aria-label="Delete page"
        >
          <Trash2 className="h-4 w-4 text-white" />
        </button>
      )}
    </div>
  );
}
