export interface AllowedUser {
  id: string;
  email: string;
  name?: string | null;
  role: 'reader' | 'admin';
  status: 'invited' | 'active';
  invited_by?: string | null;
  has_password: boolean;
  created_at: string;
  activated_at?: string | null;
}

export interface AuthStatusResult {
  allowed: boolean;
  hasPassword: boolean;
  isFirstAccess: boolean;
  name?: string;
  message?: string;
}

export type LoginStep = 'EMAIL' | 'PASSWORD' | 'OTP' | 'SET_PASSWORD';

export interface PasswordStrength {
  score: number; // 0 to 5
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  passwordsMatch: boolean;
  isValid: boolean;
}
