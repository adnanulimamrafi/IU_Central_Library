import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import { QuickSearchModal } from './QuickSearchModal';
import {
  BookOpen,
  Search,
  Menu,
  X,
  User as UserIcon,
  Shield,
  Bookmark,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Clock,
  BookMarked,
  Settings,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const { settings } = useLibrary();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-ivory-100/90 dark:bg-charcoal-950/90 border-b border-sage-200/80 dark:border-charcoal-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-amber-400 shadow-sm shadow-forest-900/10 group-hover:bg-forest-800 transition-all">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-forest-800 dark:text-ivory-100 tracking-tight block leading-tight">
                  {settings.libraryName || 'IU Central Library'}
                </span>
                <span className="text-[11px] font-medium text-forest-600 dark:text-sage-300 block">
                  {settings.departmentName || 'Dept. of Computer Science & Engineering'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link
                to="/"
                className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
                  isActive('/')
                    ? 'text-forest-700 dark:text-amber-400 bg-sage-200/60 dark:bg-charcoal-800'
                    : 'text-charcoal-700 dark:text-sage-200 hover:text-forest-700 hover:bg-sage-100 dark:hover:bg-charcoal-800/60'
                }`}
              >
                Home
              </Link>
              <Link
                to="/books"
                className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
                  isActive('/books')
                    ? 'text-forest-700 dark:text-amber-400 bg-sage-200/60 dark:bg-charcoal-800'
                    : 'text-charcoal-700 dark:text-sage-200 hover:text-forest-700 hover:bg-sage-100 dark:hover:bg-charcoal-800/60'
                }`}
              >
                Book Catalogue
              </Link>
              <a
                href="/#how-it-works"
                className="px-3 py-2 rounded-xl text-xs font-semibold tracking-wide text-charcoal-700 dark:text-sage-200 hover:text-forest-700 hover:bg-sage-100 dark:hover:bg-charcoal-800/60 transition-colors"
              >
                Borrowing Rules
              </a>
              <a
                href="/#project-info"
                className="px-3 py-2 rounded-xl text-xs font-semibold tracking-wide text-charcoal-700 dark:text-sage-200 hover:text-forest-700 hover:bg-sage-100 dark:hover:bg-charcoal-800/60 transition-colors"
              >
                About & Research
              </a>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Search Button */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-sage-300 dark:border-charcoal-700 bg-white/70 dark:bg-charcoal-900/70 text-charcoal-500 dark:text-sage-400 hover:border-forest-600 dark:hover:border-sage-500 text-xs transition-colors shadow-xs"
                title="Search books (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-forest-600 dark:text-amber-400" />
                <span className="hidden md:inline">Quick Search...</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-sage-100 dark:bg-charcoal-800 rounded text-charcoal-500 dark:text-sage-400 border border-sage-200 dark:border-charcoal-700">
                  Ctrl K
                </kbd>
              </button>

              {/* Notification Center */}
              <NotificationDropdown />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Dropdown / Auth CTA */}
              {isAuthenticated && currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-sage-100 dark:hover:bg-charcoal-800 transition-colors"
                    aria-label="User menu"
                  >
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80'}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover border border-sage-300 dark:border-charcoal-700 shadow-2xs"
                    />
                    <div className="hidden lg:block text-left">
                      <span className="text-xs font-semibold text-charcoal-900 dark:text-ivory-100 block leading-tight">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] text-forest-600 dark:text-sage-400 block uppercase font-medium tracking-wide">
                        {currentUser.role === 'admin' ? 'Administrator' : `Roll: ${currentUser.studentId || 'Member'}`}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-charcoal-400 hidden lg:block" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-charcoal-900 shadow-xl border border-sage-200 dark:border-charcoal-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-sage-100 dark:border-charcoal-800">
                        <p className="text-xs font-semibold text-charcoal-900 dark:text-ivory-100">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] text-charcoal-500 dark:text-sage-400 truncate">
                          {currentUser.email}
                        </p>
                        <div className="mt-1">
                          <span
                            className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                              isAdmin
                                ? 'bg-forest-700 text-ivory-100'
                                : 'bg-sage-200 text-forest-800 dark:bg-forest-900 dark:text-sage-100'
                            }`}
                          >
                            {isAdmin ? 'System Admin' : 'IU Student Member'}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        {isAdmin ? (
                          <>
                            <Link
                              to="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800"
                            >
                              <Shield className="w-4 h-4 text-forest-600" />
                              Admin Dashboard
                            </Link>
                            <Link
                              to="/admin/books"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800"
                            >
                              <BookOpen className="w-4 h-4 text-forest-600" />
                              Manage Books
                            </Link>
                            <Link
                              to="/admin/borrowings"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800"
                            >
                              <Clock className="w-4 h-4 text-forest-600" />
                              Manage Borrowings
                            </Link>
                            <Link
                              to="/admin/settings"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800"
                            >
                              <Settings className="w-4 h-4 text-forest-600" />
                              System Settings
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800"
                            >
                              <LayoutDashboard className="w-4 h-4 text-forest-600" />
                              User Dashboard
                            </Link>
                            <Link
                              to="/dashboard/my-books"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800"
                            >
                              <BookMarked className="w-4 h-4 text-forest-600" />
                              My Borrowed Books
                            </Link>
                            <Link
                              to="/dashboard/favourites"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800"
                            >
                              <Bookmark className="w-4 h-4 text-forest-600" />
                              Saved Books
                            </Link>
                            <Link
                              to="/dashboard/profile"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800"
                            >
                              <UserIcon className="w-4 h-4 text-forest-600" />
                              My Profile
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="pt-1 border-t border-sage-100 dark:border-charcoal-800">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-xs font-semibold text-forest-700 dark:text-ivory-100 hover:text-forest-900 dark:hover:text-amber-400 hover:bg-sage-100 dark:hover:bg-charcoal-800 rounded-xl transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-xs font-semibold bg-forest-700 hover:bg-forest-800 text-ivory-100 rounded-xl shadow-xs transition-all hover:shadow-sm"
                  >
                    Register Member
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-charcoal-600 dark:text-sage-300 hover:bg-sage-100 dark:hover:bg-charcoal-800 rounded-xl transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-sage-200 dark:border-charcoal-800 bg-ivory-50 dark:bg-charcoal-900 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-150">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 text-xs text-charcoal-600 dark:text-sage-300 mb-3"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-forest-700 dark:text-amber-400" />
                <span>Search catalogue...</span>
              </div>
              <span className="text-[10px] text-charcoal-400">Ctrl K</span>
            </button>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-charcoal-800 dark:text-ivory-100 rounded-xl hover:bg-sage-100 dark:hover:bg-charcoal-800"
            >
              Home
            </Link>
            <Link
              to="/books"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-charcoal-800 dark:text-ivory-100 rounded-xl hover:bg-sage-100 dark:hover:bg-charcoal-800"
            >
              Book Catalogue
            </Link>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-charcoal-800 dark:text-ivory-100 rounded-xl hover:bg-sage-100 dark:hover:bg-charcoal-800"
            >
              Borrowing Rules
            </a>
            <a
              href="/#project-info"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-charcoal-800 dark:text-ivory-100 rounded-xl hover:bg-sage-100 dark:hover:bg-charcoal-800"
            >
              About Project & CSE Dept
            </a>

            <div className="pt-3 border-t border-sage-200 dark:border-charcoal-800">
              {isAuthenticated && currentUser ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 bg-sage-100 dark:bg-charcoal-800 rounded-xl mb-2">
                    <p className="text-xs font-bold text-forest-900 dark:text-ivory-100">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-charcoal-500 dark:text-sage-400">
                      {currentUser.email} ({currentUser.role})
                    </p>
                  </div>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-semibold text-forest-700 dark:text-amber-400"
                    >
                      Admin Dashboard &rarr;
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-semibold text-forest-700 dark:text-amber-400"
                    >
                      Member Dashboard &rarr;
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl border border-sage-300 dark:border-charcoal-700 text-xs font-semibold text-charcoal-800 dark:text-ivory-100"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl bg-forest-700 text-ivory-100 text-xs font-semibold"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Quick Search Modal */}
      <QuickSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
};
