<?php
declare(strict_types=1);

require_once __DIR__ . '/../models/Setting.php';
require_once __DIR__ . '/../middleware/admin.php';
require_once __DIR__ . '/../utils/response.php';

class SettingsController {
    /**
     * GET /api/settings
     */
    public function index(): void {
        $settings = Setting::getAll();
        Response::json($settings);
    }

    /**
     * PUT /api/settings (Admin only)
     */
    public function update(): void {
        AdminMiddleware::requireAdmin();
        $body = Response::getJsonBody();

        Setting::setMany($body);
        $updated = Setting::getAll();

        Response::json([
            'settings' => $updated,
            'message' => 'Library settings updated successfully.',
        ]);
    }
}
