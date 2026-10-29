import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import {
  BookOpen,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Phone,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Info,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { addToast } = useLibrary();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength calculation
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);
  let strengthLabel = 'Too Weak';
  let strengthColor = 'bg-rose-500';

  if (strength === 2) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-amber-500';
  } else if (strength === 3 || strength === 4) {
    strengthLabel = 'Good';
    strengthColor = 'bg-emerald-500';
  } else if (strength >= 5) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-forest-600';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid university email address.');
      return;
    }
    if (!studentId.trim()) {
      setError('Student Roll / ID is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setLoading(true);
    const result = await register(
      {
        name: name.trim(),
        email: email.trim(),
        studentId: studentId.trim(),
        department,
        session: '2021-22',
        phone: phone.trim(),
      },
      password
    );
    setLoading(false);

    if (result.success) {
      addToast('success', 'Account Created!', 'Welcome to the IU Central Library system.');
      navigate('/dashboard');
    } else {
      setError(result.error || 'Failed to create student account.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white dark:bg-charcoal-900 p-8 sm:p-10 rounded-3xl border border-sage-200 dark:border-charcoal-800 shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-forest-700 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100">
            Student & Member Registration
          </h2>
          <p className="text-xs text-charcoal-500 dark:text-sage-400 mt-1">
            Create your digital library account for Islamic University, Bangladesh
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full pl-9 pr-3 py-2.5 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-hidden focus:border-forest-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Student Roll / ID *
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. 2114028"
                  className="w-full pl-9 pr-3 py-2.5 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-hidden focus:border-forest-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                University Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@iu.ac.bd"
                  className="w-full pl-9 pr-3 py-2.5 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-hidden focus:border-forest-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full py-2.5 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information & Communication Technology">Information & Communication Technology</option>
                <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Applied Physics">Applied Physics</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
              Contact Phone (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1712-000000"
                className="w-full pl-9 pr-3 py-2.5 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-hidden focus:border-forest-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 chars"
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

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-9 pr-3 py-2.5 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-hidden focus:border-forest-600"
                />
              </div>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="p-2.5 bg-sage-50 dark:bg-charcoal-800 rounded-xl border border-sage-200 dark:border-charcoal-700 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-charcoal-600 dark:text-sage-300">
                <span>Password Strength</span>
                <span className="font-bold">{strengthLabel}</span>
              </div>
              <div className="w-full h-1.5 bg-sage-200 dark:bg-charcoal-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strengthColor} transition-all duration-300`}
                  style={{ width: `${Math.min(100, (strength / 5) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-forest-700 hover:bg-forest-800 text-ivory-100 font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Registering Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 bg-sage-50 dark:bg-charcoal-800/50 rounded-xl border border-sage-200 dark:border-charcoal-700 text-[11px] text-charcoal-500 dark:text-sage-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
          <span>
            Demo storage notice: Accounts registered here persist in your current browser localStorage and can borrow up to 5 books.
          </span>
        </div>

        <div className="text-center text-xs text-charcoal-600 dark:text-sage-400 pt-2 border-t border-sage-100 dark:border-charcoal-800">
          Already have a member account?{' '}
          <Link
            to="/login"
            className="font-bold text-forest-700 dark:text-amber-400 hover:underline"
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
