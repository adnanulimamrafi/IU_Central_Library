<?php
declare(strict_types=1);

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/BookController.php';
require_once __DIR__ . '/../controllers/CategoryController.php';
require_once __DIR__ . '/../controllers/BorrowingController.php';
require_once __DIR__ . '/../controllers/MemberController.php';
require_once __DIR__ . '/../controllers/DashboardController.php';
require_once __DIR__ . '/../controllers/NotificationController.php';
require_once __DIR__ . '/../controllers/FavouriteController.php';
require_once __DIR__ . '/../controllers/SettingsController.php';
require_once __DIR__ . '/../utils/response.php';

class Router {
    private array $routes = [];

    public function add(string $method, string $pattern, array $handler): void {
        $this->routes[] = [
            'method' => strtoupper($method),
            'pattern' => $pattern,
            'handler' => $handler,
        ];
    }

    public function dispatch(string $method, string $uri): void {
        // Strip query string
        $path = parse_url($uri, PHP_URL_PATH) ?? '/';
        $path = rtrim($path, '/');
        if ($path === '') {
            $path = '/';
        }

        // Normalize path: if request is prefixed with /api, remove or keep matching
        // We will support paths with or without leading /api
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            // Convert pattern to regex e.g. /api/books/{id} -> #^/api/books/([0-9]+)$#
            $patternRegex = preg_replace('#\{([a-zA-Z0-9_]+)\}#', '([^/]+)', $route['pattern']);
            $patternRegex = '#^' . $patternRegex . '$#';

            if (preg_match($patternRegex, $path, $matches)) {
                array_shift($matches); // Remove full match
                $matches = array_map(fn($m) => (is_numeric($m) && (string)(int)$m === (string)$m) ? (int)$m : $m, $matches);
                [$controllerClass, $action] = $route['handler'];
                $controller = new $controllerClass();
                call_user_func_array([$controller, $action], $matches);
                return;
            }
        }

        // Route not matched
        Response::error("Endpoint not found: [{$method}] {$path}", 404);
    }
}

function registerApiRoutes(): Router {
    $router = new Router();

    // Authentication
    $router->add('POST', '/api/auth/login', [AuthController::class, 'login']);
    $router->add('POST', '/api/auth/logout', [AuthController::class, 'logout']);
    $router->add('GET',  '/api/auth/me', [AuthController::class, 'me']);
    $router->add('GET',  '/api/auth/csrf', [AuthController::class, 'csrf']);
    $router->add('POST', '/api/auth/register', [AuthController::class, 'register']);
    $router->add('PUT',  '/api/auth/profile', [AuthController::class, 'updateProfile']);
    $router->add('POST', '/api/auth/change-password', [AuthController::class, 'changePassword']);

    // Books
    $router->add('GET',    '/api/books', [BookController::class, 'index']);
    $router->add('GET',    '/api/books/{id}', [BookController::class, 'show']);
    $router->add('POST',   '/api/books', [BookController::class, 'store']);
    $router->add('PUT',    '/api/books/{id}', [BookController::class, 'update']);
    $router->add('DELETE', '/api/books/{id}', [BookController::class, 'destroy']);

    // Categories
    $router->add('GET',    '/api/categories', [CategoryController::class, 'index']);
    $router->add('GET',    '/api/categories/{id}', [CategoryController::class, 'show']);
    $router->add('POST',   '/api/categories', [CategoryController::class, 'store']);
    $router->add('PUT',    '/api/categories/{id}', [CategoryController::class, 'update']);
    $router->add('DELETE', '/api/categories/{id}', [CategoryController::class, 'destroy']);

    // Borrowings
    $router->add('GET',  '/api/borrowings', [BorrowingController::class, 'index']);
    $router->add('GET',  '/api/borrowings/my', [BorrowingController::class, 'myBorrowings']);
    $router->add('POST', '/api/borrowings', [BorrowingController::class, 'store']);
    $router->add('POST', '/api/borrowings/{id}/return', [BorrowingController::class, 'returnBook']);
    $router->add('POST', '/api/borrowings/{id}/renew', [BorrowingController::class, 'renew']);

    // Members (Admin)
    $router->add('GET', '/api/members', [MemberController::class, 'index']);
    $router->add('GET', '/api/members/{id}', [MemberController::class, 'show']);
    $router->add('PUT', '/api/members/{id}/status', [MemberController::class, 'updateStatus']);

    // Dashboard & Public Stats
    $router->add('GET', '/api/stats', [DashboardController::class, 'publicStats']);
    $router->add('GET', '/api/dashboard/stats', [DashboardController::class, 'stats']);
    $router->add('GET', '/api/dashboard/member', [DashboardController::class, 'memberStats']);

    // Notifications
    $router->add('GET', '/api/notifications', [NotificationController::class, 'index']);
    $router->add('PUT', '/api/notifications/read-all', [NotificationController::class, 'markAllRead']);
    $router->add('PUT', '/api/notifications/{id}/read', [NotificationController::class, 'markRead']);

    // Favourites
    $router->add('GET',  '/api/favourites', [FavouriteController::class, 'index']);
    $router->add('POST', '/api/favourites/{id}', [FavouriteController::class, 'toggle']);

    // Settings
    $router->add('GET', '/api/settings', [SettingsController::class, 'index']);
    $router->add('PUT', '/api/settings', [SettingsController::class, 'update']);

    return $router;
}
