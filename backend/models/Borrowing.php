<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

class Borrowing {
    public static function findById(int $id): ?array {
        $pdo = Database::getConnection();
        $sql = 'SELECT br.*, 
                       b.title AS book_title, b.author AS book_author, b.cover_image AS book_cover, b.isbn AS book_isbn,
                       u.full_name AS user_name, u.email AS user_email, u.member_id AS user_student_id, u.username AS user_username
                FROM borrowings br
                LEFT JOIN books b ON b.id = br.book_id
                LEFT JOIN users u ON u.id = br.user_id
                WHERE br.id = ?
                LIMIT 1';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function getAll(array $filters = []): array {
        $pdo = Database::getConnection();
        $params = [];

        $sql = 'SELECT br.*, 
                       b.title AS book_title, b.author AS book_author, b.cover_image AS book_cover, b.isbn AS book_isbn,
                       u.full_name AS user_name, u.email AS user_email, u.member_id AS user_student_id, u.username AS user_username
                FROM borrowings br
                LEFT JOIN books b ON b.id = br.book_id
                LEFT JOIN users u ON u.id = br.user_id
                WHERE 1=1';

        if (!empty($filters['user_id'])) {
            $sql .= ' AND br.user_id = ?';
            $params[] = (int)$filters['user_id'];
        }

        if (!empty($filters['status'])) {
            $sql .= ' AND br.status = ?';
            $params[] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $term = '%' . trim($filters['search']) . '%';
            $sql .= ' AND (b.title LIKE ? OR b.author LIKE ? OR u.full_name LIKE ? OR u.username LIKE ? OR u.member_id LIKE ?)';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= ' ORDER BY br.id DESC';

        if (!empty($filters['limit'])) {
            $limit = max(1, (int)$filters['limit']);
            $sql .= " LIMIT {$limit}";
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function getUserActiveCount(int $userId): int {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM borrowings WHERE user_id = ? AND status = 'active'");
        $stmt->execute([$userId]);
        return (int)$stmt->fetchColumn();
    }

    public static function getUserActive(int $userId): array {
        return self::getAll(['user_id' => $userId, 'status' => 'active']);
    }

    public static function getUserHistory(int $userId): array {
        return self::getAll(['user_id' => $userId]);
    }
}
