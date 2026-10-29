<?php
declare(strict_types=1);

/**
 * Request Validation & Sanitization Helpers
 */

class Validation {
    /**
     * Check if required fields exist and are non-empty in data
     * Returns an array of error messages keyed by field name
     */
    public static function validateRequired(array $data, array $requiredFields): array {
        $errors = [];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
                $friendly = ucwords(str_replace('_', ' ', $field));
                $errors[$field] = "{$friendly} is required.";
            }
        }
        return $errors;
    }

    /**
     * Sanitize string input
     */
    public static function sanitizeString(?string $input): string {
        if ($input === null) {
            return '';
        }
        return trim(strip_tags($input));
    }

    /**
     * Validate integer within min / max bounds
     */
    public static function validateInt(mixed $val, int $min = 0, ?int $max = null): ?int {
        if (!is_numeric($val)) {
            return null;
        }
        $intVal = (int)$val;
        if ($intVal < $min) {
            return null;
        }
        if ($max !== null && $intVal > $max) {
            return null;
        }
        return $intVal;
    }

    /**
     * Generate URL-friendly slug
     */
    public static function slugify(string $text): string {
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text) ?: $text;
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        $text = strtolower($text);
        return empty($text) ? 'n-a' : $text;
    }
}
