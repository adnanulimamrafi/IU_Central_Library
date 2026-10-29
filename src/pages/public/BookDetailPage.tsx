import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { BookCard } from '../../components/books/BookCard';
import { BookCover } from '../../components/books/BookCover';
import { isUserRecord, isRecordForBook } from '../../utils/userRecords';
import {
  Star,
  Heart,
  ChevronRight,
  BookOpen,
  Calendar,
  Layers,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Globe,
} from 'lucide-react';

export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, settings, favourites, toggleFavourite, borrowRecords, borrowBook, markRecentlyViewed } = useLibrary();
  const { currentUser, isAuthenticated } = useAuth();

  const [confirmBorrowOpen, setConfirmBorrowOpen] = useState(false);

  const book = books.find(
    (b) => b.id === id || String(b.id) === String(id) || `b-${b.id}` === id || b.id === `b-${id}`
  );

  useEffect(() => {
    if (book) {
      markRecentlyViewed(book.id);
    }
  }, [book, markRecentlyViewed]);

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-charcoal-900 dark:text-ivory-100 mb-2">
          Book Not Found
        </h2>
        <p className="text-sm text-charcoal-500 dark:text-sage-400 mb-6">
          The requested book record does not exist or has been removed from the catalogue.
        </p>
        <Link
          to="/books"
          className="px-5 py-2.5 bg-forest-700 text-ivory-100 text-xs font-semibold rounded-xl"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;
  const isFavourite = favourites.includes(book.id);
  const isAlreadyBorrowedByMe = currentUser
    ? borrowRecords.some(
        (r) => isUserRecord(r, currentUser) && isRecordForBook(r, book.id, book.title) && r.status === 'active'
      )
    : false;

  const relatedBooks = books
    .filter((b) => b.category === book.category && b.id !== book.id)
    .slice(0, 4);

  const availabilityPercentage = Math.round((book.availableCopies / book.totalCopies) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-charcoal-500 dark:text-sage-400">
        <Link to="/" className="hover:text-forest-700 dark:hover:text-amber-400">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/books" className="hover:text-forest-700 dark:hover:text-amber-400">
          Catalogue
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-forest-700 dark:text-amber-400 font-semibold truncate max-w-xs">
          {book.title}
        </span>
      </nav>

      {/* Main Hero Card */}
      <div className="bg-white dark:bg-charcoal-900 rounded-3xl border border-sage-200 dark:border-charcoal-800 p-6 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Cover & Quick Actions */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-3/4 rounded-2xl overflow-hidden shadow-xl border border-sage-200 dark:border-charcoal-700 bg-sage-100 dark:bg-charcoal-800">
              <BookCover
                src={book.coverImage}
                title={book.title}
                author={book.author}
                category={book.category}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge variant={isAvailable ? 'available' : 'borrowed'}>
                  {isAvailable ? `${book.availableCopies} Copies Available` : 'All Out'}
                </Badge>
              </div>
            </div>

            {/* Favorite & Shelf Info */}
            <div className="w-full max-w-[280px] mt-4 space-y-2">
              <button
                onClick={() => toggleFavourite(book.id)}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  isFavourite
                    ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40'
                    : 'border-sage-300 dark:border-charcoal-700 text-charcoal-700 dark:text-sage-200 hover:bg-sage-100 dark:hover:bg-charcoal-800'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavourite ? 'fill-rose-500 text-rose-500' : ''}`} />
                {isFavourite ? 'Saved in My Reading List' : 'Add to Reading List'}
              </button>

              <div className="p-3 bg-sage-50 dark:bg-charcoal-800/60 rounded-xl border border-sage-200/60 dark:border-charcoal-700 text-center">
                <span className="text-[11px] text-charcoal-500 dark:text-sage-400 block font-medium">
                  Physical Stack Location:
                </span>
                <span className="text-xs font-bold text-forest-800 dark:text-ivory-100 flex items-center justify-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-forest-600 dark:text-amber-400" />
                  {book.shelfLocation || 'Dept. Library Stack A'}
                </span>
              </div>
            </div>
          </div>

          {/* Details & Borrowing Area */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Category & Rating */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="px-3 py-1 rounded-full bg-forest-50 dark:bg-forest-900/60 text-forest-700 dark:text-sage-200 text-xs font-semibold border border-forest-200/80 dark:border-forest-800">
                  {book.category}
                </span>

                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900/50">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{book.rating?.toFixed(1) || '4.8'}</span>
                  <span className="text-xs text-charcoal-400 font-normal">/ 5.0 (IU CSE Rating)</span>
                </div>
              </div>

              {/* Title & Author */}
              <div>
                <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal-900 dark:text-ivory-100 leading-tight">
                  {book.title}
                </h1>
                <p className="text-sm sm:text-base text-charcoal-600 dark:text-sage-300 mt-2">
                  Written by <strong className="font-semibold text-charcoal-800 dark:text-ivory-100">{book.author}</strong>
                </p>
              </div>

              {/* Inventory Stock Indicator */}
              <div className="p-4 bg-sage-50/70 dark:bg-charcoal-800/60 rounded-2xl border border-sage-200/60 dark:border-charcoal-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-charcoal-700 dark:text-sage-300">
                  <span>Inventory Copy Availability</span>
                  <span className="text-forest-700 dark:text-amber-400">
                    {book.availableCopies} of {book.totalCopies} Copies Free ({availabilityPercentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-sage-200 dark:bg-charcoal-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      book.availableCopies > 2
                        ? 'bg-emerald-600'
                        : book.availableCopies > 0
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${availabilityPercentage}%` }}
                  />
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700">
                  <span className="text-[11px] text-charcoal-400 block">ISBN</span>
                  <strong className="text-charcoal-800 dark:text-ivory-100 truncate block mt-0.5">
                    {book.isbn}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700">
                  <span className="text-[11px] text-charcoal-400 block">Published</span>
                  <strong className="text-charcoal-800 dark:text-ivory-100 block mt-0.5">
                    {book.publicationYear}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700">
                  <span className="text-[11px] text-charcoal-400 block">Pages</span>
                  <strong className="text-charcoal-800 dark:text-ivory-100 block mt-0.5">
                    {book.pages || 420} Pages
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700">
                  <span className="text-[11px] text-charcoal-400 block">Language</span>
                  <strong className="text-charcoal-800 dark:text-ivory-100 block mt-0.5">
                    {book.language || 'English'}
                  </strong>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-400 dark:text-sage-400 mb-2">
                  Summary & Academic Overview
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 dark:text-sage-300 leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>

              {/* Loan terms & rules */}
              <div className="p-4 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-charcoal-700 dark:text-sage-200 space-y-1">
                  <h4 className="font-bold text-amber-900 dark:text-amber-300">
                    Department Borrowing Policy
                  </h4>
                  <p>
                    Loans are valid for <strong>{settings.defaultLoanDurationDays} calendar days</strong>. Members may renew up to {settings.maxRenewals} times before due date. Overdue fee of {settings.currency}{settings.fineRatePerDay} per day applies after due date.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-8 border-t border-sage-200 dark:border-charcoal-800 mt-6 flex flex-col sm:flex-row items-center gap-4">
              {isAlreadyBorrowedByMe ? (
                <div className="flex-1 w-full p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You have actively borrowed this book. View status in your dashboard.</span>
                </div>
              ) : isAvailable ? (
                <button
                  onClick={() => setConfirmBorrowOpen(true)}
                  className="flex-1 w-full py-3.5 px-6 bg-forest-700 hover:bg-forest-800 text-ivory-100 font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Borrow This Book ({book.availableCopies} available)</span>
                </button>
              ) : (
                <div className="flex-1 w-full p-3 bg-sage-100 dark:bg-charcoal-800 rounded-xl text-center text-xs text-charcoal-500 dark:text-sage-400 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>All copies currently on loan. Please check back soon or visit front desk.</span>
                </div>
              )}

              <Link
                to="/books"
                className="py-3 px-5 border border-sage-300 dark:border-charcoal-700 hover:bg-sage-100 dark:hover:bg-charcoal-800 text-xs font-semibold text-charcoal-700 dark:text-sage-200 rounded-xl transition-colors whitespace-nowrap"
              >
                &larr; Back to Catalogue
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Books from Category */}
      {relatedBooks.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-forest-900 dark:text-ivory-100">
              Related Books in {book.category}
            </h3>
            <Link
              to={`/books?category=${encodeURIComponent(book.category)}`}
              className="text-xs font-semibold text-forest-700 dark:text-amber-400 hover:underline"
            >
              See all in this discipline &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook.id} book={relBook} />
            ))}
          </div>
        </div>
      )}

      {/* Borrow Confirmation Dialog */}
      <ConfirmationModal
        isOpen={confirmBorrowOpen}
        onClose={() => setConfirmBorrowOpen(false)}
        onConfirm={async () => {
          if (!isAuthenticated) {
            navigate('/login');
            return;
          }
          await borrowBook(book);
        }}
        title="Confirm Book Borrowing"
        message={`Are you sure you want to borrow "${book.title}" for ${settings.defaultLoanDurationDays} days? You can return it anytime from your dashboard.`}
        confirmText="Confirm Issue"
        type="primary"
      />
    </div>
  );
};
