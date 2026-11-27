'use client';

import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../../../context/LibraryContext';
import { LoanModal } from '../../../../components/LoanModal';
import { Book } from '../../../../types/library';
import { Plus, Search } from 'lucide-react';

function formatDateBr(dateStr?: string) {
  if (!dateStr) return '—';
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export default function AdminHistoricoPage() {
  const { loans, books, returnBook } = useLibrary();

  const [search, setSearch] = useState('');
  const [loanBook, setLoanBook] = useState<Book | null>(null);

  const filteredLoans = useMemo(() => {
    if (!search.trim()) return loans;
    const q = search.toLowerCase().trim();
    return loans.filter(
      (loan) =>
        loan.bookTitle.toLowerCase().includes(q) ||
        loan.bookAuthor.toLowerCase().includes(q) ||
        loan.userName.toLowerCase().includes(q) ||
        loan.userEmail.toLowerCase().includes(q)
    );
  }, [loans, search]);

  const firstAvailableBook =
    books.find((b) => b.availableCopies > 0) || books[0] || null;

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-6">
      {/* Top-right Action Pill matching Figma "Tela do Admin - Empréstimos" */}
      <div className="max-w-[1136px] mx-auto flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (firstAvailableBook) setLoanBook(firstAvailableBook);
          }}
          disabled={!firstAvailableBook}
          className="px-7 py-2.5 rounded-[50px] bg-[#EBE3D4] border-[3px] border-[#D29F96] shadow-coletivo-card inline-flex items-center gap-3 text-[#9B2915] hover:bg-[#F4F0E8] transition-colors cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3.5]" />
          <span className="text-2xl sm:text-[40px] font-extrabold leading-none">
            Empréstimos
          </span>
        </button>
      </div>

      {/* Main Cream Panel */}
      <div className="max-w-[1136px] mx-auto bg-[#EBE3D4] rounded-[32px] sm:rounded-[50px] p-5 sm:p-10 lg:px-[69px] lg:py-10 shadow-coletivo-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-[48px] font-extrabold text-[#524F4A] leading-tight">
            Empréstimos
          </h1>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#524F4A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar empréstimo..."
              className="w-full pl-9 pr-4 py-2 rounded-[10px] border border-[#ACA69B] bg-white text-sm text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#9B2915]"
            />
          </div>
        </div>

        {/* Striped Table matching Figma */}
        <div className="rounded-[25px] border-2 border-[#3B3935] bg-[#ACA69B] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#ACA69B] text-black text-sm sm:text-base lg:text-[20px] font-bold">
                  <th className="py-3.5 px-4 border-r-2 border-black w-[32%]">
                    Nome
                  </th>
                  <th className="py-3.5 px-3 border-r-2 border-black text-center w-[15%]">
                    Status
                  </th>
                  <th className="py-3.5 px-3 border-r-2 border-black text-center w-[17%]">
                    Leitor
                  </th>
                  <th className="py-3.5 px-3 border-r-2 border-black text-center w-[20%]">
                    Email
                  </th>
                  <th className="py-3.5 px-3 text-center w-[16%]">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.length === 0 ? (
                  <tr className="bg-[#F4F0E8]">
                    <td
                      colSpan={5}
                      className="py-16 px-4 text-center text-base text-[#524F4A]"
                    >
                      Nenhum empréstimo encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map((loan, index) => {
                    const isReturned = loan.status === 'returned';
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const due = new Date(loan.dueDate);
                    due.setHours(0, 0, 0, 0);
                    const isOverdue =
                      !isReturned && (loan.status === 'overdue' || due < today);

                    const statusLabel = isReturned
                      ? 'Devolvido'
                      : isOverdue
                      ? 'Em atraso'
                      : 'Emprestado';

                    const rowBg =
                      index % 2 === 0 ? 'bg-[#F4F0E8]' : 'bg-[#ACA69B]';

                    return (
                      <tr
                        key={loan.id}
                        className={`${rowBg} text-black text-sm sm:text-base lg:text-[18px] font-medium`}
                      >
                        <td className="py-3 px-4 border-r-2 border-black">
                          <span className="font-semibold block leading-snug">
                            {loan.bookTitle}
                          </span>
                          <span className="text-xs text-[#3B3935]">
                            {loan.bookAuthor}
                          </span>
                        </td>
                        <td className="py-3 px-3 border-r-2 border-black text-center">
                          <span
                            className={
                              isOverdue ? 'text-[#9B2915] font-bold' : ''
                            }
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 border-r-2 border-black text-center">
                          {loan.userName}
                        </td>
                        <td className="py-3 px-3 border-r-2 border-black text-center text-sm truncate max-w-[200px]">
                          {loan.userEmail}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isReturned ? (
                            <span className="whitespace-nowrap">
                              {formatDateBr(loan.returnedDate || loan.dueDate)}
                            </span>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <button
                                type="button"
                                onClick={() => returnBook(loan.id)}
                                className="px-3 py-1 rounded-md bg-[#9B2915] hover:bg-[#842312] text-[#EBE3D4] text-xs font-bold cursor-pointer"
                              >
                                Devolver
                              </button>
                              <span className="text-[11px] text-[#3B3935] whitespace-nowrap">
                                Vence {formatDateBr(loan.dueDate)}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LoanModal
        book={loanBook}
        isOpen={!!loanBook}
        onClose={() => setLoanBook(null)}
      />
    </div>
  );
}
