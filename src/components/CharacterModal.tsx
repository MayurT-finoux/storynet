import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Upload, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Character } from '../types/character';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onAddCharacter: (character: Omit<Character, 'id'>) => void;
  onUpdateCharacter: (id: string, character: Omit<Character, 'id'>) => void;
  onDeleteCharacter: (id: string) => void;
}

type ModalView = 'list' | 'form' | 'preview';

const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  characters,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
}) => {
  const [view, setView] = useState<ModalView>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '', aliases: '' });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const characterData = {
      ...formData,
      aliases: formData.aliases.split(',').map(alias => alias.trim()).filter(alias => alias)
    };
    
    if (editingId) {
      onUpdateCharacter(editingId, characterData);
    } else {
      onAddCharacter(characterData);
    }

    setFormData({ name: '', description: '', image: '' });
    setEditingId(null);
    setView('list');
  };

  const handleEdit = (character: Character) => {
    setFormData({ 
      name: character.name, 
      description: character.description, 
      image: character.image || '',
      aliases: character.aliases?.join(', ') || ''
    });
    setEditingId(character.id);
    setView('form');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, image: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewCharacter = () => {
    setFormData({ name: '', description: '', image: '', aliases: '' });
    setEditingId(null);
    setView('form');
  };

  const handlePreview = (id: string) => {
    setPreviewId(id);
    setView('preview');
  };

  const previewCharacter = characters.find(c => c.id === previewId);

  return (
    <>
      {/* Background overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(6px)',
      }} onClick={onClose}></div>

      {/* Floating curved window */}
      <div style={{
        position: 'fixed',
        right: '32px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '420px',
        maxHeight: '90vh',
        background: 'white',
        zIndex: 1000,
        borderRadius: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'floatIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 24px 20px 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {view !== 'list' && (
              <button 
                onClick={() => {
                  if (view === 'preview') {
                    setView('list');
                  } else if (view === 'form') {
                    setView('list');
                    setEditingId(null);
                    setFormData({ name: '', description: '', image: '' });
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  color: '#6b7280',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'none';
                }}
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 style={{ 
              margin: 0, 
              fontSize: '18px', 
              fontWeight: '600',
              color: '#111827',
            }}>
              {view === 'form' ? (editingId ? 'Edit Character' : 'Add Character') : 
               view === 'preview' ? 'Character' : 'Characters'}
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#e5e7eb';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'none';
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: '20px' }}>
          {view === 'list' && (
            <div style={{ padding: '24px' }}>
              <button onClick={handleNewCharacter} style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                fontWeight: '500',
                width: '100%',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#2563eb';
              }}>
                <Plus size={16} />
                Add Character
              </button>

              {characters.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#9ca3af',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>👤</div>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    No characters yet
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#d1d5db' }}>
                    Add your first character to get started
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {characters.map((character) => (
                    <div key={character.id} style={{
                      border: '1.5px solid #ececf0',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: '#ffffff',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = '#d1d5db';
                      (e.currentTarget as HTMLDivElement).style.background = '#fafafa';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = '#ececf0';
                      (e.currentTarget as HTMLDivElement).style.background = '#ffffff';
                    }}>
                      {character.image ? (
                        <img src={character.image} alt={character.name} style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                        }} />
                      ) : (
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9ca3af',
                          fontSize: '20px',
                        }}>👤</div>
                      )}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                          {character.name}
                        </h3>
                        <p style={{
                          margin: '4px 0 0 0',
                          fontSize: '13px',
                          color: '#9ca3af',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {character.description || 'No description'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={(e) => { e.stopPropagation(); handlePreview(character.id); }} style={{
                          background: 'none',
                          border: '1px solid #e5e7eb',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6b7280',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = '#f3f4f6';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'none';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                        }}>
                          <Eye size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(character); }} style={{
                          background: 'none',
                          border: '1px solid #e5e7eb',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6b7280',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = '#f3f4f6';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'none';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                        }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteCharacter(character.id); }} style={{
                          background: 'none',
                          border: '1px solid #fecaca',
                          color: '#ef4444',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'none';
                        }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'form' && (
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Character Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1.5px solid #ececf0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#ffffff',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    color: '#000',
                  }}
                  placeholder="Enter character name"
                  onFocus={(e) => {
                    (e.currentTarget as HTMLInputElement).style.borderColor = '#2563eb';
                    (e.currentTarget as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLInputElement).style.borderColor = '#ececf0';
                    (e.currentTarget as HTMLInputElement).style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1.5px solid #ececf0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    background: '#ffffff',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    color: '#000',
                  }}
                  placeholder="Enter character description"
                  onFocus={(e) => {
                    (e.currentTarget as HTMLTextAreaElement).style.borderColor = '#2563eb';
                    (e.currentTarget as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLTextAreaElement).style.borderColor = '#ececf0';
                    (e.currentTarget as HTMLTextAreaElement).style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Aliases (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.aliases}
                  onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1.5px solid #ececf0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#ffffff',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    color: '#000',
                  }}
                  placeholder="e.g. Johnny, John Doe, JD"
                  onFocus={(e) => {
                    (e.currentTarget as HTMLInputElement).style.borderColor = '#2563eb';
                    (e.currentTarget as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLInputElement).style.borderColor = '#ececf0';
                    (e.currentTarget as HTMLInputElement).style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Character Image
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" style={{
                    background: '#f9fafb',
                    border: '1.5px dashed #d1d5db',
                    padding: '16px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#6b7280',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLLabelElement).style.borderColor = '#2563eb';
                    (e.currentTarget as HTMLLabelElement).style.background = '#eff6ff';
                    (e.currentTarget as HTMLLabelElement).style.color = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLLabelElement).style.borderColor = '#d1d5db';
                    (e.currentTarget as HTMLLabelElement).style.background = '#f9fafb';
                    (e.currentTarget as HTMLLabelElement).style.color = '#6b7280';
                  }}>
                    <Upload size={16} />
                    Upload Image
                  </label>
                  {formData.image && (
                    <div style={{ position: 'relative' }}>
                      <img src={formData.image} alt="Preview" style={{
                        width: '100%',
                        height: '200px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1.5px solid #ececf0',
                      }} />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(0,0,0,0.6)',
                          border: 'none',
                          color: 'white',
                          borderRadius: '6px',
                          padding: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.8)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.6)';
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setView('list'); setEditingId(null); setFormData({ name: '', description: '', image: '' }); }} style={{
                  background: '#ffffff',
                  border: '1.5px solid #e5e7eb',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                }}>
                  Cancel
                </button>
                <button type="submit" style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#2563eb';
                }}>
                  {editingId ? 'Update' : 'Add'} Character
                </button>
              </div>
            </form>
          )}

          {view === 'preview' && previewCharacter && (
            <div style={{ padding: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                {previewCharacter.image ? (
                  <img src={previewCharacter.image} alt={previewCharacter.name} style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    marginBottom: '20px',
                    border: '1.5px solid #ececf0',
                  }} />
                ) : (
                  <div style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '12px',
                    background: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    marginBottom: '20px',
                    border: '1.5px solid #ececf0',
                  }}>👤</div>
                )}
                <h3 style={{ margin: '0 0 12px 0', fontSize: '22px', fontWeight: '600', color: '#111827' }}>
                  {previewCharacter.name}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '15px',
                  color: '#6b7280',
                  lineHeight: '1.6',
                }}>
                  {previewCharacter.description || 'No description available'}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexDirection: 'column' }}>
                <button onClick={() => handleEdit(previewCharacter)} style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#2563eb';
                }}>
                  <Edit2 size={16} />
                  Edit Character
                </button>
                <button onClick={() => setView('list')} style={{
                  background: '#ffffff',
                  border: '1.5px solid #e5e7eb',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                }}>
                  Back to List
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(60px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0) scale(1);
          }
        }
        
        div[style*="overflow: auto"]::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        
        div[style*="overflow: auto"] {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default CharacterModal;