import React from 'react';
import { Project } from '../../types/project';
import { FileText, Trash2, ChevronRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpen, onDelete }) => {
  const pageCount = project.data?.elements?.filter(e => e.type === 'page').length ?? 0;
  const connCount = project.data?.connections?.length ?? 0;
  const updated = new Date(project.updated_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid #ececf0',
        borderRadius: 16,
        padding: '20px',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
      }}
      onClick={() => onOpen(project)}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#d1d5db';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#ececf0';
      }}
    >
      {/* Icon + title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <FileText size={18} color="#555" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 600, color: '#111',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {project.name}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Updated {updated}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12 }}>
        <span style={{
          fontSize: 12, color: '#666', background: '#f5f5f7',
          borderRadius: 8, padding: '4px 10px', fontWeight: 500,
        }}>
          {pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </span>
        <span style={{
          fontSize: 12, color: '#666', background: '#f5f5f7',
          borderRadius: 8, padding: '4px 10px', fontWeight: 500,
        }}>
          {connCount} {connCount === 1 ? 'connection' : 'connections'}
        </span>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <button
          onClick={e => { e.stopPropagation(); onDelete(project.id); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#ccc', padding: 4, borderRadius: 8, display: 'flex', alignItems: 'center',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = '#ccc')}
          title="Delete project"
        >
          <Trash2 size={15} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#888', fontWeight: 500 }}>
          Open <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
