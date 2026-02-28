import { useState } from 'react';
import { InfiniteCanvas } from './components/InfiniteCanvas';
import { CanvasElement, CanvasElementData } from './components/CanvasElement';
import { LeftSidebar } from './components/LeftSidebar';
import { PageEditor } from './components/PageEditor';

export interface Connection {
  id: string;
  from: string;
  to: string;
}

function App() {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [elements, setElements] = useState<CanvasElementData[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [draggingConnection, setDraggingConnection] = useState<{ from: string; toX: number; toY: number } | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);

  const handleAddText = () => {
    const viewportCenterX = (window.innerWidth / 2 - offset.x) / scale;
    const viewportCenterY = (window.innerHeight / 2 - offset.y) / scale;

    const newElement: CanvasElementData = {
      id: Date.now().toString(),
      type: 'text',
      x: viewportCenterX - 125,
      y: viewportCenterY - 20,
      width: 250,
      height: 40,
      content: 'Double-click to edit text',
    };

    setElements([...elements, newElement]);
  };

  const handleAddPage = () => {
    const viewportCenterX = (window.innerWidth / 2 - offset.x) / scale;
    const viewportCenterY = (window.innerHeight / 2 - offset.y) / scale;

    const newElement: CanvasElementData = {
      id: Date.now().toString(),
      type: 'page',
      x: viewportCenterX - 90,
      y: viewportCenterY - 127,
      width: 180,
      height: 254,
      content: '',
      label: 'Draft',
    };

    setElements([...elements, newElement]);
  };

  const handleUpdateElement = (id: string, updates: Partial<CanvasElementData>) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    // Also delete any connections involving this element
    setConnections(connections.filter((conn) => conn.from !== id && conn.to !== id));
  };

  const handleStartConnection = (fromId: string, x: number, y: number) => {
    setDraggingConnection({ from: fromId, toX: x, toY: y });
  };

  const handleDragConnection = (x: number, y: number) => {
    if (draggingConnection) {
      setDraggingConnection({ ...draggingConnection, toX: x, toY: y });
    }
  };

  const handleEndConnection = (toId: string | null) => {
    if (draggingConnection && toId && toId !== draggingConnection.from) {
      // Check if connection already exists
      const exists = connections.some(
        (conn) =>
          (conn.from === draggingConnection.from && conn.to === toId) ||
          (conn.from === toId && conn.to === draggingConnection.from)
      );
      
      if (!exists) {
        const newConnection: Connection = {
          id: Date.now().toString(),
          from: draggingConnection.from,
          to: toId,
        };
        setConnections([...connections, newConnection]);
      }
    }
    setDraggingConnection(null);
  };

  const handleOpenPageEditor = (pageId: string) => {
    setEditingPageId(pageId);
  };

  const handleClosePageEditor = () => {
    setEditingPageId(null);
  };

  const handleSavePageContent = (content: string) => {
    if (editingPageId) {
      handleUpdateElement(editingPageId, { content });
    }
  };

  const totalPageCount = elements.filter((el) => el.type === 'page').length;
  const editingPage = editingPageId ? elements.find((el) => el.id === editingPageId) : null;

  return (
    <div className="w-full h-screen">
      <LeftSidebar onAddText={handleAddText} onAddPage={handleAddPage} />
      
      <InfiniteCanvas
        scale={scale}
        onScaleChange={setScale}
        offset={offset}
        onOffsetChange={setOffset}
      >
        {/* Render connection lines */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          {connections.map((connection) => {
            const fromElement = elements.find((el) => el.id === connection.from);
            const toElement = elements.find((el) => el.id === connection.to);
            if (!fromElement || !toElement) return null;

            const x1 = fromElement.x + fromElement.width;
            const y1 = fromElement.y + fromElement.height / 2;
            const x2 = toElement.x;
            const y2 = toElement.y + toElement.height / 2;

            // Calculate flowchart-style path with right angles
            const midX = x1 + (x2 - x1) / 2;
            const pathData = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;

            return (
              <path
                key={connection.id}
                d={pathData}
                stroke="#3b82f6"
                strokeWidth={2 / scale}
                fill="none"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          
          {/* Dragging connection line */}
          {draggingConnection && (() => {
            const fromElement = elements.find((el) => el.id === draggingConnection.from);
            if (!fromElement) return null;

            const x1 = fromElement.x + fromElement.width;
            const y1 = fromElement.y + fromElement.height / 2;
            const x2 = draggingConnection.toX;
            const y2 = draggingConnection.toY;

            // Calculate flowchart-style path with right angles
            const midX = x1 + (x2 - x1) / 2;
            const pathData = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;

            return (
              <path
                d={pathData}
                stroke="#93c5fd"
                strokeWidth={2 / scale}
                fill="none"
                strokeDasharray="5,5"
              />
            );
          })()}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
            </marker>
          </defs>
        </svg>

        {elements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            scale={scale}
            onUpdate={handleUpdateElement}
            onDelete={handleDeleteElement}
            totalPageCount={totalPageCount}
            onStartConnection={handleStartConnection}
            onDragConnection={handleDragConnection}
            onEndConnection={handleEndConnection}
            isDraggingConnection={draggingConnection?.from === element.id}
            onOpenPageEditor={handleOpenPageEditor}
          />
        ))}
      </InfiniteCanvas>

      {/* Page Editor Modal */}
      {editingPage && (
        <PageEditor
          content={editingPage.content || ''}
          onClose={handleClosePageEditor}
          onSave={handleSavePageContent}
        />
      )}
    </div>
  );
}

export default App;
