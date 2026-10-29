import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { BookCard } from '../../components/books/BookCard';
import { BookDetailModal } from '../../components/books/BookDetailModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { EmptyState } from '../../components/common/EmptyState';
import { Book } from '../../types';
import { Heart, Search } from 'lucide-react';

export const FavouritesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { books, favourites, borrowBook, settings } = useLibrary();

  const [activeBookForModal, setActiveBookForModal] = useState<Book | null>(null);
  const [bookToBorrow, setBookToBorrow] = useState<Book | null>(null);

  if (!currentUser) return null;

  const favBooks = books.filter((b) =>
    favourites.some((fid) => fid === b.id || String(fid) === String(b.id) || fid === `b-${b.id}` || `b-${fid}` === b.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sage-200 dark:border-charcoal-800">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100">
            Saved & Favourite Books
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-sage-400 mt-0.5">
            Your personal digital reading list. Borrow when copies become available.
          </p>
        </div>

        <div className="text-xs text-charcoal-600 dark:text-sage-300 bg-sage-100 dark:bg-charcoal-800 px-3.5 py-2 rounded-xl border border-sage-200 dark:border-charcoal-700 font-medium">
          Saved Items: <strong className="text-forest-700 dark:text-amber-400">{favBooks.length}</strong>
        </div>
      </div>

      {favBooks.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8" />}
          title="No Saved Books Yet"
          description="Click the heart icon on any book in the catalogue to save it to your reading list for quick reference."
          actionText="Explore Catalogue"
          onAction={() => (window.location.href = '/books')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favBooks.map((book) => (
            <BookCard
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
            await borrowBook(bookToBorrow);
          }
        }}
        title="Confirm Book Borrowing"
        message={`Borrow "${bookToBorrow?.title}" for ${settings.defaultLoanDurationDays} days?`}
        confirmText="Confirm Borrow"
        type="primary"
      />
    </div>
  );
};
