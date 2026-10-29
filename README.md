# Islamic University Central Library — Full-Stack Management System

A full-stack modern library management platform combining a **React 19 + TypeScript + Tailwind CSS** frontend with a native **PHP 8.2+ MVC + MySQL / MariaDB (PDO)** backend, designed for local development on **XAMPP (Apache + MySQL)**.

Developed based on the academic project report for **Course CSE 3210: Software Project**, Department of Computer Science & Engineering, Islamic University, Bangladesh.

- **Author:** Tanvir Ahmed (Roll: 2114028, Reg: 1093, Session: 2021-22)
- **Project Supervisor:** Md. Mojahidul Islam, Associate Professor, Dept. of CSE, Islamic University, Bangladesh

---

## 🔑 Predefined Demo Accounts

All demo accounts are seeded idempotently in MySQL/MariaDB with hashes created via PHP `password_hash()` and verified via `password_verify()`:

| Role | Username | Password | Full Name | Member / Student ID |
|---|---|---|---|---|
| **Administrator** | `admin` | `Admin@123` | System Administrator | EMP-ADM-001 |
| **Member (Student)** | `tanvir` | `User@123` | Tanvir Ahmed | CSE-214028 |
| **Member (Student)** | `student1` | `Student@123` | Nusrat Jahan | CSE-2021-042 |
| **Member (Student)** | `student2` | `Student@123` | Ariful Islam | EEE-2021-015 |

> **Authentication Mechanism:** Authentication is based strictly on **usernames** and passwords (not email). Sessions are established with `session_regenerate_id(true)`, `HttpOnly` cookies, and `SameSite=Lax`.

---

## 🏛️ System Architecture

```
Tanvir/
├── src/                          # React 19 Frontend Application
│   ├── components/               # UI components (BookCard, Navbar, Modals, etc.)
│   ├── context/                  # AuthContext and LibraryContext
│   ├── pages/                    # Public, Student Dashboard, Admin Console pages
│   ├── services/                 # api.ts (backend client), storage.ts (fallback cache)
│   └── types/                    # TypeScript interfaces
├── backend/                      # Native PHP 8.2+ MVC Backend
│   ├── config/database.php       # PDO connection (MySQL default with auto-fallback)
│   ├── controllers/              # Auth, Book, Category, Borrowing, Member, Dashboard, etc.
│   ├── models/                   # User, Book, Category, Borrowing, Notification, Setting
│   ├── middleware/               # Session Auth, Admin Guard, CSRF Protection
│   ├── services/                 # BorrowingService (concurrency-safe transactions)
│   ├── routes/api.php            # RESTful API route registry & dispatcher
│   ├── utils/                    # JSON Response and Validation helpers
│   ├── database/                 # schema.sql, schema_sqlite.sql, seed.php
│   ├── public/index.php          # Front controller gateway & Apache .htaccess
│   ├── tests/run_tests.php       # Automated end-to-end integration test runner
│   └── .env                      # Database configuration
├── vite.config.ts                # Vite config with backend proxy (/api -> :8000)
└── package.json
```

---

## 🚀 Getting Started

### 1. Database Setup (XAMPP MySQL)

1. Launch **XAMPP Control Panel** and start **Apache** and **MySQL**.
2. Open `backend/.env` and verify credentials (default XAMPP settings):
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=library_management_system
   DB_USERNAME=root
   DB_PASSWORD=
   ```
3. Initialize the database schema and seed predefined demo accounts:
   ```bash
   php backend/database/seed.php
   ```
   *(The seeder is idempotent: running it multiple times safely updates records without errors).*

### 2. Start the Backend API Server

Run PHP's built-in development server pointing to `backend/public`:
```bash
php -S 127.0.0.1:8000 -t backend/public
```

### 3. Start the React Frontend

In a separate terminal window, start the Vite development server:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser. All requests to `/api/*` are automatically proxied to the PHP backend.

---

## 🧪 Automated Verification Test Suite

A complete end-to-end integration test suite is included in `backend/tests/run_tests.php`. To execute:
```bash
php backend/tests/run_tests.php
```

### Verification Checklist:
- [x] API Health & Database Connection
- [x] Public Book Catalogue & Search
- [x] Student Authentication (`tanvir` / `User@123`) & Session Persistence
- [x] Student Dashboard KPIs & Due Reminders
- [x] Concurrency-Safe Book Borrowing (`SELECT ... FOR UPDATE`, 5-book limit)
- [x] Stock Inventory Decrement on Borrow
- [x] Stock Inventory Restoration & Fine Calculation on Return
- [x] Role Protection (Member 403 Forbidden on Admin Endpoints)
- [x] Administrator Authentication (`admin` / `Admin@123`)
- [x] Admin Dashboard Analytics & Charts
- [x] Admin Book CRUD Operations (Add, Edit, Delete with active loans check)
- [x] Session Termination & Secure Cookie Invalidation

---

## 📡 REST API Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login with username and password | Public |
| `POST` | `/api/auth/logout` | Terminate session and clear cookie | Authenticated |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Authenticated |
| `GET` | `/api/auth/csrf` | Fetch active CSRF token | Public |
| `POST` | `/api/auth/register` | Register new student member | Public |
| `PUT` | `/api/auth/profile` | Update profile details | Authenticated |
| `POST` | `/api/auth/change-password` | Update account password | Authenticated |
| `GET` | `/api/books` | Search, filter, and paginate catalog | Public |
| `GET` | `/api/books/{id}` | Single book details | Public |
| `POST` | `/api/books` | Create new catalog entry | Admin |
| `PUT` | `/api/books/{id}` | Update book details and copies | Admin |
| `DELETE` | `/api/books/{id}` | Delete book (rejects if active loans) | Admin |
| `GET` | `/api/categories` | Categories list with book counts | Public |
| `POST` | `/api/borrowings` | Borrow book (concurrency-safe transaction) | Member / Admin |
| `POST` | `/api/borrowings/{id}/return` | Check in book & restore copy count | Member (own) / Admin |
| `POST` | `/api/borrowings/{id}/renew` | Extend due date by 7 days | Member (own) / Admin |
| `GET` | `/api/borrowings/my` | Current student borrowing history | Member |
| `GET` | `/api/borrowings` | All circulation records with filters | Admin |
| `GET` | `/api/dashboard/stats` | System KPIs & monthly borrowing trend | Admin |
| `GET` | `/api/dashboard/member` | Student active loans & due soon alerts | Member |
| `GET` | `/api/members` | Student patron list | Admin |
| `PUT` | `/api/members/{id}/status` | Suspend or reactivate student | Admin |
| `GET` | `/api/notifications` | In-app notification center | Member / Admin |
| `GET` | `/api/settings` | Loan periods, max books limit, fines | Public |
| `PUT` | `/api/settings` | Update system configurations | Admin |

---

## 🎨 UI/UX Design System

- **Primary Forest:** `#173F35`
- **Muted Sage:** `#DCE8DF`
- **Warm Amber:** `#D6A75D`
- **Ivory Background:** `#FAF9F5`
- **Charcoal Text:** `#242B28`
- **Dynamic Cover Generator:** Crisp inline SVG data URI fallback for all book covers.
- **Accessibility:** Keyboard navigable modal dialogs, visible focus rings, ARIA labels, and responsive mobile drawers.
