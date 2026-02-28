import React, { useRef, useState, useEffect } from 'react';
import { Type, FileText, ZoomIn, ZoomOut, Maximize2, Grid3x3, Trash2, Network, User, Code } from 'lucide-react';
import { CanvasElementData, ConnectionData } from '../../types/canvas';
import { Character } from '../../types/character';
import RichTextEditor from '../RichTextEditor';
import { CANVAS_SIZE, MIN_SCALE, MAX_SCALE, INIT_SCALE } from '../../constants/canvas';

interface DraggingConnection {
  from: string;
  toX: number;
  toY: number;
}

export interface InfiniteCanvasProps {
  elements: CanvasElementData[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElementData[]>>;
  connections: ConnectionData[];
  onAddPage: () => void;
  onAddText: () => void;
  onDeleteElement: (id: string) => void;
  onCreateConnection: (fromId: string, toId: string) => void;
  onDeleteConnection: (connectionId: string) => void;
  onOpenCharacterModal: () => void;
  characters: Character[];
  onGenerateNetwork: () => Record<string, any>;
  onImportNetwork: (elements: CanvasElementData[], connections: ConnectionData[]) => void;
  onUpdateStatus: (elementId: string, status: 'draft'|'idea'|'done') => void;
}

const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  elements,
  setElements,
  connections,
  onAddPage,
  onAddText,
  onDeleteElement,
  onCreateConnection,
  onDeleteConnection,
  onOpenCharacterModal,
  characters,
  onGenerateNetwork,
  onImportNetwork,
  onUpdateStatus,
}: InfiniteCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // status dropdown constants
  const statuses: Array<'draft'|'idea'|'done'> = ['draft','idea','done'];

  const updateStatus = (elementId: string, status: 'draft'|'idea'|'done') => {
    setElements(prev => prev.map(el =>
      el.id === elementId ? { ...el, status } : el
    ));
    setTagMenuFor(null);
  };
  const [scale, setScale] = useState(INIT_SCALE);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [patternType, setPatternType] = useState<'grid' | 'dots'>('grid');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectingCursor, setConnectingCursor] = useState({ x: 0, y: 0 });
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [isImportMode, setIsImportMode] = useState(false);
  const [tagMenuFor, setTagMenuFor] = useState<string | null>(null);
  const [draggedItemType, setDraggedItemType] = useState<'page' | 'text' | null>(null);
  const [draggedItemPosition, setDraggedItemPosition] = useState({ x: 0, y: 0 });

  const pageCount = elements.filter(el => el.type === 'page').length;

  const highlightCharacters = (text: string) => {
    if (!characters.length || !text) return text;
    
    const allNames: string[] = [];
    characters.forEach(char => {
      allNames.push(char.name);
      if (char.aliases) {
        allNames.push(...char.aliases);
      }
    });
    
    const sortedNames = allNames.sort((a, b) => b.length - a.length);
    
    let highlightedText = text;
    
    sortedNames.forEach(name => {
      const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, 
        `<span style="color: #d32f2f; font-weight: bold; background-color: #ffebee;">${name}</span>`
      );
    });
    
    return highlightedText;
  };

  const SNAP_DISTANCE = 30; // Distance in pixels to trigger snap
  const PAGE_PADDING = 20; // Space between snapped pages

  // Check if pages overlap and calculate snap position
  const getSnapPosition = (draggingElement: CanvasElementData) => {
    let snapX = draggingElement.x;
    let snapY = draggingElement.y;
    let shouldSnap = false;

    // Only snap pages to pages
    if (draggingElement.type !== 'page') {
      return { x: snapX, y: snapY, shouldSnap };
    }

    // Check against all other pages
    const otherPages = elements.filter(
      el => el.type === 'page' && el.id !== draggingElement.id
    );

    for (const otherPage of otherPages) {
      const dx = Math.abs(
        (draggingElement.x + draggingElement.width / 2) -
        (otherPage.x + otherPage.width / 2)
      );
      const dy = Math.abs(
        (draggingElement.y + draggingElement.height / 2) -
        (otherPage.y + otherPage.height / 2)
      );

      // Get closest edges
      const distToRight = Math.abs(draggingElement.x - (otherPage.x + otherPage.width));
      const distToLeft = Math.abs(draggingElement.x + draggingElement.width - otherPage.x);
      const distToBottom = Math.abs(draggingElement.y - (otherPage.y + otherPage.height));
      const distToTop = Math.abs(draggingElement.y + draggingElement.height - otherPage.y);

      const minDist = Math.min(distToRight, distToLeft, distToBottom, distToTop);

      // If close to another page, snap to it
      if (minDist < SNAP_DISTANCE) {
        shouldSnap = true;

        // Snap to right of other page
        if (minDist === distToRight && dx > dy) {
          snapX = otherPage.x + otherPage.width + PAGE_PADDING;
          snapY = Math.max(
            draggingElement.y,
            Math.min(
              draggingElement.y,
              otherPage.y - (draggingElement.height - otherPage.height) / 2
            )
          );
        }
        // Snap to left of other page
        else if (minDist === distToLeft && dx > dy) {
          snapX = otherPage.x - draggingElement.width - PAGE_PADDING;
          snapY = Math.max(
            draggingElement.y,
            Math.min(
              draggingElement.y,
              otherPage.y - (draggingElement.height - otherPage.height) / 2
            )
          );
        }
        // Snap to bottom of other page
        else if (minDist === distToBottom && dy > dx) {
          snapY = otherPage.y + otherPage.height + PAGE_PADDING;
          snapX = Math.max(
            draggingElement.x,
            Math.min(
              draggingElement.x,
              otherPage.x - (draggingElement.width - otherPage.width) / 2
            )
          );
        }
        // Snap to top of other page
        else if (minDist === distToTop && dy > dx) {
          snapY = otherPage.y - draggingElement.height - PAGE_PADDING;
          snapX = Math.max(
            draggingElement.x,
            Math.min(
              draggingElement.x,
              otherPage.x - (draggingElement.width - otherPage.width) / 2
            )
          );
        }

        break;
      }
    }

    return { x: snapX, y: snapY, shouldSnap };
  };

  useEffect(() => {
    // Center the view on the middle of the canvas
    const centerX = CANVAS_SIZE / 2 - window.innerWidth / 2;
    const centerY = CANVAS_SIZE / 2 - window.innerHeight / 2;
    setOffset({ x: -centerX, y: -centerY });
  }, []);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isConnecting) {
        handleCancelConnection();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConnecting, connectingFrom]);

  // Debug effect to log when elements change
  useEffect(() => {
    console.log('Elements updated in InfiniteCanvas:', elements);
  }, [elements]);

  // Initialize editor content when editing
  useEffect(() => {
    if (editingElement && editorRef.current) {
      const element = elements.find(el => el.id === editingElement);
      if (element && editorRef.current.innerHTML !== element.content) {
        editorRef.current.innerHTML = element.content || '';
        editorRef.current.focus();
      }
    }
  }, [editingElement, elements]);

  const handleWheel = (e: React.WheelEvent) => {
    if (editingElement || isConnecting) return;
    const isZoomGesture = e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > 0 && Math.abs(e.deltaX) < 2 && e.deltaMode === 0 && (e as any).wheelDeltaY !== undefined;
    if (isZoomGesture) {
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta * scale));
      
      // Zoom towards mouse position
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const scaleRatio = newScale / scale;
        
        setOffset(prev => ({
          x: mouseX - (mouseX - prev.x) * scaleRatio,
          y: mouseY - (mouseY - prev.y) * scaleRatio
        }));
      }
      
      setScale(newScale);
    } else {
      setOffset((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Handle canvas mouse down (for panning)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (editingElement) return;
    if (e.button === 0 || e.button === 1) {
      // Only start panning if we didn't click on a page or connection button
      if (!(e.target as HTMLElement).closest('.page-element') && !(e.target as HTMLElement).closest('.connection-btn')) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
  };
  };

  // Handle page element mouse down
  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (editingElement) return;
    e.stopPropagation(); // Prevent canvas pan
    if (e.button === 0) { // Left click only
      const element = elements.find(el => el.id === elementId);
      if (element) {
        setSelectedElement(elementId);
        setIsDraggingElement(true);
        // Calculate the click offset relative to the element's position in canvas coordinates
        const clickX = (e.clientX - offset.x) / scale;
        const clickY = (e.clientY - offset.y) / scale;
        setDragStart({
          x: clickX - element.x,
          y: clickY - element.y
        });
      }
    }
  };

  // Handle mouse move for both panning and element dragging
  useEffect(() => {
    if (!isPanning && !isDraggingElement && !isConnecting) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      } else if (isDraggingElement && selectedElement) {
        // Update element position
        setElements((prev: CanvasElementData[]) => prev.map(el => {
          if (el.id === selectedElement) {
            // Calculate new position in canvas coordinates
            const mouseX = (e.clientX - offset.x) / scale;
            const mouseY = (e.clientY - offset.y) / scale;
            
            const newElement = {
              ...el,
              x: mouseX - dragStart.x,
              y: mouseY - dragStart.y
            };

            // Apply snap-to-grid for pages
            const { x: snapX, y: snapY } = getSnapPosition(newElement);
            
            return {
              ...el,
              x: snapX,
              y: snapY
            };
          }
          return el;
        }));
      } else if (isConnecting) {
        // Update the cursor position for connection line
        setConnectingCursor({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      setIsDraggingElement(false);
      setSelectedElement(null);
      
      if (isConnecting) {
        setIsConnecting(false);
        setConnectingFrom(null);
      }
      

    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, isDraggingElement, selectedElement, panStart, dragStart, offset, isConnecting, connectingFrom]);

  const handleZoomIn = () => {
    const newScale = Math.min(MAX_SCALE, scale + 0.1);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const scaleRatio = newScale / scale;
    
    setOffset(prev => ({
      x: centerX - (centerX - prev.x) * scaleRatio,
      y: centerY - (centerY - prev.y) * scaleRatio
    }));
    setScale(newScale);
  };
  
  const handleZoomOut = () => {
    const newScale = Math.max(MIN_SCALE, scale - 0.1);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const scaleRatio = newScale / scale;
    
    setOffset(prev => ({
      x: centerX - (centerX - prev.x) * scaleRatio,
      y: centerY - (centerY - prev.y) * scaleRatio
    }));
    setScale(newScale);
  };
  
  const handleResetView = () => {
    // Find the first page (oldest created)
    const pages = elements.filter(el => el.type === 'page');
    let targetOffset;
    
    if (pages.length > 0) {
      // Sort by creation time (ID contains timestamp)
      const firstPage = pages.sort((a, b) => {
        const timeA = a.id === 'initial-page' ? 0 : parseInt(a.id.split('-')[1] || '0');
        const timeB = b.id === 'initial-page' ? 0 : parseInt(b.id.split('-')[1] || '0');
        return timeA - timeB;
      })[0];
      
      // Center on first page
      const pageX = firstPage.x + firstPage.width / 2;
      const pageY = firstPage.y + firstPage.height / 2;
      
      targetOffset = {
        x: window.innerWidth / 2 - pageX * INIT_SCALE,
        y: window.innerHeight / 2 - pageY * INIT_SCALE
      };
    } else {
      // Fallback to canvas center if no pages
      targetOffset = { x: window.innerWidth / 2 - CANVAS_SIZE / 2, y: window.innerHeight / 2 - CANVAS_SIZE / 2 };
    }
    
    // Smooth transition
    const startOffset = { ...offset };
    const startScale = scale;
    const duration = 400;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      setScale(startScale + (INIT_SCALE - startScale) * easeProgress);
      setOffset({
        x: startOffset.x + (targetOffset.x - startOffset.x) * easeProgress,
        y: startOffset.y + (targetOffset.y - startOffset.y) * easeProgress
      });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };
  
  const centerOnElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      const elementCenterX = element.x + element.width / 2;
      const elementCenterY = element.y + element.height / 2;
      
      const targetOffset = {
        x: window.innerWidth / 2 - elementCenterX * scale,
        y: window.innerHeight / 2 - elementCenterY * scale
      };
      
      // Smooth transition
      const startOffset = { ...offset };
      const duration = 300;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        setOffset({
          x: startOffset.x + (targetOffset.x - startOffset.x) * easeProgress,
          y: startOffset.y + (targetOffset.y - startOffset.y) * easeProgress
        });
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  };
  
  // Center on newly added elements
  useEffect(() => {
    if (elements.length > 0) {
      const lastElement = elements[elements.length - 1];
      if (lastElement.type === 'page') {
        setTimeout(() => centerOnElement(lastElement.id), 10);
      }
    }
  }, [elements.length]);
  const togglePattern = () => setPatternType((prev) => (prev === 'grid' ? 'dots' : 'grid'));

  // Connection helpers
  const getElementCenter = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return null;
    return {
      x: element.x + element.width / 2,
      y: element.y + element.height / 2
    };
  };

  const getConnectionPoints = (fromId: string, toId: string) => {
    const fromEl = elements.find(el => el.id === fromId);
    const toEl = elements.find(el => el.id === toId);
    
    if (!fromEl || !toEl) return null;
    
    // Get element bounds
    const fromRight = fromEl.x + fromEl.width;
    const fromLeft = fromEl.x;
    const fromTop = fromEl.y;
    const fromBottom = fromEl.y + fromEl.height;
    const fromCenterY = fromEl.y + fromEl.height / 2;
    
    const toRight = toEl.x + toEl.width;
    const toLeft = toEl.x;
    const toTop = toEl.y;
    const toBottom = toEl.y + toEl.height;
    const toCenterY = toEl.y + toEl.height / 2;
    
    // Determine closest edges and connection points
    let fromPoint = { x: fromRight, y: fromCenterY };
    let toPoint = { x: toLeft, y: toCenterY };
    
    // If target is to the left, connect left-to-right
    if (toRight < fromLeft) {
      fromPoint = { x: fromLeft, y: fromCenterY };
      toPoint = { x: toRight, y: toCenterY };
    }
    // If target is above, connect top-to-bottom
    else if (toBottom < fromTop) {
      fromPoint = { x: fromEl.x + fromEl.width / 2, y: fromTop };
      toPoint = { x: toEl.x + toEl.width / 2, y: toBottom };
    }
    // If target is below, connect bottom-to-top
    else if (toTop > fromBottom) {
      fromPoint = { x: fromEl.x + fromEl.width / 2, y: fromBottom };
      toPoint = { x: toEl.x + toEl.width / 2, y: toTop };
    }
    // Default: right-to-left (target to the right)
    
    return { fromPoint, toPoint };
  };

  const getConnectionPath = (fromId: string, toId: string) => {
    const points = getConnectionPoints(fromId, toId);
    if (!points) return null;

    const { fromPoint, toPoint } = points;
    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    
    // Determine if horizontal or vertical connection
    const isHorizontal = Math.abs(dx) > Math.abs(dy);
    
    if (isHorizontal) {
      // Horizontal connection - use larger control offset for better curves
      const controlOffset = Math.max(Math.abs(dx) * 0.4, 60);
      
      const pathData = `
        M ${fromPoint.x} ${fromPoint.y}
        C ${fromPoint.x + controlOffset} ${fromPoint.y},
          ${toPoint.x - controlOffset} ${toPoint.y},
          ${toPoint.x} ${toPoint.y}
      `;
      return pathData;
    } else {
      // Vertical connection - use control points above/below
      const controlOffset = Math.abs(dy) * 0.4;
      
      const pathData = `
        M ${fromPoint.x} ${fromPoint.y}
        C ${fromPoint.x} ${fromPoint.y + controlOffset},
          ${toPoint.x} ${toPoint.y - controlOffset},
          ${toPoint.x} ${toPoint.y}
      `;
      return pathData;
    }
  };

  const handleCancelConnection = () => {
    setIsConnecting(false);
    setConnectingFrom(null);
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
      onMouseDown={handleCanvasMouseDown}
      onDragOver={(e) => {
        if (draggedItemType) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }
      }}
      onDrop={(e) => {
        if (!draggedItemType) return;
        e.preventDefault();

        // Convert mouse position to canvas coordinates
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Convert to canvas coordinates
        const canvasX = (mouseX - offset.x) / scale;
        const canvasY = (mouseY - offset.y) / scale;

        if (draggedItemType === 'page') {
          const id = `page-${Date.now()}`;
          const existingPages = elements.filter(el => el.type === 'page');
          const pageCount = existingPages.length + 1;
          const pageId = `PG${String(pageCount).padStart(3, '0')}`;

          const newPage = {
            id,
            type: 'page' as const,
            x: canvasX - 90, // Center on drop point (180/2 = 90)
            y: canvasY - 127, // Center on drop point (254/2 = 127)
            width: 180,
            height: 254,
            pageId,
          };
          setElements(prev => [...prev, newPage]);
        } else if (draggedItemType === 'text') {
          const id = `text-${Date.now()}`;
          const textWidth = 200;
          const textHeight = 40;

          const newText = {
            id,
            type: 'text' as const,
            x: canvasX - textWidth / 2, // Center on drop point
            y: canvasY - textHeight / 2, // Center on drop point
            width: textWidth,
            height: textHeight,
            content: '',
          };
          setElements(prev => [...prev, newText]);
        }

        setDraggedItemType(null);
      }}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: '#f5f5f7',
        cursor: draggedItemType ? 'copy' : (isPanning ? 'grabbing' : 'default'),
      }}
    >
      {/* Left vertical toolbar */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: 20,
        transform: 'translateY(-50%)',
        zIndex: 51,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1.5px solid #e5e7eb',
        padding: '10px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        width: 48,
      }}>
        <button
          style={toolbarBtnStyleSmall}
          title="Add Text"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move';
            setDraggedItemType('text');
          }}
          onDragEnd={() => {
            setDraggedItemType(null);
          }}
          onClick={(e) => {
            e.stopPropagation();

            const id = `text-${Date.now()}`;
            const textWidth = 200;
            const textHeight = 40;

            // visible top-left in canvas coords
            const visibleX = -offset.x / scale;
            const visibleY = -offset.y / scale;
            const visibleW = window.innerWidth / scale;
            const visibleH = window.innerHeight / scale;

            // Desired placement: halfway between top and center of visible area
            const baseX = visibleX + visibleW / 2 - textWidth / 2;
            const baseY = visibleY + visibleH * 0.25 - textHeight / 2; // quarter down the viewport

            // If a text already exists at this approximate location, place next to it (to the right)
            const tolerance = 24; // px tolerance in canvas coords
            const textsAtLocation = elements.filter(el => el.type === 'text' && Math.abs(el.y - baseY) <= tolerance);

            let x = baseX;
            let y = baseY;

            if (textsAtLocation.length > 0) {
              // find the right-most text in this row and place next to it
              const rightMost = textsAtLocation.reduce((prev, cur) => (cur.x > prev.x ? cur : prev), textsAtLocation[0]);
              x = rightMost.x + rightMost.width + 30;
              y = rightMost.y;
            }

            const newText: CanvasElementData = {
              id,
              type: 'text',
              x,
              y,
              width: textWidth,
              height: textHeight,
              content: '',
            };

            setElements(prev => [...prev, newText]);
          }}
        >
          <Type size={20} />
        </button>
        <button 
          style={toolbarBtnStyleSmall} 
          title="Add Page"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move';
            setDraggedItemType('page');
          }}
          onDragEnd={() => {
            setDraggedItemType(null);
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('Page button clicked');
            onAddPage();
          }}
        >
          <FileText size={20} />
        </button>
        <button
          style={toolbarBtnStyleSmall}
          title="Generate Network JSON"
          onClick={(e) => {
            e.stopPropagation();
            setShowJsonModal(true);
            setIsImportMode(false);
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16,18 22,12 16,6"></polyline>
            <polyline points="8,6 2,12 8,18"></polyline>
          </svg>
        </button>
      </div>
      {/* Grid or Dots pattern */}
      <div
        style={{
          ...getBackgroundStyle(),
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />
      {/* Canvas content: Render pages and text boxes */}
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
        }}
      >
        {/* SVG Layer for Connections */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {/* Render existing connections */}
          {connections.map(connection => {
            const pathData = getConnectionPath(connection.fromId, connection.toId);
            
            if (!pathData) return null;
            
            return (
              <g key={connection.id}>
                {/* Main connection line - Black, smooth curves */}
                <path
                  d={pathData}
                  stroke="#000000"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pointerEvents="stroke"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onDeleteConnection(connection.id)}
                />
              </g>
            );
          })}
          
          {/* Temporary connection line while dragging */}
          {isConnecting && connectingFrom && (
            (() => {
              const fromEl = elements.find(el => el.id === connectingFrom);
              if (!fromEl) return null;
              
              // Start from right edge of source page, centered vertically
              const startX = fromEl.x + fromEl.width;
              const startY = fromEl.y + fromEl.height / 2;
              const endX = (connectingCursor.x - offset.x) / scale;
              const endY = (connectingCursor.y - offset.y) / scale;
              
              return (
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#000000"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
              );
            })()
          )}
          

        </svg>
        {/* Debug element count */}
        <div style={{ position: 'absolute', top: 10, left: 10, color: 'black', background: 'white', padding: 5 }}>
          Elements: {elements.length}
        </div>
        
        {elements.map((element: CanvasElementData) => (
          <div
            key={element.id}
            className="page-element"
            data-element-type={element.type}
            data-element-id={element.id}
            onMouseEnter={() => setHoveredElement(element.id)}
            onMouseLeave={() => setHoveredElement(null)}
            onMouseDown={(e) => {
              if (e.detail === 2) return; // Ignore mousedown on double-click
              if ((e.target as HTMLElement).closest('[data-status-dropdown]')) return; // Ignore clicks on status dropdown
              handleElementMouseDown(e, element.id);
            }}
            onDoubleClick={(e) => {
              // Open editor on double-click for pages
              if (element.type === 'page') {
                e.stopPropagation();
                setEditingElement(element.id);
              }
            }}
            onMouseUp={(e) => {
              // Allow dropping connection line on page itself (not just icon)
              if (isConnecting && connectingFrom && connectingFrom !== element.id && element.type === 'page') {
                e.stopPropagation();
                onCreateConnection(connectingFrom, element.id);
                setIsConnecting(false);
                setConnectingFrom(null);
              }
            }}
            style={{
              position: 'absolute',
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              background: element.type === 'page' ? '#fff' : 'transparent',
              borderRadius: element.type === 'page' ? 16 : 0,
              boxShadow: selectedElement === element.id 
                ? (element.type === 'page' ? '0 0 0 2px #2563eb, 0 4px 16px rgba(0,0,0,0.08)' : '0 0 0 2px #2563eb')
                : (element.type === 'page' ? '0 4px 16px rgba(0,0,0,0.08)' : 'none'),
              border: element.type === 'page' ? '1.5px solid #ececf0' : 'none',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'visible',
              transition: 'box-shadow 0.2s',
              cursor: isDraggingElement && selectedElement === element.id ? 'grabbing' : 'grab',
            }}
          >
            {/* Placeholder for toolbar and label - removed for now */}
            {/* Page content */}
            {/* Delete button - above page on top right */}
            {hoveredElement === element.id && (
              <>
                <button
                  style={{
                        position: 'absolute',
                        top: '-16px',
                        right: '-12px',
                        zIndex: 100,
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#000',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 6px 10px rgba(0, 0, 0, 0.12)',
                        transition: 'background-color 0.12s ease-in-out',
                        padding: 0,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#111';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#000';
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteElement(element.id);
                      }}
                    >
                      <Trash2 size={16} color="white" />
                    </button>
                
                {/* Connection button - right middle edge */}
                {element.type === 'page' && (
                  <button
                    style={{
                          position: 'absolute',
                          top: '50%',
                          right: '-20px',
                          transform: 'translateY(-50%)',
                          zIndex: 100,
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: isConnecting && connectingFrom === element.id ? '#2563eb' : '#f5f5f5',
                          border: isConnecting && connectingFrom === element.id ? '2px solid #1e40af' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 6px 10px rgba(0, 0, 0, 0.12)',
                          transition: 'background-color 0.12s ease-in-out',
                          padding: 0,
                        }}
                        onMouseEnter={(e) => {
                          if (!isConnecting || connectingFrom !== element.id) {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e5e5e5';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isConnecting || connectingFrom !== element.id) {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f5f5f5';
                          }
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          // Start connection drag
                          setIsConnecting(true);
                          setConnectingFrom(element.id);
                          setConnectingCursor({ x: e.clientX, y: e.clientY });
                        }}
                      >
                        <Network size={16} color={isConnecting && connectingFrom === element.id ? '#fff' : '#000'} />
                      </button>
                )}
                
                {/* Connection target indicator for other pages during connection */}
                {isConnecting && connectingFrom !== element.id && element.type === 'page' && (
                  <div
                    style={{
                          position: 'absolute',
                          top: '50%',
                          right: '-20px',
                          transform: 'translateY(-50%)',
                          zIndex: 100,
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: '#d4d4d8',
                          border: '2px dashed #71717a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 6px 10px rgba(0, 0, 0, 0.12)',
                          transition: 'all 0.12s ease-in-out',
                          padding: 0,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = '#a1a1aa';
                          (e.currentTarget as HTMLDivElement).style.borderColor = '#52525b';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = '#d4d4d8';
                          (e.currentTarget as HTMLDivElement).style.borderColor = '#71717a';
                        }}
                        onMouseUp={(e) => {
                          e.stopPropagation();
                          if (connectingFrom && connectingFrom !== element.id) {
                            onCreateConnection(connectingFrom, element.id);
                            setIsConnecting(false);
                            setConnectingFrom(null);
                          }
                        }}
                      >
                        <Network size={16} color="#52525b" />
                      </div>
                )}
              </>
            )}
            
            <div
              style={{
                flex: 1,
                padding: element.type === 'page' ? '18px 16px 12px 16px' : '4px',
                color: element.content ? '#000' : '#a3a3b2',
                fontSize: element.type === 'page' ? 17 : 16,
                userSelect: 'none',
                overflow: 'hidden',
                background: element.type === 'text' && selectedElement === element.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                borderRadius: element.type === 'text' ? 4 : 0,
                position: 'relative',
              }}>
              {element.type === 'page' && element.pageId && (
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  right: '6px',
                  fontSize: '10px',
                  color: '#d1d5db',
                  fontWeight: '500',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}>
                  {element.pageId}
                </div>
              )}
              <div
                dangerouslySetInnerHTML={{
                  __html: element.content || (element.type === 'page' ? 'Double-click to edit...' : 'Click to edit text...')
                }}
              />
            </div>
            {/* status label/dropdown */}
            {element.type === 'page' && (
              <div
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Zoom controls */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 50,
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center',
      }}>
        <button onClick={handleZoomIn} title="Zoom In" style={iconBtnStyle}>
          <ZoomIn size={20} />
        </button>
        <button onClick={handleZoomOut} title="Zoom Out" style={iconBtnStyle}>
          <ZoomOut size={20} />
        </button>
        <button onClick={handleResetView} title="Reset View" style={iconBtnStyle}>
          <Maximize2 size={20} />
        </button>
        <div style={{ width: '100%', height: 1, background: '#e5e7eb', margin: '8px 0' }} />
        <button onClick={togglePattern} title={patternType === 'grid' ? 'Switch to Dots' : 'Switch to Grid'} style={iconBtnStyle}>
          {patternType === 'grid' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="2" />
              <circle cx="6" cy="6" r="2" />
              <circle cx="6" cy="18" r="2" />
              <circle cx="18" cy="6" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
          ) : (
            <Grid3x3 size={20} />
          )}
        </button>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#666', marginTop: 4 }}>{Math.round(scale * 100)}%</div>
      </div>

      {/* Page Editor Modal */}
      {editingElement && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
        onClick={() => setEditingElement(null)}>
          {/* Main Editor Page - Exactly like page card but larger */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '500px',
            height: '600px',
            border: '1.5px solid #ececf0',
            overflow: 'hidden',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}>
            {/* Content Area - Editable, matches page cards padding */}
            <div
              ref={editorRef}
              id="page-content-editor"
              contentEditable
              suppressContentEditableWarning={true}
              style={{
                flex: 1,
                padding: '16px',
                overflow: 'auto',
                outline: 'none',
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#111827',
                background: '#ffffff',
                fontFamily: 'inherit',
              }}
              onInput={(e) => {
                // Simple auto-save - don't manipulate HTML
                const content = (e.currentTarget as HTMLDivElement).innerHTML;
                setElements(prev => prev.map(el =>
                  el.id === editingElement ? { ...el, content } : el
                ));
              }}
            ></div>
            
            {/* Highlight Overlay - Shows character names in red without breaking cursor */}
            {editingElement && elements.find(el => el.id === editingElement) && (
              <div
                dangerouslySetInnerHTML={{
                  __html: highlightCharacters(elements.find(el => el.id === editingElement)?.content || '')
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '16px',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: 'transparent',
                  background: 'transparent',
                  pointerEvents: 'none',
                  overflow: 'auto',
                  fontFamily: 'inherit',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                }}
              ></div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 50,
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        padding: 16,
        fontSize: 14,
        color: '#666',
      }}>
        <div><b>Pan:</b> Drag Canvas</div>
        <div><b>Zoom:</b> Ctrl/Cmd + Scroll</div>
        <div><b>Connect:</b> Click icon on page</div>
        <div><b>Cancel:</b> Press Esc</div>
      </div>

      {/* Position Tooltip - Shows coordinates on page hover */}
      {hoveredElement && elements.find(el => el.id === hoveredElement)?.type === 'page' && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 100,
          zIndex: 50,
          background: 'white',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          padding: '12px 16px',
          fontSize: 13,
          color: '#374151',
          fontFamily: 'monospace',
          fontWeight: '500',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <div>X: {Math.round(elements.find(el => el.id === hoveredElement)?.x || 0)}</div>
          <div>Y: {Math.round(elements.find(el => el.id === hoveredElement)?.y || 0)}</div>
        </div>
      )}

      {/* User Icon - Top Right */}
      <button
        onClick={onOpenCharacterModal}
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 51,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1.5px solid #e5e7eb',
          padding: '10px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f7';
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#fff';
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
        }}
      >
        <User size={20} color="#222" />
      </button>

      {/* JSON Modal */}
      {showJsonModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }} onClick={() => setShowJsonModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                {isImportMode ? 'Import JSON' : 'Page Network JSON'}
              </h2>
              {!isImportMode && (
                <button onClick={() => setIsImportMode(true)} style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                }}>
                  Import JSON
                </button>
              )}
              <button onClick={() => setShowJsonModal(false)} style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {isImportMode ? (
                <>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Paste your JSON here..."
                    autoFocus
                    style={{
                      width: '100%',
                      height: '300px',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'Monaco, Consolas, monospace',
                      resize: 'vertical',
                      outline: 'none',
                      color: '#000',
                      background: '#ffffff',
                      boxSizing: 'border-box',
                      lineHeight: '1.5',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  />
                  <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                    <button onClick={() => {
                      try {
                        const trimmedInput = jsonInput.trim();
                        if (!trimmedInput) {
                          alert('Please paste JSON code first');
                          return;
                        }
                        const network = JSON.parse(trimmedInput);
                        const newElements: CanvasElementData[] = [];
                        const newConnections: ConnectionData[] = [];
                        
                        Object.entries(network).forEach(([pageKey, pageData]: [string, any]) => {
                          const coords = pageData.cordinates.split(',');
                          const x = parseInt(coords[0]);
                          const y = parseInt(coords[1]);
                          
                          const newPage: CanvasElementData = {
                            id: `page-${Date.now()}-${pageKey}`,
                            type: 'page',
                            x,
                            y,
                            width: 180,
                            height: 254,
                            content: pageData.text,
                            pageId: pageData.pageid,
                            status: pageData.status || 'draft',
                            label: pageData.label || ''
                          };
                          newElements.push(newPage);
                        });
                        
                        // Create connections (skip duplicates and reciprocal links)
                        Object.entries(network).forEach(([pageKey, pageData]: [string, any]) => {
                          if (pageData.next && pageData.next.length > 0) {
                            const fromElement = newElements.find(el => el.pageId === pageData.pageid);
                            pageData.next.forEach((nextPageId: string) => {
                              const toElement = newElements.find(el => el.pageId === nextPageId);
                              if (fromElement && toElement) {
                                const alreadyExists = newConnections.some(conn =>
                                  (conn.fromId === fromElement.id && conn.toId === toElement.id) ||
                                  (conn.fromId === toElement.id && conn.toId === fromElement.id)
                                );
                                if (!alreadyExists) {
                                  newConnections.push({
                                    id: `conn-${Date.now()}-${Math.random()}`,
                                    fromId: fromElement.id,
                                    toId: toElement.id
                                  });
                                }
                              }
                            });
                          }
                        });
                        
                        onImportNetwork(newElements, newConnections);
                        setShowJsonModal(false);
                        setJsonInput('');
                        setIsImportMode(false);
                      } catch (error) {
                        alert('Invalid JSON format');
                      }
                    }} style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}>
                      Generate Pages
                    </button>
                    <button onClick={() => setIsImportMode(false)} style={{
                      background: 'none',
                      border: '1px solid #e5e7eb',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}>
                      Back
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <pre style={{
                    background: '#f8f9fa',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '14px',
                    fontFamily: 'Monaco, Consolas, monospace',
                    color: '#374151',
                    overflow: 'auto',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {JSON.stringify(onGenerateNetwork(), null, 2)}
                  </pre>
                  
                  <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                    <button onClick={() => {
                      navigator.clipboard?.writeText(JSON.stringify(onGenerateNetwork(), null, 2));
                    }} style={{
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}>
                      Copy to Clipboard
                    </button>
                    <button onClick={() => setShowJsonModal(false)} style={{
                      background: 'none',
                      border: '1px solid #e5e7eb',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}>
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const iconBtnStyle = {
  width: 32,
  height: 32,
  border: 'none',
  background: 'none',
  borderRadius: 8,
  fontSize: 18,
  cursor: 'pointer',
  color: '#333',
  margin: 0,
  padding: 0,
  outline: 'none',
  transition: 'background 0.2s',
};

const toolbarBtnStyleSmall = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: 'none',
  color: '#222',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
  cursor: 'pointer',
  outline: 'none',
  transition: 'background 0.2s',
  margin: 0,
  padding: 0,
};

export default InfiniteCanvas;
            {/* status label/dropdown */}
            {element.type === 'page' && (
              <div
                data-status-dropdown
                onMouseEnter={(e)=>{e.stopPropagation(); setTagMenuFor(element.id);}}
                onMouseLeave={(e)=>{e.stopPropagation(); setTagMenuFor(null);}}
                onMouseDown={(e)=>{e.stopPropagation();}}
                style={{
                  position: 'absolute',
                  bottom: -14,
                  left: 8,
                  background: '#000',
                  padding: '2px 8px',
                  borderRadius: 9999,
                  fontSize: 12,
                  cursor: 'pointer',
                  zIndex: 90,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{textTransform:'capitalize'}}>{element.status || 'draft'}</span>
                {tagMenuFor === element.id && (
                  <div
                    data-status-dropdown
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderRadius: 8,
                      padding: 8,
                      zIndex: 200,
                      minWidth: 100,
                      marginTop: 4,
                    }}
                  >
                    {statuses.map(s => (
                      <div
                        key={s}
                        data-status-dropdown
                        style={{
                          padding:'8px 12px', 
                          cursor:'pointer',
                          color: '#000',
                          borderRadius: 4,
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0f0';}}
                        onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';}}
                        onMouseDown={(e)=>{e.stopPropagation();}}
                        onClick={(e)=>{e.stopPropagation(); updateStatus(element.id, s);}}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Zoom controls */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 50,
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center',
      }}>
        <button onClick={handleZoomIn} title="Zoom In" style={iconBtnStyle}>
          <ZoomIn size={20} />
        </button>
        <button onClick={handleZoomOut} title="Zoom Out" style={iconBtnStyle}>
          <ZoomOut size={20} />
        </button>
        <button onClick={handleResetView} title="Reset View" style={iconBtnStyle}>
          <Maximize2 size={20} />
        </button>
        <div style={{ width: '100%', height: 1, background: '#e5e7eb', margin: '8px 0' }} />
        <button onClick={togglePattern} title={patternType === 'grid' ? 'Switch to Dots' : 'Switch to Grid'} style={iconBtnStyle}>
          {patternType === 'grid' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="2" />
              <circle cx="6" cy="6" r="2" />
              <circle cx="6" cy="18" r="2" />
              <circle cx="18" cy="6" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
          ) : (
            <Grid3x3 size={20} />
          )}
        </button>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#666', marginTop: 4 }}>{Math.round(scale * 100)}%</div>
      </div>

      {/* Page Editor Modal */}
      {editingElement && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
        onClick={() => setEditingElement(null)}>
          {/* Main Editor Page - Exactly like page card but larger */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '500px',
            height: '600px',
            border: '1.5px solid #ececf0',
            overflow: 'hidden',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}>
            {/* Content Area - Editable, matches page cards padding */}
            <div
              ref={editorRef}
              id="page-content-editor"
              contentEditable
              suppressContentEditableWarning={true}
              style={{
                flex: 1,
                padding: '16px',
                overflow: 'auto',
                outline: 'none',
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#111827',
                background: '#ffffff',
                fontFamily: 'inherit',
              }}
              onInput={(e) => {
                // Simple auto-save - don't manipulate HTML
                const content = (e.currentTarget as HTMLDivElement).innerHTML;
                setElements(prev => prev.map(el =>
                  el.id === editingElement ? { ...el, content } : el
                ));
              }}
            ></div>
            
            {/* Highlight Overlay - Shows character names in red without breaking cursor */}
            {editingElement && elements.find(el => el.id === editingElement) && (
              <div
                dangerouslySetInnerHTML={{
                  __html: highlightCharacters(elements.find(el => el.id === editingElement)?.content || '')
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '16px',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: 'transparent',
                  background: 'transparent',
                  pointerEvents: 'none',
                  overflow: 'auto',
                  fontFamily: 'inherit',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                }}
              ></div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 50,
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        padding: 16,
        fontSize: 14,
        color: '#666',
      }}>
        <div><b>Pan:</b> Drag Canvas</div>
        <div><b>Zoom:</b> Ctrl/Cmd + Scroll</div>
        <div><b>Connect:</b> Click icon on page</div>
        <div><b>Cancel:</b> Press Esc</div>
      </div>

      {/* Position Tooltip - Shows coordinates on page hover */}
      {hoveredElement && elements.find(el => el.id === hoveredElement)?.type === 'page' && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 100,
          zIndex: 50,
          background: 'white',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          padding: '12px 16px',
          fontSize: 13,
          color: '#374151',
          fontFamily: 'monospace',
          fontWeight: '500',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <div>X: {Math.round(elements.find(el => el.id === hoveredElement)?.x || 0)}</div>
          <div>Y: {Math.round(elements.find(el => el.id === hoveredElement)?.y || 0)}</div>
        </div>
      )}

      {/* User Icon - Top Right */}
      <button
        onClick={onOpenCharacterModal}
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 51,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1.5px solid #e5e7eb',
          padding: '10px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f7';
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#fff';
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
        }}
      >
        <User size={20} color="#222" />
      </button>

      {/* JSON Modal */}
      {showJsonModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }} onClick={() => setShowJsonModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                {isImportMode ? 'Import JSON' : 'Page Network JSON'}
              </h2>
              {!isImportMode && (
                <button onClick={() => setIsImportMode(true)} style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                }}>
                  Import JSON
                </button>
              )}
              <button onClick={() => setShowJsonModal(false)} style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {isImportMode ? (
                <>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Paste your JSON here..."
                    autoFocus
                    style={{
                      width: '100%',
                      height: '300px',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'Monaco, Consolas, monospace',
                      resize: 'vertical',
                      outline: 'none',
                      color: '#000',
                      background: '#ffffff',
                      boxSizing: 'border-box',
                      lineHeight: '1.5',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  />
                  <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                    <button onClick={() => {
                      try {
                        const trimmedInput = jsonInput.trim();
                        if (!trimmedInput) {
                          alert('Please paste JSON code first');
                          return;
                        }
                        const network = JSON.parse(trimmedInput);
                        const newElements: CanvasElementData[] = [];
                        const newConnections: ConnectionData[] = [];
                        
                        Object.entries(network).forEach(([pageKey, pageData]: [string, any]) => {
                          const coords = pageData.cordinates.split(',');
                          const x = parseInt(coords[0]);
                          const y = parseInt(coords[1]);
                          
                          const newPage: CanvasElementData = {
                            id: `page-${Date.now()}-${pageKey}`,
                            type: 'page',
                            x,
                            y,
                            width: 180,
                            height: 254,
                            content: pageData.text,
                            pageId: pageData.pageid,
                            status: pageData.status || 'draft',
                            label: pageData.label || ''
                          };
                          newElements.push(newPage);
                        });
                        
                        // Create connections (skip duplicates and reciprocal links)
                        Object.entries(network).forEach(([pageKey, pageData]: [string, any]) => {
                          if (pageData.next && pageData.next.length > 0) {
                            const fromElement = newElements.find(el => el.pageId === pageData.pageid);
                            pageData.next.forEach((nextPageId: string) => {
                              const toElement = newElements.find(el => el.pageId === nextPageId);
                              if (fromElement && toElement) {
                                const alreadyExists = newConnections.some(conn =>
                                  (conn.fromId === fromElement.id && conn.toId === toElement.id) ||
                                  (conn.fromId === toElement.id && conn.toId === fromElement.id)
                                );
                                if (!alreadyExists) {
                                  newConnections.push({
                                    id: `conn-${Date.now()}-${Math.random()}`,
                                    fromId: fromElement.id,
                                    toId: toElement.id
                                  });
                                }
                              }
                            });
                          }
                        });
                        
                        onImportNetwork(newElements, newConnections);
                        setShowJsonModal(false);
                        setJsonInput('');
                        setIsImportMode(false);
                      } catch (error) {
                        alert('Invalid JSON format');
                      }
                    }} style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}>
                      Generate Pages
                    </button>
                    <button onClick={() => setIsImportMode(false)} style={{
                      background: 'none',
                      border: '1px solid #e5e7eb',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}>
                      Back
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <pre style={{
                    background: '#f8f9fa',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '14px',
                    fontFamily: 'Monaco, Consolas, monospace',
                    color: '#374151',
                    overflow: 'auto',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {JSON.stringify(onGenerateNetwork(), null, 2)}
                  </pre>
                  
                  <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                    <button onClick={() => {
                      navigator.clipboard?.writeText(JSON.stringify(onGenerateNetwork(), null, 2));
                    }} style={{
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}>
                      Copy to Clipboard
                    </button>
                    <button onClick={() => setShowJsonModal(false)} style={{
                      background: 'none',
                      border: '1px solid #e5e7eb',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}>
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const iconBtnStyle = {
  width: 32,
  height: 32,
  border: 'none',
  background: 'none',
  borderRadius: 8,
  fontSize: 18,
  cursor: 'pointer',
  color: '#333',
  margin: 0,
  padding: 0,
  outline: 'none',
  transition: 'background 0.2s',
};

const toolbarBtnStyleSmall = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: 'none',
  color: '#222',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
  cursor: 'pointer',
  outline: 'none',
  transition: 'background 0.2s',
  margin: 0,
  padding: 0,
};

export default InfiniteCanvas;
