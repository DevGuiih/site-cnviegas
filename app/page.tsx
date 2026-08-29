'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { BookCard } from '../components/BookCard';
import { BookDetailModal } from '../components/BookDetailModal';
import { LoanModal } from '../components/LoanModal';
import { EditBookModal } from '../components/EditBookModal';
import { Book } from '../types/library';
import {
  BookOpen,
  Library,
  Users,
  Sparkles,
  Shield,
  ArrowRight,
  Search,
  BookmarkCheck,
} from 'lucide-react';

export default function HomePage() {
  const { role } = useAuth();
  const { books, loans, users } = useLibrary();

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loanBook, setLoanBook] = useState<Book | null>(null);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const featuredBooks = books.filter((b) => b.featured).slice(0, 4);
  const totalBooks = books.length;
  const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const activeLoansCount = loans.filter((l) => l.status !== 'returned').length;
  const totalMembers = users.filter((u) => u.role === 'reader').length;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white">
      
      {/* HERO SECTION (Solid Color, No Gradients) */}
      <section className="relative bg-black text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-900">
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-white text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            Acervo Comunitário Aberto à População
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Biblioteca Popular <br />
            <span className="text-red-600">
              Coletivo Negro Viegas D&apos;Abreu
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            Um acervo livre e compartilhado para cultivar pensamento crítico, literatura periférica,
            lutas sociais e imaginação coletiva. Todos os títulos disponíveis para consulta e empréstimo solidário.
          </p>

          {/* Search bar directly on hero */}
          <div className="max-w-xl mx-auto pt-2">
            <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 focus-within:border-red-600 transition-all">
              <Search className="w-5 h-5 text-zinc-400 ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, autor (ex: Paulo Freire, Carolina Maria de Jesus)..."
                className="w-full py-4 px-3 bg-transparent text-sm text-white placeholder-zinc-400 focus:outline-hidden"
              />
              <Link
                href={`/books${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}
                className="mr-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shrink-0"
              >
                Buscar
              </Link>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/books"
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg transition-all flex items-center gap-2 hover:scale-102"
            >
              <Library className="w-4 h-4" />
              Ver Acervo Completo
            </Link>

            {role === 'admin' ? (
              <Link
                href="/admin"
                className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-100 text-black text-sm font-bold shadow transition-all flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-red-600" />
                Painel do Administrador
              </Link>
            ) : role === 'reader' ? (
              <Link
                href="/readers"
                className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold border border-zinc-800 transition-all flex items-center gap-2"
              >
                <BookmarkCheck className="w-4 h-4 text-red-600" />
                Meu Painel de Leitor
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold border border-zinc-800 transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-red-600" />
                Área de Membros / Login
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* STATS OVERVIEW CARDS */}
      <section className="py-8 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 shadow-xs">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 text-red-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                  {totalBooks}
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                  Títulos Catalogados
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 shadow-xs">
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white">
                <Library className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                  {totalCopies}
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                  Exemplares Físicos
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 shadow-xs">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 text-red-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                  {activeLoansCount}
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                  Livros em Circulação
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 shadow-xs">
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                  {totalMembers + 1}
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                  Leitores Registrados
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED BOOKS SECTION */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-red-600" />
              Destaques Selecionados
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white mt-1">
              Livros em Evidência no Coletivo
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Obras essenciais de formação política, poesia insurgente e memória comunitária.
            </p>
          </div>

          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 hover:underline"
          >
            Explorar todas as {books.length} obras
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onSelect={(b) => setSelectedBook(b)}
              onLoan={(b) => setLoanBook(b)}
              onEdit={(b) => setEditBook(b)}
            />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-14 bg-zinc-50 dark:bg-zinc-950 border-y border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
              Autonomia & Circulação
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white">
              Como Funciona o Empréstimo Comunitário?
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nosso sistema é construído sobre a confiança mútua e o compromisso coletivo com o cuidado dos livros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 font-black flex items-center justify-center text-lg">
                1
              </div>
              <h3 className="text-lg font-black text-black dark:text-white">
                Explore o Acervo Livremente
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Navegue pelos livros online, confira a disponibilidade de cópias e a localização física exata na estante da sede.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white font-black flex items-center justify-center text-lg">
                2
              </div>
              <h3 className="text-lg font-black text-black dark:text-white">
                Cadastre-se como Leitor
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Crie sua conta de membro do coletivo em poucos segundos para solicitar empréstimos, salvar livros favoritos e renovar prazos.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 font-black flex items-center justify-center text-lg">
                3
              </div>
              <h3 className="text-lg font-black text-black dark:text-white">
                Retire na Sede & Compartilhe
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Retire seu exemplar na sede do coletivo com prazo inicial de 14 dias (renováveis), leia com carinho e compartilhe suas impressões.
              </p>
            </div>

          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow transition-all"
            >
              Fazer Cadastro de Leitor Agora
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* MODALS */}
      <BookDetailModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onLoanRequest={(b) => setLoanBook(b)}
        onEdit={(b) => setEditBook(b)}
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
