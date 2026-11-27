'use client';

import React, { useState } from 'react';
import { Book } from '../types/library';
import { useLibrary } from '../context/LibraryContext';
import { X, Save } from 'lucide-react';

interface EditBookModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

const SOLID_COLORS = [
  { label: 'Vermelho Coletivo', value: 'bg-red-900' },
  { label: 'Preto Sólido', value: 'bg-black' },
  { label: 'Cinza Escuro', value: 'bg-zinc-900' },
  { label: 'Vermelho Escuro', value: 'bg-red-950' },
];

function EditBookModalContent({ book, onClose }: { book: Book; onClose: () => void }) {
  const { updateBook } = useLibrary();

  const [formData, setFormData] = useState<Partial<Book>>({
    title: book.title,
    author: book.author,
    publisher: book.publisher || '',
    year: book.year || new Date().getFullYear(),
    isbn: book.isbn || '',
    pages: book.pages || 100,
    totalCopies: book.totalCopies,
    availableCopies: book.availableCopies,
    description: book.description || '',
    coverColor:
      book.coverColor && !book.coverColor.includes('from-')
        ? book.coverColor
        : 'bg-red-900',
    tags: book.tags || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBook(book.id, formData);
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
        className="relative w-full max-w-2xl bg-[#EBE3D4] border-[3px] border-[#D29F96] rounded-[20px] shadow-coletivo-card overflow-hidden my-8 text-[#1A1917]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#D29F96] flex items-center justify-between bg-[#D29F96]/40">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#9B2915]">
              Editar Dados do Livro
            </h3>
            <p className="text-xs text-[#524F4A]">ID: {book.id}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#1A1917] hover:text-[#9B2915] cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Título da Obra *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] focus:outline-none focus:border-[#9B2915]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Autor(a) / Organizador(a) *
              </label>
              <input
                type="text"
                value={formData.author || ''}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
                className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] focus:outline-none focus:border-[#9B2915]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Editora
              </label>
              <input
                type="text"
                value={formData.publisher || ''}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] focus:outline-none focus:border-[#9B2915]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Ano de Publicação
              </label>
              <input
                type="number"
                value={formData.year || ''}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) || undefined })
                }
                className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] focus:outline-none focus:border-[#9B2915]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                ISBN
              </label>
              <input
                type="text"
                value={formData.isbn || ''}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] focus:outline-none focus:border-[#9B2915]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Exemplares Totais
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalCopies || 1}
                onChange={(e) =>
                  setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })
                }
                className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] focus:outline-none focus:border-[#9B2915]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Exemplares Disponíveis
              </label>
              <input
                type="number"
                min="0"
                max={formData.totalCopies || 10}
                value={formData.availableCopies ?? 1}
                onChange={(e) =>
                  setFormData({ ...formData, availableCopies: parseInt(e.target.value) || 0 })
                }
                className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] focus:outline-none focus:border-[#9B2915]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Cor da Capa
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SOLID_COLORS.map((col) => (
                  <button
                    type="button"
                    key={col.value}
                    onClick={() => setFormData({ ...formData, coverColor: col.value })}
                    className={`h-10 rounded-[10px] ${col.value} text-white text-xs font-bold flex items-center justify-center border-2 transition-all cursor-pointer ${
                      formData.coverColor === col.value
                        ? 'border-[#EBE3D4] ring-2 ring-[#9B2915]'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Sinopse / Descrição
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Apresente brevemente o contexto da obra..."
                className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] focus:outline-none focus:border-[#9B2915]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#D29F96] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-[10px] bg-[#C8C1B4] hover:bg-[#ACA69B] text-[#1A1917] text-sm font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] text-black text-sm font-bold shadow-coletivo-btn flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditBookModal({ book, isOpen, onClose }: EditBookModalProps) {
  if (!isOpen || !book) return null;
  return <EditBookModalContent key={book.id} book={book} onClose={onClose} />;
}
