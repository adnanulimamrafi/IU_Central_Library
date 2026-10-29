import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { isUserRecord } from '../../utils/userRecords';
import {
  LayoutDashboard,
  BookMarked,
  History,
  Heart,
  UserCheck,
  BookOpen,
  LogOut,
  GraduationCap,
} from 'lucide-react';

interface UserSidebarProps {
  onCloseMobile?: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ onCloseMobile }) => {
  const { currentUser, logout } = useAuth();
  const { borrowRecords, favourites } = useLibrary();

  const activeCount = currentUser
    ? borrowRecords.filter((r) => isUserRecord(r, currentUser) && r.status === 'active').length
    : 0;

  const favCount = favourites.length;

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      end: true,
    },
    {
      to: '/dashboard/my-books',
      label: 'My Borrowed Books',
      icon: <BookMarked className="w-4 h-4" />,
      badge: activeCount > 0 ? activeCount : undefined,
    },
    {
      to: '/dashboard/history',
      label: 'Borrowing History',
      icon: <History className="w-4 h-4" />,
    },
    {
      to: '/dashboard/favourites',
      label: 'Saved & Favourites',
      icon: <Heart className="w-4 h-4" />,
      badge: favCount > 0 ? favCount : undefined,
    },
    {
      to: '/dashboard/profile',
      label: 'My Profile & Security',
      icon: <UserCheck className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-full h-full flex flex-col bg-white dark:bg-charcoal-900 border-r border-sage-200 dark:border-charcoal-800 p-4 transition-colors">
      {/* Member Profile Widget */}
      {currentUser && (
        <div className="p-4 rounded-2xl bg-sage-50/80 dark:bg-charcoal-800/80 border border-sage-200/80 dark:border-charcoal-700/80 mb-6">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80'}
              alt={currentUser.name}
              className="w-12 h-12 rounded-xl object-cover border border-sage-300 dark:border-charcoal-600 shadow-2xs"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-charcoal-900 dark:text-ivory-100 truncate">
                {currentUser.name}
              </h4>
              <p className="text-[11px] text-forest-700 dark:text-amber-400 font-medium truncate">
                {currentUser.studentId ? `Roll: ${currentUser.studentId}` : (currentUser.role === 'admin' ? 'Administrator' : 'Student Member')}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-charcoal-500 dark:text-sage-400 mt-0.5">
                <GraduationCap className="w-3 h-3 shrink-0" />
                <span className="truncate">{currentUser.department || 'Islamic University'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav List */}
      <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 dark:text-sage-400 px-3 mb-2 font-mono">
        Member Services
      </div>
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-forest-700 text-ivory-100 shadow-xs'
                  : 'text-charcoal-700 dark:text-sage-200 hover:bg-sage-100 dark:hover:bg-charcoal-800 hover:text-forest-800'
              }`
            }
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.badge !== undefined && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-forest-900">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Shortcuts */}
      <div className="pt-4 border-t border-sage-200 dark:border-charcoal-800 space-y-2">
        <NavLink
          to="/books"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-forest-700 dark:text-amber-400 bg-sage-100/70 dark:bg-charcoal-800 hover:bg-sage-200/80 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Browse Library Books</span>
        </NavLink>

        <button
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            logout();
          }}
          className="flex items-center gap-2.5 w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
