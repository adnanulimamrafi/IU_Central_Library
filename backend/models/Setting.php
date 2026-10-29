<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

class Setting {
    private static array $defaults = [
        'library_name' => 'Central Digital Library',
        'institution_name' => 'State University of Technology',
        'department_name' => 'Department of Computer Science & Engineering',
        'default_loan_days' => '14',
        'max_borrow_limit' => '5',
        'fine_rate_per_day' => '2.00',
        'currency' => 'BDT',
        'contact_email' => 'library@centraltech.edu',
        'contact_phone' => '+880 1711-234567',
        'allow_self_renewal' => '1',
        'max_renewals' => '2',
    ];

    public static function getAll(): array {
        $pdo = Database::getConnection();
        $stmt = $pdo->query('SELECT setting_key, setting_value FROM settings');
        $rows = $stmt->fetchAll();

        $settings = self::$defaults;
        foreach ($rows as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        return [
            'libraryName' => $settings['library_name'],
            'institutionName' => $settings['institution_name'],
            'departmentName' => $settings['department_name'],
            'defaultLoanDurationDays' => (int)$settings['default_loan_days'],
            'maxBorrowLimit' => (int)$settings['max_borrow_limit'],
            'fineRatePerDay' => (float)$settings['fine_rate_per_day'],
            'currency' => $settings['currency'],
            'contactEmail' => $settings['contact_email'],
            'contactPhone' => $settings['contact_phone'],
            'allowSelfRenewal' => (bool)$settings['allow_self_renewal'],
            'maxRenewals' => (int)$settings['max_renewals'],
        ];
    }

    public static function get(string $key, mixed $default = null): mixed {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT setting_value FROM settings WHERE setting_key = ? LIMIT 1');
        $stmt->execute([$key]);
        $val = $stmt->fetchColumn();
        if ($val === false) {
            return self::$defaults[$key] ?? $default;
        }
        return $val;
    }

    public static function set(string $key, mixed $value): bool {
        $pdo = Database::getConnection();
        $valStr = (string)$value;
        $driver = Database::getDriver();

        if ($driver === 'sqlite') {
            $stmt = $pdo->prepare('INSERT INTO settings (setting_key, setting_value, updated_at) 
                                   VALUES (?, ?, CURRENT_TIMESTAMP) 
                                   ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP');
            return $stmt->execute([$key, $valStr]);
        }

        $stmt = $pdo->prepare('INSERT INTO settings (setting_key, setting_value) 
                               VALUES (?, ?) 
                               ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)');
        return $stmt->execute([$key, $valStr]);
    }

    public static function setMany(array $settings): bool {
        $map = [
            'libraryName' => 'library_name',
            'institutionName' => 'institution_name',
            'departmentName' => 'department_name',
            'defaultLoanDurationDays' => 'default_loan_days',
            'maxBorrowLimit' => 'max_borrow_limit',
            'fineRatePerDay' => 'fine_rate_per_day',
            'currency' => 'currency',
            'contactEmail' => 'contact_email',
            'contactPhone' => 'contact_phone',
            'allowSelfRenewal' => 'allow_self_renewal',
            'maxRenewals' => 'max_renewals',
            // Also accept direct keys
            'library_name' => 'library_name',
            'institution_name' => 'institution_name',
            'department_name' => 'department_name',
            'default_loan_days' => 'default_loan_days',
            'max_borrow_limit' => 'max_borrow_limit',
            'fine_rate_per_day' => 'fine_rate_per_day',
            'contact_email' => 'contact_email',
            'contact_phone' => 'contact_phone',
            'allow_self_renewal' => 'allow_self_renewal',
            'max_renewals' => 'max_renewals',
        ];

        foreach ($settings as $key => $val) {
            if (isset($map[$key])) {
                self::set($map[$key], is_bool($val) ? ($val ? '1' : '0') : (string)$val);
            }
        }
        return true;
    }
}
