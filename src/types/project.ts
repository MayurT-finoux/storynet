import { CanvasElementData, ConnectionData } from './canvas';
import { Character } from './character';

export interface ProjectData {
  elements: CanvasElementData[];
  connections: ConnectionData[];
  characters: Character[];
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  data: ProjectData;
}

export interface AppUser {
  id: string;
  username: string;
}
