'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { BookCard } from '../components/BookCard';
import { BookDetailModal } from '../components/BookDetailModal';
import { LoanModal } from '../components/LoanModal';
import { EditBookModal } from '../components/EditBookModal';
import { Book } from '../types/library';
import { BookOpen, Search, Loader2, X } from 'lucide-react';

export default function AcervoGeralPage() {
  const { role } = useAuth();
  const { books, isLoading } = useLibrary();

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loanBook, setLoanBook] = useState<Book | null>(null);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const q = searchQuery.toLowerCase().trim();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
    );
  }, [books, searchQuery]);

  return (
    <div className="flex flex-col flex-1 w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-[49px] pt-8 sm:pt-12 pb-16 sm:pb-24 space-y-8 sm:space-y-12">
      {/* Page Title & Search Bar */}
      <section className="space-y-6 sm:space-y-10 lg:pl-[46px]">
        <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold tracking-tight text-[#C8C1B4] leading-none">
          Acervo Geral
        </h1>

        <div className="relative max-w-[659px] w-full h-[54px] sm:h-[66px] bg-white rounded-[10px] flex items-center shadow-sm overflow-hidden">
          <div className="w-[56px] sm:w-[74px] h-full flex items-center justify-center border-r border-[#BDBDBD] shrink-0">
            <Search className="w-6 h-6 sm:w-9 sm:h-9 text-[#0C2B2E] stroke-[1.5]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquise um livro"
            aria-label="Pesquise um livro"
            className="w-full h-full px-4 sm:px-5 bg-transparent text-lg sm:text-2xl lg:text-[32px] text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Limpar busca"
              className="px-3 h-full text-[#524F4A] hover:text-[#1A1917] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="flex-1">
        {isLoading && books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#EBE3D4] space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#EBE3D4]" />
            <p className="text-sm font-medium">Carregando acervo...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 space-y-3 text-[#F2EDE3]">
            <BookOpen className="w-12 h-12 text-[#D29F96] mx-auto" />
            <h2 className="text-xl font-bold">
              {searchQuery
                ? 'Nenhum livro encontrado para esta busca.'
                : 'Nenhum livro cadastrado no momento.'}
            </h2>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-5 py-2 rounded-[10px] bg-[#EBE3D4] text-[#1A1917] text-sm font-semibold shadow-coletivo-btn hover:bg-[#F4F0E8] cursor-pointer"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 sm:gap-x-8 lg:gap-x-[68px] gap-y-10 sm:gap-y-14 justify-items-center">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onSelect={(b) => setSelectedBook(b)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
          onLoanRequest={(b: Book) => {
            setSelectedBook(null);
            setLoanBook(b);
          }}
          onEdit={
            role === 'admin'
              ? (b: Book) => {
                  setSelectedBook(null);
                  setEditBook(b);
                }
              : undefined
          }
        />
      )}

      {loanBook && (
        <LoanModal
          book={loanBook}
          isOpen={!!loanBook}
          onClose={() => setLoanBook(null)}
        />
      )}

      {editBook && (
        <EditBookModal
          book={editBook}
          isOpen={!!editBook}
          onClose={() => setEditBook(null)}
        />
      )}
    </div>
  );
}
