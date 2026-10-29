<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

class Notification {
    public static function getUserNotifications(int $userId, int $limit = 30): array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM notifications 
                               WHERE user_id = ? OR user_id IS NULL 
                               ORDER BY id DESC 
                               LIMIT ?');
        $stmt->bindValue(1, $userId, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public static function create(array $data): int {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('INSERT INTO notifications (user_id, title, message, type, action_url, is_read) 
                               VALUES (?, ?, ?, ?, ?, 0)');
        $stmt->execute([
            $data['user_id'] ?? null,
            $data['title'],
            $data['message'],
            $data['type'] ?? 'info',
            $data['action_url'] ?? null,
        ]);
        return (int)$pdo->lastInsertId();
    }

    public static function markAsRead(int $id, int $userId): bool {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND (user_id = ? OR user_id IS NULL)');
        return $stmt->execute([$id, $userId]);
    }

    public static function markAllAsRead(int $userId): bool {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? OR user_id IS NULL');
        return $stmt->execute([$userId]);
    }
}
