<?php
declare(strict_types=1);

/**
 * Database Configuration & Connection Provider
 * Supports MySQL / MariaDB (production on Alwaysdata & local XAMPP)
 * and SQLite (isolated local test suite only).
 */

class Database {
    private static ?PDO $pdo = null;
    private static string $driver = 'mysql';

    /**
     * Parse .env file without external dependencies
     */
    public static function loadEnv(?string $path = null): void {
        if ($path === null) {
            $path = dirname(__DIR__) . '/.env';
            if (!file_exists($path)) {
                $altPath = dirname(__DIR__, 2) . '/.env';
                if (file_exists($altPath)) {
                    $path = $altPath;
                }
            }
        }

        if (!file_exists($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return;
        }

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

                // Populate into getenv, $_ENV, and $_SERVER if not already set
                if (!array_key_exists($key, $_ENV) && !array_key_exists($key, $_SERVER) && getenv($key) === false) {
                    putenv("{$key}={$value}");
                    $_ENV[$key] = $value;
                    $_SERVER[$key] = $value;
                }
            }
        }
    }

    /**
     * Retrieve environment variable safely
     */
    public static function getEnv(string $key, ?string $default = null): ?string {
        $val = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
        if ($val === false || $val === null || $val === '') {
            return $default;
        }
        return (string)$val;
    }

    /**
     * Get or create PDO instance
     */
    public static function getConnection(): PDO {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        // Load environment variables
        self::loadEnv();

        $driver = strtolower(self::getEnv('DB_CONNECTION', 'mysql') ?? 'mysql');
        $host = self::getEnv('DB_HOST', 'mysql-iucentrallibrary.alwaysdata.net') ?? 'mysql-iucentrallibrary.alwaysdata.net';
        $port = self::getEnv('DB_PORT', '3306') ?? '3306';
        $database = self::getEnv('DB_DATABASE', 'iucentrallibrary_librarydb') ?? 'iucentrallibrary_librarydb';
        $username = self::getEnv('DB_USERNAME', 'iucentrallibrary') ?? 'iucentrallibrary';
        $password = self::getEnv('DB_PASSWORD', '') ?? '';
        $appEnv = strtolower(self::getEnv('APP_ENV', 'development') ?? 'development');
        $isProduction = ($appEnv === 'production');
        $appDebug = filter_var(self::getEnv('APP_DEBUG', $isProduction ? 'false' : 'true'), FILTER_VALIDATE_BOOLEAN);
        $allowSqliteFallback = filter_var(self::getEnv('ALLOW_SQLITE_FALLBACK', 'false'), FILTER_VALIDATE_BOOLEAN);

        $pdoOptions = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci',
        ];

        // 1. MySQL / MariaDB Connection
        if ($driver === 'mysql' || $driver === 'auto') {
            try {
                $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
                self::$pdo = new PDO($dsn, $username, $password, $pdoOptions);
                self::$driver = 'mysql';
                return self::$pdo;
            } catch (PDOException $e) {
                // Log real internal error privately without exposing credentials in web responses
                error_log("Database connection error [Host: {$host}, DB: {$database}]: " . $e->getMessage());

                // On local development only: if database is missing, try to create it on localhost
                $isLocalhost = in_array($host, ['127.0.0.1', 'localhost', '::1'], true);
                if (!$isProduction && $isLocalhost && (str_contains($e->getMessage(), 'Unknown database') || $e->getCode() === 1049)) {
                    try {
                        $serverDsn = "mysql:host={$host};port={$port};charset=utf8mb4";
                        $serverPdo = new PDO($serverDsn, $username, $password, $pdoOptions);
                        $serverPdo->exec("CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                        
                        self::$pdo = new PDO($dsn, $username, $password, $pdoOptions);
                        self::$driver = 'mysql';
                        return self::$pdo;
                    } catch (PDOException $createEx) {
                        error_log("Local database auto-create failed: " . $createEx->getMessage());
                    }
                }

                // In testing/local auto mode, allow fallback to local SQLite if explicitly enabled
                if (!$isProduction && ($driver === 'auto' || $allowSqliteFallback)) {
                    $sqlitePath = dirname(__DIR__) . '/database/library.sqlite';
                    self::$pdo = new PDO("sqlite:{$sqlitePath}", null, null, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]);
                    self::$pdo->exec('PRAGMA foreign_keys = ON;');
                    self::$driver = 'sqlite';
                    return self::$pdo;
                }

                // Production safety: Never leak database password or full credentials
                if ($isProduction || !$appDebug) {
                    throw new PDOException("Database connection error. Please verify database availability.", 500);
                }

                // Detailed error for local development only
                throw new PDOException("Could not connect to MySQL server at {$host}:{$port} [DB: {$database}]. (Error: " . $e->getMessage() . ")", (int)$e->getCode());
            }
        }

        // 2. Direct SQLite Connection (Local tests only)
        if ($driver === 'sqlite') {
            $sqlitePath = dirname(__DIR__) . '/database/library.sqlite';
            self::$pdo = new PDO("sqlite:{$sqlitePath}", null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
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
     * Helper to close connection (useful for testing/reconnecting)
     */
    public static function closeConnection(): void {
        self::$pdo = null;
    }
}
