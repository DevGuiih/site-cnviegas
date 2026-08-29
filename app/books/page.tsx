'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { BookCard } from '../../components/BookCard';
import { BookDetailModal } from '../../components/BookDetailModal';
import { LoanModal } from '../../components/LoanModal';
import { EditBookModal } from '../../components/EditBookModal';
import { Book, BookCategory } from '../../types/library';
import {
  Library,
  Search,
  LayoutGrid,
  List,
  CheckCircle,
  Clock,
  Sparkles,
  BookOpen,
  MapPin,
  RotateCcw,
  UserPlus,
  LogIn,
} from 'lucide-react';

const ALL_CATEGORIES: BookCategory[] = [
  'Literatura Brasileira',
  'Teoria Social & Crítica',
  'Filosofia',
  'História & Política',
  'Feminismo & Gênero',
  'Lutas Antirracistas',
  'Ecologia & Saberes Indígenas',
  'Poesia & Artes',
  'Fanzines & Revistas',
  'Outros',
];

export default function BooksPublicCatalogPage() {
  const { isAuthenticated } = useAuth();
  const { books } = useLibrary();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'borrowed'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title-asc' | 'title-desc' | 'author'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loanBook, setLoanBook] = useState<Book | null>(null);
  const [editBook, setEditBook] = useState<Book | null>(null);

  // Filter and sort logic
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesTitle = book.title.toLowerCase().includes(q);
          const matchesAuthor = book.author.toLowerCase().includes(q);
          const matchesDesc = book.description.toLowerCase().includes(q);
          const matchesIsbn = book.isbn?.toLowerCase().includes(q);
          const matchesTags = book.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesAuthor && !matchesDesc && !matchesIsbn && !matchesTags) {
            return false;
          }
        }

        // Category
        if (selectedCategory !== 'all' && book.category !== selectedCategory) {
          return false;
        }

        // Availability
        if (availabilityFilter === 'available' && book.availableCopies <= 0) {
          return false;
        }
        if (availabilityFilter === 'borrowed' && book.availableCopies > 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
        if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
        if (sortBy === 'author') return a.author.localeCompare(b.author);
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      });
  }, [books, search, selectedCategory, availabilityFilter, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: books.length };
    ALL_CATEGORIES.forEach((cat) => {
      counts[cat] = books.filter((b) => b.category === cat).length;
    });
    return counts;
  }, [books]);

  const availableTotal = books.filter((b) => b.availableCopies > 0).length;

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 bg-white dark:bg-black text-black dark:text-white">
      
      {/* Header Banner (Solid Colors) */}
      <div className="rounded-3xl bg-black text-white p-6 sm:p-10 border border-zinc-900 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-red-400 text-xs font-bold">
            <Library className="w-3.5 h-3.5 text-red-600" />
            Acervo Aberto para Consulta Pública
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Catálogo Geral de Livros
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            Consulte todos os {books.length} títulos da Biblioteca Coletivo Negro Viegas D&apos;Abreu.
            Você pode verificar a disponibilidade de exemplares em tempo real e a localização de cada obra na nossa sede física.
          </p>
        </div>

        {/* Live indicator badges */}
        <div className="relative z-10 mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-200">
          <span className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            <CheckCircle className="w-4 h-4 text-red-600" />
            {availableTotal} títulos com exemplares disponíveis agora
          </span>
          <span className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            <Clock className="w-4 h-4 text-zinc-400" />
            {books.length - availableTotal} títulos em circulação
          </span>
        </div>
      </div>

      {/* Non-authenticated invitation banner */}
      {!isAuthenticated && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black dark:text-white">
                Quer levar um livro emprestado?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                O empréstimo é 100% gratuito. Cadastre-se como leitor do coletivo para fazer reservas e retirar na sede.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Link
              href="/register"
              className="w-full sm:w-auto text-center px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Cadastrar-se
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-center px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-zinc-700"
            >
              <LogIn className="w-3.5 h-3.5" />
              Entrar
            </Link>
          </div>
        </div>
      )}

      {/* FILTERS & SEARCH TOOLBAR */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Universal Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, autor, tema, ISBN..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-black dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-red-600 shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-black dark:hover:text-white font-semibold"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Quick Controls: Availability, Sort, View mode */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Availability pill filter */}
            <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 text-xs font-medium">
              <button
                onClick={() => setAvailabilityFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  availabilityFilter === 'all'
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Todos ({books.length})
              </button>
              <button
                onClick={() => setAvailabilityFilter('available')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  availabilityFilter === 'available'
                    ? 'bg-red-600 text-white shadow-xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Disponíveis ({availableTotal})
              </button>
              <button
                onClick={() => setAvailabilityFilter('borrowed')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  availabilityFilter === 'borrowed'
                    ? 'bg-zinc-800 text-white shadow-xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Emprestados
              </button>
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs py-2 pl-3 pr-8 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-600"
              >
                <option value="recent">Mais Recentes</option>
                <option value="title-asc">Título (A - Z)</option>
                <option value="title-desc">Título (Z - A)</option>
                <option value="author">Autor (A - Z)</option>
              </select>
            </div>

            {/* View Mode Toggle (Grid vs Table) */}
            <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-black text-red-600 shadow-xs'
                    : 'text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
                title="Visualização em Cards"
                aria-label="Visualização em Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-black text-red-600 shadow-xs'
                    : 'text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
                title="Visualização em Tabela"
                aria-label="Visualização em Tabela"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            Todas as Seções ({categoryCounts.all || 0})
          </button>

          {ALL_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || 0;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH RESULTS COUNT */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <span>
          Exibindo <strong>{filteredBooks.length}</strong> de {books.length} livros cadastrados
          {selectedCategory !== 'all' && ` na seção "${selectedCategory}"`}
        </span>

        {(search || selectedCategory !== 'all' || availabilityFilter !== 'all') && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setAvailabilityFilter('all');
            }}
            className="text-red-600 hover:underline flex items-center gap-1 font-bold"
          >
            <RotateCcw className="w-3 h-3" />
            Limpar todos os filtros
          </button>
        )}
      </div>

      {/* BOOKS PRESENTATION: GRID OR TABLE */}
      {filteredBooks.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-300 dark:border-zinc-800 p-8 space-y-4">
          <BookOpen className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-lg font-bold text-black dark:text-white">
            Nenhum livro encontrado
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Não encontramos nenhuma obra correspondente aos filtros de busca aplicados. Tente usar termos mais amplos ou redefinir os filtros.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setAvailabilityFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow hover:bg-red-700"
          >
            Ver Todo o Acervo
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onSelect={(b) => setSelectedBook(b)}
              onLoan={(b) => setLoanBook(b)}
              onEdit={(b) => setEditBook(b)}
            />
          ))}
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
              <thead className="bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white font-bold uppercase text-[11px] border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">Obra & Autor</th>
                  <th className="py-3.5 px-4">Seção / Categoria</th>
                  <th className="py-3.5 px-4">Localização Física</th>
                  <th className="py-3.5 px-4">Exemplares</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredBooks.map((book) => {
                  const isAvail = book.availableCopies > 0;
                  return (
                    <tr
                      key={book.id}
                      onClick={() => setSelectedBook(book)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="font-bold text-black dark:text-white text-sm">
                          {book.title}
                        </div>
                        <div className="text-zinc-500">{book.author} {book.year ? `(${book.year})` : ''}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 font-semibold border border-zinc-200/60 dark:border-zinc-800">
                          {book.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 flex items-center gap-1 text-zinc-500">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-red-600" />
                        <span>{book.location}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-black dark:text-white">
                          {book.availableCopies}
                        </span>{' '}
                        / {book.totalCopies}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            isAvail
                              ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 border border-red-200 dark:border-red-900'
                              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400'
                          }`}
                        >
                          {isAvail ? 'Disponível' : 'Emprestado'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBook(book);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-red-600 dark:bg-white dark:text-black dark:hover:bg-red-600 dark:hover:text-white font-bold transition-all"
                        >
                          Ver Ficha
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
