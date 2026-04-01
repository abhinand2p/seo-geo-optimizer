'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_verified: boolean;
  created_at: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'seo_geo_token';
const USER_KEY  = 'seo_geo_user';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const persist = (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Also write to a cookie so Next.js middleware can read it server-side
    document.cookie = `seo_geo_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    setToken(token);
    setUser(user);
  };

  const login = async (email: string, password: string) => {
    const { data } = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    persist(data.access_token, data.user);
  };

  const register = async (email: string, password: string, fullName?: string) => {
    const { data } = await axios.post(`${API_BASE_URL}/auth/register`, {
      email,
      password,
      full_name: fullName || null,
    });
    persist(data.access_token, data.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Clear the auth cookie
    document.cookie = 'seo_geo_token=; path=/; max-age=0';
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
