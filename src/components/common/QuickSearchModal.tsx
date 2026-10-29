import React, { useState, useEffect } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ArrowRight, X } from 'lucide-react';
import { Badge } from './Badge';
import { BookCover } from '../books/BookCover';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const { books } = useLibrary();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // open if triggered globally
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? books
        .filter(
          (b) => {
            const q = query.toLowerCase();
            return (
              (b.title || '').toLowerCase().includes(q) ||
              (b.author || '').toLowerCase().includes(q) ||
              (b.category || '').toLowerCase().includes(q) ||
              (b.isbn || '').includes(query)
            );
          }
        )
        .slice(0, 6)
    : books.slice(0, 4);

  const handleSelectBook = (id: string) => {
    onClose();
    navigate(`/books/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div
        className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative mx-auto max-w-2xl transform divide-y divide-sage-100 dark:divide-charcoal-800 rounded-2xl bg-white dark:bg-charcoal-900 shadow-2xl ring-1 ring-black/5 transition-all">
        {/* Search Input */}
        <div className="relative flex items-center px-4 py-3">
          <Search className="w-5 h-5 text-forest-600 dark:text-sage-400 mr-3" />
          <input
            type="text"
            className="h-10 w-full bg-transparent text-sm text-charcoal-900 dark:text-ivory-100 placeholder-charcoal-400 dark:placeholder-sage-500 focus:outline-hidden"
            placeholder="Search by book title, author, category, or ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-charcoal-400 hover:text-charcoal-600 dark:text-sage-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold text-charcoal-500 bg-sage-100 dark:bg-charcoal-800 rounded border border-sage-200 dark:border-charcoal-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-charcoal-400 dark:text-sage-400">
            {query.trim() ? `Search Results (${results.length})` : 'Popular Recommendations'}
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-charcoal-500 dark:text-sage-400">
              No matching books found for "{query}". Try checking the catalogue with fewer filters.
            </div>
          ) : (
            results.map((book) => {
              const isAvailable = book.availableCopies > 0;
              return (
                <div
                  key={book.id}
                  onClick={() => handleSelectBook(book.id)}
                  className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-sage-50 dark:hover:bg-charcoal-800/80 cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-14 shrink-0 rounded overflow-hidden shadow-xs border border-sage-200 dark:border-charcoal-700">
                    <BookCover
                      src={book.coverImage}
                      title={book.title}
                      author={book.author}
                      category={book.category}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-charcoal-900 dark:text-ivory-100 group-hover:text-forest-700 dark:group-hover:text-amber-400 truncate">
                        {book.title}
                      </p>
                      <Badge variant={isAvailable ? 'available' : 'borrowed'} size="sm">
                        {isAvailable ? `${book.availableCopies} available` : 'Borrowed'}
                      </Badge>
                    </div>
                    <p className="text-xs text-charcoal-500 dark:text-sage-400 truncate mt-0.5">
                      {book.author} · {book.publicationYear} · {book.category}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-forest-700 dark:group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-sage-50/50 dark:bg-charcoal-800/40 text-xs text-charcoal-500 dark:text-sage-400 rounded-b-2xl">
          <span>
            Press <strong className="font-medium text-forest-700 dark:text-sage-200">ESC</strong> to close
          </span>
          <button
            onClick={() => {
              onClose();
              navigate(`/books?q=${encodeURIComponent(query)}`);
            }}
            className="text-forest-700 dark:text-amber-400 hover:underline font-medium flex items-center gap-1"
          >
            Browse Full Catalogue &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
