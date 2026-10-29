import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { BookCover } from '../../components/books/BookCover';
import { formatDisplayDate, getEffectiveBorrowStatus } from '../../utils/dates';
import { exportToCsv } from '../../utils/csvExport';
import { isUserRecord } from '../../utils/userRecords';
import {
  History,
  Search,
  Download,
} from 'lucide-react';

export const BorrowHistoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { borrowRecords, settings } = useLibrary();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'returned'>('all');

  const myRecords = useMemo(() => {
    if (!currentUser) return [];
    return borrowRecords
      .filter((r) => isUserRecord(r, currentUser))
      .filter((r) => {
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            (r.bookTitle || '').toLowerCase().includes(q) ||
            (r.bookAuthor || '').toLowerCase().includes(q) ||
            String(r.id).toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [borrowRecords, currentUser, search, statusFilter]);

  if (!currentUser) return null;

  const handleExportCsv = () => {
    const rows = myRecords.map((r) => ({
      RecordID: r.id,
      BookTitle: r.bookTitle,
      Author: r.bookAuthor,
      IssueDate: r.issueDate,
      DueDate: r.dueDate,
      ReturnDate: r.returnDate || 'Active',
      Status: r.status,
      FineAmount: r.fineAmount,
      Renewals: r.renewCount,
    }));
    exportToCsv(`borrowing_history_${currentUser.studentId || 'member'}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sage-200 dark:border-charcoal-800">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100">
            Borrowing Records & History
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-sage-400 mt-0.5">
            Complete historical audit log of all textbooks borrowed and returned.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={myRecords.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-sage-100 hover:bg-sage-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-forest-900 dark:text-ivory-100 text-xs font-semibold rounded-xl border border-sage-300 dark:border-charcoal-700 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-forest-600 dark:text-amber-400" />
          <span>Export History CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or record ID..."
            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-900 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-hidden focus:border-forest-600"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'active', 'returned'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === filter
                  ? 'bg-forest-700 text-ivory-100'
                  : 'bg-white dark:bg-charcoal-900 text-charcoal-600 dark:text-sage-300 border border-sage-200 dark:border-charcoal-700 hover:bg-sage-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {myRecords.length === 0 ? (
        <EmptyState
          icon={<History className="w-8 h-8" />}
          title="No History Found"
          description="No past borrowing records match your search or filter criteria."
        />
      ) : (
        <div className="bg-white dark:bg-charcoal-900 rounded-2xl border border-sage-200 dark:border-charcoal-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sage-50/80 dark:bg-charcoal-800/80 text-charcoal-600 dark:text-sage-300 font-bold border-b border-sage-200 dark:border-charcoal-700">
                <tr>
                  <th className="py-3 px-4">Book Details</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Return Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100 dark:divide-charcoal-800">
                {myRecords.map((record) => {
                  const dynamicStatus = getEffectiveBorrowStatus(record);

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-sage-50/50 dark:hover:bg-charcoal-800/40 transition-colors"
                    >
                      {/* Book info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-12 shrink-0 rounded overflow-hidden shadow-2xs border border-sage-200 dark:border-charcoal-700">
                            <BookCover
                              src={record.bookCover}
                              title={record.bookTitle}
                              author={record.bookAuthor}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-charcoal-900 dark:text-ivory-100 truncate max-w-xs sm:max-w-sm">
                              {record.bookTitle}
                            </p>
                            <p className="text-[11px] text-charcoal-500 dark:text-sage-400 truncate">
                              {record.bookAuthor} · #{record.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Issue date */}
                      <td className="py-3.5 px-4 text-charcoal-700 dark:text-sage-200 whitespace-nowrap">
                        {formatDisplayDate(record.issueDate)}
                      </td>

                      {/* Due date */}
                      <td className="py-3.5 px-4 text-charcoal-700 dark:text-sage-200 whitespace-nowrap">
                        {formatDisplayDate(record.dueDate)}
                      </td>

                      {/* Return date */}
                      <td className="py-3.5 px-4 text-charcoal-700 dark:text-sage-200 whitespace-nowrap">
                        {record.returnDate ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                            {formatDisplayDate(record.returnDate)}
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            Active Loan
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant={
                            dynamicStatus === 'returned'
                              ? 'default'
                              : dynamicStatus === 'overdue'
                              ? 'overdue'
                              : dynamicStatus === 'due-soon'
                              ? 'due-soon'
                              : 'active'
                          }
                          size="sm"
                        >
                          {dynamicStatus === 'returned'
                            ? 'Returned'
                            : dynamicStatus === 'overdue'
                            ? 'Overdue'
                            : dynamicStatus === 'due-soon'
                            ? 'Due Soon'
                            : 'Active'}
                        </Badge>
                      </td>

                      {/* Fine */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium">
                        {record.fineAmount > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400">
                            {settings.currency}{record.fineAmount} {record.finePaid ? '(Paid)' : '(Unpaid)'}
                          </span>
                        ) : (
                          <span className="text-charcoal-400">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
