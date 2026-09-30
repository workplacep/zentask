export type PriorityBucket = 'today' | 'this_week' | 'later';

export interface SegmentNames {
  today: string;
  this_week: string;
  later: string;
}

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  notes?: string;
  bucket: PriorityBucket;
  due_date: string; // YYYY-MM-DD format
  is_completed: boolean;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  project_id?: string | null;
  project_title?: string | null;
  order_index?: number;
}

export type ProjectCategory = 'learning' | 'project';

export interface ProjectChecklistItem {
  id: string;
  title: string;
  is_completed: boolean;
}

export interface ProjectResource {
  id: string;
  title: string;
  url?: string;
}

export interface ProjectItem {
  id: string;
  user_id?: string;
  title: string;
  category: ProjectCategory;
  description?: string;
  color?: string; // hex or tailwind badge class
  checklist: ProjectChecklistItem[];
  resources: ProjectResource[];
  created_at: string;
  updated_at: string;
}

export type ActiveTab = 'tasks' | 'projects' | 'completed';

export interface UserSession {
  email: string | null;
  id: string | null;
  isLoggedIn: boolean;
}

export type SyncStatus = 'offline' | 'local_only' | 'syncing' | 'synced' | 'error';
