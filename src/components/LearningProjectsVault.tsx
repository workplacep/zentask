import React, { useState } from 'react';
import { 
  BookOpen, 
  FolderKanban, 
  Plus, 
  Check, 
  ExternalLink, 
  Trash2, 
  Sparkles, 
  CalendarDays, 
  ChevronDown, 
  ChevronUp, 
  Link as LinkIcon
} from 'lucide-react';
import type { ProjectCategory } from '../types';
import { useTaskStore } from '../store/useTaskStore';

export const LearningProjectsVault: React.FC = () => {
  const { 
    projects, 
    addProject, 
    deleteProject, 
    addProjectChecklistItem, 
    toggleProjectChecklistItem, 
    deleteProjectChecklistItem,
    promoteChecklistItemToTask,
    addProjectResource,
    deleteProjectResource 
  } = useTaskStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'learning' | 'project'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New project/learning form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProjectCategory>('learning');
  const [newDescription, setNewDescription] = useState('');

  // Per-project active inputs
  const [newChecklistText, setNewChecklistText] = useState<{ [id: string]: string }>({});
  const [newResourceTitle, setNewResourceTitle] = useState<{ [id: string]: string }>({});
  const [newResourceUrl, setNewResourceUrl] = useState<{ [id: string]: string }>({});
  const [expandedCards, setExpandedCards] = useState<{ [id: string]: boolean }>({});

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      addProject(
        newTitle.trim(), 
        newCategory, 
        newDescription.trim(), 
        newCategory === 'learning' ? 'emerald' : 'sky'
      );
      setNewTitle('');
      setNewDescription('');
      setShowAddModal(false);
    }
  };

  const handleAddChecklist = (projectId: string) => {
    const text = newChecklistText[projectId]?.trim();
    if (text) {
      addProjectChecklistItem(projectId, text);
      setNewChecklistText(prev => ({ ...prev, [projectId]: '' }));
    }
  };

  const handleAddResource = (projectId: string) => {
    const title = newResourceTitle[projectId]?.trim();
    const url = newResourceUrl[projectId]?.trim();
    if (title) {
      addProjectResource(projectId, title, url);
      setNewResourceTitle(prev => ({ ...prev, [projectId]: '' }));
      setNewResourceUrl(prev => ({ ...prev, [projectId]: '' }));
    }
  };

  const filteredProjects = projects.filter(p => {
    if (activeFilter === 'all') return true;
    return p.category === activeFilter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* Header bar */}
      <div className="mb-6 bg-white dark:bg-[#121722] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Learning & Projects Incubator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                A dedicated space for self-learning topics, courses, ideas, and side projects.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Pills */}
          <div className="flex bg-slate-100 dark:bg-[#181f2e] p-1 rounded-xl text-xs border border-slate-200/60 dark:border-slate-800/60">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setActiveFilter('learning')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                activeFilter === 'learning'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Learning
            </button>
            <button
              onClick={() => setActiveFilter('project')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                activeFilter === 'project'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              Projects
            </button>
          </div>

          {/* New Item Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Item</span>
          </button>
        </div>
      </div>

      {/* Creation Modal / Popover */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151b28] rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-5 shadow-elevated">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
              Add to Learning & Projects
            </h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCategory('learning')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      newCategory === 'learning'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    Learning & Skills
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory('project')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      newCategory === 'project'
                        ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <FolderKanban className="w-4 h-4 text-sky-500" />
                    Project / Build
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder={newCategory === 'learning' ? 'e.g., Master TypeScript Generics' : 'e.g., Personal Portfolio Redesign'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Description or Learning Roadmap
                </label>
                <textarea
                  rows={3}
                  placeholder="What is the objective, scope, or learning outcomes?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 outline-none resize-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-2 text-xs bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white rounded-xl font-medium shadow-sm"
                >
                  Create Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid of Projects & Learning Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8">
            <BookOpen className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No learning or project items in this view
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Record courses you want to take, skills you are studying, or prospective projects you want to build.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add First Item
            </button>
          </div>
        ) : (
          filteredProjects.map(proj => {
            const isLearning = proj.category === 'learning';
            const completedMilestones = proj.checklist.filter(c => c.is_completed).length;
            const totalMilestones = proj.checklist.length;
            const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
            const isExpanded = expandedCards[proj.id] ?? true;

            return (
              <div
                key={proj.id}
                className="bg-white dark:bg-[#141a26] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  {/* Card Top / Category Tag */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      isLearning
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                    }`}>
                      {isLearning ? (
                        <>
                          <BookOpen className="w-3 h-3 text-emerald-500" />
                          Learning & Study
                        </>
                      ) : (
                        <>
                          <FolderKanban className="w-3 h-3 text-sky-500" />
                          Project
                        </>
                      )}
                    </span>

                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {proj.title}
                  </h3>

                  {proj.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {proj.description}
                    </p>
                  )}

                  {/* Progress bar */}
                  {totalMilestones > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>Milestones</span>
                        <span>{completedMilestones}/{totalMilestones} ({progress}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isLearning ? 'bg-emerald-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Checklist / Milestones */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Action Items & Milestones
                      </span>
                      <button
                        onClick={() => toggleExpand(proj.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="space-y-2">
                        {proj.checklist.map(item => (
                          <div
                            key={item.id}
                            className="group/item flex items-center justify-between bg-slate-50 dark:bg-[#0f131c] px-2.5 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/60"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => toggleProjectChecklistItem(proj.id, item.id)}
                                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                  item.is_completed
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-sky-500'
                                }`}
                              >
                                {item.is_completed && <Check className="w-3 h-3 stroke-[3]" />}
                              </button>
                              <span className={`text-xs truncate ${
                                item.is_completed
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-700 dark:text-slate-200'
                              }`}>
                                {item.title}
                              </span>
                            </div>

                            {/* 1-CLICK PROMOTION BUTTONS: Send to Today / Send to Week */}
                            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity ml-2">
                              {!item.is_completed && (
                                <>
                                  <button
                                    onClick={() => promoteChecklistItemToTask(proj.id, item.id, 'today')}
                                    className="p-1 rounded bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-700 dark:text-amber-300 text-[10px] font-medium flex items-center gap-0.5"
                                    title="Send as active task into Today's column"
                                  >
                                    <Sparkles className="w-2.5 h-2.5" />
                                    Today
                                  </button>
                                  <button
                                    onClick={() => promoteChecklistItemToTask(proj.id, item.id, 'this_week')}
                                    className="p-1 rounded bg-sky-100 dark:bg-sky-950/60 hover:bg-sky-200 text-sky-700 dark:text-sky-300 text-[10px] font-medium flex items-center gap-0.5"
                                    title="Send as active task into This Week's column"
                                  >
                                    <CalendarDays className="w-2.5 h-2.5" />
                                    Week
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => deleteProjectChecklistItem(proj.id, item.id)}
                                className="p-1 text-slate-400 hover:text-rose-500"
                                title="Remove item"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add milestone input */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <input
                            type="text"
                            placeholder="+ Add milestone or topic..."
                            value={newChecklistText[proj.id] || ''}
                            onChange={(e) => setNewChecklistText(prev => ({ ...prev, [proj.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddChecklist(proj.id);
                              }
                            }}
                            className="flex-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddChecklist(proj.id)}
                            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Useful Resources / References */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                        Resources & References
                      </span>
                      <div className="space-y-1.5 mb-2">
                        {proj.resources.map(res => (
                          <div
                            key={res.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <LinkIcon className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              {res.url ? (
                                <a
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline text-sky-600 dark:text-sky-400 truncate flex items-center gap-1"
                                >
                                  {res.title}
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <span className="truncate">{res.title}</span>
                              )}
                            </div>
                            <button
                              onClick={() => deleteProjectResource(proj.id, res.id)}
                              className="text-slate-400 hover:text-rose-500 ml-2"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add resource form */}
                      <div className="flex items-center gap-1 text-xs">
                        <input
                          type="text"
                          placeholder="Resource title"
                          value={newResourceTitle[proj.id] || ''}
                          onChange={(e) => setNewResourceTitle(prev => ({ ...prev, [proj.id]: e.target.value }))}
                          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 outline-none text-[11px]"
                        />
                        <input
                          type="text"
                          placeholder="URL (optional)"
                          value={newResourceUrl[proj.id] || ''}
                          onChange={(e) => setNewResourceUrl(prev => ({ ...prev, [proj.id]: e.target.value }))}
                          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 outline-none text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddResource(proj.id)}
                          className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
