import React, { useState, useEffect } from 'react';
import { useTaskStore } from './store/useTaskStore';
import { Navbar } from './components/Navbar';
import { TaskTriageBoard } from './components/TaskTriageBoard';
import { LearningProjectsVault } from './components/LearningProjectsVault';
import { CompletedArchive } from './components/CompletedArchive';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AuthModal } from './components/AuthModal';

export const App: React.FC = () => {
  const { activeTab, theme, initAuthAndSync, autoPromoteDueTasks } = useTaskStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initialize theme class on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initialize cloud auth listener & sync
  useEffect(() => {
    initAuthAndSync();
  }, [initAuthAndSync]);

  // Periodic and event-driven check for task due dates
  // Automatically moves tasks whose due date has reached today into Segment 1
  useEffect(() => {
    autoPromoteDueTasks();

    const interval = setInterval(() => {
      autoPromoteDueTasks();
    }, 30000); // Check every 30 seconds

    const handleFocus = () => autoPromoteDueTasks();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        autoPromoteDueTasks();
      }
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [autoPromoteDueTasks]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f17] text-slate-800 dark:text-slate-100 transition-colors duration-150">
      {/* Top Navigation */}
      <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-8">
        {activeTab === 'tasks' && <TaskTriageBoard />}
        {activeTab === 'projects' && <LearningProjectsVault />}
        {activeTab === 'completed' && <CompletedArchive />}
      </main>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop) */}
      <MobileBottomNav onOpenAuth={() => setIsAuthModalOpen(true)} />

      {/* Cloud Sync & Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default App;
