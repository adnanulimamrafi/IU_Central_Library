/**
 * Library Management System - Frontend API Client
 * Communicates with PHP 8.2 backend via Session-based Auth & PDO REST API.
 */

import { Book, Category, BorrowRecord, NotificationItem, LibrarySettings, User } from '../types';
import { normalizeErrorMessage } from '../utils/errors';

let csrfToken: string | null = null;

// Allow configurable API base URL via environment variable (e.g., for production deployment on Render, Railway, VPS, Apache)
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

export function resolveApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return API_BASE_URL ? `${API_BASE_URL}${cleanEndpoint}` : cleanEndpoint;
}

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  try {
    const res = await fetch(resolveApiUrl('/api/auth/csrf'), { credentials: 'include' });
    const data = await res.json();
    if (data && data.success && data.data?.csrf_token) {
      csrfToken = data.data.csrf_token;
      return csrfToken as string;
    }
  } catch (err) {
    console.warn('Could not fetch CSRF token:', err);
  }
  return '';
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; errors?: any; status?: number }> {
  const url = resolveApiUrl(endpoint);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach CSRF token on mutating requests
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = await getCsrfToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ensures PHP session cookies are transmitted
    });

    let json: any = null;
    let rawText: string = '';
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        json = await response.json();
      } catch {
        json = null;
      }
    } else {
      try {
        rawText = await response.text();
      } catch {
        rawText = '';
      }
    }

    if (!response.ok) {
      let rawError: unknown = json?.error || json?.message || json?.errors;
      if (!rawError && rawText) {
        rawError = rawText;
      }
      if (!rawError) {
        rawError = `Request failed with status ${response.status}`;
      }

      const errorMsg = normalizeErrorMessage(
        rawError,
        `Request failed with status ${response.status}`
      );

      return {
        success: false,
        error: errorMsg,
        errors: json?.errors,
        status: response.status,
      };
    }

    if (json?.data?.csrf_token) {
      csrfToken = json.data.csrf_token;
    }

    return {
      success: true,
      data: json?.data !== undefined ? json.data : (json as T),
      status: response.status,
    };
  } catch (error: unknown) {
    const errorMsg = normalizeErrorMessage(
      error,
      'Network error occurred. Please verify backend server is running.'
    );
    return {
      success: false,
      error: errorMsg,
      status: 0,
    };
  }
}

