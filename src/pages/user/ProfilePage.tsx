import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import {
  User,
  Mail,
  GraduationCap,
  Phone,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Key,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, changePassword } = useAuth();
  const { addToast } = useLibrary();

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [session, setSession] = useState(currentUser?.session || '2021-22');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  if (!currentUser) return null;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    await updateProfile({
      name: name.trim(),
      department: department.trim(),
      session: session.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
    });
    setProfileSaving(false);
    addToast('success', 'Profile Updated', 'Your student information has been updated.');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!oldPassword) {
      setPwdError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setPwdSaving(true);
    const result = await changePassword(oldPassword, newPassword);
    setPwdSaving(false);

    if (result.success) {
      setPwdSuccess('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast('success', 'Password Updated', 'Your security password has been updated successfully.');
    } else {
      setPwdError(result.error || 'Failed to update password.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-sage-200 dark:border-charcoal-800">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100">
          Member Profile & Security
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 dark:text-sage-400 mt-0.5">
          View your academic enrollment details and manage account credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Avatar & ID Card Summary */}
        <div className="md:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs text-center flex flex-col items-center">
            <div className="relative mb-3">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80'}
                alt={currentUser.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-forest-600 shadow-sm"
              />
              <span className="absolute -bottom-1.5 -right-1.5 p-1 bg-forest-700 text-white rounded-full">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </span>
            </div>

            <h3 className="font-serif text-base font-bold text-charcoal-900 dark:text-ivory-100">
              {currentUser.name}
            </h3>
            {currentUser.studentId && (
              <p className="text-xs text-forest-700 dark:text-amber-400 font-semibold mt-0.5">
                Roll No: {currentUser.studentId}
              </p>
            )}
            <p className="text-[11px] text-charcoal-500 dark:text-sage-400 mt-1">
              {currentUser.department || 'Islamic University'}
            </p>

            <div className="w-full mt-4 pt-4 border-t border-sage-100 dark:border-charcoal-800 text-left text-xs space-y-2 text-charcoal-600 dark:text-sage-300">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-400">Account Role:</span>
                <span className="capitalize font-semibold text-forest-700 dark:text-amber-400">
                  {currentUser.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-400">Status:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold capitalize">
                  {currentUser.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-400">Academic Session:</span>
                <span className="font-medium">{currentUser.session || '2021-22'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Edit & Password Change */}
        <div className="md:col-span-8 space-y-8">
          {/* Section 1: Profile Information */}
          <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-forest-900 dark:text-ivory-100 pb-2 border-b border-sage-100 dark:border-charcoal-800 flex items-center gap-2">
              <User className="w-4 h-4 text-forest-600" />
              <span>Personal Information</span>
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full py-2 px-3 bg-sage-100/60 dark:bg-charcoal-800/50 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                    Session
                  </label>
                  <input
                    type="text"
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1712-345678"
                  className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                  Academic Bio / Research Interests
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="py-2.5 px-5 bg-forest-700 hover:bg-forest-800 text-ivory-100 font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{profileSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Security & Password Simulation */}
          <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-forest-900 dark:text-ivory-100 pb-2 border-b border-sage-100 dark:border-charcoal-800 flex items-center gap-2">
              <Key className="w-4 h-4 text-forest-600" />
              <span>Change Security Password</span>
            </h3>

            {pwdError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{pwdError}</span>
              </div>
            )}

            {pwdSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={pwdSaving}
                  className="py-2.5 px-5 bg-charcoal-800 hover:bg-charcoal-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {pwdSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
