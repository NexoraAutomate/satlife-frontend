"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { UserRole } from "@/lib/dummy-data";

interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  hasAccess: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sat-user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("sat-user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = useCallback((email: string, role: UserRole) => {
    const name =
      role === "Admin"
        ? "Admin User"
        : role === "Entry Operator"
          ? "Dr. Sarah Chen"
          : "James Walker";
    const newUser: AuthUser = { email, role, name };
    setUser(newUser);
    localStorage.setItem("sat-user", JSON.stringify(newUser));
    localStorage.setItem("token", "dummy-jwt-token-" + Date.now());
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("sat-user");
    localStorage.removeItem("token");
  }, []);

  const hasAccess = useCallback(
    (requiredRoles: UserRole[]) => {
      if (!user) return false;
      return requiredRoles.includes(user.role);
    },
    [user]
  );

  if (!mounted) return null;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, hasAccess }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
