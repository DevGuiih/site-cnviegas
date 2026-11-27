'use client';

import React from 'react';
import { Book } from '../types/library';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { Bookmark } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
}

const COVER_THEME_MAP: Record<string, string> = {
  'bg-red-600': 'bg-[#9B2915] text-[#F2EDE3]',
  'bg-red-900': 'bg-[#9B2915] text-[#F2EDE3]',
  'bg-red-950': 'bg-[#360E07] text-[#F2EDE3]',
  'bg-black': 'bg-[#1A1917] text-[#F2EDE3]',
  'bg-zinc-900': 'bg-[#3B3935] text-[#F2EDE3]',
};

export function BookCard({ book, onSelect }: BookCardProps) {
  const { isAuthenticated } = useAuth();
  const { isWishlisted } = useLibrary();

  const isFav = isWishlisted(book.id);
  const isAvailable = book.availableCopies > 0;
  const coverStyle =
    (book.coverColor && COVER_THEME_MAP[book.coverColor]) ||
    'bg-[#D9D9D9] text-[#1A1917]';

  return (
    <button
      type="button"
      onClick={() => onSelect(book)}
      className="group w-full max-w-[168px] flex flex-col text-left cursor-pointer focus:outline-none"
    >
      {/* Book Cover */}
      <div
        className={`relative w-full aspect-[168/208] rounded-r-[5px] overflow-hidden shadow-md transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-xl flex flex-col justify-between p-4 ${coverStyle}`}
      >
        {/* Spine Shadow Gradient matching Figma Livro component */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(270deg, rgba(217, 217, 217, 0) 80%, rgba(0, 0, 0, 0.42) 100%)',
          }}
        />

        {isAuthenticated && isFav && (
          <span
            className="relative z-10 self-end p-1 rounded bg-black/40 text-[#F2EDE3]"
            title="Salvo nos favoritos"
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </span>
        )}

        <div className="relative z-10 my-auto pl-1.5 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-75 line-clamp-1">
            {book.author}
          </p>
          <p className="text-base font-extrabold leading-snug line-clamp-4">
            {book.title}
          </p>
        </div>

        <span className="relative z-10 pl-1.5 text-[10px] font-medium opacity-70">
          {book.year || 'CN Viegas'}
        </span>
      </div>

      {/* Card Metadata below cover */}
      <div className="pt-1.5 w-full space-y-0.5">
        <h3 className="text-[18px] leading-[22px] font-normal text-[#F2EDE3] truncate group-hover:underline">
          {book.title}
        </h3>
        <p className="text-[14px] leading-[17px] font-normal text-[#F2EDE3]/90 truncate">
          {book.author}
        </p>
        <div className="pt-1.5">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-[5px] text-[12px] leading-[15px] font-normal ${
              isAvailable
                ? 'bg-[#D9D9D9] text-black'
                : 'bg-[#360E07] text-[#F2EDE3] border border-[#D29F96]/40'
            }`}
          >
            {isAvailable ? 'Disponível' : 'Indisponível'}
          </span>
        </div>
      </div>
    </button>
  );
}
