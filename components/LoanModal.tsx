'use client';

import React, { useState, useMemo } from 'react';
import { Book } from '../types/library';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { X } from 'lucide-react';

interface LoanModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LoanModal({ book, isOpen, onClose }: LoanModalProps) {
  const { currentUser, role } = useAuth();
  const { users, borrowBook } = useLibrary();

  const readerUsers = useMemo(
    () => users.filter((u) => u.role === 'reader'),
    [users]
  );

  const [selectedUserId, setSelectedUserId] = useState<string>(
    role === 'reader' && currentUser
      ? currentUser.id
      : readerUsers[0]?.id || ''
  );
  const [loanDays, setLoanDays] = useState<number>(14);
  const [submitting, setSubmitting] = useState(false);

  const formattedDueDate = useMemo(() => {
    const due = new Date();
    due.setDate(due.getDate() + loanDays);
    return due.toLocaleDateString('pt-BR');
  }, [loanDays]);

  if (!isOpen || !book) return null;

  const isAvailable = book.availableCopies > 0;
  const effectiveUserId =
    role === 'reader' && currentUser
      ? currentUser.id
      : selectedUserId || readerUsers[0]?.id || currentUser?.id || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable || !effectiveUserId || submitting) return;

    setSubmitting(true);
    const res = await borrowBook(book.id, effectiveUserId, loanDays);
    setSubmitting(false);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[782px] bg-[#EBE3D4] border-[3px] border-[#D29F96] rounded-[10px] shadow-coletivo-card p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3.5 right-3.5 p-1.5 text-[#1A1917] hover:text-[#9B2915] transition-colors cursor-pointer"
        >
          <X className="w-8 h-8 stroke-[2.2]" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl sm:text-[28px] font-normal text-black leading-snug pr-10">
            Tem certeza que deseja emprestar o livro:
          </h3>

          <div className="pl-4 sm:pl-6 space-y-0.5">
            <p className="text-2xl sm:text-[32px] font-medium text-[#9B2915] leading-tight">
              {book.title}
            </p>
            <p className="text-lg sm:text-2xl font-normal text-[#842312]">
              {book.author}
            </p>
          </div>

          <p className="text-xl sm:text-[28px] font-normal text-black leading-snug">
            Você deverá <strong className="font-bold">devolver</strong> ou{' '}
            <strong className="font-bold">renovar</strong> dia{' '}
            <strong className="font-bold">{formattedDueDate}</strong>
          </p>

          {/* Admin reader selection & period options */}
          {role === 'admin' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#524F4A] uppercase tracking-wider">
                  Leitor Destinatário
                </label>
                <select
                  value={effectiveUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-[10px] border-2 border-[#D29F96] bg-[#F4F0E8] text-sm text-[#1A1917] focus:outline-none focus:border-[#9B2915]"
                >
                  {readerUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#524F4A] uppercase tracking-wider">
                  Prazo do Empréstimo
                </label>
                <select
                  value={loanDays}
                  onChange={(e) => setLoanDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-[10px] border-2 border-[#D29F96] bg-[#F4F0E8] text-sm text-[#1A1917] focus:outline-none focus:border-[#9B2915]"
                >
                  <option value={7}>7 dias</option>
                  <option value={14}>14 dias (padrão)</option>
                  <option value={30}>30 dias</option>
                </select>
              </div>
            </div>
          )}

          {!isAvailable && (
            <p className="text-sm font-semibold text-[#9B2915]">
              Todos os exemplares deste livro estão emprestados no momento.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
            <button
              type="submit"
              disabled={!isAvailable || submitting || !effectiveUserId}
              className="px-10 sm:px-14 py-2.5 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] active:bg-[#BE7467] text-black text-xl sm:text-2xl font-normal shadow-coletivo-btn transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Emprestando...' : 'Emprestar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-10 sm:px-14 py-2.5 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] active:bg-[#BE7467] text-black text-xl sm:text-2xl font-normal shadow-coletivo-btn transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
