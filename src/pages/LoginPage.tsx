import React, { useState } from 'react';
import { BookOpen, LogIn } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, loading, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    await onLogin(username, password);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #ececf0',
    borderRadius: 12,
    fontSize: 15,
    outline: 'none',
    background: '#fff',
    color: '#111',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        border: '1.5px solid #ececf0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        padding: '40px 44px',
        width: '100%',
        maxWidth: 480,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>StoryNet</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: '#888', margin: '0 0 28px' }}>Sign in to your account</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              autoFocus
              autoComplete="username"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = '#111')}
              onBlur={e => (e.currentTarget.style.borderColor = '#ececf0')}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = '#111')}
              onBlur={e => (e.currentTarget.style.borderColor = '#ececf0')}
            />
          </div>

          {error && (
            <div style={{
              background: '#fff5f5', border: '1.5px solid #fecaca',
              borderRadius: 10, padding: '10px 14px',
              fontSize: 13, color: '#dc2626',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            style={{
              marginTop: 4,
              padding: '13px',
              background: loading || !username.trim() || !password ? '#d1d5db' : '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading || !username.trim() || !password ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.15s',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Signing in...' : <><LogIn size={16} /> Sign in</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
