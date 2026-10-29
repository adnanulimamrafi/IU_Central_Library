<?php
declare(strict_types=1);

require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../middleware/admin.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';

class CategoryController {
    /**
     * GET /api/categories
     */
    public function index(): void {
        $categories = Category::getAll();
        $formatted = array_map(function ($c) {
            return [
                'id' => (string)$c['id'],
                'name' => $c['name'],
                'slug' => $c['slug'],
                'description' => $c['description'] ?? '',
                'iconName' => $c['icon_name'] ?? 'BookOpen',
                'bookCount' => (int)($c['book_count'] ?? 0),
            ];
        }, $categories);

        Response::json($formatted);
    }

    /**
     * GET /api/categories/{id}
     */
    public function show(int|string $id): void {
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        if ($cleanId <= 0) $cleanId = 1;

        $c = Category::findById($cleanId);
        if (!$c) {
            Response::error('Category not found.', 404);
        }

        Response::json([
            'id' => (string)$c['id'],
            'name' => $c['name'],
            'slug' => $c['slug'],
            'description' => $c['description'] ?? '',
            'iconName' => $c['icon_name'] ?? 'BookOpen',
            'bookCount' => (int)($c['book_count'] ?? 0),
        ]);
    }

    /**
     * POST /api/categories (Admin only)
     */
    public function store(): void {
        AdminMiddleware::requireAdmin();
        $body = Response::getJsonBody();

        $errors = Validation::validateRequired($body, ['name']);
        if (!empty($errors)) {
            Response::error('Validation failed.', 422, $errors);
        }

        $name = trim($body['name']);
        $slug = !empty($body['slug']) ? Validation::slugify($body['slug']) : Validation::slugify($name);

        if (Category::findBySlug($slug)) {
            Response::error("Category slug '{$slug}' already exists.", 409);
        }

        $id = Category::create([
            'name' => $name,
            'slug' => $slug,
            'description' => trim($body['description'] ?? ''),
            'icon_name' => trim($body['icon_name'] ?? $body['iconName'] ?? 'BookOpen'),
        ]);

        $newCat = Category::findById($id);
        Response::json($newCat, 201);
    }

    /**
     * PUT /api/categories/{id} (Admin only)
     */
    public function update(int|string $id): void {
        AdminMiddleware::requireAdmin();
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        $cat = Category::findById($cleanId);
        if (!$cat) {
            Response::error('Category not found.', 404);
        }

        $body = Response::getJsonBody();
        $updates = [];

        if (isset($body['name'])) $updates['name'] = trim($body['name']);
        if (isset($body['description'])) $updates['description'] = trim($body['description']);
        if (isset($body['icon_name']) || isset($body['iconName'])) {
            $updates['icon_name'] = trim($body['icon_name'] ?? $body['iconName']);
        }
        if (isset($body['slug'])) {
            $newSlug = Validation::slugify($body['slug']);
            if ($newSlug !== $cat['slug'] && Category::findBySlug($newSlug)) {
                Response::error("Category slug '{$newSlug}' already in use.", 409);
            }
            $updates['slug'] = $newSlug;
        }

        Category::update($cleanId, $updates);
        $updated = Category::findById($cleanId);
        Response::json($updated);
    }

    /**
     * DELETE /api/categories/{id} (Admin only)
     */
    public function destroy(int|string $id): void {
        AdminMiddleware::requireAdmin();
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        $cat = Category::findById($cleanId);
        if (!$cat) {
            Response::error('Category not found.', 404);
        }

        if (Category::hasBooks($cleanId)) {
            Response::error('Cannot delete category because books are currently assigned to it.', 400);
        }

        Category::delete($cleanId);
        Response::json(['message' => "Category \"{$cat['name']}\" deleted successfully."]);
    }
}
