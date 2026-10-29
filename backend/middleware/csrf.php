<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';

class CSRF {
    /**
     * Get or generate active CSRF token for the current session
     */
    public static function getToken(): string {
        Auth::startSession();
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    /**
     * Validate token against session token (timing-attack safe)
     */
    public static function validate(?string $token): bool {
        Auth::startSession();
        $stored = $_SESSION['csrf_token'] ?? '';
        if (empty($stored) || empty($token)) {
            return false;
        }
        return hash_equals($stored, $token);
    }
}
