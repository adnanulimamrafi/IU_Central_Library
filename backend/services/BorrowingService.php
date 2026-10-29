<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Book.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Borrowing.php';
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../models/Setting.php';

class BorrowingService {
    /**
     * Concurrency-safe issue of a book to a user
     */
    public static function issueBook(int $userId, int $bookId, ?int $durationDays = null): array {
        $pdo = Database::getConnection();
        $isDriverSqlite = (Database::getDriver() === 'sqlite');

        // Check user status
        $user = User::findById($userId);
        if (!$user) {
            throw new InvalidArgumentException('User not found.');
        }
        if ($user['status'] !== 'active') {
            throw new DomainException('User account is suspended and cannot borrow books.');
        }

        // Fetch settings
        $settings = Setting::getAll();
        $maxLimit = $settings['maxBorrowLimit'];
        $loanDays = $durationDays ?? $settings['defaultLoanDurationDays'];

        // Begin transaction
        $pdo->beginTransaction();

        try {
            // Check active borrowing limit
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM borrowings WHERE user_id = ? AND status = 'active'");
            $stmt->execute([$userId]);
            $activeCount = (int)$stmt->fetchColumn();

            if ($activeCount >= $maxLimit) {
                throw new DomainException("Borrowing limit reached. You cannot borrow more than {$maxLimit} books at a time.");
            }

            // Check if user already currently has this book borrowed
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM borrowings WHERE user_id = ? AND book_id = ? AND status = 'active'");
            $stmt->execute([$userId, $bookId]);
            if ((int)$stmt->fetchColumn() > 0) {
                throw new DomainException('You already have an active borrowed copy of this book.');
            }

            // Lock book row to prevent race conditions
            $lockSql = $isDriverSqlite 
                ? 'SELECT id, title, available_copies, total_copies FROM books WHERE id = ?' 
                : 'SELECT id, title, available_copies, total_copies FROM books WHERE id = ? FOR UPDATE';
            
            $stmt = $pdo->prepare($lockSql);
            $stmt->execute([$bookId]);
            $book = $stmt->fetch();

            if (!$book) {
                throw new InvalidArgumentException('Book not found in catalogue.');
            }

            if ((int)$book['available_copies'] <= 0) {
                throw new DomainException('All copies of this book are currently on loan.');
            }

            // Decrement available copies
            $stmt = $pdo->prepare('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?');
            $stmt->execute([$bookId]);

            // Calculate dates
            $issueDate = date('Y-m-d H:i:s');
            $dueDate = date('Y-m-d H:i:s', strtotime("+{$loanDays} days"));

            // Insert borrowing record
            $stmt = $pdo->prepare('INSERT INTO borrowings (user_id, book_id, issue_date, due_date, status, fine_amount, fine_paid, renew_count) 
                                   VALUES (?, ?, ?, ?, ?, 0.00, 0, 0)');
            $stmt->execute([$userId, $bookId, $issueDate, $dueDate, 'active']);
            $borrowId = (int)$pdo->lastInsertId();

            // Notify user
            $dueDateFormatted = date('M d, Y', strtotime($dueDate));
            Notification::create([
                'user_id' => $userId,
                'title' => 'Book Borrowed Successfully',
                'message' => "You have borrowed \"{$book['title']}\". It is due on {$dueDateFormatted}.",
                'type' => 'success',
                'action_url' => '/dashboard/my-books',
            ]);

            $pdo->commit();

            return Borrowing::findById($borrowId) ?? [];
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Concurrency-safe return of a borrowed book and inventory restoration
     */
    public static function returnBook(int $borrowId, ?int $requestingUserId = null, bool $isAdmin = false): array {
        $pdo = Database::getConnection();
        $isDriverSqlite = (Database::getDriver() === 'sqlite');

        $pdo->beginTransaction();

        try {
            // Lock borrowing row
            $lockSql = $isDriverSqlite
                ? 'SELECT * FROM borrowings WHERE id = ?'
                : 'SELECT * FROM borrowings WHERE id = ? FOR UPDATE';

            $stmt = $pdo->prepare($lockSql);
            $stmt->execute([$borrowId]);
            $record = $stmt->fetch();

            if (!$record) {
                throw new InvalidArgumentException('Borrowing record not found.');
            }

            // Check permissions: either admin or the owner
            if (!$isAdmin && $requestingUserId !== null && (int)$record['user_id'] !== $requestingUserId) {
                throw new DomainException('You are not authorized to return this borrowing record.');
            }

            if ($record['status'] === 'returned') {
                throw new DomainException('This book has already been returned.');
            }

            $bookId = (int)$record['book_id'];
            $returnDate = date('Y-m-d H:i:s');

            // Calculate overdue fine if applicable
            $dueDate = strtotime($record['due_date']);
            $returnTimestamp = strtotime($returnDate);
            $fineAmount = 0.00;

            if ($returnTimestamp > $dueDate) {
                $daysOverdue = (int)ceil(($returnTimestamp - $dueDate) / 86400);
                $settings = Setting::getAll();
                $fineRate = (float)$settings['fineRatePerDay'];
                $fineAmount = round($daysOverdue * $fineRate, 2);
            }

            // Update borrowing
            $stmt = $pdo->prepare('UPDATE borrowings SET return_date = ?, status = ?, fine_amount = ? WHERE id = ?');
            $stmt->execute([$returnDate, 'returned', $fineAmount, $borrowId]);

            // Restore inventory (ensuring available_copies <= total_copies)
            $stmt = $pdo->prepare('UPDATE books SET available_copies = CASE WHEN available_copies < total_copies THEN available_copies + 1 ELSE total_copies END WHERE id = ?');
            $stmt->execute([$bookId]);

            // Fetch book title for notification
            $stmt = $pdo->prepare('SELECT title FROM books WHERE id = ?');
            $stmt->execute([$bookId]);
            $bookTitle = $stmt->fetchColumn() ?: 'Book';

            // Notify user
            Notification::create([
                'user_id' => (int)$record['user_id'],
                'title' => 'Book Returned',
                'message' => "\"{$bookTitle}\" was checked into library inventory." . ($fineAmount > 0 ? " Late fine calculated: BDT {$fineAmount}." : ''),
                'type' => $fineAmount > 0 ? 'warning' : 'info',
                'action_url' => '/dashboard/history',
            ]);

            $pdo->commit();

            return Borrowing::findById($borrowId) ?? [];
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Extend loan due date
     */
    public static function renewLoan(int $borrowId, int $requestingUserId, bool $isAdmin = false, int $days = 7): array {
        $pdo = Database::getConnection();
        $settings = Setting::getAll();

        $stmt = $pdo->prepare('SELECT br.*, b.title AS book_title FROM borrowings br LEFT JOIN books b ON b.id = br.book_id WHERE br.id = ? LIMIT 1');
        $stmt->execute([$borrowId]);
        $record = $stmt->fetch();

        if (!$record) {
            throw new InvalidArgumentException('Borrowing record not found.');
        }

        if (!$isAdmin && (int)$record['user_id'] !== $requestingUserId) {
            throw new DomainException('You are not authorized to renew this borrowing.');
        }

        if ($record['status'] !== 'active') {
            throw new DomainException('Cannot renew an already returned book.');
        }

        $maxRenewals = $settings['maxRenewals'];
        if (!$isAdmin && (int)$record['renew_count'] >= $maxRenewals) {
            throw new DomainException("Renewal limit reached. Maximum {$maxRenewals} renewals allowed.");
        }

        // Calculate new due date
        $currentDue = strtotime($record['due_date']);
        $newDue = date('Y-m-d H:i:s', strtotime("+{$days} days", $currentDue));

        $stmt = $pdo->prepare('UPDATE borrowings SET due_date = ?, renew_count = renew_count + 1 WHERE id = ?');
        $stmt->execute([$newDue, $borrowId]);

        $dueDateFormatted = date('M d, Y', strtotime($newDue));
        $bookTitle = $record['book_title'] ?? 'Book';
        Notification::create([
            'user_id' => (int)$record['user_id'],
            'title' => 'Loan Extended',
            'message' => "Loan for \"{$bookTitle}\" extended by {$days} days. New due date is {$dueDateFormatted}.",
            'type' => 'info',
            'action_url' => '/dashboard/my-books',
        ]);

        return Borrowing::findById($borrowId) ?? [];
    }
}
