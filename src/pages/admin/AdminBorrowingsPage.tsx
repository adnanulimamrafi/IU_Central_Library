import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { BorrowRecord } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { BookCover } from '../../components/books/BookCover';
import {
  formatDisplayDate,
  getDaysDifference,
  getEffectiveBorrowStatus,
  calculateOverdueFine,
} from '../../utils/dates';
import { exportToCsv } from '../../utils/csvExport';
import {
  Clock,
  Search,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Filter,
} from 'lucide-react';

export const AdminBorrowingsPage: React.FC = () => {
  const { borrowRecords, returnBook, extendLoan, settings } = useLibrary();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'due-soon' | 'overdue' | 'returned'>('all');
  const [recordToReturn, setRecordToReturn] = useState<BorrowRecord | null>(null);
  const [recordToExtend, setRecordToExtend] = useState<BorrowRecord | null>(null);
  const [extendDays, setExtendDays] = useState(7);

  const filteredRecords = useMemo(() => {
    return borrowRecords.filter((rec) => {
      // Dynamic status
      const dynStatus = getEffectiveBorrowStatus(rec);
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && rec.status !== 'active') return false;
        if (statusFilter === 'returned' && rec.status !== 'returned') return false;
        if (statusFilter === 'due-soon' && dynStatus !== 'due-soon') return false;
        if (statusFilter === 'overdue' && dynStatus !== 'overdue') return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (rec.bookTitle || '').toLowerCase().includes(q) ||
          (rec.userName || '').toLowerCase().includes(q) ||
          (rec.userStudentId && rec.userStudentId.toLowerCase().includes(q)) ||
          String(rec.id).toLowerCase().includes(q) ||
          (rec.userEmail || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [borrowRecords, statusFilter, search]);

  const handleExportCsv = () => {
    const rows = filteredRecords.map((r) => ({
      RecordID: r.id,
      BookTitle: r.bookTitle,
      Author: r.bookAuthor,
      MemberName: r.userName,
      StudentID: r.userStudentId || '',
      Email: r.userEmail,
      IssueDate: r.issueDate,
      DueDate: r.dueDate,
      ReturnDate: r.returnDate || 'Active',
      Status: r.status,
      FineAmount: r.fineAmount,
      Renewals: r.renewCount,
    }));
    exportToCsv('library_borrowing_transactions', rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sage-200 dark:border-charcoal-800">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 dark:text-ivory-100">
            Circulation & Borrowing Records
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-sage-400 mt-0.5">
            Monitor all student transactions, process institutional returns, and extend loans.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-2 bg-sage-100 hover:bg-sage-200 dark:bg-charcoal-800 text-forest-900 dark:text-ivory-100 text-xs font-semibold rounded-xl border border-sage-300 dark:border-charcoal-700 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-forest-600 dark:text-amber-400" />
          <span>Export Transactions CSV</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book title, student name, roll number, or record ID..."
            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-900 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-hidden focus:border-forest-600"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'active', 'due-soon', 'overdue', 'returned'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === filter
                  ? 'bg-forest-700 text-ivory-100 shadow-2xs'
                  : 'bg-white dark:bg-charcoal-900 text-charcoal-600 dark:text-sage-300 border border-sage-200 dark:border-charcoal-700 hover:bg-sage-100'
              }`}
            >
              {filter === 'all'
                ? 'All Records'
                : filter === 'due-soon'
                ? 'Due Soon'
                : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Records Table */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-8 h-8" />}
          title="No Transactions Found"
          description="No borrowing records match your current filters."
        />
      ) : (
        <div className="bg-white dark:bg-charcoal-900 rounded-2xl border border-sage-200 dark:border-charcoal-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sage-50/80 dark:bg-charcoal-800/80 text-charcoal-600 dark:text-sage-300 font-bold border-b border-sage-200 dark:border-charcoal-700">
                <tr>
                  <th className="py-3 px-4">Record ID & Book</th>
                  <th className="py-3 px-4">Borrower Student</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Return Date</th>
                  <th className="py-3 px-4">Status & Fine</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100 dark:divide-charcoal-800">
                {filteredRecords.map((rec) => {
                  const dynamicStatus = getEffectiveBorrowStatus(rec);
                  const fine = calculateOverdueFine(rec, settings.fineRatePerDay);

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-sage-50/50 dark:hover:bg-charcoal-800/40 transition-colors"
                    >
                      {/* Book & Record ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-12 shrink-0 rounded overflow-hidden shadow-2xs border border-sage-200 dark:border-charcoal-700">
                            <BookCover
                              src={rec.bookCover}
                              title={rec.bookTitle}
                              author={rec.bookAuthor}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-charcoal-900 dark:text-ivory-100 truncate max-w-xs">
                              {rec.bookTitle}
                            </p>
                            <p className="text-[10px] font-mono text-charcoal-400">
                              #{rec.id} · {rec.bookAuthor}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Borrower */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-charcoal-800 dark:text-ivory-100">
                          {rec.userName}
                        </p>
                        <p className="text-[11px] text-forest-700 dark:text-amber-400 font-mono">
                          Roll: {rec.userStudentId || 'Member'}
                        </p>
                      </td>

                      {/* Issue date */}
                      <td className="py-3.5 px-4 text-charcoal-700 dark:text-sage-200 whitespace-nowrap">
                        {formatDisplayDate(rec.issueDate)}
                      </td>

                      {/* Due date */}
                      <td className="py-3.5 px-4 text-charcoal-700 dark:text-sage-200 whitespace-nowrap">
                        <span className={dynamicStatus === 'overdue' ? 'text-rose-600 font-bold' : ''}>
                          {formatDisplayDate(rec.dueDate)}
                        </span>
                      </td>

                      {/* Return date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-charcoal-700 dark:text-sage-200">
                        {rec.returnDate ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                            {formatDisplayDate(rec.returnDate)}
                          </span>
                        ) : (
                          <span className="text-charcoal-400">—</span>
                        )}
                      </td>

                      {/* Status & Fine */}
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
                          {dynamicStatus}
                        </Badge>
                        {fine > 0 && (
                          <div className="text-[11px] text-rose-600 font-bold mt-0.5">
                            Fine: {settings.currency}{fine}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {rec.status === 'active' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setRecordToReturn(rec)}
                              className="py-1 px-2.5 bg-forest-700 hover:bg-forest-800 text-ivory-100 font-semibold rounded-lg text-xs"
                            >
                              Process Return
                            </button>
                            <button
                              onClick={() => setRecordToExtend(rec)}
                              className="p-1 rounded-lg text-charcoal-600 hover:bg-sage-100 dark:hover:bg-charcoal-800"
                              title="Extend Due Date"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-charcoal-400 font-medium">
                            Completed
                          </span>
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

      {/* Return Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(recordToReturn)}
        onClose={() => setRecordToReturn(null)}
        onConfirm={async () => {
          if (recordToReturn) {
            await returnBook(recordToReturn.id);
          }
        }}
        title="Process Book Return"
        message={`Mark "${recordToReturn?.bookTitle}" as returned by ${recordToReturn?.userName}? This restores the available copy to the catalogue.`}
        confirmText="Confirm Return"
        type="success"
      />

      {/* Extend Loan Modal */}
      <Modal
        isOpen={Boolean(recordToExtend)}
        onClose={() => setRecordToExtend(null)}
        title="Extend Due Date"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-charcoal-600 dark:text-sage-300">
            Extend borrowing loan duration for <strong>{recordToExtend?.bookTitle}</strong> (borrowed by {recordToExtend?.userName}).
          </p>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-sage-300 mb-1">
              Additional Days to Extend
            </label>
            <select
              value={extendDays}
              onChange={(e) => setExtendDays(Number(e.target.value))}
              className="w-full py-2 px-3 bg-sage-50/60 dark:bg-charcoal-800 border border-sage-200 dark:border-charcoal-700 rounded-xl text-xs sm:text-sm text-charcoal-800 dark:text-ivory-100 focus:outline-hidden"
            >
              <option value={7}>+7 Days (One Week)</option>
              <option value={14}>+14 Days (Two Weeks)</option>
              <option value={21}>+21 Days (Three Weeks)</option>
              <option value={30}>+30 Days (One Month)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-sage-100 dark:border-charcoal-800">
            <button
              onClick={() => setRecordToExtend(null)}
              className="py-2 px-4 text-xs font-semibold text-charcoal-600 hover:bg-sage-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (recordToExtend) {
                  await extendLoan(recordToExtend.id, extendDays);
                  setRecordToExtend(null);
                }
              }}
              className="py-2 px-4 bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-xl"
            >
              Confirm Extension
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
