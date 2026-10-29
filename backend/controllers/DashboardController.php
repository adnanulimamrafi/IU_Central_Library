<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Book.php';
require_once __DIR__ . '/../models/Borrowing.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/admin.php';
require_once __DIR__ . '/../utils/response.php';

class DashboardController {
    /**
     * GET /api/dashboard/stats (Admin overview statistics & chart data)
     */
    public function stats(): void {
        AdminMiddleware::requireAdmin();
        $pdo = Database::getConnection();

        // Total books & total copies
        $bookRow = $pdo->query('SELECT COUNT(*) AS total_titles, SUM(total_copies) AS total_copies, SUM(available_copies) AS total_available FROM books')->fetch();
        $totalTitles = (int)($bookRow['total_titles'] ?? 0);
        $totalCopies = (int)($bookRow['total_copies'] ?? 0);
        $availableCopies = (int)($bookRow['total_available'] ?? 0);

        // Total members
        $totalMembers = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'member'")->fetchColumn();

        // Active borrowings
        $activeBorrowings = (int)$pdo->query("SELECT COUNT(*) FROM borrowings WHERE status = 'active'")->fetchColumn();

        // Overdue count
        $now = date('Y-m-d H:i:s');
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM borrowings WHERE status = 'active' AND due_date < ?");
        $stmt->execute([$now]);
        $overdueCount = (int)$stmt->fetchColumn();

        // Returned count
        $returnedCount = (int)$pdo->query("SELECT COUNT(*) FROM borrowings WHERE status = 'returned'")->fetchColumn();

        // Total fines
        $totalFines = (float)$pdo->query("SELECT SUM(fine_amount) FROM borrowings")->fetchColumn();

        // Categories count
        $totalCategories = (int)$pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();

        // Category distribution for charts
        $categoriesDist = $pdo->query("
            SELECT c.name, COUNT(b.id) AS value 
            FROM categories c 
            LEFT JOIN books b ON b.category_id = c.id 
            GROUP BY c.id, c.name 
            ORDER BY value DESC 
            LIMIT 6
        ")->fetchAll();

        // Monthly borrowings trend (last 6 months)
        $monthlyBorrowings = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = date('Y-m-01 00:00:00', strtotime("-{$i} month"));
            $monthEnd = date('Y-m-t 23:59:59', strtotime("-{$i} month"));
            $monthLabel = date('M', strtotime("-{$i} month"));

            $bStmt = $pdo->prepare("SELECT COUNT(*) FROM borrowings WHERE issue_date BETWEEN ? AND ?");
            $bStmt->execute([$monthStart, $monthEnd]);
            $bCount = (int)$bStmt->fetchColumn();

            $rStmt = $pdo->prepare("SELECT COUNT(*) FROM borrowings WHERE return_date BETWEEN ? AND ?");
            $rStmt->execute([$monthStart, $monthEnd]);
            $rCount = (int)$rStmt->fetchColumn();

            $monthlyBorrowings[] = [
                'month' => $monthLabel,
                'borrowed' => $bCount,
                'returned' => $rCount,
            ];
        }

        // Recent activity
        $recent = Borrowing::getAll(['limit' => 5]);

        Response::json([
            'totalTitles' => $totalTitles,
            'totalCopies' => $totalCopies,
            'availableCopies' => $availableCopies,
            'totalMembers' => $totalMembers,
            'activeBorrowings' => $activeBorrowings,
            'overdueCount' => $overdueCount,
            'returnedCount' => $returnedCount,
            'totalFines' => $totalFines,
            'totalCategories' => $totalCategories,
            'categoryDistribution' => $categoriesDist,
            'monthlyBorrowings' => $monthlyBorrowings,
            'recentActivity' => $recent,
        ]);
    }

    /**
     * GET /api/dashboard/member (Current member's dashboard overview)
     */
    public function memberStats(): void {
        $user = Auth::requireAuth();
        $userId = (int)$user['id'];
        $pdo = Database::getConnection();

        // Active count
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM borrowings WHERE user_id = ? AND status = 'active'");
        $stmt->execute([$userId]);
        $activeCount = (int)$stmt->fetchColumn();

        // Overdue count
        $now = date('Y-m-d H:i:s');
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM borrowings WHERE user_id = ? AND status = 'active' AND due_date < ?");
        $stmt->execute([$userId, $now]);
        $overdueCount = (int)$stmt->fetchColumn();

        // History count
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM borrowings WHERE user_id = ?");
        $stmt->execute([$userId]);
        $totalBorrowed = (int)$stmt->fetchColumn();

        // Favourites count
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM favourites WHERE user_id = ?");
        $stmt->execute([$userId]);
        $favouritesCount = (int)$stmt->fetchColumn();

        // Due soon list (active, due in next 3 days)
        $threeDaysLater = date('Y-m-d H:i:s', strtotime('+3 days'));
        $stmt = $pdo->prepare("
            SELECT br.*, b.title AS book_title, b.author AS book_author, b.cover_image AS book_cover 
            FROM borrowings br
            JOIN books b ON b.id = br.book_id
            WHERE br.user_id = ? AND br.status = 'active' AND br.due_date BETWEEN ? AND ?
            ORDER BY br.due_date ASC
        ");
        $stmt->execute([$userId, $now, $threeDaysLater]);
        $dueSoon = $stmt->fetchAll();

        // Currently borrowed books
        $stmt = $pdo->prepare("
            SELECT br.*, b.title AS book_title, b.author AS book_author, b.cover_image AS book_cover 
            FROM borrowings br
            JOIN books b ON b.id = br.book_id
            WHERE br.user_id = ? AND br.status = 'active'
            ORDER BY br.due_date ASC
        ");
        $stmt->execute([$userId]);
        $activeBooks = $stmt->fetchAll();

        Response::json([
            'activeCount' => $activeCount,
            'overdueCount' => $overdueCount,
            'totalBorrowed' => $totalBorrowed,
            'favouritesCount' => $favouritesCount,
            'dueSoon' => $dueSoon,
            'activeBooks' => $activeBooks,
        ]);
    }

    /**
     * GET /api/stats (Public library statistics for landing page)
     */
    public function publicStats(): void {
        $pdo = Database::getConnection();

        $bookRow = $pdo->query('SELECT COUNT(*) AS total_titles, SUM(total_copies) AS total_copies, SUM(available_copies) AS total_available FROM books')->fetch();
        $totalTitles = (int)($bookRow['total_titles'] ?? 0);
        $totalCopies = (int)($bookRow['total_copies'] ?? 0);
        $availableCopies = (int)($bookRow['total_available'] ?? 0);

        $totalMembers = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'member'")->fetchColumn();
        $activeBorrowings = (int)$pdo->query("SELECT COUNT(*) FROM borrowings WHERE status = 'active'")->fetchColumn();
        $totalCategories = (int)$pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();

        Response::json([
            'totalTitles' => $totalTitles,
            'totalCopies' => $totalCopies,
            'availableCopies' => $availableCopies,
            'totalMembers' => $totalMembers,
            'activeLoans' => $activeBorrowings,
            'totalCategories' => $totalCategories,
        ]);
    }
}
