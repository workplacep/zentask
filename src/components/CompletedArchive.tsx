import React, { useState } from 'react';
import { 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  Sparkles, 
  CalendarDays, 
  Hourglass,
  Calendar
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

export const CompletedArchive: React.FC = () => {
  const { tasks, segmentNames, restoreTask, deleteTask, clearCompleted } = useTaskStore();
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week'>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const completedTasks = tasks.filter(t => t.is_completed);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

  const filteredTasks = completedTasks.filter(t => {
    if (!t.completed_at) return filterPeriod === 'all';
    const completionTime = new Date(t.completed_at).getTime();
    if (filterPeriod === 'today') {
      return completionTime >= startOfToday;
    }
    if (filterPeriod === 'week') {
      return completionTime >= oneWeekAgo;
    }
    return true;
  });

  const formatCompletionDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Completed';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'Completed';
    }
  };

  const getBucketBadge = (bucket: string) => {
    if (bucket === 'today') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40">
          <Sparkles className="w-2.5 h-2.5" />
          {segmentNames.today.split('/')[0].trim()}
        </span>
      );
    }
    if (bucket === 'this_week') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/40">
          <CalendarDays className="w-2.5 h-2.5" />
          {segmentNames.this_week.split('/')[0].trim()}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40">
        <Hourglass className="w-2.5 h-2.5" />
        {segmentNames.later.split('/')[0].trim()}
      </span>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4">
      {/* Header bar */}
      <div className="mb-6 bg-white dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Completed Tasks Archive
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review your accomplishments, monitor productivity, or restore tasks to active triage.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <div className="flex bg-slate-100 dark:bg-[#181f2e] p-1 rounded-xl text-xs border border-slate-200/60 dark:border-slate-800/60">
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterPeriod === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              All ({completedTasks.length})
            </button>
            <button
              onClick={() => setFilterPeriod('today')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterPeriod === 'today'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilterPeriod('week')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterPeriod === 'week'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Past 7 Days
            </button>
          </div>

          {/* Clear Completed button */}
          {completedTasks.length > 0 && (
            <div>
              {confirmClear ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      clearCompleted();
                      setConfirmClear(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs"
                  >
                    Confirm Clear
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium border border-rose-200 dark:border-rose-900/50 transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Completed Items List */}
      <div className="bg-white dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm">
        {filteredTasks.length === 0 ? (
          <div className="py-14 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2.5" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No completed tasks found
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Tasks marked done will appear here. Tasks completed today remain visible in their segment until tomorrow.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className="py-3 px-2 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-[#161c28]/60 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-medium line-through text-slate-500 dark:text-slate-400 block truncate">
                      {task.title}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        Completed {formatCompletionDate(task.completed_at)}
                      </span>
                      {getBucketBadge(task.bucket)}
                      {task.due_date && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                          <Calendar className="w-2.5 h-2.5" />
                          Due {task.due_date}
                        </span>
                      )}
                      {task.project_title && (
                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded truncate max-w-[120px]">
                          {task.project_title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Restore & Delete */}
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => restoreTask(task.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40 transition-colors"
                    title="Restore back to active triage"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">Restore</span>
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title="Permanently remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
