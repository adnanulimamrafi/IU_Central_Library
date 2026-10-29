<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

class Book {
    public static function findById(int|string $id): ?array {
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        if ($cleanId <= 0) return null;
        $pdo = Database::getConnection();
        $sql = 'SELECT b.*, c.name AS category_name, c.slug AS category_slug 
                FROM books b 
                JOIN categories c ON c.id = b.category_id 
                WHERE b.id = ? 
                LIMIT 1';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$cleanId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findByIsbn(string $isbn): ?array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM books WHERE isbn = ? LIMIT 1');
        $stmt->execute([trim($isbn)]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function getAll(array $filters = []): array {
        $pdo = Database::getConnection();
        $params = [];

        $sql = 'SELECT b.*, c.name AS category_name, c.slug AS category_slug 
                FROM books b 
                JOIN categories c ON c.id = b.category_id 
                WHERE 1=1';

        // Search in title, author, isbn
        if (!empty($filters['search'])) {
            $term = '%' . trim($filters['search']) . '%';
            $sql .= ' AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        // Category filter (id or slug)
        if (!empty($filters['category_id'])) {
            $sql .= ' AND b.category_id = ?';
            $params[] = (int)$filters['category_id'];
        } elseif (!empty($filters['category'])) {
            $sql .= ' AND (c.slug = ? OR c.name = ?)';
            $params[] = trim($filters['category']);
            $params[] = trim($filters['category']);
        }

        // Availability filter
        if (!empty($filters['availability'])) {
            if ($filters['availability'] === 'available') {
                $sql .= ' AND b.available_copies > 0';
            } elseif ($filters['availability'] === 'borrowed' || $filters['availability'] === 'unavailable') {
                $sql .= ' AND b.available_copies = 0';
            }
        }

        // Publication year filter
        if (!empty($filters['publication_year'])) {
            $sql .= ' AND b.publication_year = ?';
            $params[] = (int)$filters['publication_year'];
        }

        // Featured filter
        if (isset($filters['featured'])) {
            $sql .= ' AND b.featured = ?';
            $params[] = $filters['featured'] ? 1 : 0;
        }

        // Sorting
        $sortBy = $filters['sort'] ?? 'newest';
        switch ($sortBy) {
            case 'title_asc':
            case 'title':
                $sql .= ' ORDER BY b.title ASC';
                break;
            case 'title_desc':
                $sql .= ' ORDER BY b.title DESC';
                break;
            case 'author':
                $sql .= ' ORDER BY b.author ASC';
                break;
            case 'year':
            case 'year_desc':
                $sql .= ' ORDER BY b.publication_year DESC';
                break;
            case 'year_asc':
                $sql .= ' ORDER BY b.publication_year ASC';
                break;
            case 'popular':
            case 'rating':
                $sql .= ' ORDER BY b.rating DESC, b.id DESC';
                break;
            case 'newest':
            default:
                $sql .= ' ORDER BY b.id DESC';
                break;
        }

        // Pagination
        $limit = isset($filters['limit']) ? max(1, min(100, (int)$filters['limit'])) : 50;
        $page = isset($filters['page']) ? max(1, (int)$filters['page']) : 1;
        $offset = ($page - 1) * $limit;

        $sql .= " LIMIT {$limit} OFFSET {$offset}";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function countAll(array $filters = []): int {
        $pdo = Database::getConnection();
        $params = [];

        $sql = 'SELECT COUNT(*) 
                FROM books b 
                JOIN categories c ON c.id = b.category_id 
                WHERE 1=1';

        if (!empty($filters['search'])) {
            $term = '%' . trim($filters['search']) . '%';
            $sql .= ' AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        if (!empty($filters['category_id'])) {
            $sql .= ' AND b.category_id = ?';
            $params[] = (int)$filters['category_id'];
        } elseif (!empty($filters['category'])) {
            $sql .= ' AND (c.slug = ? OR c.name = ?)';
            $params[] = trim($filters['category']);
            $params[] = trim($filters['category']);
        }

        if (!empty($filters['availability'])) {
            if ($filters['availability'] === 'available') {
                $sql .= ' AND b.available_copies > 0';
            } elseif ($filters['availability'] === 'borrowed' || $filters['availability'] === 'unavailable') {
                $sql .= ' AND b.available_copies = 0';
            }
        }

        if (!empty($filters['publication_year'])) {
            $sql .= ' AND b.publication_year = ?';
            $params[] = (int)$filters['publication_year'];
        }

        if (isset($filters['featured'])) {
            $sql .= ' AND b.featured = ?';
            $params[] = $filters['featured'] ? 1 : 0;
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn();
    }

    public static function create(array $data): int {
        $pdo = Database::getConnection();
        $sql = 'INSERT INTO books (title, author, isbn, category_id, publication_year, description, cover_image, total_copies, available_copies, publisher, pages, language, shelf_location, rating, featured) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        $stmt = $pdo->prepare($sql);
        $total = max(1, (int)($data['total_copies'] ?? 1));
        $available = isset($data['available_copies']) ? max(0, min($total, (int)$data['available_copies'])) : $total;

        $stmt->execute([
            $data['title'],
            $data['author'],
            $data['isbn'],
            $data['category_id'],
            $data['publication_year'],
            $data['description'],
            $data['cover_image'] ?? null,
            $total,
            $available,
            $data['publisher'] ?? null,
            $data['pages'] ?? null,
            $data['language'] ?? 'English',
            $data['shelf_location'] ?? null,
            $data['rating'] ?? 4.5,
            !empty($data['featured']) ? 1 : 0,
        ]);
        return (int)$pdo->lastInsertId();
    }

    public static function update(int|string $id, array $data): bool {
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        if ($cleanId <= 0) return false;
        $pdo = Database::getConnection();
        $fields = [];
        $params = [];

        $allowed = [
            'title', 'author', 'isbn', 'category_id', 'publication_year', 
            'description', 'cover_image', 'total_copies', 'available_copies', 
            'publisher', 'pages', 'language', 'shelf_location', 'rating', 'featured'
        ];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "`{$field}` = ?";
                $params[] = $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $params[] = $cleanId;
        $sql = 'UPDATE books SET ' . implode(', ', $fields) . ' WHERE id = ?';
        return $pdo->prepare($sql)->execute($params);
    }

    public static function hasActiveBorrowings(int|string $id): bool {
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        if ($cleanId <= 0) return false;
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM borrowings WHERE book_id = ? AND status = 'active'");
        $stmt->execute([$cleanId]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public static function delete(int|string $id): bool {
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        if ($cleanId <= 0) return false;
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('DELETE FROM books WHERE id = ?');
        return $stmt->execute([$cleanId]);
    }
}
