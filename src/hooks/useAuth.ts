import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AppUser } from '../types/project';

const SESSION_KEY = 'storynet_user';

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Calls the Postgres login() function — password hash never leaves the DB
      const { data, error: rpcError } = await supabase
        .rpc('login', { p_username: username.trim().toLowerCase(), p_password: password });

      if (rpcError || !data || data.length === 0) {
        setError('Invalid username or password');
        return false;
      }

      const appUser: AppUser = { id: data[0].id, username: data[0].username };
      localStorage.setItem(SESSION_KEY, JSON.stringify(appUser));
      setUser(appUser);
      return true;
    } catch {
      setError('Something went wrong. Try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return { user, login, logout, loading, error };
}
