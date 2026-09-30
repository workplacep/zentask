import React, { useState, useRef } from 'react';
import { 
  Check, 
  Trash2, 
  GripVertical, 
  Edit3, 
  Sparkles,
  BookOpen,
  FolderKanban,
  Calendar,
  AlertCircle
} from 'lucide-react';
import type { Task } from '../types';
import { useTaskStore, getTodayDateString, isCompletedToday } from '../store/useTaskStore';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onDragEnd }) => {
  const { toggleTaskCompletion, deleteTask, updateTask, moveTaskBucket } = useTaskStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedNotes, setEditedNotes] = useState(task.notes || '');
  const [editedDueDate, setEditedDueDate] = useState(task.due_date || getTodayDateString());
  const editDateInputRef = useRef<HTMLInputElement>(null);

  const todayStr = getTodayDateString();
  const wasCompletedToday = task.is_completed && isCompletedToday(task.completed_at);

  const triggerDatePicker = () => {
    if (editDateInputRef.current) {
      try {
        if ('showPicker' in HTMLInputElement.prototype) {
          editDateInputRef.current.showPicker();
        } else {
          editDateInputRef.current.focus();
        }
      } catch {
        editDateInputRef.current.focus();
      }
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedTitle.trim() && editedDueDate.trim()) {
      updateTask(task.id, {
        title: editedTitle.trim(),
        notes: editedNotes.trim(),
        due_date: editedDueDate.trim(),
      });
      setIsEditing(false);
    }
  };

  const formatDueDateLabel = (dueDateStr?: string) => {
    if (!dueDateStr) return null;
    const dateOnly = dueDateStr.split('T')[0].trim();
    if (dateOnly === todayStr) {
      return { text: 'Due Today', isToday: true, isOverdue: false };
    }
    if (dateOnly < todayStr) {
      return { text: `Overdue (${dateOnly})`, isToday: false, isOverdue: true };
    }
    try {
      const d = new Date(dateOnly + 'T00:00:00');
      const formatted = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return { text: `Due ${formatted}`, isToday: false, isOverdue: false };
    } catch {
      return { text: `Due ${dateOnly}`, isToday: false, isOverdue: false };
    }
  };

  const dueBadge = formatDueDateLabel(task.due_date);

  return (
    <div
      draggable={!task.is_completed}
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      className={`group relative rounded-xl border p-3.5 transition-all duration-150 ${
        task.is_completed
          ? 'bg-slate-50/80 dark:bg-[#101520]/80 border-slate-200/60 dark:border-slate-800/50 shadow-none'
          : 'bg-white dark:bg-[#161c28] border-slate-200/90 dark:border-slate-800/80 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle (only for active tasks) */}
        {!task.is_completed ? (
          <div 
            className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 mt-0.5 cursor-grab"
            title="Drag to reorder or move segment"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-4 h-4 mt-0.5" />
        )}

        {/* Custom Checkbox */}
        <button
          type="button"
          onClick={() => toggleTaskCompletion(task.id)}
          className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-lg border transition-all flex items-center justify-center ${
            task.is_completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
              : 'border-slate-300 dark:border-slate-600 hover:border-sky-500 dark:hover:border-sky-400 bg-transparent'
          }`}
          title={task.is_completed ? 'Task completed today (click to uncheck)' : 'Mark as done'}
        >
          {task.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                autoFocus
                required
                placeholder="Task title"
                className="w-full text-sm font-medium bg-slate-50 dark:bg-slate-900 border border-sky-400 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 outline-none"
              />
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Optional description / notes..."
                rows={2}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-700 dark:text-slate-300 outline-none resize-none"
              />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Due Date:</span>
                  <button
                    type="button"
                    onClick={triggerDatePicker}
                    className="p-1 rounded text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/60 text-[10px] font-semibold flex items-center gap-1"
                    title="Open calendar picker"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Open Calendar</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={editDateInputRef}
                    type="date"
                    required
                    value={editedDueDate}
                    onChange={(e) => setEditedDueDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 outline-none dark:[color-scheme:dark] cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs px-2.5 py-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs px-3 py-1 rounded bg-sky-500 hover:bg-sky-600 text-white font-medium shadow-sm"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p
                onClick={() => !task.is_completed && setIsExpanded(!isExpanded)}
                className={`text-sm font-medium leading-snug cursor-pointer select-none transition-colors ${
                  task.is_completed
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-800 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400'
                }`}
              >
                {task.title}
              </p>

              {/* Badges row: Due Date + Project + Completed Today indicator */}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {/* Due Date Badge */}
                {dueBadge && !task.is_completed && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                      dueBadge.isOverdue
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/60 font-semibold'
                        : dueBadge.isToday
                        ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/70 dark:border-slate-700/60'
                    }`}
                  >
                    {dueBadge.isOverdue ? (
                      <AlertCircle className="w-3 h-3 text-rose-500" />
                    ) : (
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    )}
                    <span>{dueBadge.text}</span>
                  </span>
                )}

                {/* Completed Today Badge */}
                {wasCompletedToday && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                    <Check className="w-3 h-3" />
                    Completed today · Moves to archive tomorrow
                  </span>
                )}

                {/* Linked project or learning tag */}
                {task.project_title && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                    {task.project_title.includes('Learn') ? (
                      <BookOpen className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <FolderKanban className="w-3 h-3 text-sky-500" />
                    )}
                    <span className="truncate max-w-[130px]">{task.project_title}</span>
                  </span>
                )}
              </div>

              {/* Description / Expanded Notes */}
              {(isExpanded || task.notes) && (
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#0f141f] rounded-lg p-2 border border-slate-100 dark:border-slate-800/60">
                  {task.notes ? (
                    <p className="whitespace-pre-wrap">{task.notes}</p>
                  ) : (
                    <p className="italic text-slate-400">No description.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action icons */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Edit task"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => deleteTask(task.id)}
              className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Move Pills (Only for active tasks) */}
      {!task.is_completed && !isEditing && (
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-normal text-slate-400 dark:text-slate-500">Quick move:</span>
          <div className="flex items-center gap-1.5">
            {task.bucket !== 'today' && (
              <button
                type="button"
                onClick={() => moveTaskBucket(task.id, 'today')}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                title="Move to Today"
              >
                <Sparkles className="w-3 h-3" />
                Today
              </button>
            )}

            {task.bucket !== 'this_week' && (
              <button
                type="button"
                onClick={() => moveTaskBucket(task.id, 'this_week')}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors"
                title="Move to This Week"
              >
                Week
              </button>
            )}

            {task.bucket !== 'later' && (
              <button
                type="button"
                onClick={() => moveTaskBucket(task.id, 'later')}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Move to Later"
              >
                Later
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
