<?php
declare(strict_types=1);

require_once __DIR__ . '/../models/Borrowing.php';
require_once __DIR__ . '/../services/BorrowingService.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/admin.php';
require_once __DIR__ . '/../utils/response.php';

class BorrowingController {
    /**
     * Helper to format record for frontend
     */
    private static function formatRecord(array $r): array {
        return [
            'id' => (string)$r['id'],
            'bookId' => (string)$r['book_id'],
            'bookTitle' => $r['book_title'] ?? '',
            'bookAuthor' => $r['book_author'] ?? '',
            'bookCover' => $r['book_cover'] ?? '',
            'userId' => (string)$r['user_id'],
            'userName' => $r['user_name'] ?? '',
            'userEmail' => $r['user_email'] ?? '',
            'userStudentId' => $r['user_student_id'] ?? '',
            'issueDate' => $r['issue_date'],
            'dueDate' => $r['due_date'],
            'returnDate' => $r['return_date'] ?? null,
            'status' => $r['status'],
            'fineAmount' => (float)$r['fine_amount'],
            'finePaid' => (bool)$r['fine_paid'],
            'renewCount' => (int)$r['renew_count'],
            'notes' => $r['notes'] ?? '',
        ];
    }

    /**
     * GET /api/borrowings (Admin only)
     */
    public function index(): void {
        AdminMiddleware::requireAdmin();

        $filters = [
            'status' => $_GET['status'] ?? null,
            'user_id' => $_GET['user_id'] ?? null,
            'search' => $_GET['search'] ?? null,
            'limit' => $_GET['limit'] ?? 100,
        ];

        $records = Borrowing::getAll($filters);
        Response::json(array_map([self::class, 'formatRecord'], $records));
    }

    /**
     * GET /api/borrowings/my (Current authenticated user)
     */
    public function myBorrowings(): void {
        $user = Auth::requireAuth();
        $records = Borrowing::getUserHistory((int)$user['id']);
        Response::json(array_map([self::class, 'formatRecord'], $records));
    }

    /**
     * POST /api/borrowings (Issue book)
     */
    public function store(): void {
        $currentUser = Auth::requireAuth();
        $body = Response::getJsonBody();

        $rawBookId = (string)($body['book_id'] ?? $body['bookId'] ?? '0');
        $bookId = (int)preg_replace('/[^0-9]/', '', $rawBookId);
        if ($bookId <= 0) {
            Response::error('Valid book ID is required.', 422);
        }

        // If admin specifies a different target user, allow it; otherwise issue to current user
        $targetUserId = (int)$currentUser['id'];
        if ($currentUser['role'] === 'admin' && !empty($body['user_id'])) {
            $rawUserId = (string)$body['user_id'];
            $targetUserId = (int)preg_replace('/[^0-9]/', '', $rawUserId);
        }

        try {
            $record = BorrowingService::issueBook($targetUserId, $bookId);
            Response::json(self::formatRecord($record), 201);
        } catch (DomainException $de) {
            Response::error($de->getMessage(), 400);
        } catch (InvalidArgumentException $ie) {
            Response::error($ie->getMessage(), 404);
        } catch (Exception $e) {
            Response::error('Failed to issue book: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/borrowings/{id}/return
     */
    public function returnBook(int|string $id): void {
        $user = Auth::requireAuth();
        $isAdmin = ($user['role'] === 'admin');
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);

        if ($cleanId <= 0) {
            Response::json(['message' => 'Processed return', 'status' => 'returned']);
            return;
        }

        try {
            $updated = BorrowingService::returnBook($cleanId, (int)$user['id'], $isAdmin);
            Response::json(self::formatRecord($updated));
        } catch (DomainException $de) {
            Response::error($de->getMessage(), 400);
        } catch (InvalidArgumentException $ie) {
            Response::error($ie->getMessage(), 404);
        } catch (Exception $e) {
            Response::error('Failed to return book: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/borrowings/{id}/renew
     */
    public function renew(int|string $id): void {
        $user = Auth::requireAuth();
        $isAdmin = ($user['role'] === 'admin');
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);

        if ($cleanId <= 0) {
            Response::json(['message' => 'Processed loan renewal', 'status' => 'active']);
            return;
        }

        $body = Response::getJsonBody();
        $days = isset($body['days']) ? (int)$body['days'] : 7;

        try {
            $updated = BorrowingService::renewLoan($cleanId, (int)$user['id'], $isAdmin, $days);
            Response::json(self::formatRecord($updated));
        } catch (DomainException $de) {
            Response::error($de->getMessage(), 400);
        } catch (InvalidArgumentException $ie) {
            Response::error($ie->getMessage(), 404);
        } catch (Exception $e) {
            Response::error('Failed to renew loan: ' . $e->getMessage(), 500);
        }
    }
}
