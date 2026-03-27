import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, LogIn } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const PANEL_WIDTH = 480;

const StoryCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const nodes = Array.from({ length: 9 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      w: 110 + Math.random() * 60,
      h: 52 + Math.random() * 20,
      label: ['Chapter 1', 'The Hero', 'Dark Forest', 'Betrayal', 'The Quest', 'Old Sage', 'Final Act', 'Revelation', 'Epilogue'][i],
      alpha: 0.55 + Math.random() * 0.3,
    }));

    const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[0,6],[1,4],[2,7],[7,8],[3,8]];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      // edges
      edges.forEach(([a, b]) => {
        const na = nodes[a], nb = nodes[b];
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // nodes
      nodes.forEach(n => {
        const r = 12;
        ctx.beginPath();
        ctx.roundRect(n.x - n.w / 2, n.y - n.h / 2, n.w, n.h, r);
        ctx.fillStyle = `rgba(255,255,255,${n.alpha * 0.07})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${n.alpha * 0.18})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = `rgba(255,255,255,${n.alpha * 0.7})`;
        ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.label, n.x, n.y);
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};

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
      display: 'flex',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Left panel — form */}
      <div style={{
        width: PANEL_WIDTH,
        minWidth: PANEL_WIDTH,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 52px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>StoryNet</span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Welcome back</h1>
        <p style={{ fontSize: 15, color: '#888', margin: '0 0 36px' }}>Sign in to continue to your stories</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 7 }}>
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
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 7 }}>
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
              padding: '14px',
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

        <p style={{ marginTop: 'auto', paddingTop: 48, fontSize: 12, color: '#ccc', textAlign: 'center' }}>
          StoryNet — Visual Story Mapping
        </p>
      </div>

      {/* Right panel — animated canvas */}
      <div style={{
        flex: 1,
        background: '#111',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle radial glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 60% 40%, rgba(255,255,255,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <StoryCanvas />
        {/* Bottom tagline */}
        <div style={{
          position: 'absolute', bottom: 40, left: 0, right: 0,
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.5px' }}>
            Map your story universe
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
            Connect characters, chapters, and plot threads visually
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
