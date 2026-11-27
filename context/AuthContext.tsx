'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '../types/library';
import { createClient } from '../lib/supabase/client';
import { fetchProfile } from '../lib/profile';
import { SetPasswordForm } from '../components/auth/SetPasswordForm';

export interface AuthResult {
  ok: boolean;
  error?: string;
  isFirstAccess?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  needsPasswordSetup: boolean;
  setNeedsPasswordSetup: (val: boolean) => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginAsDemo: (role: 'reader' | 'admin') => Promise<AuthResult>;
  sendOtp: (email: string) => Promise<AuthResult>;
  verifyOtp: (email: string, token: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
    bio?: string,
    interests?: string[],
  ) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Seeded fixtures from supabase/seed.sql. The password is public by design.
const DEMO_CREDENTIALS = {
  admin: { email: 'admin@cnviegas.org', password: 'demo123456' },
  reader: { email: 'leitor@cnviegas.org', password: 'demo123456' },
};

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (message.includes('User already registered')) {
    return 'Este e-mail já está cadastrado.';
  }
  if (message.includes('Password should be at least')) {
    return 'A senha deve ter ao menos 6 caracteres.';
  }
  if (message.toLowerCase().includes('rate limit')) {
    return 'Muitas tentativas. Tente novamente em alguns minutos.';
  }
  if (message.includes('Token has expired') || message.includes('expired')) {
    return 'O código OTP expirou. Solicite um novo código.';
  }
  if (message.includes('invalid') || message.includes('Invalid token')) {
    return 'Código de verificação incorreto.';
  }
  return 'Não foi possível completar a ação. Tente novamente.';
}

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  // Seeded by the server layout, so there is no logged-out flash on load.
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        setCurrentUser(null);
        setNeedsPasswordSetup(false);
        return;
      }

      // Check if user is newly arrived without a password setup
      const meta = session.user.user_metadata || {};
      const isNewcomer = meta.first_access_completed === false || meta.needs_password === true;
      if (isNewcomer) {
        setNeedsPasswordSetup(true);
      }

      const profile = await fetchProfile(supabase, session.user.id);
      setCurrentUser(profile);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { ok: false, error: translateAuthError(error.message) };
    setNeedsPasswordSetup(false);
    router.refresh();
    return { ok: true };
  };

  const loginAsDemo = (demoRole: 'reader' | 'admin'): Promise<AuthResult> => {
    const { email, password } = DEMO_CREDENTIALS[demoRole];
    return login(email, password);
  };

  const sendOtp = async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
    });
    if (error) return { ok: false, error: translateAuthError(error.message) };
    return { ok: true };
  };

  const verifyOtp = async (email: string, token: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email',
    });

    if (error) return { ok: false, error: translateAuthError(error.message) };

    const meta = data?.user?.user_metadata || {};
    const isFirstAccess = meta.first_access_completed !== true;

    if (isFirstAccess) {
      setNeedsPasswordSetup(true);
    }

    router.refresh();
    return { ok: true, isFirstAccess };
  };

  const updatePassword = async (password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.updateUser({
      password,
      data: {
        first_access_completed: true,
        has_password: true,
      },
    });

    if (error) return { ok: false, error: translateAuthError(error.message) };
    setNeedsPasswordSetup(false);
    router.refresh();
    return { ok: true };
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setNeedsPasswordSetup(false);
    router.refresh();
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    bio?: string,
    interests: string[] = [],
  ): Promise<AuthResult> => {
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
          phone: phone?.trim() ?? '',
          bio: bio?.trim() ?? '',
          interests,
          first_access_completed: true,
          has_password: true,
        },
      },
    });
    if (error) return { ok: false, error: translateAuthError(error.message) };
    setNeedsPasswordSetup(false);
    router.refresh();
    return { ok: true };
  };

  const role: UserRole = currentUser ? currentUser.role : 'visitor';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAuthenticated: !!currentUser,
        needsPasswordSetup,
        setNeedsPasswordSetup,
        login,
        loginAsDemo,
        sendOtp,
        verifyOtp,
        updatePassword,
        logout,
        register,
      }}
    >
      {children}

      {/* Mandatory Navigation Lock if user is authenticated but hasn't created a password */}
      {needsPasswordSetup && currentUser?.email && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <SetPasswordForm
              email={currentUser.email}
              onSuccess={() => {
                setNeedsPasswordSetup(false);
                router.refresh();
              }}
            />
          </div>
        </div>
      )}
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
