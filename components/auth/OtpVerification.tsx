'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '../../lib/supabase/client';
import { KeyRound, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  onSuccess: (user: any) => void;
  onBack: () => void;
}

export function OtpVerification({ email, onSuccess, onBack }: OtpVerificationProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [infoMessage, setInfoMessage] = useState<string | null>(
    `Enviamos um código de 6 dígitos para ${email}. Verifique sua caixa de entrada e spam.`
  );

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const supabase = useRef(createClient()).current;

  // Auto-focus first input box
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric input
    const cleanVal = value.replace(/\D/g, '');

    // Handle multi-character paste in a single box
    if (cleanVal.length > 1) {
      handlePaste(cleanVal);
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);
    setError(null);

    // If character entered, move to next input
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all digits filled, auto-submit
    if (cleanVal && index === 5 && newDigits.every((d) => d !== '')) {
      const code = newDigits.join('');
      submitOtp(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      // Move to previous box on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (pastedText: string) => {
    const numericChars = pastedText.replace(/\D/g, '').slice(0, 6);
    if (!numericChars) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = numericChars[i] || '';
    }
    setDigits(newDigits);
    setError(null);

    // Focus last filled or next empty
    const nextIdx = Math.min(numericChars.length, 5);
    inputRefs.current[nextIdx]?.focus();

    if (numericChars.length === 6) {
      submitOtp(numericChars);
    }
  };

  const submitOtp = async (tokenCode?: string) => {
    const code = tokenCode || digits.join('');
    if (code.length !== 6) {
      setError('Por favor, digite todos os 6 dígitos do código.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code,
        type: 'email',
      });

      if (verifyError) {
        if (verifyError.message.includes('expired') || verifyError.message.includes('Token has expired')) {
          setError('O código digitado expirou. Clique em reenviar para obter um novo.');
        } else if (verifyError.message.includes('invalid') || verifyError.message.includes('Invalid token')) {
          setError('Código incorreto. Confira os 6 dígitos e tente novamente.');
        } else if (verifyError.message.toLowerCase().includes('rate limit')) {
          setError('Muitas tentativas consecutivas. Aguarde 1 minuto antes de tentar novamente.');
        } else {
          setError(verifyError.message || 'Código de verificação inválido.');
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        onSuccess(data.user);
      } else {
        // Fallback check user
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (currentUser) {
          onSuccess(currentUser);
        } else {
          setError('Sessão não identificada. Tente reenviar o código.');
        }
      }
    } catch (err) {
      setError('Erro ao validar o código. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setError(null);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
      });

      if (otpError) {
        setError(`Falha ao reenviar código: ${otpError.message}`);
      } else {
        setResendCooldown(60);
        setInfoMessage('Novo código enviado com sucesso! Verifique sua caixa de entrada.');
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Não foi possível reenviar o código no momento.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-red-900/10 text-red-900 mx-auto flex items-center justify-center">
          <KeyRound className="w-6 h-6 text-red-900" />
        </div>
        <h3 className="text-xl font-black text-black dark:text-white">
          Verificação do Código OTP
        </h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Digite o código de 6 dígitos enviado para{' '}
          <strong className="text-black dark:text-white font-mono">{email}</strong>
        </p>
      </div>

      {infoMessage && !error && (
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{infoMessage}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 6 Digit Input Boxes */}
      <div className="space-y-2">
        <label className="block text-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Código de 6 Dígitos
        </label>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={(e) => {
                e.preventDefault();
                handlePaste(e.clipboardData.getData('text'));
              }}
              disabled={loading}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border transition-all ${
                digit
                  ? 'border-red-900 bg-red-50/50 dark:bg-red-950/30 text-black dark:text-white'
                  : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white'
              } focus:outline-hidden focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:opacity-50`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => submitOtp()}
          disabled={loading || digits.some((d) => !d)}
          className="w-full py-3 rounded-xl bg-red-900 hover:bg-red-800 text-white text-sm font-bold shadow-md shadow-red-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-101"
        >
          <ShieldCheck className="w-4 h-4" />
          {loading ? 'Verificando Código...' : 'Confirmar e Prosseguir'}
        </button>

        <div className="flex items-center justify-between text-xs pt-1">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Alterar e-mail
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resending || loading}
            className="text-red-900 hover:underline font-bold disabled:text-zinc-400 disabled:no-underline flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
            {resendCooldown > 0 ? `Reenviar código em ${resendCooldown}s` : 'Reenviar código agora'}
          </button>
        </div>
      </div>
    </div>
  );
}
