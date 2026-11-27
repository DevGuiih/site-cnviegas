'use client';

import React from 'react';
import Link from 'next/link';
import { Book } from '../types/library';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { X, Bookmark, Edit, Trash2 } from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onLoanRequest?: (book: Book) => void;
  onEdit?: (book: Book) => void;
}

const COVER_THEME_MAP: Record<string, string> = {
  'bg-red-600': 'bg-[#9B2915] text-[#F2EDE3]',
  'bg-red-900': 'bg-[#9B2915] text-[#F2EDE3]',
  'bg-red-950': 'bg-[#360E07] text-[#F2EDE3]',
  'bg-black': 'bg-black text-white',
  'bg-zinc-900': 'bg-[#1A1917] text-[#F2EDE3]',
};

export function BookDetailModal({
  book,
  isOpen,
  onClose,
  onLoanRequest,
  onEdit,
}: BookDetailModalProps) {
  const { role, isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist, deleteBook } = useLibrary();

  if (!isOpen || !book) return null;

  const isFav = isWishlisted(book.id);
  const isAvailable = book.availableCopies > 0;
  const coverStyle =
    (book.coverColor && COVER_THEME_MAP[book.coverColor]) ||
    'bg-black text-white';

  const handleDelete = async () => {
    await deleteBook(book.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-modal-title"
        className="relative w-full max-w-[782px] bg-[#EBE3D4] border-[3px] border-[#D29F96] rounded-[10px] shadow-coletivo-card overflow-hidden p-5 sm:p-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top curved decorative accent matching Figma Pop-up - Info do livro */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 right-0 h-[117px] bg-[#D29F96] rounded-br-[300px]"
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-20 p-1.5 text-[#1A1917] hover:text-[#9B2915] transition-colors cursor-pointer"
        >
          <X className="w-8 h-8 stroke-[2.2]" />
        </button>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-stretch">
          {/* Left Book Cover */}
          <div
            className={`w-[190px] sm:w-[240px] h-[285px] sm:h-[360px] rounded-[10px] shrink-0 overflow-hidden relative flex flex-col justify-between p-6 shadow-md ${coverStyle}`}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(270deg, rgba(217,217,217,0) 85%, rgba(0,0,0,0.45) 100%)',
              }}
            />
            <div className="relative z-10 my-auto text-center space-y-3">
              <p className="text-xl sm:text-2xl font-black uppercase leading-tight tracking-tight">
                {book.title}
              </p>
              <p className="text-sm sm:text-base font-bold uppercase tracking-wider opacity-85">
                {book.author}
              </p>
            </div>
            {(book.year || book.publisher) && (
              <p className="relative z-10 text-center text-[11px] opacity-70">
                {[book.publisher, book.year].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>

          {/* Right Info Column */}
          <div className="flex-1 flex flex-col justify-between gap-4 w-full min-w-0">
            {/* Title & Author */}
            <div className="pr-8">
              <h2
                id="book-modal-title"
                className="text-2xl sm:text-[36px] lg:text-[42px] font-bold text-[#9B2915] leading-[1.1] break-words"
              >
                {book.title}
              </h2>
              <p className="text-lg sm:text-2xl font-bold text-[#842312] mt-1 sm:pl-2">
                {book.author}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <p className="text-sm sm:text-[18px] leading-relaxed text-black max-h-[145px] overflow-y-auto pr-1">
                {book.description ||
                  'Obra catalogada no acervo comunitário da Biblioteca do Coletivo Negro Viegas D\'Abreu.'}
              </p>
              {(book.isbn || book.location || book.pages) && (
                <p className="text-xs text-[#524F4A] font-medium">
                  {[
                    book.location ? `Local: ${book.location}` : null,
                    book.pages ? `${book.pages} páginas` : null,
                    book.isbn ? `ISBN: ${book.isbn}` : null,
                  ]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              )}
            </div>

            {/* Availability Pill & Wishlist */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-[10px] text-sm sm:text-base font-normal ${
                  isAvailable
                    ? 'bg-[#9B2915] text-[#EBE3D4]'
                    : 'bg-[#524F4A] text-[#EBE3D4]'
                }`}
              >
                {isAvailable
                  ? `Disponível (${book.availableCopies}/${book.totalCopies})`
                  : `Indisponível (0/${book.totalCopies})`}
              </span>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => toggleWishlist(book.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold border transition-colors cursor-pointer ${
                    isFav
                      ? 'bg-[#9B2915]/15 border-[#9B2915] text-[#9B2915]'
                      : 'border-[#524F4A]/40 text-[#524F4A] hover:border-[#9B2915] hover:text-[#9B2915]'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                  {isFav ? 'Favoritado' : 'Favoritar'}
                </button>
              )}
            </div>

            {/* Primary CTA & Admin Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {isAuthenticated ? (
                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onLoanRequest && onLoanRequest(book)}
                  className="px-10 sm:px-14 py-2.5 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] active:bg-[#BE7467] text-black text-xl sm:text-2xl font-normal shadow-coletivo-btn transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAvailable ? 'Emprestar' : 'Indisponível'}
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="px-8 sm:px-12 py-2.5 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] active:bg-[#BE7467] text-black text-lg sm:text-2xl font-normal shadow-coletivo-btn transition-colors"
                >
                  Entrar para Emprestar
                </Link>
              )}

              {role === 'admin' && (
                <div className="flex items-center gap-2 ml-auto">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(book)}
                      aria-label="Editar livro"
                      title="Editar livro"
                      className="p-2.5 rounded-[10px] border border-[#524F4A]/30 text-[#1A1917] hover:bg-[#D29F96]/40 transition-colors cursor-pointer"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDelete}
                    aria-label="Excluir livro"
                    title="Excluir livro"
                    className="p-2.5 rounded-[10px] border border-[#9B2915]/40 text-[#9B2915] hover:bg-[#9B2915] hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
