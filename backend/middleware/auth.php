<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

class Auth {
    /**
     * Start secure session if not started
     */
    public static function startSession(): void {
        if (session_status() === PHP_SESSION_NONE) {
            // Configure session cookie parameters
            $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
                        (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443) ||
                        (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') ||
                        (!empty($_SERVER['HTTP_X_FORWARDED_SSL']) && strtolower($_SERVER['HTTP_X_FORWARDED_SSL']) === 'on') ||
                        (getenv('SESSION_SECURE') === 'true') ||
                        ((getenv('APP_ENV') ?: ($_ENV['APP_ENV'] ?? '')) === 'production');

            // Cross-site cookie support (Vercel -> Alwaysdata) requires SameSite=None and Secure=true over HTTPS.
            // On plain HTTP (local dev), browsers reject SameSite=None, so fallback to Lax and Secure=false.
            $sameSite = $isSecure ? 'None' : 'Lax';

            session_set_cookie_params([
                'lifetime' => 86400, // 24 hours
                'path' => '/',
                'domain' => '',
                'secure' => $isSecure,
                'httponly' => true,
                'samesite' => $sameSite,
            ]);

            session_start();
        }
    }

    /**
     * Get currently logged-in user from session and DB
     */
    public static function getUser(): ?array {
        self::startSession();

        if (empty($_SESSION['user_id'])) {
            return null;
        }

        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare('SELECT id, username, full_name, email, role, member_id, department, session, phone, bio, avatar, status, created_at FROM users WHERE id = ? LIMIT 1');
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();

            if (!$user || $user['status'] !== 'active') {
                // If user is disabled or removed, destroy session
                self::logout();
                return null;
            }

            return $user;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Require authentication; aborts with 401 if unauthenticated
     */
    public static function requireAuth(): array {
        $user = self::getUser();
        if (!$user) {
            Response::error('Authentication required. Please sign in.', 401);
        }
        return $user;
    }

    /**
     * Store user in session and regenerate session ID to prevent fixation
     */
    public static function loginUser(array $user): void {
        self::startSession();
        session_regenerate_id(true);

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['login_time'] = time();

        // Refresh CSRF token on login
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    /**
     * Clear session completely
     */
    public static function logout(): void {
        self::startSession();
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                [
                    'expires' => time() - 42000,
                    'path' => $params['path'],
                    'domain' => $params['domain'],
                    'secure' => $params['secure'],
                    'httponly' => $params['httponly'],
                    'samesite' => $params['samesite'] ?? 'Lax',
                ]
            );
        }

        session_destroy();
    }
}
