<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/../utils/response.php';

class AdminMiddleware {
    /**
     * Require that current user is authenticated and has admin role
     */
    public static function requireAdmin(): array {
        $user = Auth::requireAuth();
        if ($user['role'] !== 'admin') {
            Response::error('Access denied. Administrator privileges required.', 403);
        }
        return $user;
    }
}
