'use client';

import React, { useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { validatePasswordStrength, getPasswordStrengthMeta } from '../../lib/password-utils';
import { confirmPasswordCreatedAction } from '../../app/actions/auth-actions';
import {
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface SetPasswordFormProps {
  email: string;
  onSuccess: () => void;
}

export function SetPasswordForm({ email, onSuccess }: SetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const strength = validatePasswordStrength(password, confirmPassword);
  const strengthMeta = getPasswordStrengthMeta(strength.score);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!strength.isValid) {
      if (!strength.hasMinLength) {
        setError('A senha deve ter no mínimo 8 caracteres.');
      } else if (!strength.hasUppercase || !strength.hasLowercase) {
        setError('A senha deve conter letras maiúsculas e minúsculas.');
      } else if (!strength.hasNumber) {
        setError('A senha deve conter pelo menos um número.');
      } else if (!strength.hasSpecialChar) {
        setError('A senha deve conter pelo menos um caractere especial (ex: !@#$).');
      } else if (!strength.passwordsMatch) {
        setError('A confirmação da senha não confere com a nova senha digitada.');
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Update user password in Supabase Auth and flag first access completed
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: {
          first_access_completed: true,
          has_password: true,
        },
      });

      if (updateError) {
        setError(`Erro ao definir senha: ${updateError.message}`);
        setLoading(false);
        return;
      }

      // 2. Mark in allowed_users table as active & has_password
      await confirmPasswordCreatedAction(email);

      // 3. Trigger success
      onSuccess();
    } catch (err) {
      setError('Ocorreu um erro ao salvar sua nova senha. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="text-xl font-black text-black dark:text-white">
          Definição de Senha Obrigatória
        </h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Este é o seu primeiro acesso à Biblioteca Coletivo Negro Viegas D&apos;Abreu.
          Crie sua senha pessoal e segura para os próximos acessos.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email read-only badge */}
        <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between">
          <span className="text-zinc-500">Usuário associado:</span>
          <span className="font-bold text-black dark:text-white font-mono">{email}</span>
        </div>

        {/* New Password */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-black dark:text-white">
            Nova Senha Pessoal *
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Digite sua senha forte..."
              required
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password Strength Meter */}
        {password.length > 0 && (
          <div className="space-y-2 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-medium">Força da Senha:</span>
              <span className={`font-bold ${strength.score >= 4 ? 'text-emerald-600' : 'text-zinc-700 dark:text-zinc-300'}`}>
                {strengthMeta.label}
              </span>
            </div>
            
            <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strengthMeta.color}`}
                style={{ width: `${strengthMeta.percentage}%` }}
              />
            </div>

            {/* Checklist of security requirements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 text-[11px]">
              <div className={`flex items-center gap-1.5 ${strength.hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-400'}`}>
                {strength.hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>Mínimo 8 caracteres</span>
              </div>
              <div className={`flex items-center gap-1.5 ${strength.hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-400'}`}>
                {strength.hasUppercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>Letra maiúscula (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${strength.hasLowercase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-400'}`}>
                {strength.hasLowercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>Letra minúscula (a-z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${strength.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-400'}`}>
                {strength.hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>Pelo menos 1 número (0-9)</span>
              </div>
              <div className={`flex items-center gap-1.5 sm:col-span-2 ${strength.hasSpecialChar ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-400'}`}>
                {strength.hasSpecialChar ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>Caractere especial (!@#$%^&*...)</span>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-black dark:text-white">
            Confirmar Nova Senha *
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError(null);
              }}
              placeholder="Digite a senha novamente..."
              required
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl border ${
                confirmPassword.length > 0 && !strength.passwordsMatch
                  ? 'border-red-500 ring-1 ring-red-500'
                  : 'border-zinc-300 dark:border-zinc-700'
              } bg-white dark:bg-zinc-900 text-sm text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-900`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword.length > 0 && !strength.passwordsMatch && (
            <p className="text-[11px] text-red-600 mt-1">As senhas não coincidem.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !strength.isValid}
          className="w-full py-3 rounded-xl bg-red-900 hover:bg-red-800 text-white text-sm font-bold shadow-md shadow-red-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-101"
        >
          <ShieldCheck className="w-4 h-4" />
          {loading ? 'Salvando Senha...' : 'Criar Senha e Acessar Biblioteca'}
        </button>

        <p className="text-[11px] text-zinc-400 text-center leading-tight">
          🔒 Esta etapa é obrigatória para assegurar seu registro na biblioteca comunitária.
        </p>
      </form>
    </div>
  );
}
