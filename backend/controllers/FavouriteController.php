<?php
declare(strict_types=1);

require_once __DIR__ . '/../models/Favourite.php';
require_once __DIR__ . '/../models/Book.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../utils/response.php';

class FavouriteController {
    /**
     * GET /api/favourites
     */
    public function index(): void {
        $user = Auth::requireAuth();
        $ids = Favourite::getUserFavouriteIds((int)$user['id']);
        Response::json([
            'favourites' => array_map('strval', $ids),
        ]);
    }

    /**
     * POST /api/favourites/{book_id} (Toggle favourite)
     */
    public function toggle(int|string $bookId): void {
        $user = Auth::requireAuth();
        $cleanBookId = (int)preg_replace('/[^0-9]/', '', (string)$bookId);
        if ($cleanBookId <= 0) $cleanBookId = 1;
        
        $book = Book::findById($cleanBookId);
        if (!$book) {
            Response::error('Book not found.', 404);
        }

        $isFavourite = Favourite::toggle((int)$user['id'], $cleanBookId);

        Response::json([
            'book_id' => (string)$cleanBookId,
            'is_favourite' => $isFavourite,
            'message' => $isFavourite ? 'Book added to reading list.' : 'Book removed from reading list.',
        ]);
    }
}
