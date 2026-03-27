import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Project, ProjectData } from '../types/project';

export function useProjects(userId: string | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase
        .rpc('get_projects', { p_user_id: userId });
      if (rpcError) throw rpcError;
      setProjects(data || []);
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createProject = async (name: string): Promise<Project | null> => {
    if (!userId) return null;
    const { data, error: rpcError } = await supabase
      .rpc('create_project', { p_user_id: userId, p_name: name.trim() });
    if (rpcError || !data?.length) return null;
    const project = data[0] as Project;
    setProjects(prev => [project, ...prev]);
    return project;
  };

  const saveProject = async (projectId: string, projectData: ProjectData): Promise<boolean> => {
    const { data, error: rpcError } = await supabase
      .rpc('save_project', { p_project_id: projectId, p_user_id: userId, p_data: projectData });
    if (!rpcError && data) {
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, data: projectData, updated_at: new Date().toISOString() } : p
      ));
    }
    return !rpcError && !!data;
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
    const { data, error: rpcError } = await supabase
      .rpc('delete_project', { p_project_id: projectId, p_user_id: userId });
    if (!rpcError && data) setProjects(prev => prev.filter(p => p.id !== projectId));
    return !rpcError && !!data;
  };

  return { projects, loading, error, fetchProjects, createProject, saveProject, deleteProject };
}
