'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/library';
import { INITIAL_USERS } from '../data/initial-data';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  loginAsDemo: (role: 'reader' | 'admin') => void;
  logout: () => void;
  register: (name: string, email: string, phone?: string, bio?: string) => boolean;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'cnviegas_library_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Error loading auth from localStorage', e);
    }
    setMounted(true);
  }, []);

  const saveUser = (user: User | null) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  };

  const login = (email: string, _password?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check against initial users or create reader
    const foundUser = INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (foundUser) {
      saveUser(foundUser);
      return true;
    }

    // If admin keyword is in email, grant admin, else reader
    const newRole: UserRole = cleanEmail.includes('admin') ? 'admin' : 'reader';
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: cleanEmail.split('@')[0].replace('.', ' '),
      email: cleanEmail,
      role: newRole,
      avatar: newRole === 'admin' ? '🛡️' : '📚',
      joinedAt: new Date().toISOString().split('T')[0],
      activeLoansCount: 0,
      maxLoansAllowed: newRole === 'admin' ? 10 : 3,
    };

    saveUser(newUser);
    return true;
  };

  const loginAsDemo = (role: 'reader' | 'admin') => {
    if (role === 'admin') {
      saveUser(INITIAL_USERS[0]);
    } else {
      saveUser(INITIAL_USERS[1]);
    }
  };

  const logout = () => {
    saveUser(null);
  };

  const register = (name: string, email: string, phone?: string, bio?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: cleanEmail.includes('admin') ? 'admin' : 'reader',
      avatar: '🌱',
      joinedAt: new Date().toISOString().split('T')[0],
      phone: phone?.trim() || '',
      bio: bio?.trim() || '',
      activeLoansCount: 0,
      maxLoansAllowed: 3,
    };

    saveUser(newUser);
    return true;
  };

  const switchRole = (role: UserRole) => {
    if (role === 'visitor') {
      saveUser(null);
    } else if (role === 'admin') {
      saveUser(INITIAL_USERS[0]);
    } else {
      saveUser(INITIAL_USERS[1]);
    }
  };

  const role: UserRole = currentUser ? currentUser.role : 'visitor';
  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAuthenticated,
        login,
        loginAsDemo,
        logout,
        register,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
