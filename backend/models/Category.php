<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/validation.php';

class Category {
    public static function getAll(): array {
        $pdo = Database::getConnection();
        $sql = 'SELECT c.*, COUNT(b.id) AS book_count 
                FROM categories c 
                LEFT JOIN books b ON b.category_id = c.id 
                GROUP BY c.id 
                ORDER BY c.name ASC';
        return $pdo->query($sql)->fetchAll();
    }

    public static function findById(int $id): ?array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT c.*, COUNT(b.id) AS book_count 
                               FROM categories c 
                               LEFT JOIN books b ON b.category_id = c.id 
                               WHERE c.id = ? 
                               GROUP BY c.id 
                               LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findBySlug(string $slug): ?array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM categories WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function create(array $data): int {
        $pdo = Database::getConnection();
        $slug = !empty($data['slug']) ? Validation::slugify($data['slug']) : Validation::slugify($data['name']);
        
        $sql = 'INSERT INTO categories (name, slug, description, icon_name) VALUES (?, ?, ?, ?)';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['name'],
            $slug,
            $data['description'] ?? null,
            $data['icon_name'] ?? 'BookOpen',
        ]);
        return (int)$pdo->lastInsertId();
    }

    public static function update(int $id, array $data): bool {
        $pdo = Database::getConnection();
        $fields = [];
        $params = [];

        if (isset($data['name'])) {
            $fields[] = 'name = ?';
            $params[] = $data['name'];
        }
        if (isset($data['slug'])) {
            $fields[] = 'slug = ?';
            $params[] = Validation::slugify($data['slug']);
        }
        if (array_key_exists('description', $data)) {
            $fields[] = 'description = ?';
            $params[] = $data['description'];
        }
        if (isset($data['icon_name'])) {
            $fields[] = 'icon_name = ?';
            $params[] = $data['icon_name'];
        }

        if (empty($fields)) {
            return false;
        }

        $params[] = $id;
        $sql = 'UPDATE categories SET ' . implode(', ', $fields) . ' WHERE id = ?';
        return $pdo->prepare($sql)->execute($params);
    }

    public static function hasBooks(int $id): bool {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM books WHERE category_id = ?');
        $stmt->execute([$id]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public static function delete(int $id): bool {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('DELETE FROM categories WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
