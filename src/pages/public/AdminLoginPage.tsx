import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import {
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info,
  Check,
  Copy,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const { addToast } = useLibrary();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);

    if (result.success) {
      addToast('success', 'Admin Session Verified', 'Welcome to the Library Administration Panel.');
      navigate('/admin');
    } else {
      setError(result.error || 'Invalid administrator credentials.');
    }
  };

  const handleDemoAdmin = async () => {
    setLoading(true);
    setError('');
    const res = await login('admin', 'Admin@123');
    setLoading(false);
    if (res.success) {
      addToast('success', 'Admin Session Verified', 'Logged in as System Administrator.');
      navigate('/admin');
    } else {
      setError(res.error || 'Admin login failed.');
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText('Admin@123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-charcoal-900 p-8 sm:p-10 rounded-3xl border border-forest-600/30 dark:border-forest-700/50 shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-forest-900 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-forest-700 shadow-md">
            <Shield className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900/50">
            Administrative Portal
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100 mt-2">
            Staff & Faculty Control
          </h2>
          <p className="text-xs text-charcoal-500 dark:text-sage-400 mt-1">
            Department of Computer Science & Engineering · Central Digital Library
          </p>
        </div>

        {/* 1-Click Demo Admin Button */}
        <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Pre-Seeded Demo Supervisor
            </span>
          </div>
          <button
            type="button"
            onClick={handleDemoAdmin}
            disabled={loading}
            className="w-full py-2.5 bg-forest-900 hover:bg-forest-950 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Instant Admin Login (admin / Admin@123)</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-9 pr-3 py-2.5 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-hidden focus:border-forest-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
              Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-hidden focus:border-forest-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 dark:text-sage-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-sage-400 bg-sage-50/50 dark:bg-charcoal-800/50 p-2.5 rounded-xl border border-sage-200/50 dark:border-charcoal-700">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-forest-700 dark:text-amber-400" />
              Password: <code className="bg-sage-200/60 dark:bg-charcoal-700 px-1.5 py-0.5 rounded font-mono">Admin@123</code>
            </span>
            <button
              type="button"
              onClick={handleCopyPassword}
              className="text-forest-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-forest-900 hover:bg-forest-950 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Access Management Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-sage-200 dark:border-charcoal-800">
          <Link
            to="/login"
            className="text-xs text-charcoal-500 dark:text-sage-400 hover:text-forest-700 dark:hover:text-amber-400 hover:underline"
          >
            ← Return to Student Portal Login
          </Link>
        </div>
      </div>
    </div>
  );
};
