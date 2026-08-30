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
        {/* Logo + sign out */}
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
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '20px 32px 16px' }}>
          <div style={{ position: 'relative' }}>
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
        </div>

        {/* Add project */}
        <div style={{ padding: '0 32px 16px', borderBottom: '1.5px solid #ececf0' }}>
          <button
            onClick={() => setShowNewModal(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', background: '#111', color: '#fff',
              border: 'none', borderRadius: 12,
              padding: '11px 20px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#333')}
            onMouseLeave={e => (e.currentTarget.style.background = '#111')}
          >
            <Plus size={16} /> Add Project
          </button>
        </div>

        {/* Project list */}
        <div className="project-list-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 32px' }}>
          <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 12px' }}>
            {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}{search ? ' found' : ''}
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa', fontSize: 14 }}>
              Loading projects...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '48px 0',
              background: '#fafafa', borderRadius: 16,
              border: '1.5px solid #ececf0',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 14px',
              }}>
                <BookOpen size={20} color="#bbb" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 6 }}>
                {search ? 'No results found' : 'No projects yet'}
              </div>
              <div style={{ fontSize: 13, color: '#aaa' }}>
                {search ? 'Try a different search term' : 'Create your first story network'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

        <div style={{ padding: '16px 32px', borderTop: '1.5px solid #ececf0' }}>
          <p style={{ fontSize: 11, color: '#ccc', margin: 0, textAlign: 'center' }}>StoryNet — Visual Story Mapping</p>
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

      <style>{`
        .project-list-scroll {
          scrollbar-width: thin;
          scrollbar-color: #e0e0e5 transparent;
        }
        .project-list-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .project-list-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .project-list-scroll::-webkit-scrollbar-thumb {
          background: #e0e0e5;
          border-radius: 8px;
        }
        .project-list-scroll::-webkit-scrollbar-thumb:hover {
          background: #c8c8ce;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
