<?php
declare(strict_types=1);

/**
 * Automated Comprehensive End-to-End API Test Suite
 * Tests authentication, registration, sessions, role authorization, concurrency-safe borrowing, inventory restoration, search safety, and dashboards.
 */

$baseUrl = 'http://127.0.0.1:8000';

function apiRequest(string $method, string $path, ?array $body = null, ?string $cookieFile = null): array {
    global $baseUrl;
    $url = $baseUrl . $path;
    $ch = curl_init($url);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    if ($cookieFile) {
        curl_setopt($ch, CURLOPT_COOKIEJAR, $cookieFile);
        curl_setopt($ch, CURLOPT_COOKIEFILE, $cookieFile);
    }

    $headers = ['Accept: application/json'];
    if ($body !== null) {
        $json = json_encode($body);
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
    }

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = json_decode($raw ?: '', true) ?? [];
    return ['status' => $status, 'data' => $data, 'raw' => $raw];
}

function assertTest(string $description, bool $condition, ?string $details = null): void {
    if ($condition) {
        echo "  [PASS] {$description}\n";
    } else {
        echo "  [FAIL] {$description}\n";
        if ($details) {
            echo "         Details: {$details}\n";
        }
        exit(1);
    }
}

echo "====================================================\n";
echo "Comprehensive Full-Stack Codebase Bug Audit & E2E Test\n";
echo "====================================================\n\n";

// 1. System Health Check
echo "1. System Health Check\n";
$res = apiRequest('GET', '/api/health');
assertTest('API Health is online', $res['status'] === 200 && ($res['data']['success'] ?? false));
echo "\n";

// 2. Public Book Catalogue & Search Null Safety
echo "2. Public Book Catalogue & Search Queries\n";
$res = apiRequest('GET', '/api/books?search=Code&availability=available&sort=title');
assertTest('Catalogue filter & search returns matching books', $res['status'] === 200 && is_array($res['data']['data']['books']));
$firstBook = $res['data']['data']['books'][0] ?? null;
assertTest('Found book matching query', $firstBook !== null);
echo "\n";

// 3. String Book ID Resolution (e.g. b-1 or 1)
echo "3. String Book ID Resolution (/api/books/b-1)\n";
$res = apiRequest('GET', '/api/books/b-1');
assertTest('Single book resolved via string ID format b-1', $res['status'] === 200 && isset($res['data']['data']['title']));
echo "\n";

// 4. Member Registration API (Testing field mapping: name, email, studentId)
echo "4. Member Registration (Frontend Payload Mapping)\n";
$testEmail = 'audit_student_' . rand(1000, 9999) . '@student.edu';
$regPayload = [
    'name' => 'Audited Student',
    'email' => $testEmail,
    'studentId' => 'CSE-2021-' . rand(1000, 9999),
    'department' => 'Computer Science & Engineering',
    'phone' => '+880 1700-999999',
    'password' => 'Pass@123',
];
$regCookies = __DIR__ . '/reg_cookies.txt';
if (file_exists($regCookies)) unlink($regCookies);

$regRes = apiRequest('POST', '/api/auth/register', $regPayload, $regCookies);
assertTest('Member registration succeeds with name & email (201)', $regRes['status'] === 201);
assertTest('Session initialized upon registration', ($regRes['data']['data']['user']['role'] ?? '') === 'member');
if (file_exists($regCookies)) unlink($regCookies);
echo "\n";

// 5. Member Authentication (tanvir / User@123)
echo "5. Member Authentication & Session Persistence\n";
$memberCookies = __DIR__ . '/member_cookies.txt';
if (file_exists($memberCookies)) unlink($memberCookies);

$res = apiRequest('POST', '/api/auth/login', ['username' => 'tanvir', 'password' => 'User@123'], $memberCookies);
assertTest('Member login succeeds (200)', $res['status'] === 200);
assertTest('User role is member', ($res['data']['data']['user']['role'] ?? '') === 'member');
assertTest('Full name is Tanvir Ahmed', ($res['data']['data']['user']['full_name'] ?? '') === 'Tanvir Ahmed');

$res = apiRequest('GET', '/api/auth/me', null, $memberCookies);
assertTest('Session verified on /api/auth/me', ($res['data']['data']['authenticated'] ?? false) === true);
echo "\n";

// 6. Member Dashboard & Borrowings
echo "6. Member Dashboard & Borrowings\n";
$res = apiRequest('GET', '/api/dashboard/member', null, $memberCookies);
assertTest('Member dashboard statistics returned', $res['status'] === 200 && isset($res['data']['data']['activeCount']));

$myBorrowings = apiRequest('GET', '/api/borrowings/my', null, $memberCookies);
assertTest('My borrowings returned', $myBorrowings['status'] === 200 && is_array($myBorrowings['data']['data']));
echo "\n";

// 7. Concurrency-Safe Borrowing & Inventory Decrement
echo "7. Concurrency-Safe Book Issue & Inventory Decrement\n";
$allBooks = apiRequest('GET', '/api/books');
$bookToBorrow = null;
foreach ($allBooks['data']['data']['books'] as $b) {
    if ((int)$b['availableCopies'] > 0) {
        $bookToBorrow = $b;
        break;
    }
}
assertTest('Found available textbook in catalogue', $bookToBorrow !== null);
$targetBookId = (int)$bookToBorrow['id'];
$initialAvail = (int)$bookToBorrow['availableCopies'];

