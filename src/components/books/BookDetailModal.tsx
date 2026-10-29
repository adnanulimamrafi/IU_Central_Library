import React from 'react';
import { Book } from '../../types';
import { isUserRecord, isRecordForBook } from '../../utils/userRecords';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Star, Heart, Calendar, Hash, Bookmark, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { BookCover } from './BookCover';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onBorrowRequest: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isOpen,
  onClose,
  onBorrowRequest,
}) => {
  const { settings, favourites, toggleFavourite, borrowRecords } = useLibrary();
  const { currentUser } = useAuth();

  if (!book) return null;

  const isFavourite = favourites.includes(book.id);
  const isAvailable = book.availableCopies > 0;
  const isAlreadyBorrowedByMe = currentUser
    ? borrowRecords.some(
        (r) => isUserRecord(r, currentUser) && isRecordForBook(r, book.id, book.title) && r.status === 'active'
      )
    : false;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-1">
        {/* Left: Cover & Quick Metadata */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[220px] aspect-3/4 rounded-2xl overflow-hidden shadow-lg border border-sage-200 dark:border-charcoal-700 bg-sage-100 dark:bg-charcoal-800">
            <BookCover
              src={book.coverImage}
              title={book.title}
              author={book.author}
              category={book.category}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-full max-w-[220px] mt-4 space-y-2">
            <button
              onClick={() => toggleFavourite(book.id)}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                isFavourite
                  ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40'
                  : 'border-sage-300 dark:border-charcoal-700 text-charcoal-700 dark:text-sage-200 hover:bg-sage-100 dark:hover:bg-charcoal-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavourite ? 'fill-rose-500 text-rose-500' : ''}`} />
              {isFavourite ? 'Saved in Favourites' : 'Save to Reading List'}
            </button>

            <Link
              to={`/books/${book.id}`}
              onClick={onClose}
              className="w-full py-2 px-3 rounded-xl bg-sage-100 hover:bg-sage-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-forest-800 dark:text-ivory-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Full Book Page
            </Link>
          </div>
        </div>

        {/* Right: Book Details & Loan Action */}
        <div className="md:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-forest-700 dark:text-amber-400">
                {book.category}
              </span>
              <span className="text-charcoal-300">·</span>
              <Badge variant={isAvailable ? 'available' : 'borrowed'} size="sm">
                {isAvailable ? `${book.availableCopies} of ${book.totalCopies} Available` : 'All Copies Borrowed'}
              </Badge>
            </div>

            <h3 className="font-serif text-xl font-bold text-charcoal-900 dark:text-ivory-100 leading-snug mb-1">
              {book.title}
            </h3>

            <p className="text-sm text-charcoal-600 dark:text-sage-300 mb-3">
              Author: <strong className="font-semibold text-charcoal-800 dark:text-ivory-200">{book.author}</strong>
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs text-charcoal-600 dark:text-sage-300 p-3 bg-sage-50/70 dark:bg-charcoal-800/60 rounded-xl border border-sage-100 dark:border-charcoal-800 mb-4">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-forest-600 dark:text-amber-400" />
                <span className="truncate">ISBN: {book.isbn}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-forest-600 dark:text-amber-400" />
                <span>Year: {book.publicationYear}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-forest-600 dark:text-amber-400" />
                <span>Shelf: {book.shelfLocation || 'Dept. Stack'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-500 font-medium">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Rating: {book.rating?.toFixed(1) || '4.8'} / 5.0</span>
              </div>
            </div>

            <div className="mb-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-charcoal-400 dark:text-sage-400 mb-1.5">
                Description
              </h5>
              <p className="text-xs text-charcoal-600 dark:text-sage-300 leading-relaxed max-h-36 overflow-y-auto">
                {book.description}
              </p>
            </div>

            {/* Borrowing policy banner */}
            <div className="p-3 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl mb-4 text-xs text-charcoal-700 dark:text-sage-200 flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Loan Term:</strong> {settings.defaultLoanDurationDays} days loan duration. Late returns incur {settings.currency}{settings.fineRatePerDay}/day overdue fine.
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t border-sage-100 dark:border-charcoal-800">
            {isAlreadyBorrowedByMe ? (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                You already have an active loan for this book.
              </div>
            ) : isAvailable ? (
              <button
                onClick={() => {
                  onClose();
                  onBorrowRequest(book);
                }}
                className="w-full py-3 bg-forest-700 hover:bg-forest-800 text-ivory-100 font-semibold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Borrow This Book Now
              </button>
            ) : (
              <div className="p-2.5 bg-sage-100 dark:bg-charcoal-800 rounded-xl text-center text-xs text-charcoal-500 dark:text-sage-400 flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                All copies currently checked out. Check back later or notify staff.
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
