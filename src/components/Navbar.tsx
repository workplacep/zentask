import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  Cloud, 
  Sun, 
  Moon, 
  Download, 
  Check,
  RefreshCw
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { 
    activeTab, 
    setActiveTab, 
    tasks, 
    projects, 
    theme, 
    toggleTheme, 
    userSession, 
    syncWithCloud 
  } = useTaskStore();

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isSyncRotating, setIsSyncRotating] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleManualSync = async () => {
    setIsSyncRotating(true);
    await syncWithCloud();
    setTimeout(() => setIsSyncRotating(false), 600);
  };

  const activeTaskCount = tasks.filter(t => !t.is_completed).length;
  const completedTaskCount = tasks.filter(t => t.is_completed).length;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0b0f17]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 safe-top">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-sm">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            </div>
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              ZenTask
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400">
              Cross-Platform
            </span>
          </div>
        </div>

        {/* Center: Core View Navigation Tabs (Desktop / Tablet) */}
        <nav className="hidden md:flex items-center bg-slate-100/90 dark:bg-[#141a26] p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/70 text-xs font-medium">
          {/* Active Triage (Core 3 Segmentations) */}
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'tasks'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-500" />
            <span>Active Triage</span>
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300">
              {activeTaskCount}
            </span>
          </button>

          {/* Dedicated Learning & Projects Hub */}
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'projects'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>Learning & Projects</span>
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300">
              {projects.length}
            </span>
          </button>

          {/* Completed Archive */}
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Completed Archive</span>
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300">
              {completedTaskCount}
            </span>
          </button>
        </nav>

        {/* Right Actions: Sync status, Theme, Install, Account */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install Button */}
          {installPrompt && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium shadow-xs transition-all"
              title="Install Desktop Application"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Sync status pill */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              userSession.isLoggedIn
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 hover:border-sky-400'
            }`}
            title={userSession.isLoggedIn ? `Synced with ${userSession.email}` : 'Click to setup Cloud Sync for Phone'}
          >
            <span className={`w-2 h-2 rounded-full ${
              userSession.isLoggedIn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`} />
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {userSession.isLoggedIn ? 'Cloud Synced' : 'Sync / Login'}
            </span>
          </button>

          {/* Manual sync refresh if logged in */}
          {userSession.isLoggedIn && (
            <button
              onClick={handleManualSync}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Sync now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncRotating ? 'animate-spin text-sky-500' : ''}`} />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