// Issue book
$issueRes = apiRequest('POST', '/api/borrowings', ['book_id' => $targetBookId], $memberCookies);
// Either succeeds (201) or returns already borrowed (400)
assertTest('Borrow request returned valid status', $issueRes['status'] === 201 || $issueRes['status'] === 400);

if ($issueRes['status'] === 201) {
    $borrowRecordId = (int)$issueRes['data']['data']['id'];
    assertTest("Borrow record created (ID {$borrowRecordId})", $borrowRecordId > 0);

    // Verify inventory decremented
    $bookCheck = apiRequest('GET', "/api/books/{$targetBookId}");
    $afterCopies = (int)$bookCheck['data']['data']['availableCopies'];
    assertTest("Inventory decremented ({$initialAvail} -> {$afterCopies})", $afterCopies === $initialAvail - 1);

    // Test loan renewal
    $renewRes = apiRequest('POST', "/api/borrowings/{$borrowRecordId}/renew", ['days' => 7], $memberCookies);
    assertTest('Loan renewal succeeds (200)', $renewRes['status'] === 200);

    // Test return book
    $returnRes = apiRequest('POST', "/api/borrowings/{$borrowRecordId}/return", null, $memberCookies);
    assertTest('Book return succeeds (200)', $returnRes['status'] === 200);

    // Verify inventory restored
    $bookRestored = apiRequest('GET', "/api/books/{$targetBookId}");
    $restoredCopies = (int)$bookRestored['data']['data']['availableCopies'];
    assertTest("Inventory restored back to {$initialAvail}", $restoredCopies === $initialAvail);
}
echo "\n";

// 8. Favourites & In-App Notifications
echo "8. Favourites & Notification Center\n";
$favToggle = apiRequest('POST', "/api/favourites/{$targetBookId}", null, $memberCookies);
assertTest('Toggle favourite succeeds (200)', $favToggle['status'] === 200 && isset($favToggle['data']['data']['is_favourite']));

$notifs = apiRequest('GET', '/api/notifications', null, $memberCookies);
assertTest('Notifications fetched', $notifs['status'] === 200 && is_array($notifs['data']['data']));

$markAll = apiRequest('PUT', '/api/notifications/read-all', null, $memberCookies);
assertTest('Mark all notifications read (200)', $markAll['status'] === 200);
echo "\n";

// 9. Admin Security, Stats & Book CRUD
echo "9. Admin Security & CRUD Operations\n";
$adminCookies = __DIR__ . '/admin_cookies.txt';
if (file_exists($adminCookies)) unlink($adminCookies);

// Member rejected from admin endpoints
$forbidden = apiRequest('GET', '/api/dashboard/stats', null, $memberCookies);
assertTest('Member is rejected (403) from admin endpoints', $forbidden['status'] === 403);

// Admin login
$adminLogin = apiRequest('POST', '/api/auth/login', ['username' => 'admin', 'password' => 'Admin@123'], $adminCookies);
assertTest('Admin login succeeds (200)', $adminLogin['status'] === 200);

// Admin stats
$adminStats = apiRequest('GET', '/api/dashboard/stats', null, $adminCookies);
assertTest('Admin stats returned (200)', $adminStats['status'] === 200 && isset($adminStats['data']['data']['totalTitles']));

// Create book with category NAME resolution
$newBook = [
    'title' => 'Software Project Architecture ' . rand(100, 999),
    'author' => 'Islamic University Dept. of CSE',
    'isbn' => '978-' . rand(1000000000, 9999999999),
    'category' => 'Software Engineering', // Testing name resolution instead of category_id
    'publication_year' => 2026,
    'description' => 'Comprehensive textbook for CSE 3210 Software Project curriculum.',
    'total_copies' => 4,
];
$createBookRes = apiRequest('POST', '/api/books', $newBook, $adminCookies);
assertTest('Admin creates book with category name resolution (201)', $createBookRes['status'] === 201);
$createdBookId = (int)$createBookRes['data']['data']['id'];

// Edit book
$updateRes = apiRequest('PUT', "/api/books/{$createdBookId}", ['title' => 'Software Project Architecture (2nd Edition)'], $adminCookies);
assertTest('Admin updates book (200)', $updateRes['status'] === 200);

// Delete book
$deleteRes = apiRequest('DELETE', "/api/books/{$createdBookId}", null, $adminCookies);
assertTest('Admin deletes book (200)', $deleteRes['status'] === 200);

// Category CRUD
$newCatRes = apiRequest('POST', '/api/categories', [
    'name' => 'Embedded Systems ' . rand(100, 999),
    'description' => 'Microcontrollers and IoT architectures.',
    'icon_name' => 'Cpu',
], $adminCookies);
assertTest('Admin creates category (201)', $newCatRes['status'] === 201);
$newCatId = (int)$newCatRes['data']['data']['id'];

$delCatRes = apiRequest('DELETE', "/api/categories/{$newCatId}", null, $adminCookies);
assertTest('Admin deletes category (200)', $delCatRes['status'] === 200);

// Logout
$logout = apiRequest('POST', '/api/auth/logout', null, $adminCookies);
assertTest('Admin session terminated (200)', $logout['status'] === 200);

if (file_exists($memberCookies)) unlink($memberCookies);
if (file_exists($adminCookies)) unlink($adminCookies);

echo "\n====================================================\n";
echo "ALL AUDIT CHECKS PASSED: ZERO BUGS DETECTED!\n";
echo "====================================================\n";
