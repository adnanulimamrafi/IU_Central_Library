# Alwaysdata Deployment Guide: IU Central Library PHP Backend

This guide provides end-to-end instructions for deploying the **IU Central Library Management System** PHP 8.2+ backend to **Alwaysdata** and connecting it to your live Vercel frontend.

---

## Architecture Overview

```
+-------------------------------------------------------+
|  Frontend: Vercel (React + TypeScript + Vite)         |
|  URL: https://iu-central-library.vercel.app           |
+---------------------------+---------------------------+
                            |
                   HTTPS Cross-Origin API
                   with Credentials (Cookies)
                            |
                            v
+-------------------------------------------------------+
|  Backend: Alwaysdata (Native PHP 8.2 / 8.3)           |
|  URL: https://<your-account>.alwaysdata.net/api       |
|  Document Root: .../backend/public                    |
+---------------------------+---------------------------+
                            |
                   Internal MySQL PDO
                            |
                            v
+-------------------------------------------------------+
|  Database: Alwaysdata MySQL 8.x                       |
|  Host: mysql-iucentrallibrary.alwaysdata.net:3306     |
|  Database: iucentrallibrary_librarydb                 |
|  User: iucentrallibrary                               |
+-------------------------------------------------------+
```

---

## Pre-requisites & Database Credentials

Your Alwaysdata MySQL database details:
- **Database Host**: `mysql-iucentrallibrary.alwaysdata.net`
- **Database Port**: `3306`
- **Database Name**: `iucentrallibrary_librarydb`
- **Database Username**: `iucentrallibrary`
- **Database Password**: Set privately by you in `backend/.env` on the server.

> **Security Note**: Never commit the real database password to Git or send it in plaintext chat.

---

## Step 1: Confirm Database Schema in phpMyAdmin

1. Log in to your Alwaysdata phpMyAdmin (`https://phpmyadmin.alwaysdata.com/`).
2. Select `iucentrallibrary_librarydb`.
3. Confirm that the tables are present (`users`, `categories`, `books`, `borrowings`, `favourites`, `notifications`, `settings`).
   *(If not already imported, import `backend/database/schema.sql` via the phpMyAdmin **Import** tab).*

---

## Step 2: Deploy Backend Code to Alwaysdata

You can deploy the code via SSH (recommended) or via SFTP.

### Method A: Git via SSH (Recommended)

1. In the Alwaysdata admin panel, navigate to **Remote access** > **SSH** and ensure SSH is enabled.
2. Connect to your Alwaysdata account via terminal:
   ```bash
   ssh iucentrallibrary@ssh-iucentrallibrary.alwaysdata.net
   ```
3. Clone or pull the repository in your home directory:
   ```bash
   cd /home/iucentrallibrary
   git clone https://github.com/adnanulimamrafi/IU_Central_Library.git
   ```
   *(If already cloned, simply update: `cd IU_Central_Library && git pull origin main`)*

### Method B: SFTP / Web File Manager
Upload the project folder `IU_Central_Library` to `/home/iucentrallibrary/IU_Central_Library`.

---

## Step 3: Configure Alwaysdata Site (Web > Sites)