export const api = {
  // Auth
  auth: {
    async me(): Promise<{ user: User | null; authenticated: boolean }> {
      const res = await apiRequest<{ user: User | null; authenticated: boolean }>('/api/auth/me');
      if (res.success && res.data) {
        return res.data;
      }
      return { user: null, authenticated: false };
    },

    async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
      const res = await apiRequest<{ user: User; csrf_token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (res.success && res.data?.user) {
        if (res.data.csrf_token) csrfToken = res.data.csrf_token;
        return { success: true, user: res.data.user };
      }
      return { success: false, error: res.error || 'Login failed.' };
    },

    async logout(): Promise<void> {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      csrfToken = null;
    },

    async register(data: any, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
      const res = await apiRequest<{ user: User; csrf_token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...data, password }),
      });

      if (res.success && res.data?.user) {
        if (res.data.csrf_token) csrfToken = res.data.csrf_token;
        return { success: true, user: res.data.user };
      }
      return { success: false, error: res.error || 'Registration failed.' };
    },

    async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
      const res = await apiRequest<{ user: User }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return { success: res.success, user: res.data?.user, error: res.error };
    },

    async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
      const res = await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      return { success: res.success, error: res.error };
    },
  },

  // Books
  books: {
    async getAll(params: Record<string, any> = {}): Promise<{ books: Book[]; total: number }> {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.set(key, String(val));
        }
      });
      const res = await apiRequest<{ books: Book[]; total: number }>(`/api/books?${query.toString()}`);
      if (res.success && res.data) {
        return res.data;
      }
      return { books: [], total: 0 };
    },

    async getById(id: string | number): Promise<Book | null> {
      const res = await apiRequest<Book>(`/api/books/${id}`);
      return res.success && res.data ? res.data : null;
    },

    async create(data: Partial<Book>): Promise<Book> {
      const res = await apiRequest<Book>('/api/books', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to add book.');
      }
      return res.data;
    },

    async update(id: string | number, data: Partial<Book>): Promise<Book> {
      const res = await apiRequest<Book>(`/api/books/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to update book.');
      }
      return res.data;
    },

    async delete(id: string | number): Promise<boolean> {
      const res = await apiRequest(`/api/books/${id}`, { method: 'DELETE' });
      if (!res.success) {
        throw new Error(res.error || 'Failed to delete book.');
      }
      return true;
    },
  },

  // Categories
  categories: {
    async getAll(): Promise<Category[]> {
      const res = await apiRequest<Category[]>('/api/categories');
      return res.success && Array.isArray(res.data) ? res.data : [];
    },

    async create(data: Partial<Category>): Promise<Category> {
      const res = await apiRequest<Category>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to create category.');
      }
      return res.data;
    },

    async update(id: string | number, data: Partial<Category>): Promise<Category> {
      const res = await apiRequest<Category>(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to update category.');
      }
      return res.data;
    },

    async delete(id: string | number): Promise<boolean> {
      const res = await apiRequest(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.success) {
        throw new Error(res.error || 'Failed to delete category.');
      }
      return true;
    },
  },

  // Borrowings
  borrowings: {
    async getAll(params: Record<string, any> = {}): Promise<BorrowRecord[]> {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) query.set(k, String(v));
      });
      const res = await apiRequest<BorrowRecord[]>(`/api/borrowings?${query.toString()}`);
      return res.success && Array.isArray(res.data) ? res.data : [];
    },

    async getMy(): Promise<BorrowRecord[]> {
      const res = await apiRequest<BorrowRecord[]>('/api/borrowings/my');
      return res.success && Array.isArray(res.data) ? res.data : [];
    },

    async issue(bookId: string | number, userId?: string | number): Promise<BorrowRecord> {
      const res = await apiRequest<BorrowRecord>('/api/borrowings', {
        method: 'POST',
        body: JSON.stringify({ book_id: bookId, user_id: userId }),
      });
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to issue book.');
      }
      return res.data;
    },

    async returnBook(recordId: string | number): Promise<BorrowRecord> {
      const res = await apiRequest<BorrowRecord>(`/api/borrowings/${recordId}/return`, {
        method: 'POST',
      });
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to return book.');
      }
      return res.data;
    },

    async renew(recordId: string | number, days: number = 7): Promise<BorrowRecord> {
      const res = await apiRequest<BorrowRecord>(`/api/borrowings/${recordId}/renew`, {
        method: 'POST',
        body: JSON.stringify({ days }),
      });
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to extend loan.');
      }
      return res.data;
    },
  },

  // Members
  members: {
    async getAll(params: Record<string, any> = {}): Promise<User[]> {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.set(k, String(v));
      });
      const res = await apiRequest<User[]>(`/api/members?${query.toString()}`);
      return res.success && Array.isArray(res.data) ? res.data : [];
    },

    async updateStatus(id: string | number, status?: string): Promise<{ id: string; status: string }> {
      const res = await apiRequest<{ id: string; status: string }>(`/api/members/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to update member status.');
      }
      return res.data;
    },
  },

  // Dashboard
  dashboard: {
    async getPublicStats(): Promise<{
      totalTitles: number;
      totalCopies: number;
      availableCopies: number;
      totalMembers: number;
      activeLoans: number;
      totalCategories: number;
    } | null> {
      const res = await apiRequest('/api/stats');
      return res.success && res.data ? res.data : null;
    },

    async getStats(): Promise<any> {
      const res = await apiRequest('/api/dashboard/stats');
      return res.success ? res.data : null;
    },

    async getMemberStats(): Promise<any> {
      const res = await apiRequest('/api/dashboard/member');
      return res.success ? res.data : null;
    },
  },

  // Notifications
  notifications: {
    async getAll(): Promise<NotificationItem[]> {
      const res = await apiRequest<NotificationItem[]>('/api/notifications');
      return res.success && Array.isArray(res.data) ? res.data : [];
    },

    async markRead(id: string | number): Promise<void> {
      await apiRequest(`/api/notifications/${id}/read`, { method: 'PUT' });
    },

    async markAllRead(): Promise<void> {
      await apiRequest('/api/notifications/read-all', { method: 'PUT' });
    },
  },

  // Favourites
  favourites: {
    async getAll(): Promise<string[]> {
      const res = await apiRequest<{ favourites: string[] }>('/api/favourites');
      return res.success && res.data?.favourites ? res.data.favourites : [];
    },

    async toggle(bookId: string | number): Promise<boolean> {
      const res = await apiRequest<{ is_favourite: boolean }>(`/api/favourites/${bookId}`, {
        method: 'POST',
      });
      return res.success ? Boolean(res.data?.is_favourite) : false;
    },
  },

  // Settings
  settings: {
    async get(): Promise<LibrarySettings | null> {
      const res = await apiRequest<LibrarySettings>('/api/settings');
      return res.success && res.data ? res.data : null;
    },

    async update(updates: Partial<LibrarySettings>): Promise<LibrarySettings> {
      const res = await apiRequest<{ settings: LibrarySettings }>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to update settings.');
      }
      return res.data.settings;
    },
  },
};
