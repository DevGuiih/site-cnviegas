'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLibrary } from '../../../context/LibraryContext';
import { BookDetailModal } from '../../../components/BookDetailModal';
import { LoanModal } from '../../../components/LoanModal';
import { EditBookModal } from '../../../components/EditBookModal';
import { Book } from '../../../types/library';
import { Plus, SquarePen, X, Search } from 'lucide-react';

function formatDateBr(dateStr?: string) {
  if (!dateStr) return '—';
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export default function AdminBooksPage() {
  const { books, loans, deleteBook } = useLibrary();

  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loanBook, setLoanBook] = useState<Book | null>(null);
  const [editBook, setEditBook] = useState<Book | null>(null);

  const filteredBooks = useMemo(() => {
    if (!search.trim()) return books;
    const q = search.toLowerCase().trim();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
    );
  }, [books, search]);

  const getBookLoanStatus = (book: Book) => {
    const activeBookLoans = loans.filter(
      (l) => l.bookId === book.id && l.status !== 'returned'
    );
    const hasOverdue = activeBookLoans.some((l) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(l.dueDate);
      due.setHours(0, 0, 0, 0);
      return l.status === 'overdue' || due < today;
    });

    if (hasOverdue) return 'Em atraso';
    if (book.availableCopies <= 0 || activeBookLoans.length > 0) {
      return book.availableCopies > 0 ? 'Disponível' : 'Emprestado';
    }
    return 'Disponível';
  };

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-6">
      {/* Top-right Action Pill matching Figma "Tela do Admin - Livros" */}
      <div className="max-w-[1136px] mx-auto flex justify-end">
        <Link
          href="/admin/add"
          className="px-7 py-2.5 rounded-[50px] bg-[#EBE3D4] border-[3px] border-[#D29F96] shadow-coletivo-card inline-flex items-center gap-3 text-[#9B2915] hover:bg-[#F4F0E8] transition-colors"
        >
          <Plus className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3.5]" />
          <span className="text-2xl sm:text-[40px] font-extrabold leading-none">
            Livros
          </span>
        </Link>
      </div>

      {/* Main Cream Panel */}
      <div className="max-w-[1136px] mx-auto bg-[#EBE3D4] rounded-[32px] sm:rounded-[50px] p-5 sm:p-10 lg:px-[69px] lg:py-10 shadow-coletivo-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-[48px] font-extrabold text-[#524F4A] leading-tight">
            Livros
          </h1>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#524F4A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar livro..."
              className="w-full pl-9 pr-4 py-2 rounded-[10px] border border-[#ACA69B] bg-white text-sm text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#9B2915]"
            />
          </div>
        </div>

        {/* Striped Table matching Figma */}
        <div className="rounded-[25px] border-2 border-[#3B3935] bg-[#ACA69B] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-[#ACA69B] text-black text-sm sm:text-base lg:text-[20px] font-bold">
                  <th className="py-3.5 px-4 border-r-2 border-black w-[38%]">
                    Nome
                  </th>
                  <th className="py-3.5 px-3 border-r-2 border-black text-center w-[15%]">
                    Status
                  </th>
                  <th className="py-3.5 px-3 border-r-2 border-black text-center w-[14%]">
                    ID
                  </th>
                  <th className="py-3.5 px-3 border-r-2 border-black text-center w-[19%]">
                    Registrado desde:
                  </th>
                  <th className="py-3.5 px-3 text-center w-[14%]" aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {filteredBooks.length === 0 ? (
                  <tr className="bg-[#F4F0E8]">
                    <td
                      colSpan={5}
                      className="py-16 px-4 text-center text-base text-[#524F4A]"
                    >
                      Nenhum livro encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book, index) => {
                    const statusLabel = getBookLoanStatus(book);
                    const rowBg =
                      index % 2 === 0 ? 'bg-[#F4F0E8]' : 'bg-[#ACA69B]';

                    return (
                      <tr
                        key={book.id}
                        className={`${rowBg} text-black text-sm sm:text-base lg:text-[18px] font-medium`}
                      >
                        <td className="py-3 px-4 border-r-2 border-black">
                          <button
                            type="button"
                            onClick={() => setSelectedBook(book)}
                            className="text-left hover:text-[#9B2915] transition-colors cursor-pointer"
                          >
                            <span className="font-semibold block leading-snug">
                              {book.title}
                            </span>
                            <span className="text-xs text-[#3B3935]">
                              {book.author} ({book.availableCopies}/{book.totalCopies})
                            </span>
                          </button>
                        </td>
                        <td className="py-3 px-3 border-r-2 border-black text-center">
                          <span
                            className={
                              statusLabel === 'Em atraso'
                                ? 'text-[#9B2915] font-bold'
                                : ''
                            }
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 border-r-2 border-black text-center font-mono text-sm">
                          #{book.id}
                        </td>
                        <td className="py-3 px-3 border-r-2 border-black text-center whitespace-nowrap">
                          {formatDateBr(book.addedAt)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => setEditBook(book)}
                              title="Editar livro"
                              aria-label={`Editar ${book.title}`}
                              className="p-1 text-black hover:text-[#9B2915] transition-colors cursor-pointer"
                            >
                              <SquarePen className="w-6 h-6" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBook(book.id)}
                              title="Excluir livro"
                              aria-label={`Excluir ${book.title}`}
                              className="w-7 h-7 rounded-full bg-[#E53935] hover:bg-[#9B2915] text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
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

      {/* Modals */}
      <BookDetailModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onLoanRequest={(b) => {
          setSelectedBook(null);
          setLoanBook(b);
        }}
        onEdit={(b) => {
          setSelectedBook(null);
          setEditBook(b);
        }}
      />

      <LoanModal
        book={loanBook}
        isOpen={!!loanBook}
        onClose={() => setLoanBook(null)}
      />

      <EditBookModal
        book={editBook}
        isOpen={!!editBook}
        onClose={() => setEditBook(null)}
      />
    </div>
  );
}
