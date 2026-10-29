<?php
declare(strict_types=1);

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Borrowing.php';
require_once __DIR__ . '/../middleware/admin.php';
require_once __DIR__ . '/../utils/response.php';

class MemberController {
    /**
     * GET /api/members (Admin only)
     */
    public function index(): void {
        AdminMiddleware::requireAdmin();

        $search = $_GET['search'] ?? null;
        $status = $_GET['status'] ?? null;
        $members = User::getAll('member', $status, $search);

        $formatted = array_map(function ($m) {
            return [
                'id' => (string)$m['id'],
                'name' => $m['full_name'],
                'username' => $m['username'],
                'email' => $m['email'],
                'role' => $m['role'],
                'studentId' => $m['member_id'] ?? '',
                'department' => $m['department'] ?? '',
                'session' => $m['session'] ?? '',
                'phone' => $m['phone'] ?? '',
                'avatar' => $m['avatar'] ?? '',
                'bio' => $m['bio'] ?? '',
                'status' => $m['status'] === 'disabled' ? 'suspended' : 'active',
                'createdAt' => $m['created_at'],
            ];
        }, $members);

        Response::json($formatted);
    }

    /**
     * GET /api/members/{id} (Admin only)
     */
    public function show(int|string $id): void {
        AdminMiddleware::requireAdmin();
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);

        $m = User::findById($cleanId);
        if (!$m) {
            Response::error('Member not found.', 404);
        }

        $borrowings = Borrowing::getUserHistory($cleanId);

        Response::json([
            'member' => [
                'id' => (string)$m['id'],
                'name' => $m['full_name'],
                'username' => $m['username'],
                'email' => $m['email'],
                'role' => $m['role'],
                'studentId' => $m['member_id'] ?? '',
                'department' => $m['department'] ?? '',
                'session' => $m['session'] ?? '',
                'phone' => $m['phone'] ?? '',
                'avatar' => $m['avatar'] ?? '',
                'bio' => $m['bio'] ?? '',
                'status' => $m['status'] === 'disabled' ? 'suspended' : 'active',
                'createdAt' => $m['created_at'],
            ],
            'borrowings' => $borrowings,
        ]);
    }

    /**
     * PUT /api/members/{id}/status (Admin only)
     */
    public function updateStatus(int|string $id): void {
        AdminMiddleware::requireAdmin();
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        $user = User::findById($cleanId);
        if (!$user) {
            Response::error('User not found.', 404);
        }

        // Prevent admin from disabling themselves
        $currentAdmin = Auth::getUser();
        if ($currentAdmin && (int)$currentAdmin['id'] === $cleanId) {
            Response::error('You cannot change the status of your own account.', 400);
        }

        $body = Response::getJsonBody();
        $newStatus = $body['status'] ?? null;
        if ($newStatus === null) {
            // Toggle
            $newStatus = ($user['status'] === 'active') ? 'disabled' : 'active';
        } else {
            // Frontend might send 'suspended'
            $newStatus = ($newStatus === 'suspended' || $newStatus === 'disabled') ? 'disabled' : 'active';
        }

        User::updateStatus($cleanId, $newStatus);

        Response::json([
            'id' => (string)$cleanId,
            'status' => $newStatus === 'disabled' ? 'suspended' : 'active',
            'message' => "User status updated to {$newStatus}.",
        ]);
    }
}
