import { BorrowRecord, User } from '../types';

/**
 * Accurately determines if a borrow record belongs to the given user,
 * safely handling differences between database numeric IDs ('2') and mock string IDs ('u-tanvir'),
 * as well as matching student ID roll numbers and email addresses without cross-user leakage.
 */
export function isUserRecord(record: BorrowRecord, user: User | null): boolean {
  if (!user) return false;

  // Direct ID match
  if (String(record.userId) === String(user.id)) {
    return true;
  }

  // Tanvir demo account mapping: allow mock ID 'u-tanvir' or database ID '2' ONLY for Tanvir
  const isTanvir =
    (user.username && user.username.toLowerCase() === 'tanvir') ||
    (user.email && user.email.toLowerCase() === 'tanvir@student.edu') ||
    user.id === 'u-tanvir' ||
    user.id === '2';

  if (isTanvir && (record.userId === 'u-tanvir' || String(record.userId) === '2')) {
    return true;
  }

  // Student Roll / ID match
  if (
    user.studentId &&
    record.userStudentId &&
    record.userStudentId.trim().toLowerCase() === user.studentId.trim().toLowerCase()
  ) {
    return true;
  }

  // Email address match
  if (
    user.email &&
    record.userEmail &&
    record.userEmail.trim().toLowerCase() === user.email.trim().toLowerCase()
  ) {
    return true;
  }

  return false;
}

/**
 * Checks if a borrow record corresponds to a given book,
 * handling string prefix formats like 'b-1' vs numeric '1' and exact titles.
 */
export function isRecordForBook(
  record: BorrowRecord,
  bookId: string | number,
  bookTitle?: string
): boolean {
  const targetIdStr = String(bookId);
  const recordIdStr = String(record.bookId);

  if (
    recordIdStr === targetIdStr ||
    `b-${recordIdStr}` === targetIdStr ||
    recordIdStr === `b-${targetIdStr}`
  ) {
    return true;
  }

  if (
    bookTitle &&
    record.bookTitle &&
    record.bookTitle.trim().toLowerCase() === bookTitle.trim().toLowerCase()
  ) {
    return true;
  }

  return false;
}
