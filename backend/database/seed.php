<?php
declare(strict_types=1);

/**
 * Idempotent Database Seeder for Library Management System
 * Seeds demo accounts, categories, books, borrowings, notifications, and settings.
 * Can be executed via CLI (`php backend/database/seed.php`) or invoked during setup.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../models/Book.php';
require_once __DIR__ . '/../models/Borrowing.php';
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../models/Setting.php';

function runSeeder(): void {
    echo "--- Initializing Database & Running Seeder ---\n";

    $pdo = Database::getConnection();
    $driver = Database::getDriver();
    echo "Active Database Driver: {$driver}\n";

    // 1. Ensure Schema Exists
    if ($driver === 'sqlite') {
        $schemaSql = file_get_contents(__DIR__ . '/schema_sqlite.sql');
        $pdo->exec($schemaSql);
        echo "✓ Schema verified (SQLite)\n";
    } else {
        $hasUsers = false;
        try {
            $check = $pdo->query("SHOW TABLES LIKE 'users'")->fetch();
            $hasUsers = !empty($check);
        } catch (Throwable $e) {
            $hasUsers = false;
        }

        if (!$hasUsers) {
            $schemaSql = file_get_contents(__DIR__ . '/schema.sql');
            $pdo->exec($schemaSql);
            echo "✓ Schema created\n";
        } else {
            echo "✓ Schema already present (tables verified)\n";
        }
    }

    // 2. Seed Default Settings
    Setting::setMany([
        'libraryName' => 'Central Digital Library',
        'institutionName' => 'State University of Technology',
        'departmentName' => 'Department of Computer Science & Engineering',
        'defaultLoanDurationDays' => 14,
        'maxBorrowLimit' => 5,
        'fineRatePerDay' => 2.00,
        'currency' => 'BDT',
        'contactEmail' => 'library@centraltech.edu',
        'contactPhone' => '+880 1711-234567',
        'allowSelfRenewal' => true,
        'maxRenewals' => 2,
    ]);
    echo "✓ Settings configured\n";

    // 3. Seed Predefined Demo Users (Idempotently)
    $demoUsers = [
        [
            'username' => 'admin',
            'full_name' => 'System Administrator',
            'email' => 'admin@library.edu',
            'password' => 'Admin@123',
            'role' => 'admin',
            'member_id' => 'EMP-ADM-001',
            'department' => 'Library & Information Services',
            'session' => 'Permanent',
            'phone' => '+880 1700-000001',
            'bio' => 'Senior Library System Administrator managing catalog records and digital circulation.',
        ],
        [
            'username' => 'tanvir',
            'full_name' => 'Tanvir Ahmed',
            'email' => 'tanvir@student.edu',
            'password' => 'User@123',
            'role' => 'member',
            'member_id' => '2114028',
            'department' => 'Computer Science & Engineering',
            'session' => '2021-22',
            'phone' => '+880 1712-345678',
            'bio' => 'Undergraduate CSE senior researching distributed systems, web architectures, and algorithms.',
        ],
        [
            'username' => 'student1',
            'full_name' => 'Nusrat Jahan',
            'email' => 'student1@student.edu',
            'password' => 'Student@123',
            'role' => 'member',
            'member_id' => 'CSE-2021-042',
            'department' => 'Computer Science & Engineering',
            'session' => '2021-22',
            'phone' => '+880 1719-876543',
            'bio' => 'Third-year CSE student interested in deep learning and natural language processing.',
        ],
        [
            'username' => 'student2',
            'full_name' => 'Ariful Islam',
            'email' => 'student2@student.edu',
            'password' => 'Student@123',
            'role' => 'member',
            'member_id' => 'EEE-2021-015',
            'department' => 'Electrical & Electronic Engineering',
            'session' => '2021-22',
            'phone' => '+880 1812-987654',
            'bio' => 'Robotics enthusiast and embedded systems designer.',
        ],
    ];

    $userIds = [];
    foreach ($demoUsers as $u) {
        $existing = User::findByUsername($u['username']);
        $passwordHash = password_hash($u['password'], PASSWORD_DEFAULT);

        if (!$existing) {
            $id = User::create([
                'username' => $u['username'],
                'full_name' => $u['full_name'],
                'email' => $u['email'],
                'password_hash' => $passwordHash,
                'role' => $u['role'],
                'member_id' => $u['member_id'],
                'department' => $u['department'],
                'session' => $u['session'],
                'phone' => $u['phone'],
                'bio' => $u['bio'],
                'status' => 'active',
            ]);
            $userIds[$u['username']] = $id;
            echo "  + Created user {$u['username']} ({$u['role']})\n";
        } else {
            // Update password hash to guarantee match with demo requirements
            User::updatePassword((int)$existing['id'], $passwordHash);
            $userIds[$u['username']] = (int)$existing['id'];
            echo "  = Updated user {$u['username']} (verified password)\n";
        }
    }

    // 4. Seed Categories
    $categories = [
        ['name' => 'Computer Science', 'slug' => 'computer-science', 'icon_name' => 'Cpu', 'description' => 'Algorithms, data structures, and foundational computing theory.'],
        ['name' => 'Artificial Intelligence', 'slug' => 'artificial-intelligence', 'icon_name' => 'Brain', 'description' => 'Machine learning, neural networks, and computer vision.'],
        ['name' => 'Software Engineering', 'slug' => 'software-engineering', 'icon_name' => 'Code', 'description' => 'System design, testing, clean architecture, and project management.'],
        ['name' => 'Data Science & Big Data', 'slug' => 'data-science', 'icon_name' => 'Database', 'description' => 'Statistical learning, data engineering, and business intelligence.'],
        ['name' => 'Cybersecurity & Networks', 'slug' => 'cybersecurity', 'icon_name' => 'Shield', 'description' => 'Network security, cryptography, and penetration testing.'],
        ['name' => 'Mathematics & Theory', 'slug' => 'mathematics', 'icon_name' => 'Binary', 'description' => 'Discrete mathematics, linear algebra, and calculus.'],
    ];

    $categoryIds = [];
    foreach ($categories as $cat) {
        $existing = Category::findBySlug($cat['slug']);
        if (!$existing) {
            $id = Category::create($cat);
            $categoryIds[$cat['slug']] = $id;
            echo "  + Created category: {$cat['name']}\n";
        } else {
            $categoryIds[$cat['slug']] = (int)$existing['id'];
        }
    }

    // 5. Seed Books
    $books = [
        [
            'title' => 'Clean Code: A Handbook of Agile Software Craftsmanship',
            'author' => 'Robert C. Martin',
            'isbn' => '978-0132350884',
            'category_slug' => 'software-engineering',
            'publication_year' => 2008,
            'description' => 'Even bad code can function. But if code is not clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code.',
            'cover_image' => 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=800',
            'total_copies' => 5,
            'available_copies' => 3,
            'publisher' => 'Prentice Hall',
            'pages' => 464,
            'shelf_location' => 'Rack A-01',
            'rating' => 4.8,
            'featured' => 1,
        ],
        [
            'title' => 'Introduction to Algorithms (Fourth Edition)',
            'author' => 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
            'isbn' => '978-0262046305',
            'category_slug' => 'computer-science',
            'publication_year' => 2022,
            'description' => 'A comprehensive update of the leading algorithms text, with new chapters on bipartite graphs, online algorithms, and machine learning.',
            'cover_image' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
            'total_copies' => 4,
            'available_copies' => 2,
            'publisher' => 'MIT Press',
            'pages' => 1312,
            'shelf_location' => 'Rack A-03',
            'rating' => 4.9,
            'featured' => 1,
        ],
        [
            'title' => 'Designing Data-Intensive Applications',
            'author' => 'Martin Kleppmann',
            'isbn' => '978-1449373320',
            'category_slug' => 'data-science',
            'publication_year' => 2017,
            'description' => 'Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability.',
            'cover_image' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
            'total_copies' => 4,
            'available_copies' => 3,
            'publisher' => "O'Reilly Media",
            'pages' => 616,
            'shelf_location' => 'Rack B-02',
            'rating' => 4.9,
            'featured' => 1,
        ],
        [
            'title' => 'Artificial Intelligence: A Modern Approach (4th Edition)',
            'author' => 'Stuart Russell, Peter Norvig',
            'isbn' => '978-0134610993',
            'category_slug' => 'artificial-intelligence',
            'publication_year' => 2020,
            'description' => 'The most comprehensive, up-to-date introduction to the theory and practice of artificial intelligence, covering probabilistic reasoning, deep learning, and multiagent systems.',
            'cover_image' => 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800',
            'total_copies' => 3,
            'available_copies' => 1,
            'publisher' => 'Pearson',
            'pages' => 1152,
            'shelf_location' => 'Rack C-01',
            'rating' => 4.8,
            'featured' => 1,
        ],
        [
            'title' => 'The Pragmatic Programmer: Your Journey to Mastery',
            'author' => 'David Thomas, Andrew Hunt',
            'isbn' => '978-0135957059',
            'category_slug' => 'software-engineering',
            'publication_year' => 2019,
            'description' => 'Filled with technical and architectural advice, time-tested habits, and pragmatic philosophy that distinguishes great software craftspeople.',
            'cover_image' => 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800',
            'total_copies' => 3,
            'available_copies' => 2,
            'publisher' => 'Addison-Wesley',
            'pages' => 352,
            'shelf_location' => 'Rack A-02',
            'rating' => 4.7,
            'featured' => 0,
        ],
        [
            'title' => 'Computer Security: Principles and Practice',
            'author' => 'William Stallings, Lawrie Brown',
            'isbn' => '978-0134772806',
            'category_slug' => 'cybersecurity',
            'publication_year' => 2018,
            'description' => 'An essential textbook for computer security, covering encryption standards, authentication protocols, intrusion detection, and organizational security policies.',
            'cover_image' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
            'total_copies' => 3,
            'available_copies' => 2,
            'publisher' => 'Pearson',
            'pages' => 800,
            'shelf_location' => 'Rack D-01',
            'rating' => 4.6,
            'featured' => 0,
        ],
        [
            'title' => 'Discrete Mathematics and Its Applications',
            'author' => 'Kenneth H. Rosen',
            'isbn' => '978-1259676512',
            'category_slug' => 'mathematics',
            'publication_year' => 2018,
            'description' => 'The world-renowned text for discrete math, covering propositional logic, set theory, combinatorics, graph theory, and mathematical proofs.',
            'cover_image' => 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800',
            'total_copies' => 4,
            'available_copies' => 3,
            'publisher' => 'McGraw-Hill',
            'pages' => 1024,
            'shelf_location' => 'Rack E-02',
            'rating' => 4.7,
            'featured' => 0,
        ],
    ];

    $bookIds = [];
    foreach ($books as $b) {
        $existing = Book::findByIsbn($b['isbn']);
        $catId = $categoryIds[$b['category_slug']] ?? 1;

        if (!$existing) {
            $id = Book::create([
                'title' => $b['title'],
                'author' => $b['author'],
                'isbn' => $b['isbn'],
                'category_id' => $catId,
                'publication_year' => $b['publication_year'],
                'description' => $b['description'],
                'cover_image' => $b['cover_image'],
                'total_copies' => $b['total_copies'],
                'available_copies' => $b['available_copies'],
                'publisher' => $b['publisher'],
                'pages' => $b['pages'],
                'shelf_location' => $b['shelf_location'],
                'rating' => $b['rating'],
                'featured' => $b['featured'],
            ]);
            $bookIds[$b['isbn']] = $id;
            echo "  + Created book: {$b['title']}\n";
        } else {
            $bookIds[$b['isbn']] = (int)$existing['id'];
        }
    }

    // 6. Seed Sample Borrowings
    $tanvirId = $userIds['tanvir'] ?? 2;
    $student1Id = $userIds['student1'] ?? 3;
    $cleanCodeId = $bookIds['978-0132350884'] ?? 1;
    $algoId = $bookIds['978-0262046305'] ?? 2;
    $aiId = $bookIds['978-0134610993'] ?? 4;

    // Check if borrowings already exist
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM borrowings WHERE user_id = ?");
    $stmt->execute([$tanvirId]);
    if ((int)$stmt->fetchColumn() === 0) {
        // Active borrowing 1: due in 5 days
        $pdo->prepare("INSERT INTO borrowings (user_id, book_id, issue_date, due_date, status, fine_amount, renew_count) VALUES (?, ?, ?, ?, 'active', 0.00, 0)")
            ->execute([$tanvirId, $cleanCodeId, date('Y-m-d H:i:s', strtotime('-9 days')), date('Y-m-d H:i:s', strtotime('+5 days'))]);

        // Active borrowing 2: due in 1 day (due-soon)
        $pdo->prepare("INSERT INTO borrowings (user_id, book_id, issue_date, due_date, status, fine_amount, renew_count) VALUES (?, ?, ?, ?, 'active', 0.00, 0)")
            ->execute([$tanvirId, $algoId, date('Y-m-d H:i:s', strtotime('-13 days')), date('Y-m-d H:i:s', strtotime('+1 day'))]);

        // Returned history record
        $pdo->prepare("INSERT INTO borrowings (user_id, book_id, issue_date, due_date, return_date, status, fine_amount, renew_count) VALUES (?, ?, ?, ?, ?, 'returned', 0.00, 1)")
            ->execute([$tanvirId, $aiId, date('Y-m-d H:i:s', strtotime('-30 days')), date('Y-m-d H:i:s', strtotime('-16 days')), date('Y-m-d H:i:s', strtotime('-18 days'))]);

        echo "✓ Sample borrowings seeded for tanvir\n";
    }

    // 7. Seed Initial Notifications
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ?");
    $stmt->execute([$tanvirId]);
    if ((int)$stmt->fetchColumn() === 0) {
        Notification::create([
            'user_id' => $tanvirId,
            'title' => 'Welcome to Central Digital Library',
            'message' => 'Your student account (2114028) is active. You can borrow up to 5 books concurrently.',
            'type' => 'info',
            'action_url' => '/catalogue',
        ]);

        Notification::create([
            'user_id' => $tanvirId,
            'title' => 'Due Date Reminder',
            'message' => 'Introduction to Algorithms (Fourth Edition) is due tomorrow. Please return or renew in your dashboard.',
            'type' => 'warning',
            'action_url' => '/dashboard/my-books',
        ]);
        echo "✓ Notifications seeded for tanvir\n";
    }

    echo "=============================================\n";
    echo "  Seeding Completed Successfully!\n";
    echo "  Demo Credentials:\n";
    echo "  - Admin:  admin    / Admin@123\n";
    echo "  - Member: tanvir   / User@123\n";
    echo "  - Member: student1 / Student@123\n";
    echo "  - Member: student2 / Student@123\n";
    echo "=============================================\n";
}

// Auto-run if executed from CLI
if (php_sapi_name() === 'cli') {
    runSeeder();
}
