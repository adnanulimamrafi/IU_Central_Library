import React, { useState, useMemo } from 'react';
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
  Search,
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

export const MyBooksPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { borrowRecords, returnBook, extendLoan, settings } = useLibrary();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due-soon' | 'overdue'>('all');
  const [recordToReturn, setRecordToReturn] = useState<BorrowRecord | null>(null);
  const [recordToExtend, setRecordToExtend] = useState<BorrowRecord | null>(null);

  const myActiveRecords = useMemo(() => {
    if (!currentUser) return [];
    return borrowRecords
      .filter((r) => isUserRecord(r, currentUser) && r.status === 'active')
      .filter((r) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            (r.bookTitle || '').toLowerCase().includes(q) ||
            (r.bookAuthor || '').toLowerCase().includes(q) ||
            String(r.id).toLowerCase().includes(q)
          );
        }
        return true;
      })
      .filter((r) => {
        const diff = getDaysDifference(r.dueDate);
        if (statusFilter === 'due-soon') {
          return diff >= 0 && diff <= 2;
        }
        if (statusFilter === 'overdue') {
          return diff < 0;
        }
        return true;
      });
  }, [borrowRecords, currentUser, search, statusFilter]);

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sage-200 dark:border-charcoal-800">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100">
            My Borrowed Books
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-sage-400 mt-0.5">
            Manage your currently active loans, renewals, and returns.
          </p>
        </div>

        <div className="text-xs text-charcoal-600 dark:text-sage-300 bg-sage-100 dark:bg-charcoal-800 px-3.5 py-2 rounded-xl border border-sage-200 dark:border-charcoal-700 font-medium">
          Quota: <strong className="text-forest-700 dark:text-amber-400">{myActiveRecords.length}</strong> / {settings.maxBorrowLimit} books
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search within my books..."
            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-900 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-hidden focus:border-forest-600"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'due-soon', 'overdue'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === filter
                  ? 'bg-forest-700 text-ivory-100'
                  : 'bg-white dark:bg-charcoal-900 text-charcoal-600 dark:text-sage-300 border border-sage-200 dark:border-charcoal-700 hover:bg-sage-100'
              }`}
            >
              {filter === 'all' ? 'All Active' : filter === 'due-soon' ? 'Due Soon' : 'Overdue'}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      {myActiveRecords.length === 0 ? (
        <EmptyState
          icon={<BookMarked className="w-8 h-8" />}
          title="No Borrowed Books Found"
          description={
            search || statusFilter !== 'all'
              ? 'No books match your current filter settings.'
              : 'You have no active loans right now. Visit the catalogue to borrow course materials.'
          }
          actionText="Browse Catalogue"
          onAction={() => (window.location.href = '/books')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myActiveRecords.map((record) => {
            const diff = getDaysDifference(record.dueDate);
            const dynamicStatus = getEffectiveBorrowStatus(record);
            const overdueFine = calculateOverdueFine(record, settings.fineRatePerDay);

            return (
              <div
                key={record.id}
                className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-800 shadow-xs flex flex-col sm:flex-row gap-4"
              >
                <div className="w-24 h-34 shrink-0 rounded-xl overflow-hidden border border-sage-200 dark:border-charcoal-700 shadow-2xs">
                  <BookCover
                    src={record.bookCover}
                    title={record.bookTitle}
                    author={record.bookAuthor}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <Badge
                        variant={
                          dynamicStatus === 'overdue'
                            ? 'overdue'
                            : dynamicStatus === 'due-soon'
                            ? 'due-soon'
                            : 'active'
                        }
                      >
                        {dynamicStatus === 'overdue'
                          ? `Overdue (${Math.abs(diff)}d)`
                          : dynamicStatus === 'due-soon'
                          ? `Due in ${diff}d`
                          : `${diff} days left`}
                      </Badge>
                      <span className="text-[10px] text-charcoal-400 font-mono">
                        #{record.id}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-charcoal-900 dark:text-ivory-100 line-clamp-1 mb-0.5">
                      {record.bookTitle}
                    </h3>
                    <p className="text-xs text-charcoal-500 dark:text-sage-400 truncate mb-3">
                      by {record.bookAuthor}
                    </p>

                    <div className="p-3 bg-sage-50/70 dark:bg-charcoal-800/60 rounded-xl border border-sage-100 dark:border-charcoal-800 text-xs space-y-1 text-charcoal-600 dark:text-sage-300">
                      <div className="flex items-center justify-between">
                        <span className="text-charcoal-400">Issue Date:</span>
                        <strong>{formatDisplayDate(record.issueDate)}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-charcoal-400">Due Date:</span>
                        <strong className={dynamicStatus === 'overdue' ? 'text-rose-600 font-bold' : ''}>
                          {formatDisplayDate(record.dueDate)}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-charcoal-400">Renewals:</span>
                        <span>{record.renewCount} of {settings.maxRenewals} used</span>
                      </div>
                      {overdueFine > 0 && (
                        <div className="flex items-center justify-between text-rose-600 font-bold pt-1 border-t border-sage-200 dark:border-charcoal-700">
                          <span>Overdue Fine:</span>
                          <span>{settings.currency}{overdueFine}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-sage-100 dark:border-charcoal-800 flex items-center gap-2 mt-4">
                    <button
                      onClick={() => setRecordToReturn(record)}
                      className="flex-1 py-2 px-3 bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Return Book</span>
                    </button>
                    <button
                      onClick={() => setRecordToExtend(record)}
                      disabled={record.renewCount >= settings.maxRenewals}
                      className="py-2 px-3 bg-sage-100 hover:bg-sage-200 dark:bg-charcoal-800 disabled:opacity-50 text-forest-800 dark:text-ivory-100 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                      title={record.renewCount >= settings.maxRenewals ? 'Max renewals reached' : 'Extend loan by 7 days'}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Renew (+7d)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
