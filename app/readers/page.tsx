'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { BookCard } from '../../components/BookCard';
import { BookDetailModal } from '../../components/BookDetailModal';
import { LoanModal } from '../../components/LoanModal';
import { Book } from '../../types/library';
import { RotateCw, CheckCircle, Bookmark, ArrowLeft } from 'lucide-react';

function formatDateBr(dateStr?: string) {
  if (!dateStr) return '—';
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function isLoanOverdue(dueDateStr: string, status: string) {
  if (status === 'returned') return false;
  if (status === 'overdue') return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

function ReaderDashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'wishlist' ? 'wishlist' : 'loans';

  const { currentUser } = useAuth();
  const {
    books,
    wishlist,
    getUserLoans,
    renewLoan,
    returnBook,
  } = useLibrary();

  const [activeTab, setActiveTab] = useState<'loans' | 'wishlist'>(initialTab);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loanBook, setLoanBook] = useState<Book | null>(null);

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-[#EBE3D4] border-[3px] border-[#D29F96] rounded-[30px] shadow-coletivo-card p-8 text-center space-y-4 text-[#1A1917]">
          <h1 className="text-2xl font-bold text-[#524F4A]">
            Acesso restrito ao leitor
          </h1>
          <p className="text-sm text-[#524F4A]">
            Entre na sua conta para visualizar seus empréstimos e livros favoritos.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-2.5 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] text-black text-base font-medium shadow-coletivo-btn"
          >
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  const allUserLoans = getUserLoans(currentUser.id);
  const wishlistedBooks = books.filter((b) => wishlist.includes(b.id));

  if (activeTab === 'wishlist') {
    return (
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-[49px] pt-8 sm:pt-12 pb-16 sm:pb-24 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 lg:pl-[46px]">
          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold tracking-tight text-[#C8C1B4] leading-none">
            Meus Favoritos
          </h1>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('loans')}
              className="px-5 py-2.5 rounded-[50px] bg-[#EBE3D4] border-[3px] border-[#D29F96] text-[#9B2915] font-bold text-sm sm:text-base shadow-coletivo-card hover:bg-[#F4F0E8] transition-colors cursor-pointer"
            >
              Meus Empréstimos
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-[50px] bg-[#C8C1B4] text-[#524F4A] font-bold text-sm sm:text-base hover:bg-[#EBE3D4] transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Acervo Geral
            </Link>
          </div>
        </div>

        {wishlistedBooks.length === 0 ? (
          <div className="max-w-lg mx-auto bg-[#EBE3D4] border-[3px] border-[#D29F96] rounded-[30px] shadow-coletivo-card p-8 text-center space-y-4 text-[#1A1917] my-12">
            <Bookmark className="w-10 h-10 text-[#9B2915] mx-auto" />
            <h2 className="text-xl font-bold text-[#524F4A]">
              Sua lista de favoritos está vazia
            </h2>
            <p className="text-sm text-[#524F4A]">
              Abra qualquer livro no Acervo Geral e clique em &ldquo;Favoritar&rdquo; para salvá-lo aqui.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-2.5 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] text-black font-medium shadow-coletivo-btn"
            >
              Explorar Acervo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 sm:gap-x-8 lg:gap-x-[68px] gap-y-10 justify-items-center">
            {wishlistedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onSelect={(b) => setSelectedBook(b)}
              />
            ))}
          </div>
        )}

        <BookDetailModal
          book={selectedBook}
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
          onLoanRequest={(b) => {
            setSelectedBook(null);
            setLoanBook(b);
          }}
        />
        <LoanModal
          book={loanBook}
          isOpen={!!loanBook}
          onClose={() => setLoanBook(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16">
      {/* Main Cream Panel matching Figma "Tela do Leitor - Empréstimos" */}
      <div className="max-w-[1136px] mx-auto bg-[#EBE3D4] rounded-[32px] sm:rounded-[50px] p-5 sm:p-10 lg:px-[69px] lg:py-10 shadow-coletivo-card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-[48px] font-extrabold text-[#524F4A] leading-tight">
            Meus empréstimos
          </h1>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('wishlist')}
              className="px-4 py-2 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] text-black text-sm font-medium shadow-coletivo-btn transition-colors cursor-pointer"
            >
              Meus Favoritos ({wishlistedBooks.length})
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-[10px] bg-[#C8C1B4] hover:bg-[#ACA69B] text-[#1A1917] text-sm font-medium transition-colors"
            >
              Ver Acervo
            </Link>
          </div>
        </div>

        {/* Striped Table matching Figma */}
        <div className="rounded-[25px] border-2 border-[#3B3935] bg-[#ACA69B] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-[#ACA69B] text-black text-sm sm:text-base lg:text-[20px] font-bold">
                  <th className="py-3.5 px-4 border-r-2 border-black w-[36%]">
                    Nome
                  </th>
                  <th className="py-3.5 px-3 border-r-2 border-black text-center w-[15%]">
                    Status
                  </th>
                  <th className="py-3.5 px-3 border-r-2 border-black text-center w-[16%]">
                    Data de Retirada
                  </th>
                  <th className="py-3.5 px-3 border-r-2 border-black text-center w-[15%]">
                    Vencimento
                  </th>
                  <th className="py-3.5 px-3 text-center w-[18%]">
                    Data de Devolução
                  </th>
                </tr>
              </thead>
              <tbody>
                {allUserLoans.length === 0 ? (
                  <tr className="bg-[#F4F0E8]">
                    <td
                      colSpan={5}
                      className="py-16 px-4 text-center text-base text-[#524F4A]"
                    >
                      Você ainda não possui empréstimos registrados.{' '}
                      <Link href="/" className="text-[#9B2915] font-bold underline">
                        Explorar o acervo
                      </Link>
                    </td>
                  </tr>
                ) : (
                  allUserLoans.map((loan, index) => {
                    const isReturned = loan.status === 'returned';
                    const overdue = isLoanOverdue(loan.dueDate, loan.status);
                    const statusLabel = isReturned
                      ? 'Devolvido'
                      : overdue
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
                              overdue
                                ? 'text-[#9B2915] font-bold'
                                : 'text-black'
                            }
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 border-r-2 border-black text-center whitespace-nowrap">
                          {formatDateBr(loan.borrowedDate)}
                        </td>
                        <td className="py-3 px-3 border-r-2 border-black text-center whitespace-nowrap">
                          {formatDateBr(loan.dueDate)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isReturned ? (
                            <span className="whitespace-nowrap">
                              {formatDateBr(loan.returnedDate || loan.dueDate)}
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => renewLoan(loan.id, 7)}
                                title="Renovar por +7 dias"
                                className="px-2.5 py-1 rounded-md bg-[#D29F96] hover:bg-[#C98B81] text-black text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <RotateCw className="w-3 h-3" />
                                Renovar
                              </button>
                              <button
                                type="button"
                                onClick={() => returnBook(loan.id)}
                                title="Confirmar devolução"
                                className="px-2.5 py-1 rounded-md bg-[#9B2915] hover:bg-[#842312] text-[#EBE3D4] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Devolver
                              </button>
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
    </div>
  );
}

export default function ReaderDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-20 text-[#EBE3D4]">
          Carregando painel do leitor...
        </div>
      }
    >
      <ReaderDashboardContent />
    </Suspense>
  );
}
