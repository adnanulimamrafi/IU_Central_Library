export type Role = 'member' | 'admin';

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: Role;
  studentId?: string;
  department?: string;
  session?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publicationYear: number;
  description: string;
  coverImage: string;
  totalCopies: number;
  availableCopies: number;
  publisher?: string;
  pages?: number;
  language?: string;
  shelfLocation?: string;
  rating?: number;
  featured?: boolean;
  addedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  bookCount?: number;
}

export type BorrowStatus = 'active' | 'returned' | 'overdue' | 'due-soon';

export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  userId: string;
  userName: string;
  userEmail: string;
  userStudentId?: string;
  issueDate: string; // ISO date string
  dueDate: string;   // ISO date string
  returnDate: string | null; // ISO date string or null
  status: 'active' | 'returned'; // dynamic status can calculate overdue/due-soon
  fineAmount: number;
  finePaid: boolean;
  renewCount: number;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // 'all' or specific user id
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'reminder';
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

export interface LibrarySettings {
  libraryName: string;
  institutionName: string;
  departmentName: string;
  defaultLoanDurationDays: number;
  maxBorrowLimit: number;
  fineRatePerDay: number;
  currency: string;
  contactEmail: string;
  contactPhone: string;
  allowSelfRenewal: boolean;
  maxRenewals: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

export interface BookFilterParams {
  search: string;
  category: string;
  availability: 'all' | 'available' | 'borrowed';
  yearRange: [number, number];
  sortBy: 'title' | 'author' | 'newest' | 'rating' | 'popular';
}