1. Log in to your **Alwaysdata Admin Panel**.
2. Go to **Web** > **Sites**.
3. Edit your existing site (or click **Add a site**):
   - **Name**: `IU Central Library API`
   - **Domain / Addresses**: `<your-account>.alwaysdata.net` (e.g. `iucentrallibrary.alwaysdata.net`)
   - **Type**: `PHP`
   - **PHP Version**: `8.2` or `8.3`
   - **Application path / Working directory**:
     ```
     /home/iucentrallibrary/IU_Central_Library/backend/public
     ```
     > **CRITICAL**: The application path MUST point directly to `backend/public`, **NOT** the root repository. This ensures that sensitive files (`.env`, `controllers/`, `models/`, `.git/`) are placed outside the public web root and cannot be accessed via direct URLs.
   - **SSL**: Enable **Force HTTPS** (Alwaysdata automatically issues a free Let's Encrypt SSL certificate).
4. Click **Submit** or **Save**.

---

## Step 4: Configure Production `.env` File on Alwaysdata

1. Via SSH terminal (or Alwaysdata File Manager):
   ```bash
   cd /home/iucentrallibrary/IU_Central_Library/backend
   cp .env.example .env
   nano .env
   ```
2. Fill in your real configuration values:
   ```dotenv
   # Database Configuration
   DB_CONNECTION=mysql
   DB_HOST=mysql-iucentrallibrary.alwaysdata.net
   DB_PORT=3306
   DB_DATABASE=iucentrallibrary_librarydb
   DB_USERNAME=iucentrallibrary
   DB_PASSWORD=YOUR_REAL_ALWAYSDATA_PASSWORD_HERE

   # Application Environment
   APP_ENV=production
   APP_DEBUG=false
   ALLOW_SQLITE_FALLBACK=false

   # Cross-Origin Whitelist (Vercel Frontend)
   CORS_ALLOWED_ORIGIN=https://iu-central-library.vercel.app

   # Cross-Site Cookie Session Settings
   SESSION_LIFETIME=86400
   SESSION_SECURE=true
   SESSION_SAMESITE=None

   # Setup Security Key (Used to protect web seeding)
   SETUP_KEY=my_secure_random_key_12345
   ```
3. Save the file (`Ctrl + O`, `Enter`, then `Ctrl + X` in `nano`).
4. Set secure file permissions:
   ```bash
   chmod 600 /home/iucentrallibrary/IU_Central_Library/backend/.env
   ```

---

## Step 5: Seed Predefined Demo Accounts

Seed the predefined demo accounts, categories, initial books, and system settings idempotently.

### Predefined Demo Accounts:
| Role | Username | Password | Full Name |
|---|---|---|---|
| Admin | `admin` | `Admin@123` | System Administrator |
| Member | `tanvir` | `User@123` | Tanvir Ahmed |
| Member | `student1` | `Student@123` | Nusrat Jahan |
| Member | `student2` | `Student@123` | Ariful Islam |

### Running Seeder via SSH:
```bash
cd /home/iucentrallibrary/IU_Central_Library
php backend/database/seed.php
```

Expected output:
```
--- Initializing Database & Running Seeder ---
Active Database Driver: mysql
✓ Schema already present (tables verified)
✓ Settings configured
  + Created user admin (admin)
  + Created user tanvir (member)
  + Created user student1 (member)
  + Created user student2 (member)
✓ Categories verified
✓ Books verified
✓ Sample borrowings seeded for tanvir
✓ Notifications seeded for tanvir
=============================================
  Seeding Completed Successfully!
=============================================
```

*(Alternatively, run via web browser using your `SETUP_KEY`:)*
```
https://<your-alwaysdata-domain>/api/seed?key=my_secure_random_key_12345
```

---

## Step 6: Verify Backend Health

Visit your backend health endpoint in any browser or using curl:

```
https://<your-alwaysdata-domain>/api/health
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "status": "online",
    "database": "connected",
    "system": "IU Central Library API",
    "driver": "mysql",
    "php_version": "8.2.x",
    "timestamp": "2026-10-29T..."
  }
}
```

> If `"database"` returns `"error"`, inspect your `backend/.env` credentials and verify that `DB_PASSWORD` matches your Alwaysdata MySQL password.

---

## Step 7: Connect Vercel Frontend to Alwaysdata Backend

1. Go to your **Vercel Dashboard**: [https://vercel.com](https://vercel.com).
2. Select your project: **iu-central-library**.
3. Navigate to **Settings** > **Environment Variables**.
4. Add or update the following environment variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://<your-alwaysdata-domain>` *(e.g. `https://iucentrallibrary.alwaysdata.net` - DO NOT include a trailing slash)*
   - **Environment**: Check **Production**, **Preview**, and **Development**.
5. Save the variable.
6. Trigger a redeployment:
   - Go to **Deployments**.
   - Click the three dots `...` next to the latest deployment and select **Redeploy**.
   - Ensure the "Use existing Build Cache" option is unchecked so the new environment variable is baked into the build.

---

## Step 8: End-to-End Verification

1. Open your live frontend: [https://iu-central-library.vercel.app/login](https://iu-central-library.vercel.app/login)
2. Click the quick-fill demo button **tanvir (Student)** and click **Sign In**:
   - Authentication sends a POST to `https://<your-alwaysdata-domain>/api/auth/login`.
   - Backend verifies `password_verify('User@123', hash)` against MySQL.
   - PHP sets the session cookie with `SameSite=None; Secure; HttpOnly`.
   - Browser redirects to `/dashboard`.
3. Try borrowing a book from `/catalogue`:
   - Inventory decrements in MySQL.
   - Active borrowing record is created.
4. Try logging in as **admin / Admin@123** at `/login` or `/admin-login`:
   - Admin dashboard opens with live database statistics.

---

## Troubleshooting & Key Technical Notes

### 1. Cross-Domain Cookies (SameSite=None & Secure)
- **Problem**: In cross-domain setups (frontend on `.vercel.app` and backend on `.alwaysdata.net`), default session cookies (`SameSite=Lax`) will be blocked by browsers.
- **Solution**: The backend automatically sets `SameSite=None` and `Secure=true` whenever requests arrive via HTTPS. Both frontend and backend MUST be accessed over HTTPS.

### 2. CORS Preflight & Credentials
- All API endpoints send `Access-Control-Allow-Credentials: true` and validate origins against `CORS_ALLOWED_ORIGIN`.
- OPTIONS requests return `HTTP 204 No Content` immediately.

### 3. Database Connection Security
- The backend uses PDO prepared statements with `PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION`.
- Under `APP_ENV=production`, error messages returned to clients are generic ("Database connection error. Please contact administrator.") and the real database password/host is never leaked to the browser.
- Detailed connection errors are written to PHP's private error log on the server.
