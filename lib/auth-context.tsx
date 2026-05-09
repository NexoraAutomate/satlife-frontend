'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import * as Models from './models';

interface AuthContextType {
  user: Models.User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasAccess: (roles?: string[], permissions?: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('sat-user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (error) {
        console.error('[v0] Failed to parse stored user:', error);
        localStorage.removeItem('sat-user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const apiUrl = 'http://127.0.0.1:8000/api';

      // Create form-encoded body for login endpoint
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Authentication failed');
      }

      const data = await response.json();

      // Validate token exists
      if (!data.access_token) {
        throw new Error('No access token received from server');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.access_token);

      // Fetch user info using the token
      const userResponse = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
          // 'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!userResponse.ok) {
        localStorage.removeItem('token');
        throw new Error('Failed to fetch user info');
      }

      const userData = await userResponse.json();

      // Transform roles array
      const userDataWithRole = {
        ...userData,
        roles: Array.isArray(userData.roles)
          ? userData.roles.map((r: any) => (typeof r === 'string' ? r : r.name))
          : [],
      };

      setUser(userDataWithRole);
      localStorage.setItem('sat-user', JSON.stringify(userDataWithRole));

    } catch (error) {
      console.error('[v0] Login error:', error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred during login');
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sat-user');
    localStorage.removeItem('token');
  }, []);

  const hasAccess = () => true; // Placeholder for actual access control logic

  if (!mounted) return null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );


}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
