export interface CanvasElementData {
  id: string;
  type: 'page' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  label?: string;
  pageId?: string; // Hidden ID for pages with PG prefix
  status?: 'draft' | 'idea' | 'done'; // page workflow status
}

export interface ConnectionData {
  id: string;
  fromId: string;
  toId: string;
}
