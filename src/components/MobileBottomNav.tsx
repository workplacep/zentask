import React from 'react';
import { 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  Cloud 
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

interface MobileBottomNavProps {
  onOpenAuth: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenAuth }) => {
  const { activeTab, setActiveTab, tasks, projects, userSession } = useTaskStore();

  const activeTaskCount = tasks.filter(t => !t.is_completed).length;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0c1018]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 safe-bottom">
      <div className="grid grid-cols-4 h-14 items-center">
        {/* Active Triage */}
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'tasks'
              ? 'text-sky-500 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <div className="relative">
            <Layers className="w-4 h-4" />
            {activeTaskCount > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] px-1 bg-sky-500 text-white rounded-full">
                {activeTaskCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1">Triage</span>
        </button>

        {/* Learning & Projects */}
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'projects'
              ? 'text-emerald-500 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <div className="relative">
            <BookOpen className="w-4 h-4" />
            {projects.length > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] px-1 bg-emerald-500 text-white rounded-full">
                {projects.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1">Projects</span>
        </button>

        {/* Completed */}
        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'completed'
              ? 'text-purple-500 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-[10px] mt-1">Completed</span>
        </button>

        {/* Sync / Account */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-colors"
        >
          <div className="relative">
            <Cloud className="w-4 h-4" />
            <span className={`absolute -top-0.5 -right-1 w-2 h-2 rounded-full ${
              userSession.isLoggedIn ? 'bg-emerald-500' : 'bg-amber-400'
            }`} />
          </div>
          <span className="text-[10px] mt-1">{userSession.isLoggedIn ? 'Account' : 'Sync'}</span>
        </button>
      </div>
    </div>
  );
};
