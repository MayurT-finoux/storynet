import React, { useRef, useState, useEffect } from 'react';
import { Type, FileText, ZoomIn, ZoomOut, Maximize2, Grid3x3, Trash2, Network, User, X, Upload, Copy, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
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
  onDarkModeChange?: (dark: boolean) => void;
  darkMode?: boolean;
  onBackToHome?: () => void;
  projectName?: string;
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
  onDarkModeChange,
  darkMode: darkModeProp = false,
  onBackToHome,
  projectName,
}: InfiniteCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|Touch/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches;
  const lastTouchDist = useRef<number | null>(null);
  const lastTouchMid = useRef<{ x: number; y: number } | null>(null);
  const touchDragId = useRef<string | null>(null);
  const touchDragStart = useRef<{ x: number; y: number } | null>(null);
  const touchTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchTapCount = useRef(0);
  const [darkMode, setDarkMode] = useState(darkModeProp);
  const toggleDark = (v: boolean) => { setDarkMode(v); onDarkModeChange?.(v); };
  const dm = {
    bg: darkMode ? '#111' : '#f5f5f7',
    card: darkMode ? '#1e1e1e' : '#fff',
    border: darkMode ? '#333' : '#ececf0',
    text: darkMode ? '#f0f0f0' : '#111',
    subtext: darkMode ? '#888' : '#9ca3af',
    toolbar: darkMode ? '#1e1e1e' : '#fff',
    toolbarBorder: darkMode ? '#333' : '#e5e7eb',
    overlay: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
    gridLine: darkMode ? '#2a2a2a' : '#e5e7eb',
  };

  // status dropdown constants
  const statuses: Array<'draft'|'idea'|'done'> = ['draft','idea','done'];

  const updateStatus = (elementId: string, status: 'draft'|'idea'|'done') => {
    // directly update local elements state instead of relying solely on
    // parent callback so we can immediately reflect changes in the UI and
    // avoid unnecessary re-renders during drag operations.
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
  const [editingTextElement, setEditingTextElement] = useState<string | null>(null);
  const [resizingElement, setResizingElement] = useState<string | null>(null);
  const resizeStart = useRef<{ mouseX: number; mouseY: number; w: number; h: number } | null>(null);
  const [stackPrompt, setStackPrompt] = useState<{ draggedId: string; targetId: string; x: number; y: number } | null>(null);


  const pageCount = elements.filter(el => el.type === 'page').length;
  const [charTooltip, setCharTooltip] = useState<{ name: string; x: number; y: number } | null>(null);

  const highlightCharacters = (text: string) => {
    if (!characters.length || !text) return text;
    const allNames: string[] = [];
    characters.forEach(char => {
      allNames.push(char.name);
      if (char.aliases) allNames.push(...char.aliases);
    });
    const sortedNames = allNames.sort((a, b) => b.length - a.length);
    let highlightedText = text;
    sortedNames.forEach(name => {
      const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex,
        `<span data-char="${name}" style="color:#d32f2f;font-weight:bold;cursor:pointer;border-radius:3px;padding:0 2px">${name}</span>`
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
      }
      // place cursor at end
      editorRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editingElement]);

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
    if (!isPanning && !isDraggingElement && !isConnecting && !resizingElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      } else if (resizingElement && resizeStart.current) {
        const rs = resizeStart.current;
        const dx = (e.clientX - rs.mouseX) / scale;
        const dy = (e.clientY - rs.mouseY) / scale;
        setElements(prev => prev.map(el =>
          el.id === resizingElement
            ? { ...el, width: Math.max(80, rs.w + dx), height: Math.max(24, rs.h + dy) }
            : el
        ));
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

    const handleMouseUp = (e: MouseEvent) => {
      setIsPanning(false);
      setIsDraggingElement(false);

      // Overlap detection: if dragged page overlaps a connected page, offer to stack
      if (isDraggingElement && selectedElement) {
        const dragged = elements.find(el => el.id === selectedElement);
        if (dragged && dragged.type === 'page') {
          const connectedIds = connections
            .filter(c => c.fromId === selectedElement || c.toId === selectedElement)
            .map(c => c.fromId === selectedElement ? c.toId : c.fromId);

          for (const otherId of connectedIds) {
            const other = elements.find(el => el.id === otherId);
            if (!other) continue;
            const overlapX = Math.max(0, Math.min(dragged.x + dragged.width, other.x + other.width) - Math.max(dragged.x, other.x));
            const overlapY = Math.max(0, Math.min(dragged.y + dragged.height, other.y + other.height) - Math.max(dragged.y, other.y));
            const overlapArea = overlapX * overlapY;
            const draggedArea = dragged.width * dragged.height;
            // Trigger if overlap is more than 30% of the dragged card
            if (overlapArea > draggedArea * 0.3) {
              const screenX = (other.x + other.width / 2) * scale + offset.x;
              const screenY = (other.y + other.height / 2) * scale + offset.y;
              setStackPrompt({ draggedId: selectedElement, targetId: otherId, x: screenX, y: screenY });
              break;
            }
          }
        }
      }

      setSelectedElement(null);
      if (resizingElement) {
        setResizingElement(null);
        resizeStart.current = null;
      }
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
  }, [isPanning, isDraggingElement, selectedElement, panStart, dragStart, offset, isConnecting, connectingFrom, resizingElement, scale, connections, elements]);

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

  // Returns the best exit/entry edge point and direction normal for a pair of elements
  const getConnectionPoints = (fromId: string, toId: string) => {
    const fromEl = elements.find(el => el.id === fromId);
    const toEl = elements.find(el => el.id === toId);
    if (!fromEl || !toEl) return null;

    const fCX = fromEl.x + fromEl.width / 2;
    const fCY = fromEl.y + fromEl.height / 2;
    const tCX = toEl.x + toEl.width / 2;
    const tCY = toEl.y + toEl.height / 2;

    // Gap clearance so lines never cross the connection button (button is at right:-20px, 36px wide)
    const EDGE_CLEAR = 28;

    // Score each of the 4 exit edges on the source against 4 entry edges on the target
    // Pick the pair with shortest center-to-center distance along that axis
    const candidates: Array<{
      from: { x: number; y: number; nx: number; ny: number };
      to: { x: number; y: number; nx: number; ny: number };
      dist: number;
    }> = [
      // right → left
      {
        from: { x: fromEl.x + fromEl.width + EDGE_CLEAR, y: fCY, nx: 1, ny: 0 },
        to:   { x: toEl.x - EDGE_CLEAR,                  y: tCY, nx: -1, ny: 0 },
        dist: Math.abs(tCX - fCX) + Math.abs(tCY - fCY) * 0.3,
      },
      // left → right
      {
        from: { x: fromEl.x - EDGE_CLEAR, y: fCY, nx: -1, ny: 0 },
        to:   { x: toEl.x + toEl.width + EDGE_CLEAR, y: tCY, nx: 1, ny: 0 },
        dist: Math.abs(tCX - fCX) + Math.abs(tCY - fCY) * 0.3,
      },
      // bottom → top
      {
        from: { x: fCX, y: fromEl.y + fromEl.height + EDGE_CLEAR, nx: 0, ny: 1 },
        to:   { x: tCX, y: toEl.y - EDGE_CLEAR,                   nx: 0, ny: -1 },
        dist: Math.abs(tCY - fCY) + Math.abs(tCX - fCX) * 0.3,
      },
      // top → bottom
      {
        from: { x: fCX, y: fromEl.y - EDGE_CLEAR, nx: 0, ny: -1 },
        to:   { x: tCX, y: toEl.y + toEl.height + EDGE_CLEAR, nx: 0, ny: 1 },
        dist: Math.abs(tCY - fCY) + Math.abs(tCX - fCX) * 0.3,
      },
    ];

    // Prefer right→left when target is clearly to the right, left→right when clearly to the left
    const dx = tCX - fCX;
    const dy = tCY - fCY;
    let best;
    if (Math.abs(dx) >= Math.abs(dy)) {
      best = dx >= 0 ? candidates[0] : candidates[1];
    } else {
      best = dy >= 0 ? candidates[2] : candidates[3];
    }

    return { fromPoint: { x: best.from.x, y: best.from.y }, toPoint: { x: best.to.x, y: best.to.y },
             fromNormal: { x: best.from.nx, y: best.from.ny }, toNormal: { x: best.to.nx, y: best.to.ny } };
  };

  const getConnectionPath = (fromId: string, toId: string) => {
    const pts = getConnectionPoints(fromId, toId);
    if (!pts) return null;
    const { fromPoint, toPoint, fromNormal, toNormal } = pts;

    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Adaptive control arm: longer when far, shorter when close, minimum 60px
    // This prevents the ugly straight-line look when cards are nearby
    const arm = Math.max(60, dist * 0.45);

    const c1x = fromPoint.x + fromNormal.x * arm;
    const c1y = fromPoint.y + fromNormal.y * arm;
    const c2x = toPoint.x + toNormal.x * arm;
    const c2y = toPoint.y + toNormal.y * arm;

    return `M ${fromPoint.x} ${fromPoint.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${toPoint.x} ${toPoint.y}`;
  };

  const handleCancelConnection = () => {
    setIsConnecting(false);
    setConnectingFrom(null);
  };



  const getBackgroundStyle = () => {
    const g = dm.gridLine;
    if (patternType === 'grid') {
      return {
        backgroundImage: `linear-gradient(to right, ${g} 1px, transparent 1px), linear-gradient(to bottom, ${g} 1px, transparent 1px)`,
        backgroundSize: `${40 * scale}px ${40 * scale}px`,
        backgroundPosition: `${offset.x}px ${offset.y}px`,
      };
    } else {
      return {
        backgroundImage: `radial-gradient(circle, ${g} 1.5px, transparent 1.5px)`,
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
      onTouchStart={(e) => {
        if (editingElement) return;
        const touches = e.touches;
        if (touches.length === 2) {
          const dx = touches[1].clientX - touches[0].clientX;
          const dy = touches[1].clientY - touches[0].clientY;
          lastTouchDist.current = Math.hypot(dx, dy);
          lastTouchMid.current = {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2,
          };
        } else if (touches.length === 1) {
          const t = touches[0];
          const target = t.target as HTMLElement;
          if (!target.closest('.page-element')) {
            setPanStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
            setIsPanning(true);
          }
        }
      }}
      onTouchMove={(e) => {
        if (editingElement) return;
        e.preventDefault();
        const touches = e.touches;
        if (touches.length === 2 && lastTouchDist.current !== null && lastTouchMid.current !== null) {
          const dx = touches[1].clientX - touches[0].clientX;
          const dy = touches[1].clientY - touches[0].clientY;
          const dist = Math.hypot(dx, dy);
          const mid = {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2,
          };
          const scaleRatio = dist / lastTouchDist.current;
          const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * scaleRatio));
          setOffset(prev => ({
            x: mid.x - (mid.x - prev.x) * (newScale / scale),
            y: mid.y - (mid.y - prev.y) * (newScale / scale),
          }));
          setScale(newScale);
          lastTouchDist.current = dist;
          lastTouchMid.current = mid;
        } else if (touches.length === 1 && isPanning) {
          const t = touches[0];
          setOffset({ x: t.clientX - panStart.x, y: t.clientY - panStart.y });
        } else if (touches.length === 1 && isConnecting) {
          const t = touches[0];
          setConnectingCursor({ x: t.clientX, y: t.clientY });
        }
      }}
      onTouchEnd={() => {
        lastTouchDist.current = null;
        lastTouchMid.current = null;
        setIsPanning(false);
      }}
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
        background: dm.bg,
        cursor: draggedItemType ? 'copy' : (isPanning ? 'grabbing' : 'default'),
        touchAction: 'none',
      }}
    >
      {/* Browser indicator */}
      <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 51, background: isMobile ? '#000' : '#2563eb', color: '#fff', padding: '3px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, pointerEvents: 'none' }}>
        {isMobile ? 'mobile' : 'desktop'}
      </div>

      {/* Left vertical toolbar */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: isMobile ? 12 : 20,
        transform: 'translateY(-50%)',
        zIndex: 51,
        background: dm.toolbar,
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: `1.5px solid ${dm.toolbarBorder}`,
        padding: '10px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        width: isMobile ? 56 : 48,
      }}>
        <button
          style={{...toolbarBtnStyleSmall, color: dm.text, width: isMobile ? 40 : 32, height: isMobile ? 40 : 32}}
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
            const visibleX = -offset.x / scale;
            const visibleY = -offset.y / scale;
            const visibleW = window.innerWidth / scale;
            const visibleH = window.innerHeight / scale;
            const centerX = visibleX + visibleW / 2 - textWidth / 2;
            const centerY = visibleY + visibleH * 0.25 - 20;
            // stack diagonally if something already near center
            const overlap = elements.filter(el =>
              el.type === 'text' &&
              Math.abs(el.x - centerX) < 30 &&
              Math.abs(el.y - centerY) < 30
            );
            const offset24 = overlap.length * 24;
            const newText: CanvasElementData = {
              id, type: 'text',
              x: centerX + offset24,
              y: centerY + offset24,
              width: textWidth, height: 40, content: '',
            };
            setElements(prev => [...prev, newText]);
          }}
        >
          <Type size={20} />
        </button>
        <button 
          style={{...toolbarBtnStyleSmall, color: dm.text, width: isMobile ? 40 : 32, height: isMobile ? 40 : 32}} 
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
          style={{...toolbarBtnStyleSmall, color: dm.text, width: isMobile ? 40 : 32, height: isMobile ? 40 : 32}}
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
          <defs>
            <filter id="wire-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={dm.text} floodOpacity="0.10" />
            </filter>
          </defs>

          {/* Render existing connections */}
          {connections.map(connection => {
            const pathData = getConnectionPath(connection.fromId, connection.toId);
            if (!pathData) return null;
            return (
              <g key={connection.id}>
                {/* Wide invisible hit area */}
                <path
                  d={pathData}
                  stroke="transparent"
                  strokeWidth="16"
                  fill="none"
                  pointerEvents="stroke"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onDeleteConnection(connection.id)}
                />
                {/* Subtle glow / shadow layer */}
                <path
                  d={pathData}
                  stroke={dm.text}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.06"
                  filter="url(#wire-shadow)"
                  pointerEvents="none"
                />
                {/* Main line */}
                <path
                  d={pathData}
                  stroke={dm.text}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
              </g>
            );
          })}

          {/* Temporary connection line while dragging */}
          {isConnecting && connectingFrom && (
            (() => {
              const fromEl = elements.find(el => el.id === connectingFrom);
              if (!fromEl) return null;
              const startX = fromEl.x + fromEl.width + 28;
              const startY = fromEl.y + fromEl.height / 2;
              const endX = (connectingCursor.x - offset.x) / scale;
              const endY = (connectingCursor.y - offset.y) / scale;
              const dx = endX - startX;
              const arm = Math.max(60, Math.sqrt(dx*dx + (endY-startY)**2) * 0.4);
              const pathData = `M ${startX} ${startY} C ${startX + arm} ${startY}, ${endX - arm} ${endY}, ${endX} ${endY}`;
              return (
                <path
                  d={pathData}
                  stroke={dm.text}
                  strokeWidth="1.75"
                  fill="none"
                  strokeDasharray="6,4"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              );
            })()
          )}
        </svg>
        
        {elements.map((element: CanvasElementData) => (
          <div
            key={element.id}
            className="page-element"
            data-element-type={element.type}
            data-element-id={element.id}
            onMouseEnter={() => setHoveredElement(element.id)}
            onMouseLeave={() => setHoveredElement(null)}
            onTouchStart={(e) => {
              if (e.touches.length !== 1) return;
              if ((e.target as HTMLElement).closest('.connection-btn')) return;
              if (isConnecting && connectingFrom && connectingFrom !== element.id && element.type === 'page') {
                e.stopPropagation();
                onCreateConnection(connectingFrom, element.id);
                setIsConnecting(false);
                setConnectingFrom(null);
                return;
              }
              const t = e.touches[0];
              setHoveredElement(element.id);
              touchTapCount.current += 1;
              if (touchTapTimer.current) clearTimeout(touchTapTimer.current);
              touchTapTimer.current = setTimeout(() => { touchTapCount.current = 0; }, 300);
              if (touchTapCount.current === 2) {
                touchTapCount.current = 0;
                if (element.type === 'page') { e.stopPropagation(); setEditingElement(element.id); return; }
                if (element.type === 'text') { e.stopPropagation(); setEditingTextElement(element.id); return; }
              }
              e.stopPropagation();
              touchDragId.current = element.id;
              const canvasX = (t.clientX - offset.x) / scale;
              const canvasY = (t.clientY - offset.y) / scale;
              touchDragStart.current = { x: canvasX - element.x, y: canvasY - element.y };
              setSelectedElement(element.id);
              setIsDraggingElement(true);
            }}
            onTouchMove={(e) => {
              if (e.touches.length !== 1 || touchDragId.current !== element.id) return;
              e.stopPropagation();
              e.preventDefault();
              const t = e.touches[0];
              const canvasX = (t.clientX - offset.x) / scale;
              const canvasY = (t.clientY - offset.y) / scale;
              setElements(prev => prev.map(el => {
                if (el.id !== element.id || !touchDragStart.current) return el;
                const newEl = { ...el, x: canvasX - touchDragStart.current!.x, y: canvasY - touchDragStart.current!.y };
                const { x, y } = getSnapPosition(newEl);
                return { ...el, x, y };
              }));
            }}
            onTouchEnd={() => {
              touchDragId.current = null;
              touchDragStart.current = null;
              setIsDraggingElement(false);
              setSelectedElement(null);
              setTimeout(() => setHoveredElement(null), 1200);
            }}
            onMouseDown={(e) => {
              if (e.detail === 2) return;
              if ((e.target as HTMLElement).closest('[data-status-dropdown]')) return;
              if ((e.target as HTMLElement).closest('[data-resize-handle]')) return;
              if (element.type === 'text' && editingTextElement === element.id) return;
              if (element.type === 'text') {
                e.stopPropagation();
                setSelectedElement(element.id);
                return;
              }
              handleElementMouseDown(e, element.id);
            }}
            onDoubleClick={(e) => {
              if (element.type === 'page') {
                e.stopPropagation();
                setEditingElement(element.id);
              }
              if (element.type === 'text') {
                e.stopPropagation();
                setEditingTextElement(element.id);
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
              height: element.type === 'text' ? 'auto' : element.height,
              minHeight: element.type === 'text' ? 32 : undefined,
              background: element.type === 'page' ? dm.card : 'transparent',
              borderRadius: element.type === 'text' ? 6 : 16,
              boxShadow: selectedElement === element.id
                ? (element.type === 'page' ? `0 0 0 2px #2563eb, 0 4px 16px rgba(0,0,0,0.08)` : 'none')
                : (element.type === 'page' ? `0 4px 16px rgba(0,0,0,${darkMode?'0.4':'0.08'})` : 'none'),
              border: element.type === 'page'
                ? `1.5px solid ${dm.border}`
                : (editingTextElement === element.id
                    ? `1.5px solid ${dm.text}`
                    : (hoveredElement === element.id || selectedElement === element.id
                        ? `1.5px dashed ${dm.subtext}`
                        : '1.5px dashed transparent')),
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'visible',
              transition: 'box-shadow 0.2s',
              zIndex: isDraggingElement && selectedElement === element.id ? 10 : 1,
              cursor: editingTextElement === element.id ? 'text' : (isDraggingElement && selectedElement === element.id ? 'grabbing' : 'grab'),
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
                    className="connection-btn"
                    style={{
                          position: 'absolute', top: '50%', right: '-20px',
                          transform: 'translateY(-50%)', zIndex: 100,
                          width: '36px', height: '36px', borderRadius: '50%',
                          backgroundColor: isConnecting && connectingFrom === element.id ? '#2563eb' : '#f5f5f5',
                          border: isConnecting && connectingFrom === element.id ? '2px solid #1e40af' : 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', boxShadow: '0 6px 10px rgba(0,0,0,0.12)',
                          transition: 'background-color 0.12s ease-in-out', padding: 0,
                        }}
                        onMouseEnter={(e) => {
                          if (!isConnecting || connectingFrom !== element.id)
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e5e5e5';
                        }}
                        onMouseLeave={(e) => {
                          if (!isConnecting || connectingFrom !== element.id)
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f5f5f5';
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setIsConnecting(true);
                          setConnectingFrom(element.id);
                          setConnectingCursor({ x: e.clientX, y: e.clientY });
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (isConnecting && connectingFrom === element.id) {
                            setIsConnecting(false); setConnectingFrom(null);
                          } else {
                            setIsConnecting(true);
                            setConnectingFrom(element.id);
                            const t = e.touches[0];
                            setConnectingCursor({ x: t.clientX, y: t.clientY });
                          }
                        }}
                      >
                        <Network size={16} color={isConnecting && connectingFrom === element.id ? '#fff' : '#000'} />
                      </button>
                )}

                {/* Mobile only: full-card tap target for other pages */}
                {isMobile && isConnecting && connectingFrom !== element.id && element.type === 'page' && (
                  <div
                    style={{
                      position: 'absolute', inset: 0, zIndex: 200,
                      borderRadius: 16, border: '2.5px dashed #2563eb',
                      background: 'rgba(37,99,235,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      onCreateConnection(connectingFrom!, element.id);
                      setIsConnecting(false); setConnectingFrom(null);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      onCreateConnection(connectingFrom!, element.id);
                      setIsConnecting(false); setConnectingFrom(null);
                    }}
                  >
                    <Network size={22} color="#2563eb" />
                  </div>
                )}
              </>
            )}
            
            <div
              style={{
                flex: 1,
                padding: element.type === 'page' ? '18px 16px 12px 16px' : '6px 8px',
                color: dm.text,
                fontSize: 15,
                userSelect: editingTextElement === element.id ? 'text' : 'none',
                overflow: 'visible',
                background: 'transparent',
                position: 'relative',
                cursor: editingTextElement === element.id ? 'text' : 'inherit',
                lineHeight: '1.5',
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
              {element.type === 'text' && editingTextElement === element.id ? (
                <div
                  contentEditable
                  suppressContentEditableWarning
                  autoFocus
                  style={{
                    outline: 'none',
                    cursor: 'text',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: dm.text,
                    minHeight: '1.5em',
                    width: '100%',
                    fontFamily: 'inherit',
                    fontSize: 15,
                    lineHeight: '1.5',
                  }}
                  onBlur={(e) => {
                    const content = e.currentTarget.innerHTML;
                    setElements(prev => prev.map(el => el.id === element.id ? { ...el, content } : el));
                    setEditingTextElement(null);
                  }}
                  dangerouslySetInnerHTML={{ __html: element.content || '' }}
                />
              ) : (
                <div
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: element.content ? dm.text : dm.subtext }}
                  dangerouslySetInnerHTML={{
                    __html: element.content || (element.type === 'page' ? 'Double-click to edit...' : 'Double-click to edit...')
                  }}
                />
              )}
              {/* Resize handle for text elements */}
              {element.type === 'text' && (hoveredElement === element.id || selectedElement === element.id || editingTextElement === element.id) && (
                <div
                  data-resize-handle
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, w: element.width, h: element.height };
                    setResizingElement(element.id);
                  }}
                  style={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: '#111',
                    cursor: 'nwse-resize',
                    zIndex: 10,
                  }}
                />
              )}
            </div>
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
                  background: darkMode ? '#f0f0f0' : '#000',
                  padding: '2px 8px',
                  borderRadius: 9999,
                  fontSize: 12,
                  cursor: 'pointer',
                  zIndex: 90,
                  color: darkMode ? '#000' : '#fff',
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
                      background: dm.card,
                      border: `1px solid ${dm.border}`,
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
                          color: dm.text,
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
          </div>
        ))}
      </div>

      {/* Zoom controls */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 50,
        background: dm.toolbar,
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: `1px solid ${dm.toolbarBorder}`,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center',
      }}>
        <button onClick={handleZoomIn} title="Zoom In" style={{...iconBtnStyle, color: dm.text}}>
          <ZoomIn size={20} />
        </button>
        <button onClick={handleZoomOut} title="Zoom Out" style={{...iconBtnStyle, color: dm.text}}>
          <ZoomOut size={20} />
        </button>
        <button onClick={handleResetView} title="Reset View" style={{...iconBtnStyle, color: dm.text}}>
          <Maximize2 size={20} />
        </button>
        <div style={{ width: '100%', height: 1, background: dm.border, margin: '8px 0' }} />
        <button onClick={togglePattern} title={patternType === 'grid' ? 'Switch to Dots' : 'Switch to Grid'} style={{...iconBtnStyle, color: dm.text}}>
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
        <div style={{ textAlign: 'center', fontSize: 12, color: dm.subtext, marginTop: 4 }}>{Math.round(scale * 100)}%</div>
      </div>

      {/* Page Editor Modal */}
      {editingElement && (() => {
        const nextPages = connections
          .filter(c => c.fromId === editingElement)
          .map(c => elements.find(el => el.id === c.toId))
          .filter(Boolean) as CanvasElementData[];
        const prevPages = connections
          .filter(c => c.toId === editingElement)
          .map(c => elements.find(el => el.id === c.fromId))
          .filter(Boolean) as CanvasElementData[];

        const NavCard = ({ page, side }: { page: CanvasElementData; side: 'left' | 'right' }) => (
          <button
            onClick={() => setEditingElement(page.id)}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: side === 'left' ? 'flex-end' : 'flex-start',
              gap: '3px', padding: '10px 12px',
              background: darkMode ? 'rgba(30,30,30,0.92)' : 'rgba(255,255,255,0.9)', border: `1.5px solid ${dm.border}`,
              borderRadius: '12px', cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              backdropFilter: 'blur(8px)', transition: 'all 0.15s',
              maxWidth: '120px', width: '120px',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = darkMode ? 'rgba(50,50,50,0.98)' : '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = darkMode ? '#555' : '#d1d5db'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = darkMode ? 'rgba(30,30,30,0.92)' : 'rgba(255,255,255,0.9)'; (e.currentTarget as HTMLButtonElement).style.borderColor = darkMode ? '#333' : '#ececf0'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: dm.subtext, fontSize: 11 }}>
              {side === 'left' && <ChevronLeft size={11} />}
              <span>{side === 'left' ? 'Previous' : 'Next'}</span>
              {side === 'right' && <ChevronRight size={11} />}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: dm.text, lineHeight: 1.3, wordBreak: 'break-all' }}>
              {page.label || page.pageId || 'Page'}
            </div>
          </button>
        );

        return (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px',
            }}
            onClick={() => setEditingElement(null)}
          >
            {/* Prev — left of page near bottom */}
            {prevPages.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  right: 'calc(50% + 260px)',
                  bottom: '80px',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px',
                }}
                onClick={e => e.stopPropagation()}
              >
                {prevPages.map(p => <NavCard key={p.id} page={p} side="left" />)}
              </div>
            )}

            {/* Next — right of page near bottom */}
            {nextPages.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: 'calc(50% + 260px)',
                  bottom: '80px',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px',
                }}
                onClick={e => e.stopPropagation()}
              >
                {nextPages.map(p => <NavCard key={p.id} page={p} side="right" />)}
              </div>
            )}

            <div
              style={{
                background: dm.card, borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                display: 'flex', flexDirection: 'column',
                width: '100%', maxWidth: '500px', height: '600px',
                border: `1.5px solid ${dm.border}`, overflow: 'hidden', position: 'relative',
              }}
              onClick={e => e.stopPropagation()}
            >
              {(() => { const pg = elements.find(el => el.id === editingElement); return pg?.pageId ? (
                <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 11, color: '#d1d5db', fontWeight: 500, pointerEvents: 'none', zIndex: 2 }}>{pg.pageId}</div>
              ) : null; })()}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                style={{ flex: 1, padding: '16px', overflow: 'auto', outline: 'none', fontSize: '16px', lineHeight: '1.6', color: dm.text, background: dm.card, fontFamily: 'inherit' }}
                onInput={e => {
                  const content = (e.currentTarget as HTMLDivElement).innerHTML;
                  setElements(prev => prev.map(el => el.id === editingElement ? { ...el, content } : el));
                }}
                onMouseOver={e => {
                  const target = e.target as HTMLElement;
                  const charName = target.getAttribute?.('data-char');
                  if (charName) { const rect = target.getBoundingClientRect(); setCharTooltip({ name: charName, x: rect.left, y: rect.top }); }
                }}
                onMouseOut={e => { if ((e.target as HTMLElement).getAttribute?.('data-char')) setCharTooltip(null); }}
              />
              {elements.find(el => el.id === editingElement) && (
                <div
                  dangerouslySetInnerHTML={{ __html: highlightCharacters(elements.find(el => el.id === editingElement)?.content || '') }}
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    padding: '16px', fontSize: '16px', lineHeight: '1.6',
                    color: 'transparent', background: 'transparent', pointerEvents: 'none',
                    overflow: 'auto', fontFamily: 'inherit', whiteSpace: 'pre-wrap', wordWrap: 'break-word',
                  }}
                />
              )}
            </div>
          </div>
        );
      })()}

      {/* Character tooltip */}
      {charTooltip && (() => {
        const char = characters.find(c =>
          c.name.toLowerCase() === charTooltip.name.toLowerCase() ||
          c.aliases?.some(a => a.toLowerCase() === charTooltip.name.toLowerCase())
        );
        if (!char) return null;
        return (
          <div style={{
            position: 'fixed',
            left: charTooltip.x,
            top: charTooltip.y - 8,
            transform: 'translateY(-100%)',
            zIndex: 2000,
            background: '#fff',
            border: '1.5px solid #ececf0',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            padding: '10px 12px',
            minWidth: '160px',
            maxWidth: '220px',
            pointerEvents: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: char.description ? '8px' : 0 }}>
              {char.image
                ? <img src={char.image} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', border: '1px solid #ececf0' }} />
                : <div style={{ width: 28, height: 28, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={14} color="#9ca3af" />
                  </div>
              }
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{char.name}</span>
            </div>
            {char.description && (
              <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
                {char.description.length > 80 ? char.description.slice(0, 80) + '…' : char.description}
              </div>
            )}
          </div>
        );
      })()}

      {/* Instructions */}
      {!isMobile && <div style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 50,
        background: dm.toolbar,
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: `1px solid ${dm.toolbarBorder}`,
        padding: 16,
        fontSize: 14,
        color: dm.subtext,
      }}>
        <div><b>Pan:</b> Drag Canvas</div>
        <div><b>Zoom:</b> Ctrl/Cmd + Scroll</div>
        <div><b>Connect:</b> Click icon on page</div>
        <div><b>Cancel:</b> Press Esc</div>
      </div>}

      {/* Connecting mode banner - mobile only */}
      {isMobile && isConnecting && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, background: '#2563eb', color: '#fff',
          borderRadius: 12, padding: '10px 20px',
          fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
        }}>
          <span>Tap a page to connect</span>
          <button
            onTouchEnd={(e) => { e.stopPropagation(); setIsConnecting(false); setConnectingFrom(null); }}
            onClick={() => { setIsConnecting(false); setConnectingFrom(null); }}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, color: '#fff', padding: '4px 10px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
          >Cancel</button>
        </div>
      )}

      {/* Stack prompt — shown when a connected page is dragged on top of another */}
      {stackPrompt && (
        <div style={{
          position: 'fixed',
          left: Math.min(stackPrompt.x, window.innerWidth - 220),
          top: Math.max(stackPrompt.y - 80, 12),
          zIndex: 300,
          background: dm.toolbar,
          border: `1.5px solid ${dm.toolbarBorder}`,
          borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          padding: '14px 16px',
          minWidth: 200,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          {/* Stack preview illustration */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ position: 'relative', width: 36, height: 28, flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 28, height: 20, borderRadius: 5, background: dm.border, border: `1.5px solid ${dm.toolbarBorder}` }} />
              <div style={{ position: 'absolute', top: 6, left: 6, width: 28, height: 20, borderRadius: 5, background: dm.toolbar, border: `1.5px solid ${dm.text}`, opacity: 0.9 }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: dm.text }}>Stack pages?</div>
              <div style={{ fontSize: 11, color: dm.subtext, marginTop: 1 }}>Arrange diagonally offset</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                const target = elements.find(el => el.id === stackPrompt.targetId);
                if (target) {
                  setElements(prev => prev.map(el =>
                    el.id === stackPrompt.draggedId
                      ? { ...el, x: target.x + 22, y: target.y + 22 }
                      : el
                  ));
                }
                setStackPrompt(null);
              }}
              style={{
                flex: 1, padding: '7px 0', border: 'none', borderRadius: 9,
                background: dm.text, color: dm.toolbar,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Stack
            </button>
            <button
              onClick={() => setStackPrompt(null)}
              style={{
                flex: 1, padding: '7px 0', border: `1.5px solid ${dm.toolbarBorder}`, borderRadius: 9,
                background: 'none', color: dm.subtext,
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Keep here
            </button>
          </div>
        </div>
      )}

      {/* Connecting mode banner - mobile only */}
      {isMobile && isConnecting && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, background: '#2563eb', color: '#fff',
          borderRadius: 12, padding: '10px 20px',
          fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
        }}>
          <span>Tap a page to connect</span>
          <button
            onTouchEnd={(e) => { e.stopPropagation(); setIsConnecting(false); setConnectingFrom(null); }}
            onClick={() => { setIsConnecting(false); setConnectingFrom(null); }}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, color: '#fff', padding: '4px 10px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
          >Cancel</button>
        </div>
      )}

      {/* Position Tooltip - Shows coordinates on page hover */}
      {hoveredElement && elements.find(el => el.id === hoveredElement)?.type === 'page' && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 100,
          zIndex: 50,
          background: dm.toolbar,
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: `1px solid ${dm.toolbarBorder}`,
          padding: '12px 16px',
          fontSize: 13,
          color: dm.text,
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
      {onBackToHome && (
        <div style={{
          position: 'fixed', top: 24, left: 24, zIndex: 51,
          display: 'flex', alignItems: 'center', gap: 10,
          background: dm.toolbar, borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: `1.5px solid ${dm.toolbarBorder}`,
          padding: '8px 14px 8px 10px',
        }}>
          <button
            onClick={onBackToHome}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, fontWeight: 500, color: dm.subtext, padding: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = dm.text; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = dm.subtext; }}
          >
            <ChevronLeft size={14} /> Home
          </button>
          <span style={{ color: dm.border, fontSize: 14 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: dm.text }}>
            {projectName || 'Untitled'}
          </span>
        </div>
      )}

      <button
        onClick={onOpenCharacterModal}
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 51,
          background: dm.toolbar,
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: `1.5px solid ${dm.toolbarBorder}`,
          padding: '10px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = darkMode ? '#2a2a2a' : '#f5f5f7';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = dm.toolbar;
        }}
      >
        <User size={20} color={dm.text} />
      </button>

      {/* Dark mode toggle */}
      <button
        onClick={() => toggleDark(!darkMode)}
        style={{
          position: 'fixed',
          top: 80,
          right: 24,
          zIndex: 51,
          background: dm.toolbar,
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: `1.5px solid ${dm.toolbarBorder}`,
          padding: '10px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = darkMode ? '#2a2a2a' : '#f5f5f7';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = dm.toolbar;
        }}
        title={darkMode ? 'Switch to Light' : 'Switch to Dark'}
      >
        {darkMode ? <Sun size={20} color={dm.text} /> : <Moon size={20} color={dm.text} />}
      </button>

      {/* JSON Modal */}
      {showJsonModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
          onClick={() => { setShowJsonModal(false); setIsImportMode(false); }}
        >
          <div
            style={{
              background: dm.card, borderRadius: '20px',
              boxShadow: darkMode ? '0 4px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08), 0 0 0 1.5px #ececf0',
              width: '100%', maxWidth: '560px', maxHeight: '82vh',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '16px', borderBottom: `1.5px solid ${dm.border}`,
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              {isImportMode && (
                <button
                  onClick={() => setIsImportMode(false)}
                  style={{ background: 'none', border: `1.5px solid ${dm.border}`, borderRadius: '8px', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: dm.subtext, flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.background = dm.bg)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              <span style={{ flex: 1, fontSize: '15px', fontWeight: '600', color: dm.text }}>
                {isImportMode ? 'Import Network' : 'Page Network'}
              </span>
              {!isImportMode && (
                <button
                  onClick={() => setIsImportMode(true)}
                  style={{ background: 'none', border: `1.5px solid ${dm.border}`, borderRadius: '8px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: dm.text }}
                  onMouseEnter={e => (e.currentTarget.style.background = dm.bg)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <Upload size={13} /> Import
                </button>
              )}
              <button
                onClick={() => { setShowJsonModal(false); setIsImportMode(false); }}
                style={{ background: 'none', border: `1.5px solid ${dm.border}`, borderRadius: '8px', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: dm.subtext, flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.background = dm.bg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isImportMode ? (
                <>
                  <textarea
                    value={jsonInput}
                    onChange={e => setJsonInput(e.target.value)}
                    placeholder="Paste your network JSON here..."
                    autoFocus
                    style={{
                      width: '100%', height: '280px', padding: '14px',
                      border: `1.5px solid ${dm.border}`, borderRadius: '12px',
                      fontSize: '13px', fontFamily: 'Monaco, Consolas, monospace',
                      resize: 'none', outline: 'none', color: dm.text,
                      background: dm.bg, boxSizing: 'border-box', lineHeight: '1.6',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = dm.text)}
                    onBlur={e => (e.currentTarget.style.borderColor = dm.border)}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setIsImportMode(false)}
                      style={{ flex: 1, padding: '10px', border: `1.5px solid ${dm.border}`, borderRadius: '10px', background: dm.card, cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: dm.text, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onMouseEnter={e => (e.currentTarget.style.background = dm.bg)}
                      onMouseLeave={e => (e.currentTarget.style.background = dm.card)}
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button
                      onClick={() => {
                        try {
                          const trimmedInput = jsonInput.trim();
                          if (!trimmedInput) { alert('Please paste JSON first'); return; }
                          const network = JSON.parse(trimmedInput);
                          const newElements: CanvasElementData[] = [];
                          const newConnections: ConnectionData[] = [];
                          Object.entries(network).forEach(([pageKey, pageData]: [string, any]) => {
                            const coords = pageData.cordinates.split(',');
                            newElements.push({
                              id: `page-${Date.now()}-${pageKey}`,
                              type: 'page', x: parseInt(coords[0]), y: parseInt(coords[1]),
                              width: 180, height: 254, content: pageData.text,
                              pageId: pageData.pageid, status: pageData.status || 'draft', label: pageData.label || ''
                            });
                          });
                          Object.entries(network).forEach(([_, pageData]: [string, any]) => {
                            if (pageData.next?.length > 0) {
                              const fromEl = newElements.find(el => el.pageId === pageData.pageid);
                              pageData.next.forEach((nextId: string) => {
                                const toEl = newElements.find(el => el.pageId === nextId);
                                if (fromEl && toEl && !newConnections.some(c =>
                                  (c.fromId === fromEl.id && c.toId === toEl.id) ||
                                  (c.fromId === toEl.id && c.toId === fromEl.id)
                                )) {
                                  newConnections.push({ id: `conn-${Date.now()}-${Math.random()}`, fromId: fromEl.id, toId: toEl.id });
                                }
                              });
                            }
                          });
                          onImportNetwork(newElements, newConnections);
                          setShowJsonModal(false); setJsonInput(''); setIsImportMode(false);
                        } catch { alert('Invalid JSON format'); }
                      }}
                      style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', background: '#000', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#222')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#000')}
                    >
                      <FileText size={14} /> Generate Pages
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <pre style={{
                    background: dm.bg, border: `1.5px solid ${dm.border}`,
                    borderRadius: '12px', padding: '14px',
                    fontSize: '13px', fontFamily: 'Monaco, Consolas, monospace',
                    color: dm.text, overflow: 'auto', margin: 0,
                    whiteSpace: 'pre-wrap', lineHeight: '1.6', flex: 1,
                  }}>
                    {JSON.stringify(onGenerateNetwork(), null, 2)}
                  </pre>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => { setShowJsonModal(false); setIsImportMode(false); }}
                      style={{ flex: 1, padding: '10px', border: `1.5px solid ${dm.border}`, borderRadius: '10px', background: dm.card, cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: dm.text, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onMouseEnter={e => (e.currentTarget.style.background = dm.bg)}
                      onMouseLeave={e => (e.currentTarget.style.background = dm.card)}
                    >
                      <X size={14} /> Close
                    </button>
                    <button
                      onClick={() => navigator.clipboard?.writeText(JSON.stringify(onGenerateNetwork(), null, 2))}
                      style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', background: '#000', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#222')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#000')}
                    >
                      <Copy size={14} /> Copy JSON
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
