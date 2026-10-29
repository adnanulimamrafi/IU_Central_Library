import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { BookCard } from '../../components/books/BookCard';
import { BookListItem } from '../../components/books/BookListItem';
import { BookDetailModal } from '../../components/books/BookDetailModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { EmptyState } from '../../components/common/EmptyState';
import { Book } from '../../types';
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  X,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

export const CataloguePage: React.FC = () => {
  const { books, categories, borrowBook, settings } = useLibrary();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search & Filter State from URL
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const availabilityFilter = searchParams.get('availability') || 'all';
  const sortBy = searchParams.get('sort') || 'rating';
  const viewMode = (searchParams.get('view') as 'grid' | 'list') || 'grid';

  const [activeBookForModal, setActiveBookForModal] = useState<Book | null>(null);
  const [bookToBorrow, setBookToBorrow] = useState<Book | null>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Update query params helper
  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Filter & Sort logic
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (book.title || '').toLowerCase().includes(q);
          const matchAuthor = (book.author || '').toLowerCase().includes(q);
          const matchIsbn = (book.isbn || '').toLowerCase().includes(q);
          const matchCategory = (book.category || '').toLowerCase().includes(q);
          if (!matchTitle && !matchAuthor && !matchIsbn && !matchCategory) {
            return false;
          }
        }

        // Category
        if (
          selectedCategory !== 'all' &&
          book.category !== selectedCategory &&
          (book as any).categoryId !== selectedCategory &&
          (book as any).categorySlug !== selectedCategory
        ) {
          return false;
        }

        // Availability
        if (availabilityFilter === 'available' && book.availableCopies <= 0) {
          return false;
        }
        if (availabilityFilter === 'borrowed' && book.availableCopies > 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'author':
            return a.author.localeCompare(b.author);
          case 'newest':
            return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
          case 'year':
            return b.publicationYear - a.publicationYear;
          case 'rating':
          default:
            return (b.rating || 0) - (a.rating || 0);
        }
      });
  }, [books, searchQuery, selectedCategory, availabilityFilter, sortBy]);

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || availabilityFilter !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sage-200 dark:border-charcoal-800">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900 dark:text-ivory-100 tracking-tight">
            Library Book Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 dark:text-sage-400 mt-1">
            Browse our curated collection of textbooks, research monographs, and academic papers.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center p-1 bg-sage-100 dark:bg-charcoal-800 rounded-xl border border-sage-200 dark:border-charcoal-700">
            <button
              onClick={() => updateParam('view', 'grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-charcoal-900 text-forest-700 dark:text-amber-400 shadow-xs'
                  : 'text-charcoal-500 hover:text-charcoal-900 dark:text-sage-400'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => updateParam('view', 'list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-charcoal-900 text-forest-700 dark:text-amber-400 shadow-xs'
                  : 'text-charcoal-500 hover:text-charcoal-900 dark:text-sage-400'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 bg-sage-100 dark:bg-charcoal-800 rounded-xl border border-sage-200 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-sage-200"
          >
            <Filter className="w-4 h-4 text-forest-600" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Control Toolbar: Search Bar, Category Filter, Availability, Sort */}
      <div className="bg-white dark:bg-charcoal-900 p-4 sm:p-5 rounded-2xl border border-sage-200 dark:border-charcoal-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-forest-600 dark:text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="w-full pl-9 pr-8 py-2.5 bg-sage-50/70 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-900 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-hidden focus:border-forest-600"
            />
            {searchQuery && (
              <button
                onClick={() => updateParam('q', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => updateParam('category', e.target.value)}
              className="w-full py-2.5 px-3 bg-sage-50/70 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
            >
              <option value="all">All Categories ({books.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.bookCount || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="md:col-span-2">
            <select
              value={availabilityFilter}
              onChange={(e) => updateParam('availability', e.target.value)}
              className="w-full py-2.5 px-3 bg-sage-50/70 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
            >
              <option value="all">Availability: All</option>
              <option value="available">Available Now</option>
              <option value="borrowed">Checked Out</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-full py-2.5 px-3 bg-sage-50/70 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden focus:border-forest-600"
            >
              <option value="rating">Top Rated</option>
              <option value="newest">Recently Added</option>
              <option value="title">Title (A-Z)</option>
              <option value="author">Author (A-Z)</option>
              <option value="year">Publication Year</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips & Clear Action */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-sage-100 dark:border-charcoal-800 text-xs">
            <span className="text-charcoal-500 dark:text-sage-400 font-medium">
              Active Filters:
            </span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sage-100 dark:bg-charcoal-800 rounded-lg text-forest-800 dark:text-sage-200 text-xs">
                Search: "{searchQuery}"
                <button onClick={() => updateParam('q', '')}>
                  <X className="w-3 h-3 text-charcoal-400 hover:text-charcoal-700" />
                </button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sage-100 dark:bg-charcoal-800 rounded-lg text-forest-800 dark:text-sage-200 text-xs">
                Category: {selectedCategory}
                <button onClick={() => updateParam('category', 'all')}>
                  <X className="w-3 h-3 text-charcoal-400 hover:text-charcoal-700" />
                </button>
              </span>
            )}
            {availabilityFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sage-100 dark:bg-charcoal-800 rounded-lg text-forest-800 dark:text-sage-200 text-xs">
                Status: {availabilityFilter === 'available' ? 'Available' : 'Checked Out'}
                <button onClick={() => updateParam('availability', 'all')}>
                  <X className="w-3 h-3 text-charcoal-400 hover:text-charcoal-700" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-sage-400 font-medium">
        <span>
          Showing <strong className="text-charcoal-800 dark:text-ivory-100">{filteredBooks.length}</strong> of {books.length} catalogued items
        </span>
      </div>

      {/* Book Grid or List View */}
      {filteredBooks.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="No Books Found"
          description="We couldn't find any books matching your selected filters or search terms. Try clearing some criteria."
          actionText="Clear All Filters"
          onAction={clearAllFilters}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onQuickView={(b) => setActiveBookForModal(b)}
              onBorrowRequest={(b) => setBookToBorrow(b)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBooks.map((book) => (
            <BookListItem
              key={book.id}
              book={book}
              onQuickView={(b) => setActiveBookForModal(b)}
              onBorrowRequest={(b) => setBookToBorrow(b)}
            />
          ))}
        </div>
      )}

      {/* Book Detail Modal */}
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
        message={`Borrow "${bookToBorrow?.title}" for ${settings.defaultLoanDurationDays} days? A record will be logged in your account.`}
        confirmText="Confirm Borrow"
        type="primary"
      />
    </div>
  );
};
