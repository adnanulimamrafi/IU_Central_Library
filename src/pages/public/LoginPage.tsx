import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import {
  BookOpen,
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

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const { addToast } = useLibrary();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoPasswords, setShowDemoPasswords] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || (isAdmin ? '/admin' : '/dashboard');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please fill in both username and password.');
      return;
    }

    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);

    if (result.success) {
      addToast('success', 'Welcome Back!', 'Logged in successfully.');
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleFillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  const handleInstantLogin = async (u: string, p: string, label: string) => {
    setLoading(true);
    setError('');
    const res = await login(u, p);
    setLoading(false);
    if (res.success) {
      addToast('success', 'Logged In', `Session established as ${label}.`);
      navigate(u === 'admin' ? '/admin' : '/dashboard');
    } else {
      setError(res.error || 'Login failed.');
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-7 bg-white dark:bg-charcoal-900 p-8 sm:p-10 rounded-3xl border border-sage-200 dark:border-charcoal-800 shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-forest-700 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100">
            Sign In to Library
          </h2>
          <p className="text-xs text-charcoal-500 dark:text-sage-400 mt-1">
            Access your student borrowing account and digital reading list
          </p>
        </div>

        {/* 1-Click Instant Demo Login Buttons */}
        <div className="p-4 bg-sage-50/80 dark:bg-charcoal-800/80 rounded-2xl border border-sage-200 dark:border-charcoal-700 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-forest-800 dark:text-amber-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Predefined Demo Accounts</span>
            </span>
            <button
              type="button"
              onClick={() => setShowDemoPasswords(!showDemoPasswords)}
              className="text-[10px] text-charcoal-500 dark:text-sage-400 hover:underline flex items-center gap-1"
            >
              {showDemoPasswords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showDemoPasswords ? 'Hide details' : 'View credentials'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleInstantLogin('tanvir', 'User@123', 'Tanvir Ahmed (Student)')}
              className="py-2 px-2.5 bg-forest-700 hover:bg-forest-800 text-ivory-100 rounded-xl text-xs font-semibold shadow-xs transition-colors text-center truncate"
            >
              tanvir (Student)
            </button>
            <button
              type="button"
              onClick={() => handleInstantLogin('student1', 'Student@123', 'Nusrat Jahan (Student)')}
              className="py-2 px-2.5 bg-forest-700 hover:bg-forest-800 text-ivory-100 rounded-xl text-xs font-semibold shadow-xs transition-colors text-center truncate"
            >
              student1 (Student)
            </button>
            <button
              type="button"
              onClick={() => handleInstantLogin('student2', 'Student@123', 'Ariful Islam (Student)')}
              className="py-2 px-2.5 bg-forest-700 hover:bg-forest-800 text-ivory-100 rounded-xl text-xs font-semibold shadow-xs transition-colors text-center truncate"
            >
              student2 (Student)
            </button>
            <button
              type="button"
              onClick={() => handleInstantLogin('admin', 'Admin@123', 'Administrator')}
              className="py-2 px-2.5 bg-charcoal-800 hover:bg-charcoal-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors text-center truncate"
            >
              admin (Supervisor)
            </button>
          </div>

          {showDemoPasswords && (
            <div className="mt-2 pt-2 border-t border-sage-200 dark:border-charcoal-700 text-[11px] space-y-1.5 font-mono text-charcoal-700 dark:text-sage-300">
              <div className="flex justify-between items-center bg-white/70 dark:bg-charcoal-900/70 p-1.5 rounded-lg">
                <span>tanvir / User@123</span>
                <button
                  type="button"
                  onClick={() => handleFillCredentials('tanvir', 'User@123')}
                  className="text-[10px] text-forest-700 dark:text-amber-400 font-sans font-semibold hover:underline"
                >
                  Fill Form
                </button>
              </div>
              <div className="flex justify-between items-center bg-white/70 dark:bg-charcoal-900/70 p-1.5 rounded-lg">
                <span>admin / Admin@123</span>
                <button
                  type="button"
                  onClick={() => handleFillCredentials('admin', 'Admin@123')}
                  className="text-[10px] text-forest-700 dark:text-amber-400 font-sans font-semibold hover:underline"
                >
                  Fill Form
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="tanvir or admin"
                className="w-full pl-9 pr-3 py-2.5 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-hidden focus:border-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
              Password
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

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-charcoal-600 dark:text-sage-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-sage-300 text-forest-700 focus:ring-forest-600"
              />
              <span>Remember this session</span>
            </label>
            <Link
              to="/admin-login"
              className="text-forest-700 dark:text-amber-400 font-semibold hover:underline"
            >
              Staff Portal →
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-forest-700 hover:bg-forest-800 text-ivory-100 font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-sage-200 dark:border-charcoal-800">
          <p className="text-xs text-charcoal-500 dark:text-sage-400">
            Need a student borrowing card?{' '}
            <Link
              to="/register"
              className="font-semibold text-forest-700 dark:text-amber-400 hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
