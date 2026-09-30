import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Lock, 
  Mail, 
  Check, 
  Database, 
  Smartphone, 
  Laptop, 
  LogOut, 
  AlertCircle,
  ShieldCheck,
  Zap,
  ExternalLink,
  Copy
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { 
  getStoredSupabaseConfig, 
  saveStoredSupabaseConfig, 
  SUPABASE_SQL_SETUP_SCRIPT 
} from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { userSession, signIn, signUp, signOut } = useTaskStore();

  const [activeTab, setActiveTab] = useState<'auth' | 'howitworks' | 'advanced'>('auth');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Auth inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Supabase advanced inputs
  const currentConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.key);
  const [copiedSql, setCopiedSql] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        const res = await signUp(email, password);
        if (res.error) {
          setAuthError(res.error);
        } else {
          setAuthSuccessMsg('Account created! Your tasks are now safely backed up in the cloud.');
          setTimeout(() => onClose(), 1000);
        }
      } else {
        const res = await signIn(email, password);
        if (res.error) {
          setAuthError(res.error);
        } else {
          setAuthSuccessMsg('Logged in! All your tasks have been restored and synced.');
          setTimeout(() => onClose(), 1000);
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSupabaseConfig(supabaseUrl, supabaseKey);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#131924] rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                Account & Cloud Sync
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Safe cloud backup & real-time sync across desktop & phone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 pt-2 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('auth')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'auth'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Account Login
          </button>
          <button
            onClick={() => setActiveTab('howitworks')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'howitworks'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            GitHub & Vercel Setup
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'advanced'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Optional: Supabase
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'auth' ? (
            userSession.isLoggedIn ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {userSession.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Account Backed Up in Cloud
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-300 font-mono mt-0.5">
                        {userSession.email}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-medium">
                    Synced
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161c28] border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-sky-500" />
                    <Smartphone className="w-4 h-4 text-sky-500" />
                    Sync across your devices:
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Open ZenTask on your phone (or any other computer), sign in with <strong>{userSession.email}</strong>, and all your tasks, due dates, projects, and segments will appear immediately!
                  </p>
                </div>

                <button
                  onClick={signOut}
                  className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out from this device
                </button>
              </div>
            ) : (
              <div>
                {/* Reassuring Backup Notice */}
                <div className="mb-4 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 text-sky-800 dark:text-sky-300 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Crash & Reinstall Protection</span>
                    <span className="text-[11px] text-sky-700 dark:text-sky-300/90 leading-tight block mt-0.5">
                      When logged in, if your phone is lost, app is deleted, or PC crashes, simply log in to restore all your tasks in 1 second.
                    </span>
                  </div>
                </div>

                {/* Sign In / Sign Up toggle */}
                <div className="flex bg-slate-100 dark:bg-[#181f2e] p-1 rounded-xl mb-4 text-xs font-medium">
                  <button
                    onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      authMode === 'signin'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      authMode === 'signup'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {authError && (
                  <div className="p-3 mb-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                {authSuccessMsg && (
                  <div className="p-3 mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{authSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-sky-500 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-sky-500 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium text-xs shadow-sm transition-all"
                  >
                    {authLoading ? 'Connecting...' : authMode === 'signin' ? 'Sign In & Restore Tasks' : 'Create Account & Backup'}
                  </button>
                </form>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 text-center">
                  Offline mode is always active. Tasks are continuously saved locally even without an internet connection.
                </div>
              </div>
            )
          ) : activeTab === 'howitworks' ? (
            /* Simple GitHub & Vercel Setup Tab (NO SQL!) */
            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300">
                <span className="font-semibold block mb-0.5">Zero-SQL Database (100% Free Forever)</span>
                <span className="text-[11px] leading-tight block">
                  You do NOT need SQL, tables, or complex setups. Just deploy to Vercel and connect Upstash Redis in 1 click!
                </span>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  How to deploy in 3 simple steps:
                </div>
                <ol className="list-decimal list-inside space-y-2 pl-1 text-[11px] leading-relaxed">
                  <li>
                    <strong>Push to GitHub</strong>: Push this folder to a repository on your GitHub.
                  </li>
                  <li>
                    <strong>Import to Vercel</strong>: Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">vercel.com</a>, click <strong>Add New → Project</strong>, select your GitHub repo, and click <strong>Deploy</strong>.
                  </li>
                  <li>
                    <strong>1-Click Database</strong>:
                    In your Vercel project dashboard, click <strong>Storage</strong> → select <strong>Upstash Redis</strong> → click <strong>Connect</strong>.
                    <span className="block text-slate-400 mt-0.5">That's it! Vercel automatically links the database with zero configuration.</span>
                  </li>
                </ol>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                Once deployed, open your live Vercel link on your phone and laptop, log in, and all your tasks sync seamlessly in real time!
              </div>
            </div>
          ) : (
            /* Optional Advanced Supabase Tab */
            <div className="space-y-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Advanced option: Connect a Supabase PostgreSQL database if you prefer traditional SQL tables.
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-sky-500 text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-sky-500 text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-sky-500 hover:underline flex items-center gap-1"
                  >
                    Supabase Console <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-xs"
                  >
                    {configSaved ? 'Saved!' : 'Save Credentials'}
                  </button>
                </div>
              </form>

              {/* 1-Click SQL Setup Script */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Database Setup (SQL Script)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[10px] p-2.5 bg-slate-900 text-slate-300 rounded-xl max-h-32 overflow-y-auto font-mono leading-tight">
                  {SUPABASE_SQL_SETUP_SCRIPT}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
