import React, { useState, useRef, useEffect } from 'react';
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

const getInitials = (name?: string): string => {
  if (!name) return 'IU';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const Navbar: React.FC = () => {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const { settings } = useLibrary();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.avatar]);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userDropdownOpen]);

  // Close menus on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-ivory-100/95 dark:bg-charcoal-950/95 border-b border-sage-200/80 dark:border-charcoal-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 min-w-0 mr-2">
              <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-amber-400 shadow-sm shadow-forest-900/10 group-hover:bg-forest-800 transition-all shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-serif text-base sm:text-lg font-bold text-forest-800 dark:text-ivory-100 tracking-tight block leading-tight truncate">
                  {settings.libraryName || 'IU Central Library'}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-forest-600 dark:text-sage-400 block truncate hidden xs:block">
                  {settings.departmentName || 'Dept. of Computer Science & Engineering'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Visible on large screens) */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 shrink-0">
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
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Quick Search Button */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-sage-300 dark:border-charcoal-700 bg-white/70 dark:bg-charcoal-900/70 text-charcoal-500 dark:text-sage-400 hover:border-forest-600 dark:hover:border-sage-500 text-xs transition-colors shadow-xs"
                title="Search books (Ctrl+K)"
                aria-label="Search catalogue"
              >
                <Search className="w-3.5 h-3.5 text-forest-600 dark:text-amber-400" />
                <span className="hidden md:inline">Quick Search...</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-sage-100 dark:bg-charcoal-800 rounded text-charcoal-500 dark:text-sage-400 border border-sage-200 dark:border-charcoal-700 font-mono">
                  Ctrl K
                </kbd>
              </button>

              {/* Notification Center */}
              <NotificationDropdown />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Profile Section & Dropdown */}
              {isAuthenticated && currentUser ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-sage-100/80 dark:hover:bg-charcoal-800 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-600 dark:focus-visible:ring-amber-400 cursor-pointer"
                    aria-label={`User menu for ${currentUser.name}`}
                    aria-haspopup="true"
                    aria-expanded={userDropdownOpen}
                  >
                    {/* Circular Avatar with Fallback */}
                    {currentUser.avatar && !avatarError ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        onError={() => setAvatarError(true)}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shrink-0 border border-sage-300 dark:border-charcoal-700 shadow-2xs"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-forest-700 dark:bg-forest-800 text-amber-400 font-bold text-xs uppercase flex items-center justify-center shrink-0 border border-sage-300 dark:border-charcoal-700 shadow-2xs">
                        {getInitials(currentUser.name)}
                      </div>
                    )}

                    {/* Name & Roll Block — Single-Line Non-Wrapping with Responsive Max-Width */}
                    <div className="hidden sm:flex flex-col text-left min-w-0 max-w-[110px] md:max-w-[130px] lg:max-w-[150px] xl:max-w-[185px]">
                      <span className="text-xs font-semibold text-charcoal-900 dark:text-ivory-100 block leading-tight truncate whitespace-nowrap">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] text-forest-600 dark:text-sage-400 block uppercase font-medium tracking-wide truncate whitespace-nowrap mt-0.5">
                        {currentUser.role === 'admin'
                          ? 'Administrator'
                          : currentUser.studentId
                          ? `ROLL: ${currentUser.studentId}`
                          : 'IU Member'}
                      </span>
                    </div>

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-charcoal-400 dark:text-sage-400 shrink-0 transition-transform duration-200 hidden sm:block ${
                        userDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-charcoal-900 shadow-xl border border-sage-200 dark:border-charcoal-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      {/* Dropdown User Info Card */}
                      <div className="px-4 py-3 border-b border-sage-100 dark:border-charcoal-800">
                        <div className="flex items-center gap-3 mb-2">
                          {currentUser.avatar && !avatarError ? (
                            <img
                              src={currentUser.avatar}
                              alt={currentUser.name}
                              className="w-10 h-10 rounded-full object-cover shrink-0 border border-sage-300 dark:border-charcoal-700 shadow-2xs"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-forest-700 dark:bg-forest-800 text-amber-400 font-bold text-xs uppercase flex items-center justify-center shrink-0 border border-sage-300 dark:border-charcoal-700 shadow-2xs">
                              {getInitials(currentUser.name)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-charcoal-900 dark:text-ivory-100 truncate">
                              {currentUser.name}
                            </p>
                            <p className="text-[11px] text-charcoal-500 dark:text-sage-400 truncate">
                              {currentUser.email}
                            </p>
                            {currentUser.studentId && (
                              <p className="text-[10px] text-forest-700 dark:text-amber-400 font-semibold truncate mt-0.5">
                                Roll: {currentUser.studentId}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                              isAdmin
                                ? 'bg-forest-700 text-ivory-100 dark:bg-forest-600'
                                : 'bg-sage-200 text-forest-800 dark:bg-forest-900 dark:text-sage-100'
                            }`}
                          >
                            {isAdmin ? 'System Administrator' : 'IU Student Member'}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Action Links */}
                      <div className="py-1">
                        {isAdmin ? (
                          <>
                            <Link
                              to="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800 transition-colors"
                              role="menuitem"
                            >
                              <Shield className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                              <span>Admin Dashboard</span>
                            </Link>
                            <Link
                              to="/admin/books"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800 transition-colors"
                              role="menuitem"
                            >
                              <BookOpen className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                              <span>Manage Books</span>
                            </Link>
                            <Link
                              to="/admin/borrowings"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800 transition-colors"
                              role="menuitem"
                            >
                              <Clock className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                              <span>Manage Borrowings</span>
                            </Link>
                            <Link
                              to="/admin/settings"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800 transition-colors"
                              role="menuitem"
                            >
                              <Settings className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                              <span>System Settings</span>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800 transition-colors"
                              role="menuitem"
                            >
                              <LayoutDashboard className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                              <span>User Dashboard</span>
                            </Link>
                            <Link
                              to="/dashboard/my-books"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800 transition-colors"
                              role="menuitem"
                            >
                              <BookMarked className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                              <span>My Borrowed Books</span>
                            </Link>
                            <Link
                              to="/dashboard/favourites"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800 transition-colors"
                              role="menuitem"
                            >
                              <Bookmark className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                              <span>Saved Books</span>
                            </Link>
                            <Link
                              to="/dashboard/profile"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-charcoal-800 transition-colors"
                              role="menuitem"
                            >
                              <UserIcon className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                              <span>My Profile</span>
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Sign Out CTA */}
                      <div className="pt-1 border-t border-sage-100 dark:border-charcoal-800">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          role="menuitem"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
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
                className="lg:hidden p-2 text-charcoal-600 dark:text-sage-300 hover:bg-sage-100 dark:hover:bg-charcoal-800 rounded-xl transition-colors cursor-pointer"
                aria-label="Toggle mobile menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-sage-200 dark:border-charcoal-800 bg-ivory-50 dark:bg-charcoal-900 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-150 shadow-lg">
            {/* Quick Search Trigger */}
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
              <span className="text-[10px] text-charcoal-400 font-mono">Ctrl K</span>
            </button>

            {/* Main Links */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-charcoal-800 dark:text-ivory-100 rounded-xl hover:bg-sage-100 dark:hover:bg-charcoal-800 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/books"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-charcoal-800 dark:text-ivory-100 rounded-xl hover:bg-sage-100 dark:hover:bg-charcoal-800 transition-colors"
            >
              Book Catalogue
            </Link>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-charcoal-800 dark:text-ivory-100 rounded-xl hover:bg-sage-100 dark:hover:bg-charcoal-800 transition-colors"
            >
              Borrowing Rules
            </a>
            <a
              href="/#project-info"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-charcoal-800 dark:text-ivory-100 rounded-xl hover:bg-sage-100 dark:hover:bg-charcoal-800 transition-colors"
            >
              About & Research
            </a>

            {/* Authenticated User Actions or Guest CTA */}
            <div className="pt-3 border-t border-sage-200 dark:border-charcoal-800">
              {isAuthenticated && currentUser ? (
                <div className="space-y-1">
                  {/* User Card in Mobile Drawer */}
                  <div className="p-3 bg-sage-100/80 dark:bg-charcoal-800 rounded-2xl mb-3 flex items-center gap-3">
                    {currentUser.avatar && !avatarError ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-sage-300 dark:border-charcoal-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-forest-700 dark:bg-forest-800 text-amber-400 font-bold text-xs uppercase flex items-center justify-center shrink-0 border border-sage-300 dark:border-charcoal-700">
                        {getInitials(currentUser.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-forest-900 dark:text-ivory-100 truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-charcoal-500 dark:text-sage-400 truncate">
                        {currentUser.email}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-forest-700 dark:text-amber-400 font-semibold uppercase">
                          {currentUser.role === 'admin'
                            ? 'Administrator'
                            : currentUser.studentId
                            ? `Roll: ${currentUser.studentId}`
                            : 'IU Member'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions in Mobile Drawer */}
                  {isAdmin ? (
                    <>
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-charcoal-700 dark:text-sage-200 hover:bg-sage-100 dark:hover:bg-charcoal-800 rounded-xl transition-colors"
                      >
                        <Shield className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                        <span>Admin Dashboard</span>
                      </Link>
                      <Link
                        to="/admin/books"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-charcoal-700 dark:text-sage-200 hover:bg-sage-100 dark:hover:bg-charcoal-800 rounded-xl transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                        <span>Manage Books</span>
                      </Link>
                      <Link
                        to="/admin/borrowings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-charcoal-700 dark:text-sage-200 hover:bg-sage-100 dark:hover:bg-charcoal-800 rounded-xl transition-colors"
                      >
                        <Clock className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                        <span>Manage Borrowings</span>
                      </Link>
                      <Link
                        to="/admin/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-charcoal-700 dark:text-sage-200 hover:bg-sage-100 dark:hover:bg-charcoal-800 rounded-xl transition-colors"
                      >
                        <Settings className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                        <span>System Settings</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-charcoal-700 dark:text-sage-200 hover:bg-sage-100 dark:hover:bg-charcoal-800 rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                        <span>User Dashboard</span>
                      </Link>
                      <Link
                        to="/dashboard/my-books"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-charcoal-700 dark:text-sage-200 hover:bg-sage-100 dark:hover:bg-charcoal-800 rounded-xl transition-colors"
                      >
                        <BookMarked className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                        <span>My Borrowed Books</span>
                      </Link>
                      <Link
                        to="/dashboard/favourites"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-charcoal-700 dark:text-sage-200 hover:bg-sage-100 dark:hover:bg-charcoal-800 rounded-xl transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                        <span>Saved Books</span>
                      </Link>
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-charcoal-700 dark:text-sage-200 hover:bg-sage-100 dark:hover:bg-charcoal-800 rounded-xl transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                        <span>My Profile</span>
                      </Link>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors mt-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl border border-sage-300 dark:border-charcoal-700 text-xs font-semibold text-charcoal-800 dark:text-ivory-100 hover:bg-sage-100 dark:hover:bg-charcoal-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold transition-colors"
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
