import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { BookCard } from '../../components/books/BookCard';
import { BookCover } from '../../components/books/BookCover';
import { BookDetailModal } from '../../components/books/BookDetailModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Book } from '../../types';
import {
  Search,
  BookOpen,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Layers,
  Cpu,
  Brain,
  Binary,
  Feather,
  TrendingUp,
  Eye,
  EyeOff,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { books, categories, borrowRecords, borrowBook, settings, addToast } = useLibrary();
  const { isAuthenticated, currentUser, quickLogin } = useAuth();
  const navigate = useNavigate();

  const [heroSearch, setHeroSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeBookForModal, setActiveBookForModal] = useState<Book | null>(null);
  const [bookToBorrow, setBookToBorrow] = useState<Book | null>(null);
  const [showDemoPasswords, setShowDemoPasswords] = useState(false);

  const featuredBooks = books.filter((b) => b.featured).slice(0, 4);
  const recentBooks = [...books].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()).slice(0, 4);

  const [liveStats, setLiveStats] = useState<{
    totalTitles: number;
    totalCopies: number;
    activeLoans: number;
    totalMembers: number;
  } | null>(null);

  useEffect(() => {
    api.dashboard.getPublicStats().then((data) => {
      if (data) setLiveStats(data);
    }).catch(() => {});
  }, [books, borrowRecords]);

  const totalTitlesDisplay = liveStats?.totalTitles ?? books.length;
  const totalCopiesDisplay = liveStats?.totalCopies ?? books.reduce((acc, b) => acc + b.totalCopies, 0);
  const activeLoansDisplay = liveStats?.activeLoans ?? borrowRecords.filter((r) => r.status === 'active').length;
  const totalMembersDisplay = liveStats ? `${liveStats.totalMembers}` : '5+';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroSearch.trim()) params.append('q', heroSearch.trim());
    if (selectedCategory !== 'all') params.append('category', selectedCategory);
    navigate(`/books?${params.toString()}`);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'Brain':
        return <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case 'Binary':
        return <Binary className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case 'Feather':
        return <Feather className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />;
      default:
        return <BookOpen className="w-6 h-6 text-forest-600 dark:text-forest-400" />;
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 md:py-20 bg-linear-to-b from-sage-100/60 via-ivory-100 to-ivory-100 dark:from-charcoal-900 dark:via-charcoal-950 dark:to-charcoal-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100 dark:bg-forest-900/60 border border-forest-200 dark:border-forest-800 text-forest-800 dark:text-sage-200 text-xs font-semibold">
                <GraduationCap className="w-4 h-4 text-forest-700 dark:text-amber-400" />
                <span>Islamic University · CSE 3210 Software Project</span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-forest-900 dark:text-ivory-100 tracking-tight leading-[1.15]">
                Knowledge for Future <span className="text-forest-600 dark:text-amber-400 italic">Engineers & Scholars</span>
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-charcoal-600 dark:text-sage-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Welcome to the official <strong>IU Central Library Management System</strong> for the Department of Computer Science & Engineering. Search textbooks, track copies, borrow resources with instant validation, and manage your academic readings.
              </p>

              {/* Prominent Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="p-2 sm:p-2.5 bg-white dark:bg-charcoal-900 rounded-2xl shadow-xl border border-sage-300/80 dark:border-charcoal-700 max-w-xl mx-auto lg:mx-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
              >
                <div className="flex items-center gap-2 px-3 flex-1">
                  <Search className="w-5 h-5 text-forest-600 dark:text-amber-400 shrink-0" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search by title, author, or ISBN..."
                    className="w-full bg-transparent text-sm text-charcoal-800 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-hidden py-1.5"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-xs bg-sage-50 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl px-2.5 py-2.5 text-charcoal-700 dark:text-sage-300 focus:outline-hidden"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Quick links & tags */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs text-charcoal-500 dark:text-sage-400 pt-1">
                <span className="font-semibold text-charcoal-700 dark:text-sage-200">Popular:</span>
                {['Clean Code', 'Algorithms', 'AI & Machine Learning', 'Databases'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/books?q=${encodeURIComponent(tag)}`)}
                    className="px-2.5 py-1 bg-white/70 dark:bg-charcoal-800/70 border border-sage-200 dark:border-charcoal-700 rounded-lg hover:border-forest-600 text-[11px] text-charcoal-600 dark:text-sage-300 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Visual Book Stack Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md">
                {/* Decorative blob */}
                <div className="absolute -inset-4 bg-linear-to-tr from-amber-400/20 to-forest-500/20 rounded-3xl blur-2xl -z-10" />

                <div className="relative bg-white dark:bg-charcoal-900 rounded-3xl border border-sage-200 dark:border-charcoal-700 p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-sage-100 dark:border-charcoal-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-forest-800 dark:text-ivory-100 uppercase tracking-wider">
                        Featured Book of the Month
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                      Available
                    </span>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="w-24 h-34 shrink-0 rounded-xl overflow-hidden shadow-md border border-sage-200 dark:border-charcoal-700">
                      <BookCover
                        src={books[0]?.coverImage}
                        title={books[0]?.title || 'Clean Code'}
                        author={books[0]?.author || 'Robert C. Martin'}
                        category={books[0]?.category}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-semibold text-forest-700 dark:text-amber-400">
                        {books[0]?.category}
                      </span>
                      <h4 className="font-serif text-base font-bold text-charcoal-900 dark:text-ivory-100 leading-snug line-clamp-2">
                        {books[0]?.title}
                      </h4>
                      <p className="text-xs text-charcoal-500 dark:text-sage-400 mt-0.5">
                        by {books[0]?.author}
                      </p>
                      <div className="mt-2 text-xs font-medium text-charcoal-600 dark:text-sage-300">
                        Copies: <strong className="text-forest-700 dark:text-amber-400">{books[0]?.availableCopies}</strong> / {books[0]?.totalCopies}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      to={`/books/${books[0]?.id}`}
                      className="flex-1 py-2.5 text-center bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-xl shadow-xs transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => setBookToBorrow(books[0])}
                      className="flex-1 py-2.5 text-center bg-sage-100 hover:bg-sage-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-forest-900 dark:text-ivory-100 text-xs font-semibold rounded-xl transition-colors"
                    >
                      Borrow Book
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE LIBRARY STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-forest-50 dark:bg-forest-900/40 text-forest-700 dark:text-forest-300 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-ivory-100">
                {totalTitlesDisplay}
              </div>
              <div className="text-xs text-charcoal-500 dark:text-sage-400 font-medium">
                Unique Titles ({totalCopiesDisplay} Copies)
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-ivory-100">
                {totalMembersDisplay}
              </div>
              <div className="text-xs text-charcoal-500 dark:text-sage-400 font-medium">
                Registered CSE Members
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-ivory-100">
                {activeLoansDisplay}
              </div>
              <div className="text-xs text-charcoal-500 dark:text-sage-400 font-medium">
                Active Books on Loan
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 dark:text-ivory-100">
                {categories.length}
              </div>
              <div className="text-xs text-charcoal-500 dark:text-sage-400 font-medium">
                Academic Disciplines
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED BOOKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 dark:text-amber-400 uppercase tracking-wider font-mono mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Recommended Curriculum</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100">
              Featured Course Textbooks
            </h2>
          </div>
          <Link
            to="/books"
            className="text-xs font-semibold text-forest-700 dark:text-amber-400 hover:underline flex items-center gap-1.5"
          >
            <span>View All Books ({books.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onQuickView={(b) => setActiveBookForModal(b)}
              onBorrowRequest={(b) => setBookToBorrow(b)}
            />
          ))}
        </div>
      </section>

      {/* 4. BROWSE BY CATEGORY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-bold text-forest-700 dark:text-amber-400 uppercase tracking-wider font-mono mb-1">
            Subject Navigation
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100 mb-2">
            Explore Books by Category
          </h2>
          <p className="text-xs text-charcoal-500 dark:text-sage-400 leading-relaxed">
            Browse specialized collections aligned with academic degree requirements and research fields at Islamic University.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => navigate(`/books?category=${encodeURIComponent(category.name)}`)}
              className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 hover:border-forest-600 dark:hover:border-forest-500/80 hover:shadow-md cursor-pointer transition-all duration-200 group"
            >
              <div className="p-3 w-fit rounded-xl bg-sage-100 dark:bg-charcoal-800 mb-3 group-hover:scale-110 transition-transform">
                {getCategoryIcon(category.iconName)}
              </div>
              <h3 className="font-serif text-base font-bold text-charcoal-900 dark:text-ivory-100 group-hover:text-forest-700 dark:group-hover:text-amber-400 mb-1">
                {category.name}
              </h3>
              <p className="text-xs text-charcoal-500 dark:text-sage-400 line-clamp-2 leading-relaxed mb-3">
                {category.description}
              </p>
              <div className="flex items-center justify-between text-xs font-semibold text-forest-700 dark:text-amber-400 pt-2 border-t border-sage-100 dark:border-charcoal-800">
                <span>{category.bookCount || 0} Books Available</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. RECENTLY ADDED BOOKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-forest-700 dark:text-amber-400 uppercase tracking-wider font-mono mb-1">
              New Arrivals
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100">
              Recently Catalogued Resources
            </h2>
          </div>
          <Link
            to="/books?sort=newest"
            className="text-xs font-semibold text-forest-700 dark:text-amber-400 hover:underline flex items-center gap-1.5"
          >
            <span>Explore New Additions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onQuickView={(b) => setActiveBookForModal(b)}
              onBorrowRequest={(b) => setBookToBorrow(b)}
            />
          ))}
        </div>
      </section>

      {/* 6. HOW BORROWING WORKS (3-STEP GUIDE) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-900 text-ivory-100 rounded-3xl p-8 sm:p-12 border border-forest-800 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono block mb-1">
              Seamless Student Workflow
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
              How Book Borrowing Works
            </h2>
            <p className="text-xs text-sage-200/90 leading-relaxed">
              Borrowing course references and academic literature has been fully digitized for Islamic University faculty and students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-forest-800/60 border border-forest-700">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-forest-950 font-bold flex items-center justify-center text-lg mb-4 shadow-sm">
                1
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                Discover & Check Stock
              </h3>
              <p className="text-xs text-sage-200/80 leading-relaxed">
                Search by book title, author, or ISBN. Check real-time inventory counts and shelf coordinates in the Department stacks.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-forest-800/60 border border-forest-700">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-forest-950 font-bold flex items-center justify-center text-lg mb-4 shadow-sm">
                2
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                One-Click Issue
              </h3>
              <p className="text-xs text-sage-200/80 leading-relaxed">
                Eligible students can borrow up to {settings.maxBorrowLimit} books simultaneously for {settings.defaultLoanDurationDays} days with automatic due-date scheduling.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-forest-800/60 border border-forest-700">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-forest-950 font-bold flex items-center justify-center text-lg mb-4 shadow-sm">
                3
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                Track, Renew & Return
              </h3>
              <p className="text-xs text-sage-200/80 leading-relaxed">
                Monitor countdown reminders, extend loan periods online before due dates, and return items directly via your member dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ACADEMIC PROJECT SPOTLIGHT & DECLARATION */}
      <section id="project-info" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl border border-sage-200 dark:border-charcoal-800 p-8 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-sage-100 dark:bg-charcoal-800 rounded-full text-xs font-semibold text-forest-800 dark:text-sage-200">
                <ShieldCheck className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                <span>Academic Project Declaration (Course No: CSE 3210)</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-ivory-100">
                Islamic University Computer Science & Engineering
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 dark:text-sage-300 leading-relaxed">
                This Library Management System was engineered to provide an intuitive digital platform eliminating manual ledger record-keeping and facilitating frictionless book search, issue, and tracking.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-sage-50 dark:bg-charcoal-800/60 rounded-xl border border-sage-200/60 dark:border-charcoal-700">
                  <p className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wide">
                    Submitted By:
                  </p>
                  <p className="text-sm font-bold text-forest-900 dark:text-ivory-100 mt-0.5">
                    Tanvir Ahmed
                  </p>
                  <p className="text-xs text-charcoal-500 dark:text-sage-400">
                    Roll: 2114028 · Reg: 1093 · Session: 2021-22
                  </p>
                </div>

                <div className="p-4 bg-sage-50 dark:bg-charcoal-800/60 rounded-xl border border-sage-200/60 dark:border-charcoal-700">
                  <p className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wide">
                    Project Supervisor:
                  </p>
                  <p className="text-sm font-bold text-forest-900 dark:text-ivory-100 mt-0.5">
                    Md. Mojahidul Islam
                  </p>
                  <p className="text-xs text-charcoal-500 dark:text-sage-400">
                    Associate Professor, Dept. of CSE, Islamic University
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-sage-50 dark:bg-charcoal-800/90 border border-sage-200 dark:border-charcoal-700 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-charcoal-900 dark:text-ivory-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-600 dark:text-amber-400" />
                    <span>Quick Evaluation Demo Access</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDemoPasswords(!showDemoPasswords)}
                    className="text-[11px] text-forest-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium transition-colors"
                    title={showDemoPasswords ? 'Conceal passwords' : 'Show passwords'}
                  >
                    {showDemoPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showDemoPasswords ? 'Hide' : 'Reveal'}</span>
                  </button>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-charcoal-900 dark:text-ivory-100">
                        Member Account: <span className="font-mono font-normal text-forest-700 dark:text-amber-400">tanvir</span>
                      </div>
                      <div className="text-[10px] text-charcoal-500 dark:text-sage-400 font-mono mt-0.5">
                        Password: {showDemoPasswords ? 'User@123' : '••••••••'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        quickLogin('member');
                        addToast('success', 'Logged In as Student', 'Welcome, Tanvir Ahmed!');
                        navigate('/dashboard');
                      }}
                      className="px-2.5 py-1 bg-forest-700 hover:bg-forest-800 text-white rounded-lg text-[10px] font-semibold transition-colors shrink-0 cursor-pointer"
                    >
                      1-Click
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-charcoal-900 dark:text-ivory-100">
                        Admin Account: <span className="font-mono font-normal text-forest-700 dark:text-amber-400">admin</span>
                      </div>
                      <div className="text-[10px] text-charcoal-500 dark:text-sage-400 font-mono mt-0.5">
                        Password: {showDemoPasswords ? 'Admin@123' : '••••••••'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        quickLogin('admin');
                        addToast('success', 'Admin Session Verified', 'Welcome, Administrator!');
                        navigate('/admin');
                      }}
                      className="px-2.5 py-1 bg-charcoal-800 hover:bg-charcoal-950 text-white rounded-lg text-[10px] font-semibold transition-colors shrink-0 cursor-pointer"
                    >
                      1-Click
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="flex-1 py-2.5 text-center bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-xl"
                >
                  Student Sign In
                </Link>
                <Link
                  to="/admin/login"
                  className="flex-1 py-2.5 text-center bg-charcoal-800 hover:bg-charcoal-900 text-white text-xs font-semibold rounded-xl"
                >
                  Admin Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Book Details Modal */}
      <BookDetailModal
        book={activeBookForModal}
        isOpen={Boolean(activeBookForModal)}
        onClose={() => setActiveBookForModal(null)}
        onBorrowRequest={(book) => {
          setActiveBookForModal(null);
          setBookToBorrow(book);
        }}
      />

      {/* Borrow Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(bookToBorrow)}
        onClose={() => setBookToBorrow(null)}
        onConfirm={async () => {
          if (bookToBorrow) {
            if (!isAuthenticated) {
              navigate('/login');
              return;
            }
            await borrowBook(bookToBorrow);
          }
        }}
        title="Confirm Book Borrowing"
        message={`Are you sure you want to borrow "${bookToBorrow?.title}" for ${settings.defaultLoanDurationDays} days? You can return it anytime from your dashboard.`}
        confirmText="Confirm Borrow"
        type="primary"
      />
    </div>
  );
};
