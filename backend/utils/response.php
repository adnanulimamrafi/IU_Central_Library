<?php
declare(strict_types=1);

/**
 * Standard JSON Response Utilities & HTTP Status Helpers
 */

class Response {
    /**
     * Determine if an origin is allowed by CORS policy
     */
    public static function isAllowedOrigin(string $origin): bool {
        $envOrigins = getenv('CORS_ALLOWED_ORIGIN') ?: ($_ENV['CORS_ALLOWED_ORIGIN'] ?? '');
        if (!empty($envOrigins)) {
            $configured = array_map('trim', explode(',', $envOrigins));
            if (in_array($origin, $configured, true)) {
                return true;
            }
        }

        // Live production domain
        if ($origin === 'https://iu-central-library.vercel.app') {
            return true;
        }

        // Vercel preview deployments (e.g. https://iu-central-library-xxx.vercel.app)
        if (preg_match('#^https://iu-central-library(-[a-z0-9_-]+)?\.vercel\.app$#i', $origin)) {
            return true;
        }

        // Local development environments
        if (preg_match('#^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$#i', $origin)) {
            return true;
        }

        return false;
    }

    /**
     * Send CORS headers
     */
    public static function handleCors(): void {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedOrigin = null;

        if (!empty($origin) && self::isAllowedOrigin($origin)) {
            $allowedOrigin = $origin;
        } elseif (empty($origin)) {
            // Default fallback for direct non-browser requests
            $envOrigins = getenv('CORS_ALLOWED_ORIGIN') ?: ($_ENV['CORS_ALLOWED_ORIGIN'] ?? '');
            $allowedOrigin = !empty($envOrigins) ? trim(explode(',', $envOrigins)[0]) : 'https://iu-central-library.vercel.app';
        }

        if ($allowedOrigin !== null) {
            header("Access-Control-Allow-Origin: {$allowedOrigin}");
            header('Access-Control-Allow-Credentials: true');
        }

        header('Vary: Origin');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token, X-Setup-Key, Accept, Origin');
        header('Access-Control-Max-Age: 86400');

        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit(0);
        }
    }

    /**
     * Output successful JSON response and exit
     */
    public static function json(mixed $data, int $status = 200, array $extra = []): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');

        $response = array_merge([
            'success' => true,
            'data' => $data,
        ], $extra);

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit(0);
    }

    /**
     * Output error JSON response and exit
     */
    public static function error(string $message, int $status = 400, ?array $errors = null): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');

        $response = [
            'success' => false,
            'error' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit(0);
    }

    /**
     * Parse incoming JSON request body
     */
    public static function getJsonBody(): array {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (str_contains($contentType, 'application/json')) {
            $raw = file_get_contents('php://input');
            if ($raw === false || trim($raw) === '') {
                return [];
            }
            $data = json_decode($raw, true);
            return is_array($data) ? $data : [];
        }
        return $_POST;
    }
}
