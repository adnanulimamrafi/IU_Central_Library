import React from 'react';
import { Book } from '../../types';
import { isUserRecord, isRecordForBook } from '../../utils/userRecords';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Star, Heart, BookOpen, Check } from 'lucide-react';
import { Badge } from '../common/Badge';
import { BookCover } from './BookCover';

interface BookCardProps {
  book: Book;
  onQuickView?: (book: Book) => void;
  onBorrowRequest?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onQuickView,
  onBorrowRequest,
}) => {
  const { favourites, toggleFavourite, borrowRecords } = useLibrary();
  const { currentUser } = useAuth();

  const isFavourite = favourites.includes(book.id);
  const isAvailable = book.availableCopies > 0;

  // Check if current user already has this book actively borrowed
  const isAlreadyBorrowedByMe = currentUser
    ? borrowRecords.some(
        (r) => isUserRecord(r, currentUser) && isRecordForBook(r, book.id, book.title) && r.status === 'active'
      )
    : false;

  return (
    <div className="group relative flex flex-col bg-white dark:bg-charcoal-900 rounded-2xl border border-sage-200 dark:border-charcoal-700/80 overflow-hidden shadow-xs hover:shadow-md hover:border-forest-600/40 dark:hover:border-forest-500/50 transition-all duration-200">
      {/* Cover Image & Overlays */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-sage-100 dark:bg-charcoal-800">
        <BookCover
          src={book.coverImage}
          title={book.title}
          author={book.author}
          category={book.category}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavourite(book.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
            isFavourite
              ? 'bg-rose-500 text-white'
              : 'bg-white/80 dark:bg-charcoal-900/80 text-charcoal-600 dark:text-sage-200 hover:text-rose-500 hover:bg-white'
          }`}
          title={isFavourite ? 'Remove from Saved' : 'Save to Reading List'}
          aria-label="Save book"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavourite ? 'fill-current' : ''}`} />
        </button>

        {/* Availability Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={isAvailable ? 'available' : 'borrowed'} size="sm">
            {isAvailable ? `${book.availableCopies} Left` : 'All Out'}
          </Badge>
        </div>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onQuickView(book)}
              className="w-full py-2 bg-charcoal-950/80 hover:bg-charcoal-900 backdrop-blur-md text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Quick View
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category & Rating */}
        <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-sage-400 mb-1.5 gap-2">
          <span className="text-[11px] font-medium text-forest-700 dark:text-amber-400 truncate max-w-[70%]">
            {book.category}
          </span>
          <div className="flex items-center gap-1 text-amber-500 font-semibold text-[11px] shrink-0">
            <Star className="w-3 h-3 fill-current" />
            <span>{book.rating?.toFixed(1) || '4.8'}</span>
          </div>
        </div>

        {/* Title */}
        <Link
          to={`/books/${book.id}`}
          className="font-serif text-sm font-bold text-charcoal-900 dark:text-ivory-100 group-hover:text-forest-700 dark:group-hover:text-amber-400 line-clamp-2 leading-snug mb-1"
          title={book.title}
        >
          {book.title}
        </Link>

        {/* Author & Year */}
        <p className="text-xs text-charcoal-500 dark:text-sage-400 line-clamp-1 mb-3">
          by {book.author} · {book.publicationYear}
        </p>

        {/* Footer / Action */}
        <div className="mt-auto pt-3 border-t border-sage-100 dark:border-charcoal-800 flex items-center justify-between gap-2">
          <span className="text-[11px] text-charcoal-400 dark:text-sage-400 truncate">
            {book.shelfLocation || 'Main Stack'}
          </span>

          {isAlreadyBorrowedByMe ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg">
              <Check className="w-3 h-3" /> Issued
            </span>
          ) : isAvailable ? (
            <button
              onClick={() => onBorrowRequest ? onBorrowRequest(book) : null}
              className="px-3 py-1.5 bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              Borrow
            </button>
          ) : (
            <span className="text-[11px] text-charcoal-400 dark:text-sage-500 font-medium px-2 py-1">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
