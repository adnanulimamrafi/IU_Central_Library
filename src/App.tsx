import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import { ToastContainer } from './components/common/ToastContainer';
import { PublicLayout } from './components/layout/PublicLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { CataloguePage } from './pages/public/CataloguePage';
import { BookDetailPage } from './pages/public/BookDetailPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { AdminLoginPage } from './pages/public/AdminLoginPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// User Dashboard
import { UserDashboardLayout } from './components/dashboard/UserDashboardLayout';
import { UserOverviewPage } from './pages/user/UserOverviewPage';
import { MyBooksPage } from './pages/user/MyBooksPage';
import { BorrowHistoryPage } from './pages/user/BorrowHistoryPage';
import { FavouritesPage } from './pages/user/FavouritesPage';
import { ProfilePage } from './pages/user/ProfilePage';

// Admin Dashboard
import { AdminDashboardLayout } from './components/dashboard/AdminDashboardLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminBooksPage } from './pages/admin/AdminBooksPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminMembersPage } from './pages/admin/AdminMembersPage';
import { AdminBorrowingsPage } from './pages/admin/AdminBorrowingsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LibraryProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Pages */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/books" element={<CataloguePage />} />
                <Route path="/catalogue" element={<CataloguePage />} />
                <Route path="/books/:id" element={<BookDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin-login" element={<AdminLoginPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* User Dashboard */}
              <Route path="/dashboard" element={<UserDashboardLayout />}>
                <Route index element={<UserOverviewPage />} />
                <Route path="my-books" element={<MyBooksPage />} />
                <Route path="history" element={<BorrowHistoryPage />} />
                <Route path="favourites" element={<FavouritesPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Admin Dashboard */}
              <Route path="/admin" element={<AdminDashboardLayout />}>
                <Route index element={<AdminOverviewPage />} />
                <Route path="books" element={<AdminBooksPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="members" element={<AdminMembersPage />} />
                <Route path="borrowings" element={<AdminBorrowingsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Routes>

            {/* Global Toasts */}
            <ToastContainer />
          </BrowserRouter>
        </LibraryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
