<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

class User {
    public static function findById(int|string $id): ?array {
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        if ($cleanId <= 0) return null;
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT id, username, full_name, email, role, member_id, department, session, phone, bio, avatar, status, created_at, updated_at FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$cleanId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findByUsername(string $username): ?array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1');
        $stmt->execute([trim($username)]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findByEmail(string $email): ?array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1');
        $stmt->execute([trim($email)]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findByMemberId(string $memberId): ?array {
        $clean = trim($memberId);
        if ($clean === '') return null;
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM users WHERE LOWER(member_id) = LOWER(?) LIMIT 1');
        $stmt->execute([$clean]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function create(array $data): int {
        $pdo = Database::getConnection();
        $sql = 'INSERT INTO users (username, full_name, email, password_hash, role, member_id, department, session, phone, bio, avatar, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([
                $data['username'],
                $data['full_name'],
                $data['email'],
                $data['password_hash'],
                $data['role'] ?? 'member',
                $data['member_id'] ?? null,
                $data['department'] ?? 'Computer Science & Engineering',
                $data['session'] ?? '2021-22',
                $data['phone'] ?? null,
                $data['bio'] ?? null,
                $data['avatar'] ?? null,
                $data['status'] ?? 'active',
            ]);
            return (int)$pdo->lastInsertId();
        } catch (\PDOException $e) {
            if (str_contains($e->getMessage(), 'UNIQUE') || $e->getCode() === '23000' || $e->getCode() === 23000) {
                Response::error('An account with this username, email, or student ID already exists.', 409);
            }
            throw $e;
        }
    }

    public static function update(int|string $id, array $data): bool {
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        if ($cleanId <= 0) return false;
        $pdo = Database::getConnection();
        $fields = [];
        $params = [];

        $allowed = ['full_name', 'email', 'member_id', 'department', 'session', 'phone', 'bio', 'avatar'];
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
        $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
        return $pdo->prepare($sql)->execute($params);
    }

    public static function updateStatus(int|string $id, string $status): bool {
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        if ($cleanId <= 0) return false;
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('UPDATE users SET status = ? WHERE id = ?');
        return $stmt->execute([$status, $cleanId]);
    }

    public static function updatePassword(int|string $id, string $passwordHash): bool {
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        if ($cleanId <= 0) return false;
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
        return $stmt->execute([$passwordHash, $cleanId]);
    }

    public static function getAll(?string $role = null, ?string $status = null, ?string $search = null): array {
        $pdo = Database::getConnection();
        $sql = 'SELECT id, username, full_name, email, role, member_id, department, session, phone, bio, avatar, status, created_at FROM users WHERE 1=1';
        $params = [];

        if ($role !== null && $role !== '') {
            $sql .= ' AND role = ?';
            $params[] = $role;
        }

        if ($status !== null && $status !== '') {
            $sql .= ' AND status = ?';
            $params[] = $status;
        }

        if ($search !== null && trim($search) !== '') {
            $sql .= ' AND (full_name LIKE ? OR username LIKE ? OR email LIKE ? OR member_id LIKE ?)';
            $term = '%' . trim($search) . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= ' ORDER BY id ASC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function getMemberCount(): int {
        $pdo = Database::getConnection();
        return (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'member'")->fetchColumn();
    }
}
