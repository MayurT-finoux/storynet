import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Upload, ChevronLeft, User, UserPlus } from 'lucide-react';
import { Character } from '../types/character';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onAddCharacter: (character: Omit<Character, 'id'>) => void;
  onUpdateCharacter: (id: string, character: Omit<Character, 'id'>) => void;
  onDeleteCharacter: (id: string) => void;
  darkMode?: boolean;
}

type ModalView = 'list' | 'form' | 'preview';

const inputStyle = (dm: any): React.CSSProperties => ({
  width: '100%',
  padding: '10px 12px',
  border: `1.5px solid ${dm.border}`,
  borderRadius: '10px',
  fontSize: '14px',
  outline: 'none',
  background: dm.bg,
  boxSizing: 'border-box',
  color: dm.text,
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
});

const labelStyle = (dm: any): React.CSSProperties => ({
  display: 'block',
  marginBottom: '6px',
  fontSize: '12px',
  fontWeight: '600',
  color: dm.subtext,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

const iconBtn = (dm: any): React.CSSProperties => ({
  background: 'none',
  border: `1.5px solid ${dm.border}`,
  borderRadius: '8px',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: dm.subtext,
  flexShrink: 0,
  transition: 'all 0.15s',
});

const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen, onClose, characters, onAddCharacter, onUpdateCharacter, onDeleteCharacter, darkMode = false,
}) => {
  const dm = {
    card: darkMode ? '#1e1e1e' : '#fff',
    border: darkMode ? '#333' : '#ececf0',
    text: darkMode ? '#f0f0f0' : '#111',
    subtext: '#9ca3af',
    bg: darkMode ? '#111' : '#fafafa',
    chip: darkMode ? '#2a2a2a' : '#f3f4f6',
    hover: darkMode ? '#2a2a2a' : '#f5f5f7',
  };
  const [view, setView] = useState<ModalView>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '', aliases: '' });

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({ name: '', description: '', image: '', aliases: '' });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    const characterData = {
      ...formData,
      aliases: formData.aliases.split(',').map(a => a.trim()).filter(Boolean),
    };
    if (editingId) onUpdateCharacter(editingId, characterData);
    else onAddCharacter(characterData);
    resetForm();
    setView('list');
  };

  const handleEdit = (character: Character) => {
    setFormData({
      name: character.name,
      description: character.description,
      image: character.image || '',
      aliases: character.aliases?.join(', ') || '',
    });
    setEditingId(character.id);
    setView('form');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFormData(f => ({ ...f, image: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const previewCharacter = characters.find(c => c.id === previewId);

  const Avatar = ({ character, size = 44 }: { character: Character; size?: number }) =>
    character.image ? (
      <img src={character.image} alt={character.name} style={{
        width: size, height: size, borderRadius: size * 0.4,
        objectFit: 'cover', border: `1.5px solid ${dm.border}`, flexShrink: 0,
      }} />
    ) : (
      <div style={{
        width: size, height: size, borderRadius: size * 0.4,
        background: dm.chip, border: `1.5px solid ${dm.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <User size={size * 0.45} color={dm.subtext} />
      </div>
    );

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 999 }}
        onClick={onClose}
      />

      <div style={{
        position: 'fixed',
        right: '24px',
        top: '10vh',
        width: '420px',
        maxHeight: '80vh',
        background: dm.card,
        zIndex: 1000,
        borderRadius: '20px',
        boxShadow: `0 4px 24px rgba(0,0,0,0.08), 0 0 0 1.5px ${dm.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideIn 0.25s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 16px 14px',
          borderBottom: `1.5px solid ${dm.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {view !== 'list' && (
            <button
              style={iconBtn(dm)}
              onClick={() => { setView('list'); resetForm(); }}
              onMouseEnter={e => (e.currentTarget.style.background = dm.hover)}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <ChevronLeft size={16} color={dm.subtext} />
            </button>
          )}
          <span style={{ flex: 1, fontSize: '15px', fontWeight: '600', color: dm.text }}>
            {view === 'form' ? (editingId ? 'Edit Character' : 'New Character') :
             view === 'preview' ? previewCharacter?.name : 'Characters'}
          </span>
          {view === 'list' && (
            <button
              style={{
                ...iconBtn(dm),
                background: darkMode ? '#f0f0f0' : '#000',
                border: 'none',
                color: darkMode ? '#000' : '#fff',
                borderRadius: '8px',
              }}
              onClick={() => { resetForm(); setView('form'); }}
              onMouseEnter={e => (e.currentTarget.style.background = darkMode ? '#d4d4d4' : '#222')}
              onMouseLeave={e => (e.currentTarget.style.background = darkMode ? '#f0f0f0' : '#000')}
              title="Add Character"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={darkMode ? '#000' : '#fff'} strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          )}
          <button
            style={iconBtn(dm)}
            onClick={onClose}
            onMouseEnter={e => (e.currentTarget.style.background = dm.hover)}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={dm.subtext} strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

          {/* LIST */}
          {view === 'list' && (
            characters.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 16px', color: dm.subtext }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, background: dm.chip,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <User size={24} color={dm.subtext} />
                </div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: dm.text }}>No characters yet</p>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Click + to add your first character</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {characters.map(character => (
                  <div
                    key={character.id}
                    onClick={() => { setPreviewId(character.id); setView('preview'); }}
                    style={{
                      border: `1.5px solid ${dm.border}`,
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      background: dm.card,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.background = dm.hover;
                      (e.currentTarget as HTMLDivElement).style.borderColor = darkMode ? '#444' : '#d1d5db';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.background = dm.card;
                      (e.currentTarget as HTMLDivElement).style.borderColor = dm.border;
                    }}
                  >
                    <Avatar character={character} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: dm.text }}>{character.name}</div>
                      <div style={{
                        fontSize: '12px', color: dm.subtext, marginTop: '2px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {character.description || 'No description'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        style={iconBtn(dm)}
                        onClick={e => { e.stopPropagation(); handleEdit(character); }}
                        onMouseEnter={e => (e.currentTarget.style.background = dm.hover)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        title="Edit"
                      >
                        <Edit2 size={14} color={dm.subtext} />
                      </button>
                      <button
                        style={{ ...iconBtn(dm), borderColor: '#fecaca', color: '#ef4444' }}
                        onClick={e => { e.stopPropagation(); onDeleteCharacter(character.id); }}
                        onMouseEnter={e => (e.currentTarget.style.background = darkMode ? 'rgba(239,68,68,0.12)' : '#fff1f2')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        title="Delete"
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* FORM */}
          {view === 'form' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle(dm)}>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  required
                  autoFocus
                  placeholder="Character name"
                  style={inputStyle(dm)}
                  onFocus={e => (e.currentTarget.style.borderColor = dm.text)}
                  onBlur={e => (e.currentTarget.style.borderColor = dm.border)}
                />
              </div>

              <div>
                <label style={labelStyle(dm)}>Aliases</label>
                <input
                  type="text"
                  value={formData.aliases}
                  onChange={e => setFormData(f => ({ ...f, aliases: e.target.value }))}
                  placeholder="e.g. Johnny, JD (comma separated)"
                  style={inputStyle(dm)}
                  onFocus={e => (e.currentTarget.style.borderColor = dm.text)}
                  onBlur={e => (e.currentTarget.style.borderColor = dm.border)}
                />
              </div>

              <div>
                <label style={labelStyle(dm)}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                  placeholder="Character description..."
                  style={{ ...inputStyle(dm), resize: 'vertical' }}
                  onFocus={e => (e.currentTarget.style.borderColor = dm.text)}
                  onBlur={e => (e.currentTarget.style.borderColor = dm.border)}
                />
              </div>

              <div>
                <label style={labelStyle(dm)}>Image</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="img-upload" />
                {formData.image ? (
                  <div style={{ position: 'relative' }}>
                    <img src={formData.image} alt="Preview" style={{
                      width: '100%', height: '160px', borderRadius: '10px',
                      objectFit: 'cover', border: `1.5px solid ${dm.border}`, display: 'block',
                    }} />
                    <button
                      type="button"
                      onClick={() => setFormData(f => ({ ...f, image: '' }))}
                      style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff',
                        borderRadius: '6px', padding: '5px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <X size={14} color="#fff" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="img-upload" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '14px', border: `1.5px dashed ${darkMode ? '#444' : '#d1d5db'}`, borderRadius: '10px',
                    cursor: 'pointer', fontSize: '13px', color: dm.subtext, background: dm.bg,
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLLabelElement).style.borderColor = dm.text;
                      (e.currentTarget as HTMLLabelElement).style.color = dm.text;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLLabelElement).style.borderColor = darkMode ? '#444' : '#d1d5db';
                      (e.currentTarget as HTMLLabelElement).style.color = dm.subtext;
                    }}
                  >
                    <Upload size={15} color={dm.subtext} /> Upload image
                  </label>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => { setView('list'); resetForm(); }}
                  style={{
                    flex: 1, padding: '10px', border: `1.5px solid ${dm.border}`, borderRadius: '10px',
                    background: dm.card, cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: dm.text,
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = dm.hover)}
                  onMouseLeave={e => (e.currentTarget.style.background = dm.card)}
                >
                  <X size={14} color={dm.text} /> Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
                    background: darkMode ? '#f0f0f0' : '#000', color: darkMode ? '#000' : '#fff',
                    cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = darkMode ? '#d4d4d4' : '#222')}
                  onMouseLeave={e => (e.currentTarget.style.background = darkMode ? '#f0f0f0' : '#000')}
                >
                  <UserPlus size={14} color={darkMode ? '#000' : '#fff'} /> {editingId ? 'Save Changes' : 'Add Character'}
                </button>
              </div>
            </form>
          )}

          {/* PREVIEW */}
          {view === 'preview' && previewCharacter && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Avatar character={previewCharacter} size={72} />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: dm.text }}>{previewCharacter.name}</div>
                  {previewCharacter.aliases && previewCharacter.aliases.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                      {previewCharacter.aliases.map(alias => (
                        <span key={alias} style={{
                          fontSize: '11px', padding: '2px 8px', borderRadius: '9999px',
                          background: dm.chip, color: dm.subtext, border: `1px solid ${dm.border}`,
                        }}>{alias}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {previewCharacter.description && (
                <div style={{
                  background: dm.bg, border: `1.5px solid ${dm.border}`,
                  borderRadius: '12px', padding: '14px',
                  fontSize: '14px', color: dm.text, lineHeight: '1.6',
                }}>
                  {previewCharacter.description}
                </div>
              )}

              <button
                onClick={() => handleEdit(previewCharacter)}
                style={{
                  width: '100%', padding: '10px', border: `1.5px solid ${dm.border}`,
                  borderRadius: '10px', background: dm.card, cursor: 'pointer',
                  fontSize: '14px', fontWeight: '500', color: dm.text,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = dm.hover)}
                onMouseLeave={e => (e.currentTarget.style.background = dm.card)}
              >
                <Edit2 size={14} color={dm.text} /> Edit Character
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default CharacterModal;
