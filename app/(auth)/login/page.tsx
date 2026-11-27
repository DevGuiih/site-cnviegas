'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLibrary } from '../../../context/LibraryContext';
import {
  LogIn,
  UserCheck,
  Shield,
  Eye,
  Lock,
  Mail,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const { addToast } = useLibrary();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Não foi possível entrar.');
      return;
    }
    addToast('Bem-vindo!', `Login efetuado com sucesso para ${email}.`);
    router.push('/');
  };

  const handleDemoLogin = async (demoRole: 'reader' | 'admin') => {
    setError(null);
    setLoading(true);
    const result = await loginAsDemo(demoRole);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Não foi possível entrar com a conta demo.');
      return;
    }
    if (demoRole === 'admin') {
      addToast('Modo Admin', 'Conectado como Coordenação da Biblioteca.');
    } else {
      addToast('Modo Leitor', 'Conectado como Leitor Comunitário.');
    }
    router.push('/');
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Heading */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#C8C1B4]">
            Login
          </h1>
          <p className="text-sm text-[#F2EDE3]/90">
            Coletivo Negro Viegas D&apos;Abreu • Gestão e Empréstimos
          </p>
        </div>

        {/* 1-Click Demo Access */}
        <div className="p-5 rounded-[30px] bg-[#EBE3D4] border-[3px] border-[#D29F96] shadow-coletivo-card space-y-3 text-[#1A1917]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#9B2915] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#9B2915]" />
            Acesso Rápido de Demonstração
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin('reader')}
              disabled={loading}
              className="p-3 rounded-[14px] bg-[#F4F0E8] border-2 border-[#D29F96] hover:bg-[#D29F96]/40 transition-all text-left flex flex-col justify-between gap-2 cursor-pointer disabled:opacity-60"
            >
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded-lg bg-[#9B2915] text-[#EBE3D4]">
                  <UserCheck className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-[#9B2915] bg-[#D29F96]/40 px-2 py-0.5 rounded">
                  Leitor
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#1A1917]">Leitor Comunitário</p>
                <p className="text-[11px] text-[#524F4A]">Membro Comum</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="p-3 rounded-[14px] bg-[#F4F0E8] border-2 border-[#D29F96] hover:bg-[#D29F96]/40 transition-all text-left flex flex-col justify-between gap-2 cursor-pointer disabled:opacity-60"
            >
              <div className="flex items-center justify-between">
                <span className="p-1.5 rounded-lg bg-[#3B3935] text-[#EBE3D4]">
                  <Shield className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-[#1A1917] bg-[#C8C1B4] px-2 py-0.5 rounded">
                  Admin
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#1A1917]">Coordenação</p>
                <p className="text-[11px] text-[#524F4A]">Gestor do Coletivo</p>
              </div>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="p-6 sm:p-8 rounded-[30px] bg-[#EBE3D4] border-[3px] border-[#D29F96] shadow-coletivo-card space-y-5 text-[#1A1917]">
          <div className="flex items-center justify-between border-b border-[#ACA69B] pb-3">
            <span className="text-xs font-bold text-[#524F4A] uppercase tracking-wider">
              Entrar com E-mail
            </span>
            <Link
              href="/register"
              className="text-xs font-bold text-[#9B2915] hover:underline"
            >
              Criar conta nova →
            </Link>
          </div>

          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Endereço de E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#524F4A]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-[#ACA69B] bg-white text-sm text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#9B2915]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#524F4A]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-[#ACA69B] bg-white text-sm text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#9B2915]"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm font-semibold text-[#9B2915]" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] active:bg-[#BE7467] text-black text-base sm:text-lg font-medium shadow-coletivo-btn transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#ACA69B]">
            <Link
              href="/"
              className="text-xs text-[#524F4A] hover:text-[#9B2915] inline-flex items-center gap-1 font-semibold"
            >
              <Eye className="w-3.5 h-3.5" />
              Apenas consultar o acervo sem autenticação
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
