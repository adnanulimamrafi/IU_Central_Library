# Library Management System - PHP & MySQL Backend

A native, lightweight PHP 8.2+ MVC backend with PDO prepared statements and session-based authentication designed for local development with XAMPP (Apache + MySQL / MariaDB).

---

## 1. Demo Credentials

| Role | Username | Password | Full Name | Member ID |
|---|---|---|---|---|
| **Administrator** | `admin` | `Admin@123` | System Administrator | EMP-ADM-001 |
| **Member (Student)** | `tanvir` | `User@123` | Tanvir Ahmed | 2114028 |
| **Member (Student)** | `student1` | `Student@123` | Nusrat Jahan | CSE-2021-042 |
| **Member (Student)** | `student2` | `Student@123` | Ariful Islam | EEE-2021-015 |

> **Security Note:** Passwords are stored using PHP's native `password_hash()` (Bcrypt/Argon2) and verified using `password_verify()`. Sessions regenerate their ID on login (`session_regenerate_id(true)`) and use `HttpOnly` and `SameSite=Lax` cookie flags.

---

## 2. Directory Structure

```
backend/
├── config/
│   └── database.php          # PDO connection provider (MySQL default + auto SQLite fallback)
├── controllers/
│   ├── AuthController.php    # Login, logout, me, register, profile, change password
│   ├── BookController.php    # Book catalog & admin CRUD operations
│   ├── CategoryController.php# Category management & statistics
│   ├── BorrowingController.php # Issue book, return, renewal endpoints
│   ├── MemberController.php  # Member management & account status toggle
│   ├── DashboardController.php # Admin overview statistics & student stats
│   ├── NotificationController.php # In-app notification center
│   ├── FavouriteController.php # Reading list / bookmarks
│   └── SettingsController.php # Library system parameters
├── models/
│   ├── User.php
│   ├── Book.php
│   ├── Category.php
│   ├── Borrowing.php
│   ├── Notification.php
│   ├── Favourite.php
│   └── Setting.php
├── middleware/
│   ├── auth.php              # Session validation & requireAuth
│   ├── admin.php             # Admin role check (requireAdmin)
│   └── csrf.php              # CSRF protection tokens
├── services/
│   └── BorrowingService.php  # Concurrency-safe transactions (SELECT ... FOR UPDATE)
├── routes/
│   └── api.php               # RESTful API route registry & dispatcher
├── utils/
│   ├── response.php          # JSON output and CORS header handlers
│   └── validation.php        # Input validation and sanitization
├── database/
│   ├── schema.sql            # MySQL table definitions, foreign keys, and indexes
│   ├── schema_sqlite.sql     # SQLite schema for fallback/portable testing
│   └── seed.php              # Idempotent database seeder
├── public/
│   ├── index.php             # Front controller & API gateway
│   └── .htaccess             # Apache URL rewriting rules
├── .env.example
├── .env
└── README.md
```

---

## 3. Database Setup (XAMPP)

1. Start **Apache** and **MySQL** from the XAMPP Control Panel.
2. Ensure the credentials in `backend/.env` match your MySQL setup (default `root` with no password):
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=library_management_system
   DB_USERNAME=root
   DB_PASSWORD=
   ```
3. Run the database initialization and seeder script from your terminal:
   ```bash
   php backend/database/seed.php
   ```
   *Alternatively, navigate to `http://localhost:8000/api/seed` in your browser.*

---

## 4. Running the Development Server

To run the backend with PHP's built-in web server:
```bash
php -S 127.0.0.1:8000 -t backend/public
```

In the root directory, start the React frontend:
```bash
npm run dev
```
The Vite development server is pre-configured to proxy `/api` requests to `http://127.0.0.1:8000`.

---

## 5. API Reference Summary

### Authentication
- `POST /api/auth/login`: `{ "username": "admin", "password": "Admin@123" }`
- `POST /api/auth/logout`: Clears session
- `GET /api/auth/me`: Current session user info
- `GET /api/auth/csrf`: CSRF token for secure state mutations
- `POST /api/auth/register`: Member registration
- `PUT /api/auth/profile`: Update user profile details
- `POST /api/auth/change-password`: Update account password

### Books & Catalogue
- `GET /api/books`: Filterable catalog (`?search=...&category=...&availability=...&sort=...`)
- `GET /api/books/{id}`: Single book detail
- `POST /api/books`: Add book (Admin)
- `PUT /api/books/{id}`: Edit book (Admin)
- `DELETE /api/books/{id}`: Delete book (Admin, rejects if active loans exist)

### Borrowings & Loans
- `POST /api/borrowings`: Issue a book (`{ "book_id": 1 }`) — concurrency-safe with row locking and 5-book limit check
- `POST /api/borrowings/{id}/return`: Return book and restore inventory
- `POST /api/borrowings/{id}/renew`: Extend loan period
- `GET /api/borrowings/my`: Current user's borrowing history
- `GET /api/borrowings`: All borrowing records (Admin)

### Administration & Dashboards
- `GET /api/dashboard/stats`: Admin analytics and monthly trend charts
- `GET /api/dashboard/member`: Student dashboard counts and due-soon reminders
- `GET /api/members`: Manage library patrons (Admin)
- `PUT /api/members/{id}/status`: Toggle member status (active / suspended)
- `GET /api/settings`: System configurations
- `PUT /api/settings`: Update loan duration, limits, and contact information (Admin)
