import React, { useState, useEffect } from 'react';
import InfiniteCanvas from './components/Canvas/InfiniteCanvas';
import CharacterModal from './components/CharacterModal';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import { CanvasElementData, ConnectionData } from './types/canvas';
import { Character } from './types/character';
import { Project, ProjectData } from './types/project';
import { CANVAS_SIZE } from './constants/canvas';
import { useAuth } from './hooks/useAuth';
import { useProjects } from './hooks/useProjects';

type AppView = 'login' | 'home' | 'canvas';

function App() {
  const { user, login, logout, loading: authLoading, error: authError } = useAuth();
  const { saveProject } = useProjects(user?.id ?? null);
  const [view, setView] = useState<AppView>(user ? 'home' : 'login');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const [elements, setElements] = useState<CanvasElementData[]>([]);
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Auto-save every 30s when in canvas view
  useEffect(() => {
    if (view !== 'canvas' || !activeProject) return;
    const interval = setInterval(() => {
      saveProject(activeProject.id, { elements, connections, characters });
    }, 30000);
    return () => clearInterval(interval);
  }, [view, activeProject, elements, connections, characters]);

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    const data = project.data || { elements: [], connections: [], characters: [] };
    setElements(data.elements?.length ? data.elements : [
      {
        id: 'initial-page',
        type: 'page',
        x: CANVAS_SIZE / 2 - 90,
        y: CANVAS_SIZE / 2 - 127,
        width: 180, height: 254,
        label: 'Draft', pageId: 'PG-A7B9-C2D4', status: 'draft',
      }
    ]);
    setConnections(data.connections || []);
    setCharacters(data.characters || []);
    setView('canvas');
  };

  const handleBackToHome = async () => {
    if (activeProject) {
      await saveProject(activeProject.id, { elements, connections, characters });
    }
    setView('home');
    setActiveProject(null);
  };

  const handleLogin = async (username: string, password: string) => {
    const ok = await login(username, password);
    if (ok) setView('home');
    return ok;
  };

  const handleLogout = () => {
    logout();
    setView('login');
    setActiveProject(null);
  };

  const handleAddPage = () => {
    const id = `page-${Date.now()}`;
    const existingPages = elements.filter(el => el.type === 'page');
    const generatePageId = () => {
      const chars = '0123456789ABCDEF';
      const part1 = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const part2 = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      return `PG-${part1}-${part2}`;
    };
    const pageId = generatePageId();
    const lastPage = existingPages[existingPages.length - 1];
    
    let x, y;
    if (lastPage) {
      x = lastPage.x + lastPage.width + 50;
      y = lastPage.y;
    } else {
      x = CANVAS_SIZE / 2 - 90;
      y = CANVAS_SIZE / 2 - 127;
    }
    
    const newPage = {
      id,
      type: 'page' as const,
      x,
      y,
      width: 180,
      height: 254,
      pageId,
      status: 'draft',
      label: ''
    };
    setElements(prev => [...prev, newPage]);
  };

  const handleAddText = () => {
    const id = `text-${Date.now()}`;
    const existingTexts = elements.filter(el => el.type === 'text');
    const lastText = existingTexts[existingTexts.length - 1];
    
    let x, y;
    if (lastText) {
      x = lastText.x + lastText.width + 30;
      y = lastText.y;
    } else {
      x = CANVAS_SIZE / 2 - 100;
      y = CANVAS_SIZE / 2 + 200;
    }
    
    const newText = {
      id,
      type: 'text' as const,
      x,
      y,
      width: 200,
      height: 40,
      content: '',
    };
    setElements(prev => [...prev, newText]);
  };

  const handleDeleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    // Remove all connections related to this element
    setConnections(prev => prev.filter(conn => conn.fromId !== id && conn.toId !== id));
  };

  const handleCreateConnection = (fromId: string, toId: string) => {
    if (connections.some(conn => conn.fromId === fromId && conn.toId === toId)) return;
    // Limit: max 5 outgoing (next) from fromId, max 5 incoming (prev) to toId
    if (connections.filter(c => c.fromId === fromId).length >= 5) return;
    if (connections.filter(c => c.toId === toId).length >= 5) return;
    setConnections(prev => [...prev, { id: `conn-${Date.now()}`, fromId, toId }]);
  };

  const handleDeleteConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };

  const handleAddCharacter = (character: Omit<Character, 'id'>) => {
    const newCharacter: Character = {
      ...character,
      id: `char-${Date.now()}`
    };
    setCharacters(prev => [...prev, newCharacter]);
  };

  const handleUpdateStatus = (elementId: string, status: 'draft'|'idea'|'done') => {
    setElements(prev => prev.map(el =>
      el.id === elementId ? { ...el, status } : el
    ));
  };

  const handleUpdateCharacter = (id: string, character: Omit<Character, 'id'>) => {
    setCharacters(prev => prev.map(char => 
      char.id === id ? { ...character, id } : char
    ));
  };

  const handleDeleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(char => char.id !== id));
  };

  const generatePageNetwork = () => {
    const pages = elements.filter(el => el.type === 'page');
    const network: Record<string, any> = {};
    
    pages.forEach((page, index) => {
      const pageKey = `page${index + 1}`;
      const connectedPages = connections
        .filter(conn => conn.fromId === page.id || conn.toId === page.id)
        .map(conn => {
          const connectedPageId = conn.fromId === page.id ? conn.toId : conn.fromId;
          const connectedPage = pages.find(p => p.id === connectedPageId);
          const connectedIndex = pages.findIndex(p => p.id === connectedPageId);
          return connectedIndex >= 0 ? `page${connectedIndex + 1}` : null;
        })
        .filter(Boolean);
      
      network[pageKey] = {
        pageid: page.pageId,
        cordinates: `${page.x},${page.y}`,
        text: page.content || '',
        status: page.status || 'draft',
        next: connectedPages.map(connectedPageKey => {
          const connectedPage = pages.find((p, i) => `page${i + 1}` === connectedPageKey);
          return connectedPage?.pageId || '';
        }).filter(Boolean)
      };
    });
    
    return network;
  };

  return (
    <>
      {view === 'login' && (
        <LoginPage onLogin={handleLogin} loading={authLoading} error={authError} />
      )}
      {view === 'home' && user && (
        <HomePage user={user} onLogout={handleLogout} onOpenProject={handleOpenProject} />
      )}
      {view === 'canvas' && (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <InfiniteCanvas
        elements={elements}
        setElements={setElements}
        connections={connections}
        onAddPage={handleAddPage}
        onAddText={handleAddText}
        onDeleteElement={handleDeleteElement}
        onCreateConnection={handleCreateConnection}
        onDeleteConnection={handleDeleteConnection}
        onOpenCharacterModal={() => setIsCharacterModalOpen(true)}
        characters={characters}
        onGenerateNetwork={generatePageNetwork}
        onImportNetwork={(newElements, newConnections) => {
          setElements(newElements);
          setConnections(newConnections);
        }}
          onUpdateStatus={handleUpdateStatus}
          darkMode={darkMode}
          onDarkModeChange={setDarkMode}
          onBackToHome={handleBackToHome}
          projectName={activeProject?.name}
      />
      
      <CharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        characters={characters}
        onAddCharacter={handleAddCharacter}
        onUpdateCharacter={handleUpdateCharacter}
        onDeleteCharacter={handleDeleteCharacter}
        darkMode={darkMode}
      />
      </div>
      )}
    </>
  );
}

export default App;
