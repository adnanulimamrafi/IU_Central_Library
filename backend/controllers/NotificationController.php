<?php
declare(strict_types=1);

require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../utils/response.php';

class NotificationController {
    /**
     * GET /api/notifications
     */
    public function index(): void {
        $user = Auth::requireAuth();
        $notifications = Notification::getUserNotifications((int)$user['id']);

        $formatted = array_map(function ($n) {
            return [
                'id' => (string)$n['id'],
                'userId' => (string)($n['user_id'] ?? 'all'),
                'title' => $n['title'],
                'message' => $n['message'],
                'type' => $n['type'],
                'createdAt' => $n['created_at'],
                'read' => (bool)$n['is_read'],
                'actionUrl' => $n['action_url'] ?? '',
            ];
        }, $notifications);

        Response::json($formatted);
    }

    /**
     * PUT /api/notifications/{id}/read
     */
    public function markRead(int|string $id): void {
        $user = Auth::requireAuth();
        $cleanId = (int)preg_replace('/[^0-9]/', '', (string)$id);
        if ($cleanId > 0) {
            Notification::markAsRead($cleanId, (int)$user['id']);
        }
        Response::json(['message' => 'Notification marked as read.']);
    }

    /**
     * PUT /api/notifications/read-all
     */
    public function markAllRead(): void {
        $user = Auth::requireAuth();
        Notification::markAllAsRead((int)$user['id']);
        Response::json(['message' => 'All notifications marked as read.']);
    }
}
