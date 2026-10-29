import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import {
  ShieldAlert,
  BookOpen,
  Tags,
  Users,
  Clock,
  Settings,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const { currentUser, logout } = useAuth();
  const { books, borrowRecords } = useLibrary();

  const totalBooks = books.length;
  const activeLoans = borrowRecords.filter((r) => r.status === 'active').length;

  const adminNav = [
    {
      to: '/admin',
      label: 'Admin Overview',
      icon: <ShieldAlert className="w-4 h-4" />,
      end: true,
    },
    {
      to: '/admin/books',
      label: 'Book Management',
      icon: <BookOpen className="w-4 h-4" />,
      badge: totalBooks,
    },
    {
      to: '/admin/categories',
      label: 'Category Management',
      icon: <Tags className="w-4 h-4" />,
    },
    {
      to: '/admin/members',
      label: 'Member Management',
      icon: <Users className="w-4 h-4" />,
    },
    {
      to: '/admin/borrowings',
      label: 'Borrowing Records',
      icon: <Clock className="w-4 h-4" />,
      badge: activeLoans,
    },
    {
      to: '/admin/settings',
      label: 'System Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-full h-full flex flex-col bg-white dark:bg-charcoal-900 border-r border-sage-200 dark:border-charcoal-800 p-4 transition-colors">
      {/* Admin Profile Box */}
      <div className="p-4 rounded-2xl bg-forest-900 text-ivory-100 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&q=80'}
            alt={currentUser?.name || 'Admin'}
            className="w-11 h-11 rounded-xl object-cover border border-forest-600"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white truncate">
              {currentUser?.name || 'Administrator'}
            </h4>
            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-medium mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Control Staff</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 dark:text-sage-400 px-3 mb-2 font-mono">
        Administration
      </div>

      <nav className="space-y-1 flex-1">
        {adminNav.map((item) => (
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
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sage-200 dark:bg-charcoal-800 text-forest-800 dark:text-sage-200">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-sage-200 dark:border-charcoal-800 space-y-2">
        <Link
          to="/"
          onClick={onCloseMobile}
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-charcoal-700 dark:text-sage-200 hover:bg-sage-100 dark:hover:bg-charcoal-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-forest-600" />
            View Public Site
          </span>
          <span className="text-[10px] text-charcoal-400">&rarr;</span>
        </Link>

        <button
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            logout();
          }}
          className="flex items-center gap-2.5 w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
};
