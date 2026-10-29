import React, { useState } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserSidebar } from './UserSidebar';
import { Menu, X, ChevronRight, Home } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationDropdown } from '../common/NotificationDropdown';

export const UserDashboardLayout: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Get active breadcrumb title
  let pageTitle = 'Member Dashboard';
  if (location.pathname.includes('/my-books')) pageTitle = 'My Borrowed Books';
  else if (location.pathname.includes('/history')) pageTitle = 'Borrowing History';
  else if (location.pathname.includes('/favourites')) pageTitle = 'Saved Books';
  else if (location.pathname.includes('/profile')) pageTitle = 'Member Profile';

  return (
    <div className="min-h-screen bg-ivory-100 dark:bg-charcoal-950 flex flex-col transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-charcoal-900 border-b border-sage-200 dark:border-charcoal-800 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 text-charcoal-600 dark:text-sage-300 hover:bg-sage-100 dark:hover:bg-charcoal-800 rounded-xl"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <Link
              to="/"
              className="text-charcoal-400 hover:text-forest-700 dark:text-sage-400 dark:hover:text-amber-400 flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
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
          <UserSidebar />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-charcoal-900 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-sage-200 dark:border-charcoal-800">
                <span className="font-serif font-bold text-forest-800 dark:text-ivory-100">
                  Student Portal
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-charcoal-400 hover:bg-sage-100 dark:hover:bg-charcoal-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <UserSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
