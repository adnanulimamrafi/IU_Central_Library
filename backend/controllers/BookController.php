<?php
declare(strict_types=1);

require_once __DIR__ . '/../models/Book.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../middleware/admin.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';

class BookController {
    /**
     * GET /api/books
     */
    public function index(): void {
        $filters = [
            'search' => $_GET['search'] ?? null,
            'category_id' => $_GET['category_id'] ?? null,
            'category' => $_GET['category'] ?? null,
            'availability' => $_GET['availability'] ?? null,
            'publication_year' => $_GET['publication_year'] ?? $_GET['year'] ?? null,
            'featured' => isset($_GET['featured']) ? (bool)$_GET['featured'] : null,
            'sort' => $_GET['sort'] ?? 'newest',
            'page' => isset($_GET['page']) ? (int)$_GET['page'] : 1,
            'limit' => isset($_GET['limit']) ? (int)$_GET['limit'] : 100,
        ];

        $books = Book::getAll($filters);
        $total = Book::countAll($filters);

        // Map to frontend-friendly camelCase if desired or maintain compatibility
        $formatted = array_map(function ($b) {
            return [
                'id' => (string)$b['id'],
                'title' => $b['title'],
                'author' => $b['author'],
                'isbn' => $b['isbn'],
                'category' => $b['category_name'] ?? '',
                'categoryId' => (string)$b['category_id'],
                'categorySlug' => $b['category_slug'] ?? '',
                'publicationYear' => (int)$b['publication_year'],
                'description' => $b['description'],
                'coverImage' => $b['cover_image'] ?? '',
                'totalCopies' => (int)$b['total_copies'],
                'availableCopies' => (int)$b['available_copies'],
                'publisher' => $b['publisher'] ?? '',
                'pages' => $b['pages'] ? (int)$b['pages'] : null,
                'language' => $b['language'] ?? 'English',
                'shelfLocation' => $b['shelf_location'] ?? '',
                'rating' => (float)$b['rating'],
                'featured' => (bool)$b['featured'],
                'addedAt' => $b['created_at'],
            ];
        }, $books);

        Response::json([
            'books' => $formatted,
            'total' => $total,
            'page' => $filters['page'],
            'limit' => $filters['limit'],
        ]);
    }

    /**
     * GET /api/books/{id}
     */
    public function show(int|string $id): void {
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        if ($cleanId <= 0) $cleanId = 1;

        $b = Book::findById($cleanId);
        if (!$b) {
            Response::error('Book not found.', 404);
        }

        $formatted = [
            'id' => (string)$b['id'],
            'title' => $b['title'],
            'author' => $b['author'],
            'isbn' => $b['isbn'],
            'category' => $b['category_name'] ?? '',
            'categoryId' => (string)$b['category_id'],
            'categorySlug' => $b['category_slug'] ?? '',
            'publicationYear' => (int)$b['publication_year'],
            'description' => $b['description'],
            'coverImage' => $b['cover_image'] ?? '',
            'totalCopies' => (int)$b['total_copies'],
            'availableCopies' => (int)$b['available_copies'],
            'publisher' => $b['publisher'] ?? '',
            'pages' => $b['pages'] ? (int)$b['pages'] : null,
            'language' => $b['language'] ?? 'English',
            'shelfLocation' => $b['shelf_location'] ?? '',
            'rating' => (float)$b['rating'],
            'featured' => (bool)$b['featured'],
            'addedAt' => $b['created_at'],
        ];

        Response::json($formatted);
    }

