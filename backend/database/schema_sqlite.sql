-- ============================================================
-- Library Management System - SQLite Schema (Fallback / Test)
-- ============================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `username` TEXT NOT NULL UNIQUE,
  `full_name` TEXT NOT NULL,
  `email` TEXT NOT NULL UNIQUE,
  `password_hash` TEXT NOT NULL,
  `role` TEXT NOT NULL DEFAULT 'member',
  `member_id` TEXT NULL UNIQUE,
  `department` TEXT NULL DEFAULT 'Computer Science & Engineering',
  `session` TEXT NULL DEFAULT '2021-22',
  `phone` TEXT NULL,
  `bio` TEXT NULL,
  `avatar` TEXT NULL,
  `status` TEXT NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `categories` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` TEXT NOT NULL UNIQUE,
  `slug` TEXT NOT NULL UNIQUE,
  `description` TEXT NULL,
  `icon_name` TEXT NOT NULL DEFAULT 'BookOpen',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `books` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `title` TEXT NOT NULL,
  `author` TEXT NOT NULL,
  `isbn` TEXT NOT NULL UNIQUE,
  `category_id` INTEGER NOT NULL,
  `publication_year` INTEGER NOT NULL,
  `description` TEXT NOT NULL,
  `cover_image` TEXT NULL,
  `total_copies` INTEGER NOT NULL DEFAULT 1,
  `available_copies` INTEGER NOT NULL DEFAULT 1,
  `publisher` TEXT NULL,
  `pages` INTEGER NULL,
  `language` TEXT NOT NULL DEFAULT 'English',
  `shelf_location` TEXT NULL,
  `rating` REAL NOT NULL DEFAULT 4.5,
  `featured` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS `borrowings` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `user_id` INTEGER NOT NULL,
  `book_id` INTEGER NOT NULL,
  `issue_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `due_date` DATETIME NOT NULL,
  `return_date` DATETIME NULL,
  `status` TEXT NOT NULL DEFAULT 'active',
  `fine_amount` REAL NOT NULL DEFAULT 0.00,
  `fine_paid` INTEGER NOT NULL DEFAULT 0,
  `renew_count` INTEGER NOT NULL DEFAULT 0,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `user_id` INTEGER NULL,
  `title` TEXT NOT NULL,
  `message` TEXT NOT NULL,
  `type` TEXT NOT NULL DEFAULT 'info',
  `is_read` INTEGER NOT NULL DEFAULT 0,
  `action_url` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `favourites` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `user_id` INTEGER NOT NULL,
  `book_id` INTEGER NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (`user_id`, `book_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` TEXT PRIMARY KEY,
  `setting_value` TEXT NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
