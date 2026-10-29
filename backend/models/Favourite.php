<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

class Favourite {
    public static function getUserFavouriteIds(int $userId): array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT book_id FROM favourites WHERE user_id = ? ORDER BY id DESC');
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public static function getUserFavouriteBooks(int $userId): array {
        $pdo = Database::getConnection();
        $sql = 'SELECT b.*, c.name AS category_name, c.slug AS category_slug, f.created_at AS favourited_at 
                FROM favourites f 
                JOIN books b ON b.id = f.book_id 
                JOIN categories c ON c.id = b.category_id 
                WHERE f.user_id = ? 
                ORDER BY f.id DESC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function toggle(int $userId, int $bookId): bool {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT id FROM favourites WHERE user_id = ? AND book_id = ? LIMIT 1');
        $stmt->execute([$userId, $bookId]);
        $existing = $stmt->fetch();

        if ($existing) {
            $del = $pdo->prepare('DELETE FROM favourites WHERE id = ?');
            $del->execute([$existing['id']]);
            return false; // Removed
        } else {
            $ins = $pdo->prepare('INSERT INTO favourites (user_id, book_id) VALUES (?, ?)');
            $ins->execute([$userId, $bookId]);
            return true; // Added
        }
    }
}
