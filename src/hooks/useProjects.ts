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
      const { data, error: dbError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (dbError) throw dbError;
      setProjects(data || []);
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createProject = async (name: string): Promise<Project | null> => {
    if (!userId) return null;
    const emptyData: ProjectData = { elements: [], connections: [], characters: [] };
    const { data, error: dbError } = await supabase
      .from('projects')
      .insert({ user_id: userId, name: name.trim(), data: emptyData })
      .select()
      .single();

    if (dbError || !data) return null;
    setProjects(prev => [data, ...prev]);
    return data;
  };

  const saveProject = async (projectId: string, projectData: ProjectData): Promise<boolean> => {
    const { error: dbError } = await supabase
      .from('projects')
      .update({ data: projectData, updated_at: new Date().toISOString() })
      .eq('id', projectId);

    if (!dbError) {
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, data: projectData, updated_at: new Date().toISOString() } : p
      ));
    }
    return !dbError;
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
    const { error: dbError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (!dbError) setProjects(prev => prev.filter(p => p.id !== projectId));
    return !dbError;
  };

  return { projects, loading, error, fetchProjects, createProject, saveProject, deleteProject };
}
