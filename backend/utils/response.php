<?php
declare(strict_types=1);

/**
 * Standard JSON Response Utilities & HTTP Status Helpers
 */

class Response {
    /**
     * Send CORS headers
     */
    public static function handleCors(): void {
        $allowedOrigin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
        
        // Accept requests from localhost Vite, XAMPP, or origin
        header("Access-Control-Allow-Origin: {$allowedOrigin}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
        header('Access-Control-Max-Age: 86400');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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
