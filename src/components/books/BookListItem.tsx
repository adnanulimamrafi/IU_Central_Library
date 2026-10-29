import React from 'react';
import { Book } from '../../types';
import { isUserRecord, isRecordForBook } from '../../utils/userRecords';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Star, Heart, Check, BookOpen } from 'lucide-react';
import { Badge } from '../common/Badge';
import { BookCover } from './BookCover';

interface BookListItemProps {
  book: Book;
  onQuickView?: (book: Book) => void;
  onBorrowRequest?: (book: Book) => void;
}

export const BookListItem: React.FC<BookListItemProps> = ({
  book,
  onQuickView,
  onBorrowRequest,
}) => {
  const { favourites, toggleFavourite, borrowRecords } = useLibrary();
  const { currentUser } = useAuth();

  const isFavourite = favourites.includes(book.id);
  const isAvailable = book.availableCopies > 0;
  const isAlreadyBorrowedByMe = currentUser
    ? borrowRecords.some(
        (r) => isUserRecord(r, currentUser) && isRecordForBook(r, book.id, book.title) && r.status === 'active'
      )
    : false;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white dark:bg-charcoal-900 rounded-2xl border border-sage-200 dark:border-charcoal-700/80 hover:shadow-md hover:border-forest-600/40 transition-all duration-200">
      {/* Cover */}
      <div className="relative w-20 h-28 sm:w-24 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-sage-100 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700">
        <BookCover
          src={book.coverImage}
          title={book.title}
          author={book.author}
          category={book.category}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold text-forest-700 dark:text-amber-400">
            {book.category}
          </span>
          <span className="text-charcoal-300 dark:text-charcoal-600">·</span>
          <span className="text-xs text-charcoal-500 dark:text-sage-400">
            ISBN: {book.isbn}
          </span>
          <span className="text-charcoal-300 dark:text-charcoal-600">·</span>
          <Badge variant={isAvailable ? 'available' : 'borrowed'} size="sm">
            {isAvailable ? `${book.availableCopies} Copies Available` : 'All Out'}
          </Badge>
        </div>

        <Link
          to={`/books/${book.id}`}
          className="font-serif text-base font-bold text-charcoal-900 dark:text-ivory-100 hover:text-forest-700 dark:hover:text-amber-400 block mb-1 transition-colors"
        >
          {book.title}
        </Link>

        <p className="text-xs text-charcoal-600 dark:text-sage-300 mb-2">
          By <strong className="font-semibold text-charcoal-800 dark:text-ivory-200">{book.author}</strong> · Published {book.publicationYear} · {book.pages || 400} pages · Shelf: {book.shelfLocation || 'Section A'}
        </p>

        <p className="text-xs text-charcoal-500 dark:text-sage-400 line-clamp-2 leading-relaxed">
          {book.description}
        </p>
      </div>

      {/* Action Column */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-sage-100 dark:border-charcoal-800">
        <div className="flex items-center gap-1.5 text-amber-500 font-semibold text-xs">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{book.rating?.toFixed(1) || '4.8'}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavourite(book.id)}
            className={`p-2 rounded-xl border transition-colors ${
              isFavourite
                ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900'
                : 'border-sage-300 dark:border-charcoal-700 text-charcoal-500 hover:text-rose-500 hover:bg-rose-50/50'
            }`}
            title="Save book"
          >
            <Heart className={`w-4 h-4 ${isFavourite ? 'fill-current' : ''}`} />
          </button>

          {onQuickView && (
            <button
              onClick={() => onQuickView(book)}
              className="p-2 rounded-xl border border-sage-300 dark:border-charcoal-700 text-charcoal-600 dark:text-sage-300 hover:bg-sage-100 dark:hover:bg-charcoal-800 transition-colors"
              title="Quick view"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          )}

          {isAlreadyBorrowedByMe ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl">
              <Check className="w-3.5 h-3.5" /> Issued
            </span>
          ) : isAvailable ? (
            <button
              onClick={() => onBorrowRequest ? onBorrowRequest(book) : null}
              className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              Borrow Book
            </button>
          ) : (
            <span className="px-3 py-1.5 text-xs text-charcoal-400 bg-sage-100 dark:bg-charcoal-800 rounded-xl">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
