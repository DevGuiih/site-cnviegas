import { PasswordStrength } from '../types/auth';

/**
 * Validates password strength based on strict security requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 * - At least one special character (!@#$%^&*...)
 * - Passwords match (if confirmPassword is provided)
 */
export function validatePasswordStrength(
  password: string,
  confirmPassword?: string
): PasswordStrength {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);
  
  const passwordsMatch = confirmPassword !== undefined ? password === confirmPassword && password.length > 0 : true;

  let score = 0;
  if (hasMinLength) score++;
  if (hasUppercase) score++;
  if (hasLowercase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;

  const isValid =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar &&
    passwordsMatch;

  return {
    score,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    passwordsMatch,
    isValid,
  };
}

export function getPasswordStrengthMeta(score: number): {
  label: string;
  color: string;
  percentage: number;
} {
  switch (score) {
    case 0:
    case 1:
      return { label: 'Muito Fraca', color: 'bg-red-500', percentage: 20 };
    case 2:
      return { label: 'Fraca', color: 'bg-orange-500', percentage: 40 };
    case 3:
      return { label: 'Razoável', color: 'bg-yellow-500', percentage: 60 };
    case 4:
      return { label: 'Boa', color: 'bg-blue-500', percentage: 80 };
    case 5:
      return { label: 'Forte & Segura', color: 'bg-emerald-500', percentage: 100 };
    default:
      return { label: 'Inválida', color: 'bg-zinc-400', percentage: 0 };
  }
}
