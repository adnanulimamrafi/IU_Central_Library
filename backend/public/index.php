<?php
declare(strict_types=1);

/**
 * Main Front Controller & API Entry Point
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../routes/api.php';
require_once __DIR__ . '/../database/seed.php';

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
    try {
        ob_start();
        runSeeder();
        $output = ob_get_clean();
        Response::json([
            'message' => 'Database initialized and seeded successfully.',
            'log' => $output,
        ]);
    } catch (Exception $e) {
        Response::error('Failed to initialize database: ' . $e->getMessage(), 500);
    }
}

// Health check endpoint
if ($path === '/api/health' || $path === '/api') {
    Response::json([
        'status' => 'online',
        'system' => 'Library Management System API',
        'driver' => Database::getDriver(),
        'php_version' => PHP_VERSION,
        'timestamp' => date('c'),
    ]);
}

// Dispatch to API Router
$router = registerApiRoutes();
$router->dispatch($_SERVER['REQUEST_METHOD'], $path);
