<?php
declare(strict_types=1);

/**
 * Deep QA Circulation & Edge Case Test Suite
 * Tests Book Borrowing, Returning, Renewal, and all Event After-Effects
 */

$baseUrl = 'http://127.0.0.1:8000';

function req(string $method, string $path, ?array $body = null, ?string $cookieFile = null): array {
    global $baseUrl;
    $ch = curl_init($baseUrl . $path);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if ($cookieFile) {
        curl_setopt($ch, CURLOPT_COOKIEJAR, $cookieFile);
        curl_setopt($ch, CURLOPT_COOKIEFILE, $cookieFile);
    }
    $headers = ['Accept: application/json'];
    if ($body !== null) {
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['status' => $status, 'data' => json_decode($raw ?: '', true) ?? [], 'raw' => $raw];
}

$tanvirCookie = __DIR__ . '/tanvir_deep_qa.txt';
$student1Cookie = __DIR__ . '/student1_deep_qa.txt';
$adminCookie = __DIR__ . '/admin_deep_qa.txt';

@unlink($tanvirCookie);
@unlink($student1Cookie);
@unlink($adminCookie);

echo "========================================================\n";
echo "PROFESSIONAL QA AUDIT: BORROWING, RETURNING & AFTER-EFFECTS\n";
echo "========================================================\n\n";

// 1. Authenticate users
echo "1. Authenticating test personas...\n";
$loginTanvir = req('POST', '/api/auth/login', ['username' => 'tanvir', 'password' => 'User@123'], $tanvirCookie);
assert($loginTanvir['status'] === 200, "Tanvir login failed");
echo "  [PASS] Tanvir authenticated (ID: {$loginTanvir['data']['data']['user']['id']})\n";

$loginStudent1 = req('POST', '/api/auth/login', ['username' => 'student1', 'password' => 'Student@123'], $student1Cookie);
assert($loginStudent1['status'] === 200, "Student1 login failed");
echo "  [PASS] Student1 authenticated (ID: {$loginStudent1['data']['data']['user']['id']})\n";

$loginAdmin = req('POST', '/api/auth/login', ['username' => 'admin', 'password' => 'Admin@123'], $adminCookie);
assert($loginAdmin['status'] === 200, "Admin login failed");
echo "  [PASS] Admin authenticated\n\n";

// 2. Inspect active loans
echo "2. Inspecting Tanvir's Current Loans...\n";
$myBorrowingsRes = req('GET', '/api/borrowings/my', null, $tanvirCookie);
$activeLoans = [];
foreach ($myBorrowingsRes['data']['data'] ?? [] as $rec) {
    if ($rec['status'] === 'active') {
        $activeLoans[] = $rec;
    }
}
echo "  Tanvir currently has " . count($activeLoans) . " active loans.\n";

// 3. Test Returning a book
echo "\n3. Testing Book Return & Inventory Restoration...\n";
assert(count($activeLoans) > 0, "No active loan to return");
$loanToReturn = $activeLoans[0];
$loanId = (int)$loanToReturn['id'];
$returnedBookId = (int)$loanToReturn['bookId'];

// Get book free copies before return
$bookBeforeReturn = req('GET', "/api/books/{$returnedBookId}", null, $tanvirCookie);
$freeBefore = (int)$bookBeforeReturn['data']['data']['availableCopies'];
echo "  Returning loan #{$loanId} ('{$loanToReturn['bookTitle']}'), Book ID {$returnedBookId}. Free before: {$freeBefore}\n";

$returnRes = req('POST', "/api/borrowings/{$loanId}/return", [], $tanvirCookie);
echo "  Return response status: {$returnRes['status']}\n";
assert($returnRes['status'] === 200, "Return failed: " . ($returnRes['data']['error'] ?? ''));
$returnedRec = $returnRes['data']['data'];
assert($returnedRec['status'] === 'returned', "Status did not change to returned");
assert(!empty($returnedRec['returnDate']), "Return date was not recorded");
echo "  [PASS] Book returned. Return date: {$returnedRec['returnDate']}\n";

// Verify After-Effect: Inventory free copies incremented (+1)
$bookAfterReturn = req('GET', "/api/books/{$returnedBookId}", null, $tanvirCookie);
$freeAfter = (int)$bookAfterReturn['data']['data']['availableCopies'];
echo "  Free copies after return: {$freeAfter} (Expected: " . ($freeBefore + 1) . ")\n";
assert($freeAfter === $freeBefore + 1, "Inventory copies did not increment by 1!");
echo "  [PASS] Inventory copies accurately restored (+1).\n";

// Verify After-Effect: Double return prevention
$dupReturn = req('POST', "/api/borrowings/{$loanId}/return", [], $tanvirCookie);
assert($dupReturn['status'] === 400, "Double return was not rejected!");
echo "  [PASS] Double return blocked with HTTP 400: '{$dupReturn['data']['error']}'\n";

// 4. Test Borrowing an available book
echo "\n4. Testing Book Borrowing & Inventory Decrement...\n";
// Find a book that Tanvir does not currently have
$refreshedMyLoans = req('GET', '/api/borrowings/my', null, $tanvirCookie);
$currentActiveBookIds = [];
foreach ($refreshedMyLoans['data']['data'] ?? [] as $r) {
    if ($r['status'] === 'active') $currentActiveBookIds[] = (int)$r['bookId'];
}
$booksRes = req('GET', '/api/books', null, $tanvirCookie);
$books = $booksRes['data']['data']['books'];
$targetBook = null;
foreach ($books as $b) {
    if (!in_array((int)$b['id'], $currentActiveBookIds, true) && (int)$b['availableCopies'] > 0) {
        $targetBook = $b;
        break;
    }
}
assert($targetBook !== null, "No available book to borrow");
$targetId = (int)$targetBook['id'];
$availBefore = (int)$targetBook['availableCopies'];
echo "  Borrowing Book #{$targetId} ('{$targetBook['title']}'), Avail before: {$availBefore}\n";

$borrowRes = req('POST', '/api/borrowings', ['book_id' => $targetId], $tanvirCookie);
assert($borrowRes['status'] === 201, "Borrow failed: " . ($borrowRes['data']['error'] ?? ''));
$newBorrow = $borrowRes['data']['data'];
$newBorrowId = (int)$newBorrow['id'];
echo "  [PASS] Borrowed with ID #{$newBorrowId}. Status: {$newBorrow['status']}, Due: {$newBorrow['dueDate']}\n";

// Verify After-Effect: Inventory free copies decremented (-1)
$bookAfterBorrow = req('GET', "/api/books/{$targetId}", null, $tanvirCookie);
$availAfter = (int)$bookAfterBorrow['data']['data']['availableCopies'];
echo "  Free copies after borrow: {$availAfter} (Expected: " . ($availBefore - 1) . ")\n";
assert($availAfter === $availBefore - 1, "Inventory did not decrement by 1!");
echo "  [PASS] Inventory copies accurately decremented (-1).\n";

// Verify After-Effect: Duplicate borrow prevention
$dupBorrow = req('POST', '/api/borrowings', ['book_id' => $targetId], $tanvirCookie);
assert($dupBorrow['status'] === 400, "Duplicate borrow was not rejected!");
echo "  [PASS] Duplicate borrow blocked with 400: '{$dupBorrow['data']['error']}'\n";

// 5. Fill quota to 5 books and test borrow limit enforcement
echo "\n5. Testing Borrow Limit Enforcement...\n";
// Ensure Tanvir has 5 active loans
$activeCount = 0;
$myCurrent = req('GET', '/api/borrowings/my', null, $tanvirCookie);
$activeIds = [];
foreach ($myCurrent['data']['data'] ?? [] as $r) {
    if ($r['status'] === 'active') {
        $activeCount++;
        $activeIds[] = (int)$r['bookId'];
    }
}
echo "  Current active count for Tanvir: {$activeCount}/5\n";
// Borrow up to 5 if needed
if ($activeCount < 5) {
    foreach ($books as $b) {
        if (!in_array((int)$b['id'], $activeIds, true) && (int)$b['availableCopies'] > 0) {
            $fillRes = req('POST', '/api/borrowings', ['book_id' => $b['id']], $tanvirCookie);
            if ($fillRes['status'] === 201) {
                $activeCount++;
                $activeIds[] = (int)$b['id'];
                echo "  + Filled quota with Book #{$b['id']} ('{$b['title']}') -> active count: {$activeCount}/5\n";
                if ($activeCount >= 5) break;
            }
        }
    }
}

// Now find a book Tanvir does NOT have and try to borrow 6th book
$unborrowedBook = null;
foreach ($books as $b) {
    if (!in_array((int)$b['id'], $activeIds, true)) {
        $unborrowedBook = $b;
        break;
    }
}

if ($unborrowedBook) {
    $borrowLimitRes = req('POST', '/api/borrowings', ['book_id' => $unborrowedBook['id']], $tanvirCookie);
    echo "  Attempting 6th book borrow (Book #{$unborrowedBook['id']}) status: {$borrowLimitRes['status']}\n";
    assert($borrowLimitRes['status'] === 400, "Borrow limit was not enforced!");
    assert(str_contains(strtolower($borrowLimitRes['data']['error'] ?? ''), 'limit reached'), "Error didn't mention limit: " . ($borrowLimitRes['data']['error'] ?? ''));
    echo "  [PASS] Max borrow limit enforced: '{$borrowLimitRes['data']['error']}'\n";
}

// 6. Test Loan Renewal & Renew Count Limit
echo "\n6. Testing Loan Renewal & Renew Count Limit...\n";
$renew1 = req('POST', "/api/borrowings/{$newBorrowId}/renew", ['days' => 7], $tanvirCookie);
assert($renew1['status'] === 200, "Renewal 1 failed: " . ($renew1['data']['error'] ?? ''));
assert((int)$renew1['data']['data']['renewCount'] === 1, "Renew count is not 1");
echo "  [PASS] Renewal 1 succeeded. New due: {$renew1['data']['data']['dueDate']}\n";

$renew2 = req('POST', "/api/borrowings/{$newBorrowId}/renew", ['days' => 7], $tanvirCookie);
assert($renew2['status'] === 200, "Renewal 2 failed: " . ($renew2['data']['error'] ?? ''));
assert((int)$renew2['data']['data']['renewCount'] === 2, "Renew count is not 2");
echo "  [PASS] Renewal 2 succeeded. New due: {$renew2['data']['data']['dueDate']}\n";

// Max renewals is 2 by default; renewal 3 should be rejected for members
$renew3 = req('POST', "/api/borrowings/{$newBorrowId}/renew", ['days' => 7], $tanvirCookie);
assert($renew3['status'] === 400, "Renewal 3 should be rejected!");
assert(str_contains(strtolower($renew3['data']['error'] ?? ''), 'renewal limit reached'), "Error didn't mention renewal limit: " . ($renew3['data']['error'] ?? ''));
echo "  [PASS] Max renewals (2) enforced: '{$renew3['data']['error']}'\n";

// 7. Test Admin Can Return and Override
echo "\n7. Testing Admin Processing Return for Member...\n";
$adminReturn = req('POST', "/api/borrowings/{$newBorrowId}/return", [], $adminCookie);
assert($adminReturn['status'] === 200, "Admin return failed: " . ($adminReturn['data']['error'] ?? ''));
assert($adminReturn['data']['data']['status'] === 'returned', "Status not returned");
echo "  [PASS] Admin successfully returned loan #{$newBorrowId} on behalf of member.\n";

// 8. Public Statistics Endpoint
echo "\n8. Testing Public Statistics Endpoint (/api/stats)...\n";
$statsRes = req('GET', '/api/stats');
assert($statsRes['status'] === 200, "Stats endpoint failed");
$stats = $statsRes['data']['data'];
assert(isset($stats['totalTitles']) && $stats['totalTitles'] > 0, "totalTitles missing or 0");
assert(isset($stats['activeLoans']), "activeLoans missing");
echo "  [PASS] /api/stats is live: Titles={$stats['totalTitles']}, Copies={$stats['totalCopies']}, ActiveLoans={$stats['activeLoans']}, Members={$stats['totalMembers']}\n";

// Clean up cookies
@unlink($tanvirCookie);
@unlink($student1Cookie);
@unlink($adminCookie);

echo "\n========================================================\n";
echo "ALL CIRCULATION & AFTER-EFFECT QA TESTS PASSED (100%)\n";
echo "========================================================\n";
