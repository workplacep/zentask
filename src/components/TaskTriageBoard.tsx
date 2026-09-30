import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  CalendarDays, 
  Hourglass, 
  Layers,
  Edit2,
  Check,
  X,
  Calendar,
  ArrowRight
} from 'lucide-react';
import type { PriorityBucket, Task } from '../types';
import { 
  useTaskStore, 
  getTodayDateString, 
  isDueDateTodayOrPast, 
  isCompletedToday 
} from '../store/useTaskStore';
import { TaskCard } from './TaskCard';

export const TaskTriageBoard: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    moveTaskBucket, 
    segmentNames,
    updateSegmentName,
    activeBucketMobile, 
    setActiveBucketMobile,
    autoPromoteDueTasks
  } = useTaskStore();

  const todayStr = getTodayDateString();

  // Run auto-promotion check on mount and whenever tasks change
  useEffect(() => {
    autoPromoteDueTasks();
  }, [autoPromoteDueTasks]);

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<PriorityBucket | null>(null);

  // Segment renaming states
  const [editingSegment, setEditingSegment] = useState<PriorityBucket | null>(null);
  const [segmentNameInput, setSegmentNameInput] = useState('');

  // Creation form states per column
  const [openCreateColumn, setOpenCreateColumn] = useState<PriorityBucket | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState(todayStr);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Auto-move Toast notification state
  const [toastNotification, setToastNotification] = useState<{ message: string } | null>(null);

  const triggerDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;
    try {
      if ('showPicker' in HTMLInputElement.prototype) {
        input.showPicker();
      } else {
        input.focus();
      }
    } catch {
      input.focus();
    }
  };

  const startEditSegment = (bucket: PriorityBucket) => {
    setEditingSegment(bucket);
    setSegmentNameInput(segmentNames[bucket]);
  };

  const saveSegmentName = (bucket: PriorityBucket) => {
    if (segmentNameInput.trim()) {
      updateSegmentName(bucket, segmentNameInput.trim());
    }
    setEditingSegment(null);
  };

  const openTaskForm = (bucket: PriorityBucket) => {
    setOpenCreateColumn(bucket);
    setNewTitle('');
    setNewDescription('');
    // Sensible default due date based on column
    if (bucket === 'today') {
      setNewDueDate(todayStr);
    } else if (bucket === 'this_week') {
      const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setNewDueDate(`${year}-${month}-${day}`);
    } else {
      const d = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setNewDueDate(`${year}-${month}-${day}`);
    }
  };

  const handleCreateTask = (e: React.FormEvent, bucket: PriorityBucket) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate.trim()) return;

    const result = addTask(
      newTitle.trim(),
      bucket,
      newDueDate.trim(),
      newDescription.trim()
    );

    // If task was in Segment 2 or 3 but had a due date of today (or earlier),
    // it was automatically routed to Segment 1!
    if (result?.redirectedToToday) {
      setToastNotification({
        message: `Task "${newTitle.trim()}" is due today and was automatically moved to ${segmentNames.today}!`,
      });
      setTimeout(() => setToastNotification(null), 5000);

      // On mobile view, switch to 'today' tab so user sees their new task
      setActiveBucketMobile('today');
    }

    setNewTitle('');
    setNewDescription('');
    setOpenCreateColumn(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setActiveDropColumn(null);
  };

  const handleDragOverColumn = (e: React.DragEvent, bucket: PriorityBucket) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== bucket) {
      setActiveDropColumn(bucket);
    }
  };

  const handleDragLeaveColumn = (e: React.DragEvent, bucket: PriorityBucket) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (activeDropColumn === bucket) {
      setActiveDropColumn(null);
    }
  };

  const handleDropOnColumn = (e: React.DragEvent, bucket: PriorityBucket) => {
    e.preventDefault();
    setActiveDropColumn(null);
    if (!draggedTask) return;

    if (draggedTask.bucket !== bucket) {
      moveTaskBucket(draggedTask.id, bucket);
    }
    setDraggedTask(null);
  };

  // Filter tasks per bucket:
  // Active uncompleted tasks + Tasks completed TODAY (past-day completed tasks moved to archive)
  const getColumnTasks = (bucket: PriorityBucket) => {
    const bucketAll = tasks.filter(t => t.bucket === bucket);
    const activeTasks = bucketAll.filter(t => !t.is_completed);
    const completedToday = bucketAll.filter(t => t.is_completed && isCompletedToday(t.completed_at));
    return { activeTasks, completedToday, totalActive: activeTasks.length };
  };

  const todayData = getColumnTasks('today');
  const weekData = getColumnTasks('this_week');
  const laterData = getColumnTasks('later');

  // Today's total completion progress
  const todayTotalCount = todayData.activeTasks.length + todayData.completedToday.length;
  const todayProgressPercent = todayTotalCount > 0 
    ? Math.round((todayData.completedToday.length / todayTotalCount) * 100) 
    : 0;

  const columns: {
    id: PriorityBucket;
    name: string;
    icon: React.ReactNode;
    colorClasses: {
      badge: string;
      headerBg: string;
      accentText: string;
    };
    activeTasks: Task[];
    completedToday: Task[];
  }[] = [
    {
      id: 'today',
      name: segmentNames.today,
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      colorClasses: {
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        headerBg: 'bg-gradient-to-r from-amber-500/5 to-transparent',
        accentText: 'text-amber-500',
      },
      activeTasks: todayData.activeTasks,
      completedToday: todayData.completedToday,
    },
    {
      id: 'this_week',
      name: segmentNames.this_week,
      icon: <CalendarDays className="w-4 h-4 text-sky-500" />,
      colorClasses: {
        badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        headerBg: 'bg-gradient-to-r from-sky-500/5 to-transparent',
        accentText: 'text-sky-500',
      },
      activeTasks: weekData.activeTasks,
      completedToday: weekData.completedToday,
    },
    {
      id: 'later',
      name: segmentNames.later,
      icon: <Hourglass className="w-4 h-4 text-purple-400" />,
      colorClasses: {
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        headerBg: 'bg-gradient-to-r from-purple-500/5 to-transparent',
        accentText: 'text-purple-400',
      },
      activeTasks: laterData.activeTasks,
      completedToday: laterData.completedToday,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* Auto-Move Notification Toast */}
      {toastNotification && (
        <div className="mb-4 flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-medium shadow-sm transition-all animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold block sm:inline">Auto-moved to {segmentNames.today}:</span>{' '}
              <span>{toastNotification.message}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setActiveBucketMobile('today')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[11px] transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setToastNotification(null)}
              className="p-1.5 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-200/50 transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Overview stats bar */}
      <div className="mb-6 bg-white dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-500" />
            Core Daily Triage
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tasks with today's due date automatically move to {segmentNames.today}. Completed tasks stay until tomorrow.
          </p>
        </div>

        {/* Today's Daily Completion Progress */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#181f2e] px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <div className="text-right">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Today's Completion
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {todayData.completedToday.length} / {todayTotalCount} done
            </div>
          </div>
          <div className="w-24 sm:w-32 bg-slate-200 dark:bg-slate-700/60 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${todayProgressPercent}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 min-w-[32px]">
            {todayProgressPercent}%
          </span>
        </div>
      </div>

      {/* Mobile Tab Selector */}
      <div className="md:hidden flex items-center justify-between bg-slate-100 dark:bg-[#151b27] p-1 rounded-xl mb-4 border border-slate-200/70 dark:border-slate-800/80">
        {columns.map(col => (
          <button
            key={col.id}
            type="button"
            onClick={() => setActiveBucketMobile(col.id)}
            className={`flex-1 py-2 px-1 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeBucketMobile === col.id
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {col.icon}
            <span className="truncate">{col.name.split('/')[0].trim()}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${col.colorClasses.badge}`}>
              {col.activeTasks.length}
            </span>
          </button>
        ))}
      </div>

      {/* 3-Column Triage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {columns.map(col => {
          const isHiddenOnMobile = activeBucketMobile !== col.id;
          const isDropTarget = activeDropColumn === col.id;
          const isFormOpen = openCreateColumn === col.id;
          const isRenaming = editingSegment === col.id;
          const isDueDateToday = col.id !== 'today' && isDueDateTodayOrPast(newDueDate);

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOverColumn(e, col.id)}
              onDragLeave={(e) => handleDragLeaveColumn(e, col.id)}
              onDrop={(e) => handleDropOnColumn(e, col.id)}
              className={`${
                isHiddenOnMobile ? 'hidden md:flex' : 'flex'
              } flex-col bg-slate-50/70 dark:bg-[#10141e]/90 rounded-2xl border transition-all duration-200 min-h-[580px] p-3.5 shadow-sm ${
                isDropTarget
                  ? 'border-sky-400 ring-2 ring-sky-400/20 bg-sky-50/30 dark:bg-sky-950/20'
                  : 'border-slate-200/70 dark:border-slate-800/70'
              }`}
            >
              {/* Column Header with editable segment name */}
              <div className={`p-3 rounded-xl ${col.colorClasses.headerBg} border-b border-slate-200/60 dark:border-slate-800/50 mb-3`}>
                <div className="flex items-center justify-between">
                  {isRenaming ? (
                    <div className="flex items-center gap-1.5 flex-1 mr-2">
                      <input
                        type="text"
                        value={segmentNameInput}
                        onChange={(e) => setSegmentNameInput(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveSegmentName(col.id);
                          if (e.key === 'Escape') setEditingSegment(null);
                        }}
                        className="w-full text-xs font-semibold bg-white dark:bg-slate-900 border border-sky-400 rounded-lg px-2 py-1 outline-none text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={() => saveSegmentName(col.id)}
                        className="p-1 rounded bg-sky-500 text-white hover:bg-sky-600"
                        title="Save name"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingSegment(null)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group/title flex-1 min-w-0">
                      {col.icon}
                      <h3 
                        onClick={() => startEditSegment(col.id)}
                        className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate cursor-pointer hover:text-sky-500 transition-colors"
                        title="Click to rename segment"
                      >
                        {col.name}
                      </h3>
                      <button
                        onClick={() => startEditSegment(col.id)}
                        className="opacity-0 group-hover/title:opacity-100 text-slate-400 hover:text-sky-500 transition-opacity p-0.5"
                        title="Rename segment"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${col.colorClasses.badge}`}>
                    {col.activeTasks.length}
                  </span>
                </div>
              </div>

              {/* Task Creation Trigger / Expandable Form */}
              <div className="mb-3.5">
                {isFormOpen ? (
                  <form
                    onSubmit={(e) => handleCreateTask(e, col.id)}
                    className="bg-white dark:bg-[#151c28] border border-sky-400/80 rounded-xl p-3.5 shadow-md space-y-3"
                  >
                    <div>
                      <input
                        type="text"
                        autoFocus
                        required
                        placeholder="Task title (required)..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 outline-none"
                      />
                    </div>
                    <div>
                      <textarea
                        rows={2}
                        placeholder="Description (optional)..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-700 dark:text-slate-300 outline-none resize-none"
                      />
                    </div>

                    {/* Due Date Section with Visual Calendar Trigger + Manual Option */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => triggerDatePicker(dateInputRef.current)}
                            className="p-1 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200/60 dark:border-sky-800/60 transition-colors flex items-center gap-1 shadow-2xs"
                            title="Click to open calendar directly"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-semibold">Select from Calendar</span>
                          </button>
                        </label>
                        <span className="text-[10px] text-slate-400">or type manually:</span>
                      </div>

                      <div className="relative flex items-center">
                        <input
                          ref={dateInputRef}
                          type="date"
                          required
                          value={newDueDate}
                          onChange={(e) => setNewDueDate(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 outline-none focus:border-sky-400 dark:[color-scheme:dark] cursor-pointer"
                        />
                      </div>

                      {/* Quick Date Presets */}
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => setNewDueDate(todayStr)}
                          className={`px-2 py-0.5 text-[10px] rounded-md transition-colors ${
                            newDueDate === todayStr
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
                            const y = d.getFullYear();
                            const m = String(d.getMonth() + 1).padStart(2, '0');
                            const day = String(d.getDate()).padStart(2, '0');
                            setNewDueDate(`${y}-${m}-${day}`);
                          }}
                          className="px-2 py-0.5 text-[10px] rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                        >
                          Tomorrow
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                            const y = d.getFullYear();
                            const m = String(d.getMonth() + 1).padStart(2, '0');
                            const day = String(d.getDate()).padStart(2, '0');
                            setNewDueDate(`${y}-${m}-${day}`);
                          }}
                          className="px-2 py-0.5 text-[10px] rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                        >
                          +3 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                            const y = d.getFullYear();
                            const m = String(d.getMonth() + 1).padStart(2, '0');
                            const day = String(d.getDate()).padStart(2, '0');
                            setNewDueDate(`${y}-${m}-${day}`);
                          }}
                          className="px-2 py-0.5 text-[10px] rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                        >
                          +1 Week
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerDatePicker(dateInputRef.current)}
                          className="px-2 py-0.5 text-[10px] rounded-md bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60 transition-colors font-medium ml-auto flex items-center gap-1"
                        >
                          <Calendar className="w-2.5 h-2.5" />
                          Pick Date
                        </button>
                      </div>

                      {/* Live Auto-Move Notice if chosen due date is today or earlier */}
                      {isDueDateToday && (
                        <div className="mt-2 flex items-start gap-1.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium animate-fadeIn">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>
                            Due date matches today! This task will automatically be placed into <strong>{segmentNames.today}</strong>.
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setOpenCreateColumn(null)}
                        className="text-xs px-2.5 py-1 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newTitle.trim() || !newDueDate.trim()}
                        className="text-xs px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-medium shadow-xs"
                      >
                        Add Task
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => openTaskForm(col.id)}
                    className="w-full flex items-center justify-between bg-white dark:bg-[#161c28] border border-slate-200 dark:border-slate-700/80 hover:border-sky-400 dark:hover:border-sky-400 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shadow-xs transition-all"
                  >
                    <span>+ Add new task...</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-400">
                      Title · Description · Due Date
                    </span>
                  </button>
                )}
              </div>

              {/* Task Cards List with Drag & Drop */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[650px] pr-0.5">
                {col.activeTasks.length === 0 && col.completedToday.length === 0 ? (
                  <div className="h-44 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-center p-4 text-slate-400 dark:text-slate-600">
                    <p className="text-xs font-medium">No tasks here yet</p>
                    <p className="text-[11px] mt-1 text-slate-400/80">
                      Drag tasks here or click above to add
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Active Tasks */}
                    {col.activeTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    ))}

                    {/* Completed Today section in the same column */}
                    {col.completedToday.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                          <span className="font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Completed Today ({col.completedToday.length})
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Auto-archives tomorrow
                          </span>
                        </div>
                        {col.completedToday.map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Drop hint when dragging */}
              {draggedTask && draggedTask.bucket !== col.id && (
                <div className="mt-2 py-2 border-2 border-dashed border-sky-400/40 rounded-xl text-center text-xs text-sky-500 dark:text-sky-400 font-medium bg-sky-50/40 dark:bg-sky-950/20 animate-pulse">
                  Drop here to move to {col.name.split('/')[0].trim()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
