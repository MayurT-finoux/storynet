import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import styled from 'styled-components';
import { useDraggable } from '@dnd-kit/core';

const PageContainer = styled.div`
  background: white;
  position: absolute;
  min-width: 240px;
  min-height: 320px;
  resize: both;
  overflow: hidden;
  padding: 0;
  transition: all 0.2s ease;
  transform-style: preserve-3d;
  perspective: 1000px;

  /* Book page effect */
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: white;
    box-shadow: 
      2px 2px 5px rgba(0,0,0,0.1),
      -1px 0 2px rgba(0,0,0,0.05);
    border-radius: 0 3px 3px 0;
    transform-origin: left;
    z-index: -1;
  }

  /* Page curl effect */
  &:after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    width: 20px;
    height: 100%;
    background: linear-gradient(to right, 
      rgba(0,0,0,0.02) 0%,
      rgba(0,0,0,0.05) 100%);
    border-radius: 0 2px 2px 0;
  }

  &:hover {
    transform: translateY(-2px);
    &:before {
      box-shadow: 
        3px 3px 8px rgba(0,0,0,0.15),
        -1px 0 3px rgba(0,0,0,0.05);
    }
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 8px;
  cursor: move;
  background: linear-gradient(to bottom, 
    rgba(0,0,0,0.02) 0%,
    transparent 100%);
  border-bottom: 1px solid rgba(0,0,0,0.08);
  font-size: 13px;
  color: #666;
  user-select: none;
  font-family: 'Georgia', serif;
`;

const EditorContainer = styled.div`
  padding: 16px 24px;
  height: calc(100% - 42px);
  overflow-y: auto;
  font-family: 'Georgia', serif;
  line-height: 1.6;
  color: #333;
  background: linear-gradient(to right,
    rgba(0,0,0,0.03) 0px,
    transparent 1px) repeat-y;
  background-size: 24px 100%;

  .ProseMirror {
    height: 100%;
    outline: none;
    min-height: 200px;
    
    > * + * {
      margin-top: 1em;
    }

    p {
      margin-bottom: 0.8em;
    }

    ul, ol {
      padding: 0 1.5rem;
      margin-bottom: 0.8em;
    }

    h1, h2, h3 {
      font-family: 'Georgia', serif;
      font-weight: 600;
      color: #222;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }

    h1 {
      font-size: 1.5em;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      padding-bottom: 0.3em;
    }

    h2 {
      font-size: 1.3em;
    }

    h3 {
      font-size: 1.1em;
    }

    code {
      background-color: rgba(0,0,0,0.05);
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 0.9em;
      font-family: 'Consolas', monospace;
    }

    blockquote {
      border-left: 3px solid #666;
      margin-left: 0;
      margin-right: 0;
      padding-left: 1em;
      font-style: italic;
      color: #555;
    }
  }
`;

const ConnectButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.1);
  background: white;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f5f5f7;
    color: #000;
    border-color: rgba(0,0,0,0.2);
  }
`;

const RichTextPage = ({ id, position, onStartConnect, onConnectTarget, style: parentStyle }) => {
  const [size, setSize] = useState({ width: 300, height: 200 });
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id.toString(),
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start writing here...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none',
      },
      handleClick: (view, pos, event) => {
        // Allow clicking in the editor without triggering page events
        event.stopPropagation();
      },
      handleDrop: (view, event, slice, moved) => {
        // Prevent default drop handling
        return true;
      },
    },
    onFocus: () => {
      // Prevent focus from triggering page events
      event?.stopPropagation();
    },
  });

  const handleResizeEnd = (e) => {
    const target = e.target;
    setSize({
      width: target.offsetWidth,
      height: target.offsetHeight,
    });
  };

  const handleStartConnect = (e) => {
    e.stopPropagation();
    onStartConnect(id);
  };

  const handleClick = (e) => {
    // Only handle connection clicks if not clicking in the editor
    if (!e.target.closest('.ProseMirror')) {
      onConnectTarget(id);
    }
  };

  return (
    <PageContainer
      ref={setNodeRef}
      onClick={handleClick}
      style={{
        ...parentStyle,
        ...style,
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
      onMouseUp={handleResizeEnd}
      {...attributes}
      {...listeners}
    >
      <PageHeader>
        <span>Page {id}</span>
        <ConnectButton onClick={handleStartConnect} title="Connect to another page">
          +
        </ConnectButton>
      </PageHeader>
      <EditorContainer>
        <EditorContent editor={editor} />
      </EditorContainer>
    </PageContainer>
  );
};

export default RichTextPage;