<?php
declare(strict_types=1);

/**
 * Main Front Controller & API Entry Point
 * IU Central Library Management System
 */

// Error logging configuration
$isProd = (getenv('APP_ENV') ?: ($_ENV['APP_ENV'] ?? '')) === 'production';
if ($isProd) {
    ini_set('display_errors', '0');
    ini_set('display_startup_errors', '0');
    error_reporting(E_ALL);
    ini_set('log_errors', '1');
} else {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../routes/api.php';
require_once __DIR__ . '/../database/seed.php';

// Global Uncaught Exception Handler
set_exception_handler(function (Throwable $e) use ($isProd) {
    error_log('Uncaught API Exception: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
    $msg = $isProd ? 'An unexpected server error occurred.' : $e->getMessage();
    Response::error($msg, 500);
});

// Handle CORS Preflight & Headers
Response::handleCors();

// Normalize Request URI
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH) ?? '/';

// If running in subfolder like /Tanvir/backend/public/api/..., strip leading directory prefixes up to /api/
if (preg_match('#/api(/.*)?$#', $path, $matches)) {
    $path = '/api' . ($matches[1] ?? '');
}

// Special install / seed endpoint for web-based initialization
if ($path === '/api/seed' || $path === '/api/install') {
    $setupKey = getenv('SETUP_KEY') ?: ($_ENV['SETUP_KEY'] ?? '');
    $providedKey = $_GET['key'] ?? $_SERVER['HTTP_X_SETUP_KEY'] ?? '';

    if ($isProd) {
        if (empty($setupKey) || !hash_equals($setupKey, (string)$providedKey)) {
            Response::error('Unauthorized setup request. A valid setup key is required in production.', 403);
        }
    }

    try {
        ob_start();
        runSeeder();
        $output = ob_get_clean();
        Response::json([
            'message' => 'Database initialized and seeded successfully.',
            'log' => $output,
        ]);
    } catch (Throwable $e) {
        error_log('Database setup error: ' . $e->getMessage());
        $msg = $isProd ? 'Database initialization failed. Please inspect server error logs.' : $e->getMessage();
        Response::error($msg, 500);
    }
}

// Health check endpoint
if ($path === '/api/health' || $path === '/api') {
    $dbStatus = 'disconnected';
    try {
        Database::getConnection();
        $dbStatus = 'connected';
    } catch (Throwable $e) {
        $dbStatus = 'error';
    }

    Response::json([
        'status' => 'online',
        'database' => $dbStatus,
        'system' => 'IU Central Library API',
        'driver' => Database::getDriver(),
        'php_version' => PHP_VERSION,
        'timestamp' => date('c'),
    ]);
}

// Dispatch to API Router
$router = registerApiRoutes();
$router->dispatch($_SERVER['REQUEST_METHOD'], $path);
