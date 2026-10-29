import React, { useState } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { Menu, X, Shield, ChevronRight, Home } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationDropdown } from '../common/NotificationDropdown';

export const AdminDashboardLayout: React.FC = () => {
  const { isAuthenticated, isAdmin, currentUser } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-ivory-100 dark:bg-charcoal-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-charcoal-900 p-8 rounded-2xl border border-rose-200 dark:border-rose-900 text-center shadow-xl">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl font-bold text-charcoal-900 dark:text-ivory-100 mb-2">
            Access Restricted
          </h2>
          <p className="text-xs text-charcoal-600 dark:text-sage-300 mb-6 leading-relaxed">
            The Admin Management Panel is restricted to library administrative faculty and supervisors. Your current account ({currentUser?.email}) has Member privileges.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/dashboard"
              className="py-2.5 px-4 bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-xl"
            >
              Return to Member Dashboard
            </Link>
            <Link
              to="/admin/login"
              className="py-2 px-4 border border-sage-300 text-xs font-semibold text-charcoal-700 rounded-xl"
            >
              Switch to Admin Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active title
  let pageTitle = 'System Administration';
  if (location.pathname.includes('/books')) pageTitle = 'Book Management';
  else if (location.pathname.includes('/categories')) pageTitle = 'Category Management';
  else if (location.pathname.includes('/members')) pageTitle = 'Member Management';
  else if (location.pathname.includes('/borrowings')) pageTitle = 'Borrowing Records';
  else if (location.pathname.includes('/settings')) pageTitle = 'System Settings';

  return (
    <div className="min-h-screen bg-ivory-100 dark:bg-charcoal-950 flex flex-col transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-charcoal-900 border-b border-sage-200 dark:border-charcoal-800 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 text-charcoal-600 dark:text-sage-300 hover:bg-sage-100 dark:hover:bg-charcoal-800 rounded-xl"
            aria-label="Open admin sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <Link
              to="/"
              className="text-charcoal-400 hover:text-forest-700 dark:text-sage-400 flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Site</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-charcoal-300" />
            <span className="px-2 py-0.5 text-[10px] bg-forest-100 text-forest-800 dark:bg-forest-900/60 dark:text-forest-200 font-bold rounded uppercase">
              Admin
            </span>
            <ChevronRight className="w-3 h-3 text-charcoal-300" />
            <span className="font-semibold text-charcoal-800 dark:text-ivory-100">
              {pageTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationDropdown />
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-sage-200 dark:border-charcoal-700">
            <span className="text-xs font-semibold text-charcoal-800 dark:text-ivory-100">
              {currentUser?.name}
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 shrink-0">
          <AdminSidebar />
        </div>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-charcoal-900 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-sage-200 dark:border-charcoal-800">
                <span className="font-serif font-bold text-forest-800 dark:text-ivory-100">
                  Admin Control Panel
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-charcoal-400 hover:bg-sage-100 dark:hover:bg-charcoal-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AdminSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
