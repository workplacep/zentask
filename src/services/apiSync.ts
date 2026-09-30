import type { Task, ProjectItem, SegmentNames } from '../types';

export interface SyncData {
  tasks: Task[];
  projects: ProjectItem[];
  segmentNames: SegmentNames | null;
}

export async function serverSignUp(email: string, password: string): Promise<{ error?: string }> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'signup', email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to sign up' };
    }
    return {};
  } catch {
    return { error: 'Cloud server not reachable. Ensure the app is deployed to Vercel with Upstash Redis.' };
  }
}

export async function serverSignIn(email: string, password: string): Promise<{ error?: string }> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'signin', email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to sign in' };
    }
    return {};
  } catch {
    return { error: 'Cloud server not reachable. Ensure the app is deployed to Vercel with Upstash Redis.' };
  }
}

export async function serverFetchUserData(email: string): Promise<SyncData | null> {
  try {
    const res = await fetch(`/api/sync?email=${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function serverSaveUserData(email: string, data: SyncData): Promise<boolean> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ...data })
    });
    return res.ok;
  } catch {
    return false;
  }
}
