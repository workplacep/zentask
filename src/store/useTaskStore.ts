import { create } from 'zustand';
import confetti from 'canvas-confetti';
import type { 
  Task, 
  PriorityBucket, 
  SegmentNames,
  ProjectItem, 
  ActiveTab, 
  UserSession, 
  SyncStatus 
} from '../types';
import { getSupabase } from '../services/supabase';
import { 
  serverSignUp, 
  serverSignIn, 
  serverFetchUserData, 
  serverSaveUserData 
} from '../services/apiSync';

const TASKS_STORAGE_KEY = 'zentask_tasks_data';
const PROJECTS_STORAGE_KEY = 'zentask_projects_data';
const THEME_STORAGE_KEY = 'zentask_theme_preference';
const SEGMENT_NAMES_STORAGE_KEY = 'zentask_segment_names';
const USER_SESSION_STORAGE_KEY = 'zentask_user_session';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isDueDateTodayOrPast(dueDateStr?: string | null): boolean {
  if (!dueDateStr) return false;
  const todayStr = getTodayDateString();
  const dateOnly = dueDateStr.split('T')[0].trim();
  return dateOnly <= todayStr;
}

export function isCompletedToday(completedAt?: string | null): boolean {
  if (!completedAt) return false;
  try {
    const completedDate = new Date(completedAt);
    const now = new Date();
    return (
      completedDate.getFullYear() === now.getFullYear() &&
      completedDate.getMonth() === now.getMonth() &&
      completedDate.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

const DEFAULT_SEGMENT_NAMES: SegmentNames = {
  today: 'Today / Immediate',
  this_week: 'This Week / Soon',
  later: 'Later / Future Prospects',
};

const todayString = getTodayDateString();
const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const fourteenDaysLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const INITIAL_TASKS: Task[] = [
  {
    id: 'demo-1',
    title: 'Attend to daily top priority tasks (Finish before end of day)',
    notes: 'Focus on high impact deliverables today.',
    bucket: 'today',
    due_date: todayString,
    is_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order_index: 0,
  },
  {
    id: 'demo-2',
    title: 'Review project milestones for this week',
    notes: 'Coordinate with team and check backlog.',
    bucket: 'this_week',
    due_date: threeDaysLater,
    is_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order_index: 1,
  },
  {
    id: 'demo-3',
    title: 'Research prospective tooling & long-term architecture',
    notes: 'Explore micro-frontends and local-first databases.',
    bucket: 'later',
    due_date: fourteenDaysLater,
    is_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order_index: 2,
  },
];

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'demo-proj-1',
    title: 'Modern Web Engineering',
    category: 'learning',
    description: 'Core concepts, performance tuning, and deep architecture principles.',
    color: 'emerald',
    checklist: [
      { id: 'item-1', title: 'Deep dive into React 19 server components', is_completed: true },
      { id: 'item-2', title: 'Explore edge runtime and offline caching', is_completed: false },
      { id: 'item-3', title: 'Study distributed data sync patterns', is_completed: false },
    ],
    resources: [
      { id: 'res-1', title: 'React Documentation', url: 'https://react.dev' },
      { id: 'res-2', title: 'Web.dev PWA Guide', url: 'https://web.dev/explore/progressive-web-apps' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-proj-2',
    title: 'Productivity Ecosystem',
    category: 'project',
    description: 'Building frictionless cross-platform tools for daily triage.',
    color: 'sky',
    checklist: [
      { id: 'item-p1', title: 'Define 3-tier priority board UI', is_completed: true },
      { id: 'item-p2', title: 'Implement mobile touch drag-and-drop', is_completed: true },
      { id: 'item-p3', title: 'Setup seamless real-time cloud sync', is_completed: false },
    ],
    resources: [
      { id: 'res-p1', title: 'Design System Guidelines' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

function loadLocalTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    const parsed: Task[] = raw ? JSON.parse(raw) : INITIAL_TASKS;
    const today = getTodayDateString();

    return parsed.map(t => {
      const taskDueDate = t.due_date ? t.due_date.split('T')[0].trim() : today;
      const shouldPromote = !t.is_completed && t.bucket !== 'today' && taskDueDate <= today;
      return {
        ...t,
        due_date: taskDueDate,
        bucket: shouldPromote ? 'today' : t.bucket
      };
    });
  } catch {
    return INITIAL_TASKS;
  }
}

function loadLocalProjects(): ProjectItem[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) return INITIAL_PROJECTS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROJECTS;
  }
}

function loadLocalTheme(): 'dark' | 'light' {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark';
}

function loadLocalSegmentNames(): SegmentNames {
  try {
    const raw = localStorage.getItem(SEGMENT_NAMES_STORAGE_KEY);
    if (!raw) return DEFAULT_SEGMENT_NAMES;
    return { ...DEFAULT_SEGMENT_NAMES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SEGMENT_NAMES;
  }
}

function loadLocalUserSession(): UserSession {
  try {
    const raw = localStorage.getItem(USER_SESSION_STORAGE_KEY);
    if (!raw) return { email: null, id: null, isLoggedIn: false };
    return JSON.parse(raw);
  } catch {
    return { email: null, id: null, isLoggedIn: false };
  }
}

interface TaskState {
  tasks: Task[];
  projects: ProjectItem[];
  segmentNames: SegmentNames;
  activeTab: ActiveTab;
  activeBucketMobile: PriorityBucket;
  userSession: UserSession;
  syncStatus: SyncStatus;
  theme: 'dark' | 'light';

  // Navigation
  setActiveTab: (tab: ActiveTab) => void;
  setActiveBucketMobile: (bucket: PriorityBucket) => void;
  toggleTheme: () => void;

  // Segment Name customization
  updateSegmentName: (bucket: PriorityBucket, newName: string) => void;

  // Task Actions
  addTask: (
    title: string, 
    bucket: PriorityBucket, 
    due_date: string, 
    notes?: string, 
    projectId?: string, 
    projectTitle?: string
  ) => { targetBucket: PriorityBucket; redirectedToToday: boolean };

  updateTask: (id: string, partial: Partial<Task>) => void;
  moveTaskBucket: (id: string, newBucket: PriorityBucket) => void;
  reorderTasks: (bucket: PriorityBucket, reorderedTasks: Task[]) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  clearCompleted: () => void;
  restoreTask: (id: string) => void;
  autoPromoteDueTasks: () => void;

  // Project Actions
  addProject: (title: string, category: 'learning' | 'project', description?: string, color?: string) => void;
  updateProject: (id: string, partial: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;
  addProjectChecklistItem: (projectId: string, title: string) => void;
  toggleProjectChecklistItem: (projectId: string, itemId: string) => void;
  deleteProjectChecklistItem: (projectId: string, itemId: string) => void;
  promoteChecklistItemToTask: (projectId: string, itemId: string, targetBucket: PriorityBucket, dueDate?: string) => void;
  addProjectResource: (projectId: string, title: string, url?: string) => void;
  deleteProjectResource: (projectId: string, resourceId: string) => void;

  // Sync & Auth Actions
  initAuthAndSync: () => Promise<void>;
  syncWithCloud: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: loadLocalTasks(),
  projects: loadLocalProjects(),
  segmentNames: loadLocalSegmentNames(),
  activeTab: 'tasks',
  activeBucketMobile: 'today',
  userSession: loadLocalUserSession(),
  syncStatus: loadLocalUserSession().isLoggedIn ? 'synced' : 'local_only',
  theme: loadLocalTheme(),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveBucketMobile: (bucket) => set({ activeBucketMobile: bucket }),

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_STORAGE_KEY, next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: next });
  },

  updateSegmentName: (bucket, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const updated = { ...get().segmentNames, [bucket]: trimmed };
    localStorage.setItem(SEGMENT_NAMES_STORAGE_KEY, JSON.stringify(updated));
    set({ segmentNames: updated });
    get().syncWithCloud();
  },

  autoPromoteDueTasks: () => {
    const todayStr = getTodayDateString();
    let hasChanges = false;

    const currentTasks = get().tasks;
    const updatedTasks = currentTasks.map(task => {
      if (!task.is_completed && task.bucket !== 'today' && task.due_date) {
        const dateOnly = task.due_date.split('T')[0].trim();
        if (dateOnly <= todayStr) {
          hasChanges = true;
          return {
            ...task,
            bucket: 'today' as PriorityBucket,
            updated_at: new Date().toISOString()
          };
        }
      }
      return task;
    });

    if (hasChanges) {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
      set({ tasks: updatedTasks });
      get().syncWithCloud();
    }
  },

  addTask: (title, bucket, due_date, notes = '', projectId, projectTitle) => {
    const trimmed = title.trim();
    if (!trimmed) {
      return { targetBucket: bucket, redirectedToToday: false };
    }

    const todayStr = getTodayDateString();
    const effectiveDueDate = due_date?.trim() || todayStr;

    let targetBucket = bucket;
    if (targetBucket !== 'today' && isDueDateTodayOrPast(effectiveDueDate)) {
      targetBucket = 'today';
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: trimmed,
      notes: notes.trim(),
      bucket: targetBucket,
      due_date: effectiveDueDate,
      is_completed: false,
      completed_at: null,
      project_id: projectId || null,
      project_title: projectTitle || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order_index: get().tasks.filter(t => t.bucket === targetBucket && !t.is_completed).length,
    };

    const updated = [newTask, ...get().tasks];
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    set({ tasks: updated });

    get().autoPromoteDueTasks();
    get().syncWithCloud();

    return {
      targetBucket,
      redirectedToToday: targetBucket !== bucket
    };
  },

  updateTask: (id, partial) => {
    const todayStr = getTodayDateString();
    const updated = get().tasks.map(t => {
      if (t.id !== id) return t;
      const merged = { ...t, ...partial, updated_at: new Date().toISOString() };
      if (!merged.is_completed && merged.bucket !== 'today' && merged.due_date) {
        const dateOnly = merged.due_date.split('T')[0].trim();
        if (dateOnly <= todayStr) {
          merged.bucket = 'today';
        }
      }
      return merged;
    });
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    set({ tasks: updated });
    get().autoPromoteDueTasks();
    get().syncWithCloud();
  },

  moveTaskBucket: (id, newBucket) => {
    const updated = get().tasks.map(t => 
      t.id === id ? { ...t, bucket: newBucket, updated_at: new Date().toISOString() } : t
    );
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    set({ tasks: updated });
    get().syncWithCloud();
  },

  reorderTasks: (bucket, reorderedList) => {
    const otherTasks = get().tasks.filter(t => t.bucket !== bucket || t.is_completed);
    const updatedWithOrder = reorderedList.map((t, idx) => ({ ...t, order_index: idx }));
    const combined = [...updatedWithOrder, ...otherTasks];
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(combined));
    set({ tasks: combined });
    get().syncWithCloud();
  },

  toggleTaskCompletion: (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;

    const willBeCompleted = !task.is_completed;
    
    if (willBeCompleted && task.bucket === 'today') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#38bdf8', '#34d399', '#f59e0b', '#a855f7'],
        });
      } catch {
        // Ignore if confetti fails
      }
    }

    const updated = get().tasks.map(t => 
      t.id === id 
        ? { 
            ...t, 
            is_completed: willBeCompleted, 
            completed_at: willBeCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString() 
          } 
        : t
    );

    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    set({ tasks: updated });
    get().syncWithCloud();
  },

  deleteTask: (id) => {
    const updated = get().tasks.filter(t => t.id !== id);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    set({ tasks: updated });
    get().syncWithCloud();
  },

  clearCompleted: () => {
    const updated = get().tasks.filter(t => !t.is_completed);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    set({ tasks: updated });
    get().syncWithCloud();
  },

  restoreTask: (id) => {
    const updated = get().tasks.map(t => 
      t.id === id 
        ? { ...t, is_completed: false, completed_at: null, updated_at: new Date().toISOString() } 
        : t
    );
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    set({ tasks: updated });
    get().autoPromoteDueTasks();
    get().syncWithCloud();
  },

  // Project Actions
  addProject: (title, category, description = '', color = 'sky') => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const newProject: ProjectItem = {
      id: crypto.randomUUID(),
      title: trimmed,
      category,
      description: description.trim(),
      color,
      checklist: [],
      resources: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newProject, ...get().projects];
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
    set({ projects: updated });
    get().syncWithCloud();
  },

  updateProject: (id, partial) => {
    const updated = get().projects.map(p => 
      p.id === id ? { ...p, ...partial, updated_at: new Date().toISOString() } : p
    );
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
    set({ projects: updated });
    get().syncWithCloud();
  },

  deleteProject: (id) => {
    const updated = get().projects.filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
    set({ projects: updated });
    get().syncWithCloud();
  },

  addProjectChecklistItem: (projectId, title) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const updated = get().projects.map(p => {
      if (p.id !== projectId) return p;
      const newItem = { id: crypto.randomUUID(), title: trimmed, is_completed: false };
      return { ...p, checklist: [...p.checklist, newItem], updated_at: new Date().toISOString() };
    });

    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
    set({ projects: updated });
    get().syncWithCloud();
  },

  toggleProjectChecklistItem: (projectId, itemId) => {
    const updated = get().projects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        checklist: p.checklist.map(item => 
          item.id === itemId ? { ...item, is_completed: !item.is_completed } : item
        ),
        updated_at: new Date().toISOString(),
      };
    });

    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
    set({ projects: updated });
    get().syncWithCloud();
  },

  deleteProjectChecklistItem: (projectId, itemId) => {
    const updated = get().projects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        checklist: p.checklist.filter(item => item.id !== itemId),
        updated_at: new Date().toISOString(),
      };
    });

    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
    set({ projects: updated });
    get().syncWithCloud();
  },

  promoteChecklistItemToTask: (projectId, itemId, targetBucket, dueDate) => {
    const project = get().projects.find(p => p.id === projectId);
    if (!project) return;
    const item = project.checklist.find(i => i.id === itemId);
    if (!item) return;

    const effectiveDueDate = dueDate || getTodayDateString();
    let effectiveBucket = targetBucket;
    if (effectiveBucket !== 'today' && isDueDateTodayOrPast(effectiveDueDate)) {
      effectiveBucket = 'today';
    }

    get().addTask(
      item.title, 
      effectiveBucket, 
      effectiveDueDate,
      `From ${project.category === 'learning' ? 'Learning Topic' : 'Project'}: ${project.title}`, 
      project.id, 
      project.title
    );
  },

  addProjectResource: (projectId, title, url = '') => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const updated = get().projects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        resources: [...p.resources, { id: crypto.randomUUID(), title: trimmed, url: url.trim() }],
        updated_at: new Date().toISOString(),
      };
    });

    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
    set({ projects: updated });
    get().syncWithCloud();
  },

  deleteProjectResource: (projectId, resourceId) => {
    const updated = get().projects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        resources: p.resources.filter(r => r.id !== resourceId),
        updated_at: new Date().toISOString(),
      };
    });

    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
    set({ projects: updated });
    get().syncWithCloud();
  },

  // Auth and Sync
  initAuthAndSync: async () => {
    get().autoPromoteDueTasks();

    // Check local session
    const savedSession = loadLocalUserSession();
    if (savedSession.isLoggedIn && savedSession.email) {
      set({ userSession: savedSession, syncStatus: 'syncing' });

      // Pull latest from Vercel / Upstash cloud database (Zero SQL!)
      try {
        const remoteData = await serverFetchUserData(savedSession.email);
        if (remoteData && remoteData.tasks && remoteData.tasks.length > 0) {
          localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(remoteData.tasks));
          set({ tasks: remoteData.tasks });

          if (remoteData.projects && remoteData.projects.length > 0) {
            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(remoteData.projects));
            set({ projects: remoteData.projects });
          }

          if (remoteData.segmentNames) {
            localStorage.setItem(SEGMENT_NAMES_STORAGE_KEY, JSON.stringify(remoteData.segmentNames));
            set({ segmentNames: remoteData.segmentNames });
          }

          set({ syncStatus: 'synced' });
        } else {
          // If remote is empty, backup current local data to cloud
          await serverSaveUserData(savedSession.email, {
            tasks: get().tasks,
            projects: get().projects,
            segmentNames: get().segmentNames
          });
          set({ syncStatus: 'synced' });
        }
      } catch {
        set({ syncStatus: 'synced' });
      }
    }

    // Also check Supabase if configured
    const sb = getSupabase();
    if (sb) {
      try {
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user) {
          const userObj = {
            email: session.user.email || null,
            id: session.user.id,
            isLoggedIn: true,
          };
          localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(userObj));
          set({
            userSession: userObj,
            syncStatus: 'synced',
          });
          await get().syncWithCloud();
        }
      } catch (err) {
        console.warn('Supabase initialization note:', err);
      }
    }
  },

  syncWithCloud: async () => {
    const { userSession } = get();
    if (!userSession.isLoggedIn || !userSession.email) {
      return;
    }

    set({ syncStatus: 'syncing' });

    // 1. Save to Vercel/Upstash Cloud Database (Zero SQL!)
    try {
      await serverSaveUserData(userSession.email, {
        tasks: get().tasks,
        projects: get().projects,
        segmentNames: get().segmentNames
      });
      set({ syncStatus: 'synced' });
    } catch {
      // Local fallback stays active
    }

    // 2. Also save to Supabase if configured
    const sb = getSupabase();
    if (sb && userSession.id) {
      try {
        const { data: remoteTasks, error: taskErr } = await sb
          .from('tasks')
          .select('*')
          .eq('user_id', userSession.id);

        if (!taskErr && remoteTasks) {
          const upsertPayload = get().tasks.map(t => ({
            id: t.id.includes('-') && t.id.length === 36 ? t.id : undefined,
            user_id: userSession.id,
            title: t.title,
            notes: t.notes || '',
            bucket: t.bucket,
            due_date: t.due_date,
            is_completed: t.is_completed,
            completed_at: t.completed_at,
            project_id: t.project_id,
            project_title: t.project_title,
            order_index: t.order_index || 0,
            created_at: t.created_at,
            updated_at: t.updated_at,
          })).filter(p => p.id);

          if (upsertPayload.length > 0) {
            await sb.from('tasks').upsert(upsertPayload);
          }
        }
      } catch (err) {
        console.error('Supabase sync note:', err);
      }
    }
  },

  signUp: async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Try Vercel Serverless / Upstash Auth first (Zero SQL!)
    const serverRes = await serverSignUp(normalizedEmail, password);
    if (!serverRes.error) {
      const session = { email: normalizedEmail, id: normalizedEmail, isLoggedIn: true };
      localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(session));
      set({ userSession: session, syncStatus: 'synced' });

      // Save initial data to cloud
      await serverSaveUserData(normalizedEmail, {
        tasks: get().tasks,
        projects: get().projects,
        segmentNames: get().segmentNames
      });

      return {};
    }

    // 2. Fall back to Supabase if configured
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.auth.signUp({ email: normalizedEmail, password });
        if (error) return { error: error.message };
        if (data.user) {
          const session = { email: data.user.email || null, id: data.user.id, isLoggedIn: true };
          localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(session));
          set({ userSession: session, syncStatus: 'synced' });
        }
        return {};
      } catch (err: any) {
        return { error: err?.message || 'Failed to sign up' };
      }
    }

    return { error: serverRes.error || 'Failed to sign up.' };
  },

  signIn: async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Try Vercel Serverless / Upstash Auth first (Zero SQL!)
    const serverRes = await serverSignIn(normalizedEmail, password);
    if (!serverRes.error) {
      const session = { email: normalizedEmail, id: normalizedEmail, isLoggedIn: true };
      localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(session));
      set({ userSession: session, syncStatus: 'syncing' });

      // Fetch cloud tasks under this account to restore if app was deleted or crashed!
      const remoteData = await serverFetchUserData(normalizedEmail);
      if (remoteData && remoteData.tasks && remoteData.tasks.length > 0) {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(remoteData.tasks));
        set({ tasks: remoteData.tasks });

        if (remoteData.projects) {
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(remoteData.projects));
          set({ projects: remoteData.projects });
        }
        if (remoteData.segmentNames) {
          localStorage.setItem(SEGMENT_NAMES_STORAGE_KEY, JSON.stringify(remoteData.segmentNames));
          set({ segmentNames: remoteData.segmentNames });
        }
      } else {
        // Upload initial data to cloud
        await serverSaveUserData(normalizedEmail, {
          tasks: get().tasks,
          projects: get().projects,
          segmentNames: get().segmentNames
        });
      }

      set({ syncStatus: 'synced' });
      get().autoPromoteDueTasks();
      return {};
    }

    // 2. Fall back to Supabase if configured
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) return { error: error.message };
        if (data.user) {
          const session = { email: data.user.email || null, id: data.user.id, isLoggedIn: true };
          localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(session));
          set({ userSession: session, syncStatus: 'synced' });
          await get().syncWithCloud();
        }
        return {};
      } catch (err: any) {
        return { error: err?.message || 'Failed to sign in' };
      }
    }

    return { error: serverRes.error || 'Failed to sign in. Please verify your credentials.' };
  },

  signOut: async () => {
    localStorage.removeItem(USER_SESSION_STORAGE_KEY);
    const sb = getSupabase();
    if (sb) {
      await sb.auth.signOut();
    }
    set({
      userSession: { email: null, id: null, isLoggedIn: false },
      syncStatus: 'local_only',
    });
  }
}));