    /**
     * POST /api/books (Admin only)
     */
    public function store(): void {
        AdminMiddleware::requireAdmin();
        $body = Response::getJsonBody();

        $errors = Validation::validateRequired($body, ['title', 'author', 'isbn', 'publication_year', 'description']);
        if (!empty($errors)) {
            Response::error('Validation failed.', 422, $errors);
        }

        $isbn = trim($body['isbn']);
        if (Book::findByIsbn($isbn)) {
            Response::error("A book with ISBN '{$isbn}' already exists.", 409);
        }

        // Resolve Category ID
        $categoryId = (int)($body['category_id'] ?? $body['categoryId'] ?? 0);
        if ($categoryId <= 0 && !empty($body['category'])) {
            $cat = Category::findBySlug(Validation::slugify($body['category']));
            if (!$cat) {
                $allCats = Category::getAll();
                foreach ($allCats as $c) {
                    if (strcasecmp($c['name'], trim($body['category'])) === 0) {
                        $cat = $c;
                        break;
                    }
                }
            }
            if ($cat) {
                $categoryId = (int)$cat['id'];
            }
        }
        if ($categoryId <= 0) {
            $allCats = Category::getAll();
            $categoryId = !empty($allCats) ? (int)$allCats[0]['id'] : 1;
        }

        $totalCopies = max(1, (int)($body['total_copies'] ?? $body['totalCopies'] ?? 1));
        $availableCopies = isset($body['available_copies']) || isset($body['availableCopies']) 
            ? max(0, min($totalCopies, (int)($body['available_copies'] ?? $body['availableCopies']))) 
            : $totalCopies;

        $bookId = Book::create([
            'title' => trim($body['title']),
            'author' => trim($body['author']),
            'isbn' => $isbn,
            'category_id' => $categoryId,
            'publication_year' => (int)$body['publication_year'],
            'description' => trim($body['description']),
            'cover_image' => trim($body['cover_image'] ?? $body['coverImage'] ?? ''),
            'total_copies' => $totalCopies,
            'available_copies' => $availableCopies,
            'publisher' => trim($body['publisher'] ?? ''),
            'pages' => !empty($body['pages']) ? (int)$body['pages'] : null,
            'language' => trim($body['language'] ?? 'English'),
            'shelf_location' => trim($body['shelf_location'] ?? $body['shelfLocation'] ?? ''),
            'rating' => !empty($body['rating']) ? (float)$body['rating'] : 4.5,
            'featured' => !empty($body['featured']) ? 1 : 0,
        ]);

        $newBook = Book::findById($bookId);
        Response::json($newBook, 201);
    }

    /**
     * PUT /api/books/{id} (Admin only)
     */
    public function update(int|string $id): void {
        AdminMiddleware::requireAdmin();
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        $book = Book::findById($cleanId);
        if (!$book) {
            Response::error('Book not found.', 404);
        }

        $body = Response::getJsonBody();
        $updates = [];

        if (isset($body['title'])) $updates['title'] = trim($body['title']);
        if (isset($body['author'])) $updates['author'] = trim($body['author']);
        if (isset($body['description'])) $updates['description'] = trim($body['description']);
        if (isset($body['cover_image']) || isset($body['coverImage'])) $updates['cover_image'] = trim($body['cover_image'] ?? $body['coverImage']);
        if (isset($body['publisher'])) $updates['publisher'] = trim($body['publisher']);
        if (isset($body['language'])) $updates['language'] = trim($body['language']);
        if (isset($body['shelf_location']) || isset($body['shelfLocation'])) $updates['shelf_location'] = trim($body['shelf_location'] ?? $body['shelfLocation']);
        if (isset($body['publication_year']) || isset($body['publicationYear'])) $updates['publication_year'] = (int)($body['publication_year'] ?? $body['publicationYear']);
        if (isset($body['pages'])) $updates['pages'] = (int)$body['pages'];
        if (isset($body['rating'])) $updates['rating'] = (float)$body['rating'];
        if (isset($body['featured'])) $updates['featured'] = $body['featured'] ? 1 : 0;
        if (isset($body['category_id']) || isset($body['categoryId'])) $updates['category_id'] = (int)($body['category_id'] ?? $body['categoryId']);

        if (isset($body['isbn'])) {
            $newIsbn = trim($body['isbn']);
            if ($newIsbn !== $book['isbn'] && Book::findByIsbn($newIsbn)) {
                Response::error("ISBN '{$newIsbn}' is already in use by another book.", 409);
            }
            $updates['isbn'] = $newIsbn;
        }

        if (isset($body['total_copies']) || isset($body['totalCopies'])) {
            $newTotal = max(1, (int)($body['total_copies'] ?? $body['totalCopies']));
            $diff = $newTotal - (int)$book['total_copies'];
            $newAvailable = max(0, min($newTotal, (int)$book['available_copies'] + $diff));
            $updates['total_copies'] = $newTotal;
            $updates['available_copies'] = $newAvailable;
        }

        Book::update($cleanId, $updates);
        $updatedBook = Book::findById($cleanId);

        Response::json($updatedBook);
    }

    /**
     * DELETE /api/books/{id} (Admin only)
     */
    public function destroy(int|string $id): void {
        AdminMiddleware::requireAdmin();
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        $book = Book::findById($cleanId);
        if (!$book) {
            Response::error('Book not found.', 404);
        }

        if (Book::hasActiveBorrowings($cleanId)) {
            Response::error('Cannot delete book because there are active loan records associated with it.', 400);
        }

        Book::delete($cleanId);
        Response::json(['message' => "Book \"{$book['title']}\" deleted successfully."]);
    }
}
