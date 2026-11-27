'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLibrary } from '../../../context/LibraryContext';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  Sparkles,
  LogIn,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { addToast } = useLibrary();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setError(null);
    setLoading(true);
    const result = await register(name, email, password, phone, bio, []);
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? 'Não foi possível concluir o cadastro.');
      return;
    }

    addToast(
      'Bem-vindo(a) ao Coletivo!',
      `Cadastro realizado com sucesso para ${name}. Seu cartão de leitor está ativo!`,
      'success'
    );
    router.push('/');
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Heading */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#C8C1B4]">
            Cadastro
          </h1>
          <p className="text-sm text-[#F2EDE3]/90">
            Biblioteca do Coletivo Negro Viegas D&apos;Abreu • Acesso comunitário livre
          </p>
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-8 rounded-[30px] bg-[#EBE3D4] border-[3px] border-[#D29F96] shadow-coletivo-card space-y-5 text-[#1A1917]">
          <div className="flex items-center justify-between border-b border-[#ACA69B] pb-3">
            <span className="text-xs font-bold text-[#524F4A] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#9B2915]" />
              Ficha de Inscrição Comunitária
            </span>
            <Link
              href="/login"
              className="text-xs font-bold text-[#9B2915] hover:underline"
            >
              Já tenho conta →
            </Link>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#524F4A]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mariana Silva"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-[#ACA69B] bg-white text-sm text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#9B2915]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Endereço de E-mail *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#524F4A]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-[#ACA69B] bg-white text-sm text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#9B2915]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Senha *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#524F4A]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-[#ACA69B] bg-white text-sm text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#9B2915]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Telefone / WhatsApp (Para avisos de devolução)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#524F4A]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-[#ACA69B] bg-white text-sm text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#9B2915]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Como você conheceu o coletivo ou o que busca ler? (Opcional)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ex: Participo das oficinas culturais..."
                rows={2}
                className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#9B2915]"
              />
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
              <UserPlus className="w-4 h-4" />
              {loading ? 'Criando Conta...' : 'Concluir Cadastro'}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#ACA69B]">
            <Link
              href="/login"
              className="text-xs text-[#524F4A] hover:text-[#9B2915] inline-flex items-center gap-1 font-semibold"
            >
              <LogIn className="w-3.5 h-3.5" />
              Já tem cadastro? Faça login aqui
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
