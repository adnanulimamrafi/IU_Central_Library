import { BorrowRecord } from '../types';

/**
 * Format an ISO date string into a friendly readable date
 */
export function formatDisplayDate(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Calculate due date given issue date and number of days
 */
export function calculateDueDate(issueDate: string, days: number): string {
  const date = new Date(issueDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/**
 * Get difference in full days between current time and due date
 * > 0: days left before due
 * = 0: due today
 * < 0: days overdue
 */
export function getDaysDifference(dueDateStr: string): number {
  const now = new Date();
  const due = new Date(dueDateStr);
  
  // Clear time components for clean day diff
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();

  const diffTime = dueDateOnly - todayDate;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Compute the dynamic status of a borrow record
 */
export function getEffectiveBorrowStatus(record: BorrowRecord): 'returned' | 'overdue' | 'due-soon' | 'active' {
  if (record.status === 'returned') {
    return 'returned';
  }

  const diff = getDaysDifference(record.dueDate);
  if (diff < 0) {
    return 'overdue';
  }
  if (diff <= 2) {
    return 'due-soon';
  }
  return 'active';
}

/**
 * Calculate simulated fine for overdue records
 */
export function calculateOverdueFine(record: BorrowRecord, ratePerDay: number): number {
  if (record.status === 'returned') {
    return record.fineAmount || 0;
  }
  const diff = getDaysDifference(record.dueDate);
  if (diff < 0) {
    return Math.abs(diff) * ratePerDay;
  }
  return 0;
}
