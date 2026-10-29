import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { BookCover } from '../../components/books/BookCover';
import { BorrowRecord } from '../../types';
import {
  formatDisplayDate,
  getDaysDifference,
  getEffectiveBorrowStatus,
  calculateOverdueFine,
} from '../../utils/dates';
import { isUserRecord } from '../../utils/userRecords';
import {
  BookMarked,
  Clock,
  AlertTriangle,
  History,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Calendar,
  Search,
  BookOpen,
} from 'lucide-react';

export const UserOverviewPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { borrowRecords, returnBook, extendLoan, settings } = useLibrary();

  const [recordToReturn, setRecordToReturn] = useState<BorrowRecord | null>(null);
  const [recordToExtend, setRecordToExtend] = useState<BorrowRecord | null>(null);

  if (!currentUser) return null;

  const myRecords = borrowRecords.filter((r) => isUserRecord(r, currentUser));
  const activeRecords = myRecords.filter((r) => r.status === 'active');
  const dueSoonRecords = activeRecords.filter((r) => {
    const diff = getDaysDifference(r.dueDate);
    return diff >= 0 && diff <= 2;
  });
  const overdueRecords = activeRecords.filter((r) => getDaysDifference(r.dueDate) < 0);
  const returnedCount = myRecords.filter((r) => r.status === 'returned').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-linear-to-r from-forest-900 to-forest-800 text-ivory-100 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-forest-700/80 rounded-full text-xs font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Islamic University Central Library</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-xs sm:text-sm text-sage-200/90 leading-relaxed">
            Roll: <strong>{currentUser.studentId || '2114028'}</strong> · Department of {currentUser.department || 'CSE'} (Session: {currentUser.session || '2021-22'}). Manage your borrowed textbooks and explore new arrivals.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/books"
              className="py-2 px-4 bg-amber-400 hover:bg-amber-500 text-forest-950 font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Browse New Books</span>
            </Link>
            <Link
              to="/dashboard/my-books"
              className="py-2 px-4 bg-forest-700/90 hover:bg-forest-700 text-ivory-100 font-semibold text-xs rounded-xl transition-colors"
            >
              View Active Loans ({activeRecords.length})
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Currently Borrowed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-forest-50 dark:bg-forest-900/40 text-forest-700 dark:text-sage-200 rounded-xl">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-forest-900 dark:text-ivory-100">
              {activeRecords.length} / {settings.maxBorrowLimit}
            </div>
            <div className="text-xs text-charcoal-500 dark:text-sage-400 font-medium">
              Currently Borrowed
            </div>
          </div>
        </div>

        {/* Due Soon */}
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-forest-900 dark:text-ivory-100">
              {dueSoonRecords.length}
            </div>
            <div className="text-xs text-charcoal-500 dark:text-sage-400 font-medium">
              Due Within 48 Hours
            </div>
          </div>
        </div>

        {/* Overdue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-forest-900 dark:text-ivory-100">
              {overdueRecords.length}
            </div>
            <div className="text-xs text-charcoal-500 dark:text-sage-400 font-medium">
              Overdue Books
            </div>
          </div>
        </div>

        {/* Total History */}
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-sage-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-sage-200 rounded-xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-forest-900 dark:text-ivory-100">
              {myRecords.length}
            </div>
            <div className="text-xs text-charcoal-500 dark:text-sage-400 font-medium">
              Total Books Issued ({returnedCount} returned)
            </div>
          </div>
        </div>
      </div>

      {/* Active Borrowed Books Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-forest-900 dark:text-ivory-100">
            Active Borrowed Books
          </h2>
          <Link
            to="/dashboard/my-books"
            className="text-xs font-semibold text-forest-700 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Manage All ({activeRecords.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeRecords.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-8 h-8" />}
            title="No Active Borrowings"
            description="You do not have any books currently checked out. Browse the library catalogue to borrow up to 5 books."
            actionText="Explore Catalogue"
            onAction={() => (window.location.href = '/books')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRecords.map((record) => {
              const diff = getDaysDifference(record.dueDate);
              const dynamicStatus = getEffectiveBorrowStatus(record);
              const overdueFine = calculateOverdueFine(record, settings.fineRatePerDay);

              return (
                <div
                  key={record.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs hover:border-forest-600/40 transition-colors"
                >
                  <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden border border-sage-200 dark:border-charcoal-700">
                    <BookCover
                      src={record.bookCover}
                      title={record.bookTitle}
                      author={record.bookAuthor}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge
                          variant={
                            dynamicStatus === 'overdue'
                              ? 'overdue'
                              : dynamicStatus === 'due-soon'
                              ? 'due-soon'
                              : 'active'
                          }
                          size="sm"
                        >
                          {dynamicStatus === 'overdue'
                            ? `Overdue by ${Math.abs(diff)} days`
                            : dynamicStatus === 'due-soon'
                            ? `Due in ${diff === 0 ? 'Today' : `${diff} days`}`
                            : `${diff} days remaining`}
                        </Badge>
                        {record.renewCount > 0 && (
                          <span className="text-[10px] text-charcoal-400">
                            Renewed {record.renewCount}x
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif text-sm font-bold text-charcoal-900 dark:text-ivory-100 line-clamp-1">
                        {record.bookTitle}
                      </h4>
                      <p className="text-xs text-charcoal-500 dark:text-sage-400 truncate">
                        by {record.bookAuthor}
                      </p>

                      <div className="mt-2 text-[11px] text-charcoal-600 dark:text-sage-300 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-forest-600 dark:text-amber-400" />
                          <span>Issued: {formatDisplayDate(record.issueDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Due: {formatDisplayDate(record.dueDate)}</span>
                        </div>
                        {overdueFine > 0 && (
                          <div className="text-rose-600 dark:text-rose-400 font-bold">
                            Estimated Fine: {settings.currency}{overdueFine}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-sage-100 dark:border-charcoal-800 flex items-center gap-2 mt-3">
                      <button
                        onClick={() => setRecordToReturn(record)}
                        className="flex-1 py-1.5 px-3 bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                      >
                        Return Book
                      </button>
                      <button
                        onClick={() => setRecordToExtend(record)}
                        disabled={record.renewCount >= settings.maxRenewals}
                        className="py-1.5 px-3 bg-sage-100 hover:bg-sage-200 dark:bg-charcoal-800 disabled:opacity-50 text-forest-800 dark:text-ivory-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                        title={record.renewCount >= settings.maxRenewals ? 'Max renewals reached' : 'Extend loan by 7 days'}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Renew</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Return Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(recordToReturn)}
        onClose={() => setRecordToReturn(null)}
        onConfirm={async () => {
          if (recordToReturn) {
            await returnBook(recordToReturn.id);
          }
        }}
        title="Confirm Return"
        message={`Are you sure you want to return "${recordToReturn?.bookTitle}"? This will check the copy back into the library catalogue.`}
        confirmText="Confirm Return"
        type="success"
      />

      {/* Extend Loan Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(recordToExtend)}
        onClose={() => setRecordToExtend(null)}
        onConfirm={async () => {
          if (recordToExtend) {
            await extendLoan(recordToExtend.id, 7);
          }
        }}
        title="Extend Loan Period"
        message={`Extend due date for "${recordToExtend?.bookTitle}" by 7 days?`}
        confirmText="Extend +7 Days"
        type="primary"
      />
    </div>
  );
};
