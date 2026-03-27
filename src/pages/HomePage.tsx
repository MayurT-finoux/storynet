import React, { useEffect, useState } from 'react';
import { AppUser, Project } from '../types/project';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/home/ProjectCard';
import { BookOpen, Plus, LogOut, X, Search } from 'lucide-react';

interface HomePageProps {
  user: AppUser;
  onLogout: () => void;
  onOpenProject: (project: Project) => void;
}

const PANEL_WIDTH = 480;

const HomePage: React.FC<HomePageProps> = ({ user, onLogout, onOpenProject }) => {
  const { projects, loading, fetchProjects, createProject, deleteProject } = useProjects(user.id);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const project = await createProject(newName);
    setCreating(false);
    if (project) {
      setShowNewModal(false);
      setNewName('');
      onOpenProject(project);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    await deleteProject(projectId);
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: '#f5f5f7',
    }}>
      {/* Left sidebar */}
      <div style={{
        width: PANEL_WIDTH,
        minWidth: PANEL_WIDTH,
        background: '#fff',
        borderRight: '1.5px solid #ececf0',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        boxSizing: 'border-box',
      }}>
        {/* Sidebar header */}
        <div style={{ padding: '28px 32px 24px', borderBottom: '1.5px solid #ececf0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookOpen size={18} color="#fff" />
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>StoryNet</span>
            </div>
            <button
              onClick={onLogout}
              title="Sign out"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: '1.5px solid #ececf0',
                borderRadius: 9, padding: '6px 10px',
                fontSize: 12, fontWeight: 500, color: '#888',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget.style.borderColor = '#111'); (e.currentTarget.style.color = '#111'); }}
              onMouseLeave={e => { (e.currentTarget.style.borderColor = '#ececf0'); (e.currentTarget.style.color = '#888'); }}
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>

          {/* User info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#f5f5f7', borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{user.username}</div>
              <div style={{ fontSize: 12, color: '#aaa' }}>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</div>
            </div>
          </div>
        </div>

        {/* Search + New */}
        <div style={{ padding: '20px 32px 16px', borderBottom: '1.5px solid #ececf0' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={14} color="#bbb" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search projects..."
                style={{
                  width: '100%', padding: '9px 12px 9px 32px',
                  border: '1.5px solid #ececf0', borderRadius: 10,
                  fontSize: 13, outline: 'none', color: '#111',
                  background: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#111')}
                onBlur={e => (e.currentTarget.style.borderColor = '#ececf0')}
              />
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#111', color: '#fff',
                border: 'none', borderRadius: 10,
                padding: '9px 14px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'background 0.15s', flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#333')}
              onMouseLeave={e => (e.currentTarget.style.background = '#111')}
            >
              <Plus size={15} /> New
            </button>
          </div>
        </div>

        {/* Project list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#bbb', fontSize: 13 }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#bbb', fontSize: 13 }}>
              {search ? 'No projects match your search' : 'No projects yet'}
            </div>
          ) : (
            filtered.map(project => (
              <div
                key={project.id}
                onClick={() => onOpenProject(project)}
                style={{
                  padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                  marginBottom: 4, transition: 'background 0.12s',
                  border: '1.5px solid transparent',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = '#f5f5f7';
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#ececf0';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {project.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#aaa' }}>
                      {(project.data?.elements?.length || 0)} pages · {(project.data?.connections?.length || 0)} connections
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(project.id); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#ddd', padding: '4px', borderRadius: 6,
                      display: 'flex', alignItems: 'center', transition: 'color 0.12s', flexShrink: 0,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#ddd')}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '16px 32px', borderTop: '1.5px solid #ececf0' }}>
          <p style={{ fontSize: 11, color: '#ccc', margin: 0, textAlign: 'center' }}>StoryNet — Visual Story Mapping</p>
        </div>
      </div>

      {/* Right content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'auto' }}>
        {/* Top bar */}
        <div style={{
          padding: '32px 40px 0',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              Your Projects
            </h1>
            <p style={{ fontSize: 14, color: '#aaa', margin: 0 }}>
              {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}{search ? ' found' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#111', color: '#fff',
              border: 'none', borderRadius: 12,
              padding: '11px 20px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#333')}
            onMouseLeave={e => (e.currentTarget.style.background = '#111')}
          >
            <Plus size={16} /> New Project
          </button>
        </div>

        <div style={{ flex: 1, padding: '28px 40px 40px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa', fontSize: 15 }}>
              Loading projects...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '100px 0',
              background: '#fff', borderRadius: 20,
              border: '1.5px solid #ececf0',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: '#f5f5f7', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px',
              }}>
                <BookOpen size={24} color="#bbb" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 8 }}>
                {search ? 'No results found' : 'No projects yet'}
              </div>
              <div style={{ fontSize: 14, color: '#aaa', marginBottom: 24 }}>
                {search ? 'Try a different search term' : 'Create your first story network'}
              </div>
              {!search && (
                <button
                  onClick={() => setShowNewModal(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: '#111', color: '#fff',
                    border: 'none', borderRadius: 12,
                    padding: '10px 20px', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={16} /> New Project
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16,
            }}>
              {filtered.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={onOpenProject}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
          onClick={() => { setShowNewModal(false); setNewName(''); }}
        >
          <div
            style={{
              background: '#fff', borderRadius: 20,
              border: '1.5px solid #ececf0',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              padding: '28px', width: '100%', maxWidth: 400,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>New Project</span>
              <button
                onClick={() => { setShowNewModal(false); setNewName(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
                  Project name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. My Novel, Chapter 1..."
                  autoFocus
                  style={{
                    width: '100%', padding: '12px 14px',
                    border: '1.5px solid #ececf0', borderRadius: 12,
                    fontSize: 15, outline: 'none', color: '#111',
                    background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#111')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#ececf0')}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => { setShowNewModal(false); setNewName(''); }}
                  style={{
                    flex: 1, padding: '11px',
                    border: '1.5px solid #ececf0', borderRadius: 12,
                    background: '#fff', color: '#555',
                    fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  style={{
                    flex: 1, padding: '11px',
                    border: 'none', borderRadius: 12,
                    background: creating || !newName.trim() ? '#d1d5db' : '#111',
                    color: '#fff', fontSize: 14, fontWeight: 600,
                    cursor: creating || !newName.trim() ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
