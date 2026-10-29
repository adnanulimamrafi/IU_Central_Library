import {
  Book,
  Category,
  User,
  BorrowRecord,
  NotificationItem,
  LibrarySettings,
} from '../types';
import {
  INITIAL_BOOKS,
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_BORROW_RECORDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  INITIAL_FAVOURITES,
  DEMO_CREDENTIALS,
} from './mockData';
import { calculateDueDate, calculateOverdueFine } from '../utils/dates';
import { generateSvgBookCover } from '../utils/bookCovers';

const STORAGE_KEYS = {
  BOOKS: 'lms_books_v2',
  CATEGORIES: 'lms_categories_v2',
  USERS: 'lms_users_v2',
  PASSWORDS: 'lms_passwords_v2',
  BORROW_RECORDS: 'lms_borrow_records_v2',
  NOTIFICATIONS: 'lms_notifications_v2',
  SETTINGS: 'lms_settings_v2',
  CURRENT_USER: 'lms_current_user_v2',
  FAVOURITES: 'lms_favourites_v2',
  RECENTLY_VIEWED: 'lms_recently_viewed_v2',
  INITIALIZED: 'lms_initialized_v2',
};

class StorageService {
  constructor() {
    this.init();
  }

  public init(forceReset = false): void {
    const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInitialized || forceReset) {
      // Also check if v1 user existed to preserve their session
      const prevUser = localStorage.getItem('lms_current_user_v1');
      
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(DEMO_CREDENTIALS));
      localStorage.setItem(STORAGE_KEYS.BORROW_RECORDS, JSON.stringify(INITIAL_BORROW_RECORDS));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.FAVOURITES, JSON.stringify(INITIAL_FAVOURITES));
      localStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(['b-1', 'b-2', 'b-4']));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

      if (prevUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, prevUser);
      }
    } else {
      // Automatic data integrity check: replace any unsplash links with robust SVG covers
      this.repairBrokenCovers();
      this.ensureDemoAccounts();
    }
  }

  private ensureDemoAccounts(): void {
    try {
      const users = this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
      let usersChanged = false;

      INITIAL_USERS.forEach((initialUser) => {
        const existingIdx = users.findIndex(
          (u) =>
            (initialUser.username && u.username && u.username.toLowerCase() === initialUser.username.toLowerCase()) ||
            u.email.toLowerCase() === initialUser.email.toLowerCase()
        );

        if (existingIdx === -1) {
          users.push(initialUser);
          usersChanged = true;
        } else {
          // Keep username & studentId synchronized
          if (!users[existingIdx].username && initialUser.username) {
            users[existingIdx].username = initialUser.username;
            usersChanged = true;
          }
          if (!users[existingIdx].studentId && initialUser.studentId) {
            users[existingIdx].studentId = initialUser.studentId;
            usersChanged = true;
          }
        }
      });

      if (usersChanged) {
        this.setItem(STORAGE_KEYS.USERS, users);
      }

      const storedPasswords = this.getItem<Record<string, string>>(STORAGE_KEYS.PASSWORDS, DEMO_CREDENTIALS);
      const mergedPasswords = { ...storedPasswords, ...DEMO_CREDENTIALS };
      this.setItem(STORAGE_KEYS.PASSWORDS, mergedPasswords);
    } catch (e) {
      console.warn('Demo accounts sync error:', e);
    }
  }

  private repairBrokenCovers(): void {
    try {
      const books = this.getItem<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
      let booksChanged = false;
      books.forEach((b) => {
        if (!b.coverImage || b.coverImage.includes('unsplash.com')) {
          b.coverImage = generateSvgBookCover({
            title: b.title,
            author: b.author,
            category: b.category,
          });
          booksChanged = true;
        }
      });
      if (booksChanged) {
        this.setItem(STORAGE_KEYS.BOOKS, books);
      }

      const records = this.getItem<BorrowRecord[]>(STORAGE_KEYS.BORROW_RECORDS, INITIAL_BORROW_RECORDS);
      let recordsChanged = false;
      records.forEach((r) => {
        if (!r.bookCover || r.bookCover.includes('unsplash.com')) {
          r.bookCover = generateSvgBookCover({
            title: r.bookTitle,
            author: r.bookAuthor,
          });
          recordsChanged = true;
        }
      });
      if (recordsChanged) {
        this.setItem(STORAGE_KEYS.BORROW_RECORDS, records);
      }
    } catch (e) {
      console.warn('Cover repair check completed.', e);
    }
  }

  public resetToDefault(): void {
    this.init(true);
  }

  // Safe item getter
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage:`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage:`, e);
    }
  }

  // --- SETTINGS ---
  public getSettings(): LibrarySettings {
    return this.getItem<LibrarySettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  public updateSettings(updates: Partial<LibrarySettings>): LibrarySettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    this.setItem(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  // --- BOOKS ---
  public getBooks(): Book[] {
    return this.getItem<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  }

  public getBookById(id: string): Book | undefined {
    const books = this.getBooks();
    return books.find((b) => b.id === id);
  }

  public addBook(bookData: Omit<Book, 'id' | 'addedAt'>): Book {
    const books = this.getBooks();
    const coverImage =
      bookData.coverImage && !bookData.coverImage.includes('unsplash.com')
        ? bookData.coverImage
        : generateSvgBookCover({
            title: bookData.title,
            author: bookData.author,
            category: bookData.category,
          });

    const newBook: Book = {
      ...bookData,
      coverImage,
      id: `b-${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    books.unshift(newBook);
    this.setItem(STORAGE_KEYS.BOOKS, books);
    return newBook;
  }

  public updateBook(id: string, updates: Partial<Book>): Book {
    const books = this.getBooks();
    const index = books.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Book not found');

    const updated = { ...books[index], ...updates };
    books[index] = updated;
    this.setItem(STORAGE_KEYS.BOOKS, books);
    return updated;
  }

  public deleteBook(id: string): boolean {
    const records = this.getBorrowRecords();
    const hasActiveBorrowing = records.some(
      (r) => r.bookId === id && r.status === 'active'
    );
    if (hasActiveBorrowing) {
      throw new Error('Cannot delete this book because copies are currently borrowed by members.');
    }

    const books = this.getBooks();
    const filtered = books.filter((b) => b.id !== id);
    this.setItem(STORAGE_KEYS.BOOKS, filtered);
    return true;
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    const categories = this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const books = this.getBooks();

    // Dynamically attach count of books
    return categories.map((cat) => ({
      ...cat,
      bookCount: books.filter((b) => b.category === cat.name).length,
    }));
  }

  public addCategory(catData: Omit<Category, 'id' | 'slug'>): Category {
    const categories = this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const slug = catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
      slug,
    };
    categories.push(newCat);
    this.setItem(STORAGE_KEYS.CATEGORIES, categories);
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category {
    const categories = this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');

    const oldName = categories[index].name;
    const updated = { ...categories[index], ...updates };
    if (updates.name && updates.name !== oldName) {
      updated.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      // Update books with old category name
      const books = this.getBooks();
      let changed = false;
      books.forEach((b) => {
        if (b.category === oldName) {
          b.category = updates.name!;
          changed = true;
        }
      });
      if (changed) this.setItem(STORAGE_KEYS.BOOKS, books);
    }

    categories[index] = updated;
    this.setItem(STORAGE_KEYS.CATEGORIES, categories);
    return updated;
  }

  public deleteCategory(id: string): boolean {
    const categories = this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const category = categories.find((c) => c.id === id);
    if (!category) return false;

    const books = this.getBooks();
    const assignedBooks = books.filter((b) => b.category === category.name);
    if (assignedBooks.length > 0) {
      throw new Error(
        `Cannot delete category "${category.name}" because ${assignedBooks.length} book(s) belong to it. Please reassign the books first.`
      );
    }

    const filtered = categories.filter((c) => c.id !== id);
    this.setItem(STORAGE_KEYS.CATEGORIES, filtered);
    return true;
  }

  // --- USERS & AUTH ---
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserByUsernameOrEmail(identifier: string): User | undefined {
    if (!identifier) return undefined;
    const clean = identifier.trim().toLowerCase();
    return this.getUsers().find(
      (u) =>
        (u.username && u.username.toLowerCase() === clean) ||
        (u.email && u.email.toLowerCase() === clean)
    );
  }

  public getPasswords(): Record<string, string> {
    const stored = this.getItem<Record<string, string>>(STORAGE_KEYS.PASSWORDS, DEMO_CREDENTIALS);
    return { ...DEMO_CREDENTIALS, ...stored };
  }

  public getUserPassword(identifier: string): string | undefined {
    if (!identifier) return undefined;
    const clean = identifier.trim().toLowerCase();
    const passwords = this.getPasswords();
    if (passwords[clean]) return passwords[clean];

    const user = this.getUserByUsernameOrEmail(identifier);
    if (user) {
      if (passwords[user.email.toLowerCase()]) return passwords[user.email.toLowerCase()];
      if (user.username && passwords[user.username.toLowerCase()]) return passwords[user.username.toLowerCase()];
    }
    return undefined;
  }

  public registerUser(userData: Omit<User, 'id' | 'createdAt' | 'status'>, password: string): User {
    const users = this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      avatar:
        userData.avatar ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80`,
    };

    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);

    const passwords = this.getPasswords();
    passwords[newUser.email.toLowerCase()] = password;
    this.setItem(STORAGE_KEYS.PASSWORDS, passwords);

    // Add welcome notification
    this.addNotification({
      userId: newUser.id,
      title: 'Welcome to the Library!',
      message: `Welcome, ${newUser.name}! Your account is active. Explore our catalogue to borrow up to 5 books.`,
      type: 'info',
    });

    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');

    const updated = { ...users[index], ...updates };
    users[index] = updated;
    this.setItem(STORAGE_KEYS.USERS, users);

    // If current session user is updated, sync session
    const current = this.getCurrentUser();
    if (current && current.id === id) {
      this.setCurrentUser(updated);
    }
    return updated;
  }

  public changeUserPassword(email: string, newPassword: string): void {
    const passwords = this.getPasswords();
    passwords[email.toLowerCase()] = newPassword;
    this.setItem(STORAGE_KEYS.PASSWORDS, passwords);
  }

  public getCurrentUser(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public setCurrentUser(user: User | null): void {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      this.setItem(STORAGE_KEYS.CURRENT_USER, user);
    }
  }

  // --- BORROWING RECORDS ---
  public getBorrowRecords(): BorrowRecord[] {
    return this.getItem<BorrowRecord[]>(STORAGE_KEYS.BORROW_RECORDS, INITIAL_BORROW_RECORDS);
  }

  public borrowBook(user: User, book: Book): BorrowRecord {
    // 1. Check account status
    if (user.status === 'suspended') {
      throw new Error('Your account is currently suspended. Please contact the library administrator.');
    }

    // 2. Check book availability
    if (book.availableCopies <= 0) {
      throw new Error('Sorry, all copies of this book are currently on loan.');
    }

    // 3. Prevent duplicate active borrow of same book by same user
    const records = this.getBorrowRecords();
    const activeSameBook = records.find(
      (r) => r.userId === user.id && r.bookId === book.id && r.status === 'active'
    );
    if (activeSameBook) {
      throw new Error(`You already have an active borrowing for "${book.title}".`);
    }

    // 4. Check borrowing limit
    const settings = this.getSettings();
    const userActiveBorrowings = records.filter(
      (r) => r.userId === user.id && r.status === 'active'
    );
    if (userActiveBorrowings.length >= settings.maxBorrowLimit) {
      throw new Error(
        `You have reached the maximum active borrowing limit of ${settings.maxBorrowLimit} books. Please return a book first.`
      );
    }

    // 5. Create new borrow record
    const issueDate = new Date().toISOString();
    const dueDate = calculateDueDate(issueDate, settings.defaultLoanDurationDays);

    const newRecord: BorrowRecord = {
      id: `br-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCover: book.coverImage,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userStudentId: user.studentId,
      issueDate,
      dueDate,
      returnDate: null,
      status: 'active',
      fineAmount: 0,
      finePaid: false,
      renewCount: 0,
      notes: `Issued online via self-service for ${settings.defaultLoanDurationDays} days.`,
    };

    records.unshift(newRecord);
    this.setItem(STORAGE_KEYS.BORROW_RECORDS, records);

    // 6. Decrement available copies
    this.updateBook(book.id, {
      availableCopies: Math.max(0, book.availableCopies - 1),
    });

    // 7. Add notification for user
    this.addNotification({
      userId: user.id,
      title: 'Book Borrowed Successfully',
      message: `You borrowed "${book.title}". Due date is ${new Date(dueDate).toLocaleDateString()}.`,
      type: 'success',
      actionUrl: '/dashboard/my-books',
    });

    return newRecord;
  }

  public returnBook(recordId: string): BorrowRecord {
    const records = this.getBorrowRecords();
    const index = records.findIndex((r) => r.id === recordId);
    if (index === -1) throw new Error('Borrow record not found.');

    const record = records[index];
    if (record.status === 'returned') {
      throw new Error('This book has already been marked as returned.');
    }

    const settings = this.getSettings();
    const returnDate = new Date().toISOString();
    const overdueFine = calculateOverdueFine(record, settings.fineRatePerDay);

    const updatedRecord: BorrowRecord = {
      ...record,
      status: 'returned',
      returnDate,
      fineAmount: overdueFine,
      finePaid: overdueFine === 0,
    };

    records[index] = updatedRecord;
    this.setItem(STORAGE_KEYS.BORROW_RECORDS, records);

    // Increment available copy
    const book = this.getBookById(record.bookId);
    if (book) {
      this.updateBook(book.id, {
        availableCopies: Math.min(book.totalCopies, book.availableCopies + 1),
      });
    }

    // Add notification
    this.addNotification({
      userId: record.userId,
      title: 'Book Returned',
      message: `You successfully returned "${record.bookTitle}". Thank you!`,
      type: 'info',
      actionUrl: '/dashboard/history',
    });

    return updatedRecord;
  }

  public extendLoan(recordId: string, additionalDays = 7): BorrowRecord {
    const records = this.getBorrowRecords();
    const index = records.findIndex((r) => r.id === recordId);
    if (index === -1) throw new Error('Borrow record not found.');

    const record = records[index];
    if (record.status === 'returned') {
      throw new Error('Cannot extend a book that has already been returned.');
    }

    const settings = this.getSettings();
    if (record.renewCount >= settings.maxRenewals) {
      throw new Error(`Maximum renewal limit (${settings.maxRenewals}) reached for this book.`);
    }

    // New due date from current due date
    const currentDue = new Date(record.dueDate);
    currentDue.setDate(currentDue.getDate() + additionalDays);
    const newDueDate = currentDue.toISOString();

    const updatedRecord: BorrowRecord = {
      ...record,
      dueDate: newDueDate,
      renewCount: record.renewCount + 1,
      notes: `${record.notes || ''} [Renewed +${additionalDays} days on ${new Date().toLocaleDateString()}]`,
    };

    records[index] = updatedRecord;
    this.setItem(STORAGE_KEYS.BORROW_RECORDS, records);

    this.addNotification({
      userId: record.userId,
      title: 'Loan Extended',
      message: `Loan for "${record.bookTitle}" has been extended by ${additionalDays} days. New due date: ${currentDue.toLocaleDateString()}.`,
      type: 'info',
      actionUrl: '/dashboard/my-books',
    });

    return updatedRecord;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(userId?: string): NotificationItem[] {
    const notifs = this.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!userId) return notifs;
    return notifs.filter((n) => n.userId === 'all' || n.userId === userId);
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): NotificationItem {
    const notifs = this.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    notifs.unshift(newNotif);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const notifs = this.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  public markAllNotificationsAsRead(userId: string): void {
    const notifs = this.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = notifs.map((n) => {
      if (n.userId === 'all' || n.userId === userId) {
        return { ...n, read: true };
      }
      return n;
    });
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  // --- FAVOURITES ---
  public getFavourites(userId: string): string[] {
    const favs = this.getItem<Record<string, string[]>>(STORAGE_KEYS.FAVOURITES, INITIAL_FAVOURITES);
    return favs[userId] || [];
  }

  public toggleFavourite(userId: string, bookId: string): boolean {
    const favs = this.getItem<Record<string, string[]>>(STORAGE_KEYS.FAVOURITES, INITIAL_FAVOURITES);
    const userFavs = favs[userId] || [];
    let isFav = false;

    if (userFavs.includes(bookId)) {
      favs[userId] = userFavs.filter((id) => id !== bookId);
      isFav = false;
    } else {
      favs[userId] = [...userFavs, bookId];
      isFav = true;
    }

    this.setItem(STORAGE_KEYS.FAVOURITES, favs);
    return isFav;
  }

  // --- RECENTLY VIEWED ---
  public getRecentlyViewed(): string[] {
    return this.getItem<string[]>(STORAGE_KEYS.RECENTLY_VIEWED, ['b-1', 'b-2', 'b-4']);
  }

  public addRecentlyViewed(bookId: string): void {
    let recent = this.getRecentlyViewed();
    recent = [bookId, ...recent.filter((id) => id !== bookId)].slice(0, 8);
    this.setItem(STORAGE_KEYS.RECENTLY_VIEWED, recent);
  }

  public saveBooks(books: Book[]): void {
    this.setItem(STORAGE_KEYS.BOOKS, books);
  }

  public saveBorrowRecords(records: BorrowRecord[]): void {
    this.setItem(STORAGE_KEYS.BORROW_RECORDS, records);
  }

  public updateUserBorrowRecords(userId: string, userRecords: BorrowRecord[]): void {
    const allRecords = this.getBorrowRecords();
    const otherRecords = allRecords.filter(
      (r) =>
        String(r.userId) !== String(userId) &&
        !(userId === '2' && (r.userId === 'u-tanvir' || r.userId === '2'))
    );
    const merged = [...userRecords, ...otherRecords];
    this.setItem(STORAGE_KEYS.BORROW_RECORDS, merged);
  }
}

export const storage = new StorageService();
