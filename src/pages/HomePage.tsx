import React, { useEffect, useState } from 'react';
import { AppUser, Project } from '../types/project';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/home/ProjectCard';
import { BookOpen, Plus, LogOut, X } from 'lucide-react';

interface HomePageProps {
  user: AppUser;
  onLogout: () => void;
  onOpenProject: (project: Project) => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, onLogout, onOpenProject }) => {
  const { projects, loading, fetchProjects, createProject, deleteProject } = useProjects(user.id);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

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

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1.5px solid #ececf0',
        padding: '0 32px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>StoryNet</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 1, height: 20, background: '#ececf0' }} />
          <span style={{ fontSize: 13, color: '#888' }}>{user.username}</span>
          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: '1.5px solid #ececf0',
              borderRadius: 10, padding: '6px 12px',
              fontSize: 13, fontWeight: 500, color: '#555',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget.style.borderColor = '#111'); (e.currentTarget.style.color = '#111'); }}
            onMouseLeave={e => { (e.currentTarget.style.borderColor = '#ececf0'); (e.currentTarget.style.color = '#555'); }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 20, borderBottom: '1.5px solid #ececf0' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.3px' }}>
              Your Projects
            </h1>
            <p style={{ fontSize: 14, color: '#888', margin: '4px 0 0' }}>
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#111', color: '#fff',
              border: 'none', borderRadius: 12,
              padding: '10px 18px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#333')}
            onMouseLeave={e => (e.currentTarget.style.background = '#111')}
          >
            <Plus size={16} /> New Project
          </button>
        </div>

        {/* Project grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 15 }}>
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0',
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
            <div style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 8 }}>No projects yet</div>
            <div style={{ fontSize: 14, color: '#aaa', marginBottom: 24 }}>Create your first story network</div>
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
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {projects.map(project => (
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
