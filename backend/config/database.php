<?php
declare(strict_types=1);

/**
 * Database Configuration & Connection Provider
 * Supports MySQL / MariaDB (primary for XAMPP) and optional SQLite fallback for local test runs.
 */

class Database {
    private static ?PDO $pdo = null;
    private static string $driver = 'mysql';

    /**
     * Parse simple .env file without external dependencies
     */
    private static function loadEnv(string $path): void {
        if (!file_exists($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                // Strip outer quotes
                if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                    (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                    $value = substr($value, 1, -1);
                }
                if (!array_key_exists($key, $_ENV) && !array_key_exists($key, $_SERVER)) {
                    putenv("{$key}={$value}");
                    $_ENV[$key] = $value;
                    $_SERVER[$key] = $value;
                }
            }
        }
    }

    /**
     * Get or create PDO instance
     */
    public static function getConnection(): PDO {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        // Load .env
        $envPath = dirname(__DIR__) . '/.env';
        self::loadEnv($envPath);

        $driver = $_ENV['DB_CONNECTION'] ?? 'mysql';
        $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
        $port = $_ENV['DB_PORT'] ?? '3306';
        $database = $_ENV['DB_DATABASE'] ?? 'library_management_system';
        $username = $_ENV['DB_USERNAME'] ?? 'root';
        $password = $_ENV['DB_PASSWORD'] ?? '';

        $pdoOptions = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        // Try MySQL first
        if ($driver === 'mysql' || $driver === 'auto') {
            try {
                // First attempt connecting directly to database
                $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
                self::$pdo = new PDO($dsn, $username, $password, $pdoOptions);
                self::$driver = 'mysql';
                return self::$pdo;
            } catch (PDOException $e) {
                // If database doesn't exist yet (1049 Unknown database), try to connect to server and create it
                if (str_contains($e->getMessage(), 'Unknown database') || $e->getCode() === 1049) {
                    try {
                        $serverDsn = "mysql:host={$host};port={$port};charset=utf8mb4";
                        $serverPdo = new PDO($serverDsn, $username, $password, $pdoOptions);
                        $serverPdo->exec("CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                        
                        // Reconnect to newly created database
                        self::$pdo = new PDO($dsn, $username, $password, $pdoOptions);
                        self::$driver = 'mysql';
                        return self::$pdo;
                    } catch (PDOException $createEx) {
                        // Fall through
                    }
                }

                // If MySQL is not reachable and auto mode is enabled or SQLite is available, fall back
                if ($driver === 'auto' || !empty($_ENV['ALLOW_SQLITE_FALLBACK'])) {
                    $sqlitePath = dirname(__DIR__) . '/database/library.sqlite';
                    self::$pdo = new PDO("sqlite:{$sqlitePath}", null, null, $pdoOptions);
                    self::$pdo->exec('PRAGMA foreign_keys = ON;');
                    self::$driver = 'sqlite';
                    return self::$pdo;
                }

                // If driver was explicitly mysql, throw meaningful error
                throw new PDOException("Could not connect to MySQL server at {$host}:{$port}. " .
                    "Ensure XAMPP MySQL is running. Original error: " . $e->getMessage(), (int)$e->getCode());
            }
        }

        // Direct SQLite connection
        if ($driver === 'sqlite') {
            $sqlitePath = dirname(__DIR__) . '/database/library.sqlite';
            self::$pdo = new PDO("sqlite:{$sqlitePath}", null, null, $pdoOptions);
            self::$pdo->exec('PRAGMA foreign_keys = ON;');
            self::$driver = 'sqlite';
            return self::$pdo;
        }

        throw new RuntimeException("Unsupported database driver: {$driver}");
    }

    public static function getDriver(): string {
        if (self::$pdo !== null) {
            try {
                return (string)self::$pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
            } catch (\Throwable $e) {}
        }
        return self::$driver;
    }

    /**
     * Helper to close connection (useful for testing/seeding)
     */
    public static function closeConnection(): void {
        self::$pdo = null;
    }
}
