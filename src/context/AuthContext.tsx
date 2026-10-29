import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { normalizeErrorMessage, isBackendUnavailable } from '../utils/errors';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMember: boolean;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: {
      name: string;
      username?: string;
      email: string;
      studentId?: string;
      department?: string;
      session?: string;
      phone?: string;
    },
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  quickLogin: (role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeStudentId = (user: any): string | undefined => {
  const isTanvir =
    (user.username && String(user.username).toLowerCase() === 'tanvir') ||
    (user.email && String(user.email).toLowerCase() === 'tanvir@student.edu') ||
    String(user.id) === 'u-tanvir' ||
    String(user.id) === '2';

  if (isTanvir) {
    return 'CSE-214028';
  }

  const raw = user.member_id || user.studentId;
  if (!raw) return undefined;
  if (raw === 'CSE-2021-089' || raw === '2114028' || raw === '214028') {
    return 'CSE-214028';
  }
  return raw;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [loading, setLoading] = useState(true);

  // Sync session with PHP backend on initial mount
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const res = await api.auth.me();
        if (!mounted) return;
        if (res.authenticated && res.user) {
          const userObj: User = {
            id: String(res.user.id),
            name: (res.user as any).full_name || res.user.name,
            username: (res.user as any).username || res.user.username,
            email: res.user.email,
            role: res.user.role,
            studentId: normalizeStudentId(res.user),
            department: res.user.department,
            session: res.user.session,
            phone: res.user.phone,
            avatar: res.user.avatar,
            bio: res.user.bio,
            status: (res.user as any).status === 'disabled' ? 'suspended' : 'active',
            createdAt: (res.user as any).created_at || res.user.createdAt || new Date().toISOString(),
          };
          setCurrentUser(userObj);
          storage.setCurrentUser(userObj);
        } else {
          // If no active session in backend, check if a user was previously active
          const local = storage.getCurrentUser();
          if (local) {
            // Attempt background auto-authentication with backend to initialize PHP session
            const username =
              (local as any).username ||
              (local.role === 'admin'
                ? 'admin'
                : local.email
                ? local.email.split('@')[0]
                : 'tanvir');
            const defaultPassword =
              username === 'admin'
                ? 'Admin@123'
                : username === 'student1' || username === 'student2'
                ? 'Student@123'
                : 'User@123';
            const loginRes = await api.auth.login(username, defaultPassword);
            if (!mounted) return;

            if (loginRes.success && loginRes.user) {
              const userObj: User = {
                id: String(loginRes.user.id),
                name: (loginRes.user as any).full_name || loginRes.user.name,
                username: (loginRes.user as any).username || loginRes.user.username || username,
                email: loginRes.user.email,
                role: loginRes.user.role,
                studentId: normalizeStudentId(loginRes.user),
                department: loginRes.user.department,
                session: loginRes.user.session,
                phone: loginRes.user.phone,
                avatar: loginRes.user.avatar,
                bio: loginRes.user.bio,
                status: (loginRes.user as any).status === 'disabled' ? 'suspended' : 'active',
                createdAt: (loginRes.user as any).created_at || loginRes.user.createdAt || new Date().toISOString(),
              };
              setCurrentUser(userObj);
              storage.setCurrentUser(userObj);
            } else {
              setCurrentUser(local);
            }
          }
        }
      } catch (err) {
        console.warn('Backend session check error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanIdentifier = (usernameOrEmail || '').trim();
    if (!cleanIdentifier || !password) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    try {
      // 1. Try PHP Backend API first
      const res = await api.auth.login(cleanIdentifier, password);
      if (res.success && res.user) {
        const userObj: User = {
          id: String(res.user.id),
          name: (res.user as any).full_name || res.user.name,
          username: (res.user as any).username || res.user.username || cleanIdentifier,
          email: res.user.email,
          role: res.user.role,
          studentId: normalizeStudentId(res.user),
          department: res.user.department,
          session: res.user.session,
          phone: res.user.phone,
          avatar: res.user.avatar,
          bio: res.user.bio,
          status: (res.user as any).status === 'disabled' ? 'suspended' : 'active',
          createdAt: (res.user as any).created_at || res.user.createdAt || new Date().toISOString(),
        };

        storage.setCurrentUser(userObj);
        setCurrentUser(userObj);
        return { success: true };
      }

      const errorMsg = normalizeErrorMessage(res.error);
      const isUnavailable = isBackendUnavailable(res);

      // If backend is active and returned a business authentication rejection (e.g., 401 Invalid credentials, 403 Suspended), return that error
      if (!isUnavailable) {
        return { success: false, error: errorMsg || 'Invalid credentials. Please verify and try again.' };
      }

      // 2. Storage fallback when backend is unreachable / offline / 404 (e.g., frontend-only Vercel hosting)
      const localUser = storage.getUserByUsernameOrEmail(cleanIdentifier);
      if (localUser) {
        if (localUser.status === 'suspended') {
          return { success: false, error: 'This account has been suspended. Please contact the library administrator.' };
        }

        const expectedPassword = storage.getUserPassword(cleanIdentifier);
        if (expectedPassword && expectedPassword === password) {
          storage.setCurrentUser(localUser);
          setCurrentUser(localUser);
          return { success: true };
        }

        return { success: false, error: 'Invalid password. Please check your credentials and try again.' };
      }

      return { success: false, error: errorMsg || 'Invalid credentials. No account found.' };
    } catch (err: unknown) {
      return { success: false, error: normalizeErrorMessage(err, 'Authentication failed.') };
    }
  };

  const register = async (
    data: {
      name: string;
      username?: string;
      email: string;
      studentId?: string;
      department?: string;
      session?: string;
      phone?: string;
    },
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const username = data.username || data.email.split('@')[0];
      const res = await api.auth.register(
        {
          full_name: data.name,
          username,
          email: data.email,
          member_id: data.studentId,
          department: data.department || 'Computer Science & Engineering',
          session: data.session || '2021-22',
          phone: data.phone,
        },
        password
      );

      if (res.success && res.user) {
        const userObj: User = {
          id: String(res.user.id),
          name: (res.user as any).full_name || res.user.name,
          username: (res.user as any).username || res.user.username || username,
          email: res.user.email,
          role: res.user.role,
          studentId: (res.user as any).member_id || res.user.studentId,
          department: res.user.department,
          session: res.user.session,
          phone: res.user.phone,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        storage.setCurrentUser(userObj);
        setCurrentUser(userObj);
        return { success: true };
      }

      // Storage fallback
      const newUser = storage.registerUser(
        {
          name: data.name,
          email: data.email,
          role: 'member',
          studentId: data.studentId,
          department: data.department || 'Computer Science & Engineering',
          session: data.session || '2021-22',
          phone: data.phone,
        },
        password
      );
      storage.setCurrentUser(newUser);
      setCurrentUser(newUser);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: normalizeErrorMessage(err, 'Registration failed.') };
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Backend logout error:', err);
    }
    storage.setCurrentUser(null);
    setCurrentUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    try {
      const res = await api.auth.updateProfile(updates);
      if (res.success && res.user) {
        const userObj: User = {
          ...currentUser,
          ...updates,
          name: (res.user as any).full_name || updates.name || currentUser.name,
        };
        storage.updateUser(currentUser.id, userObj);
        setCurrentUser(userObj);
        return;
      }
    } catch (err) {
      console.warn('Backend profile update failed:', err);
    }

    const updated = storage.updateUser(currentUser.id, updates);
    setCurrentUser(updated);
  };

  const changePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not authenticated.' };

    try {
      const res = await api.auth.changePassword(oldPassword, newPassword);
      if (res.success) {
        return { success: true };
      }
      if (res.error) {
        return { success: false, error: normalizeErrorMessage(res.error) };
      }
    } catch (err: unknown) {
      console.warn('Backend password change failed:', err);
    }

    const passwords = storage.getPasswords();
    if (passwords[currentUser.email.toLowerCase()] !== oldPassword) {
      return { success: false, error: 'Current password does not match.' };
    }

    storage.changeUserPassword(currentUser.email, newPassword);
    return { success: true };
  };

  const quickLogin = async (role: Role) => {
    if (role === 'admin') {
      await login('admin', 'Admin@123');
    } else {
      await login('tanvir', 'User@123');
    }
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    isMember: currentUser?.role === 'member',
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    quickLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
