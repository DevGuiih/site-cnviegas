'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLibrary } from '../../../../context/LibraryContext';
import { ArrowLeft, Save } from 'lucide-react';

const SOLID_COLORS = [
  { label: 'Vermelho Coletivo', value: 'bg-red-900', preview: 'bg-[#9B2915]' },
  { label: 'Preto Sólido', value: 'bg-black', preview: 'bg-[#1A1917]' },
  { label: 'Cinza Escuro', value: 'bg-zinc-900', preview: 'bg-[#3B3935]' },
  { label: 'Vermelho Escuro', value: 'bg-red-950', preview: 'bg-[#360E07]' },
];

export default function AdminAddBookPage() {
  const router = useRouter();
  const { addBook } = useLibrary();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isbn, setIsbn] = useState('');
  const [copies, setCopies] = useState(1);
  const [description, setDescription] = useState('');
  const [coverColor, setCoverColor] = useState('bg-red-900');
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await addBook({
      title: title.trim(),
      author: author.trim(),
      publisher: publisher.trim(),
      year,
      isbn: isbn.trim(),
      totalCopies: copies,
      availableCopies: copies,
      description: description.trim() || 'Obra catalogada no acervo comunitário.',
      coverColor,
      status: 'available',
      tags: tags.length > 0 ? tags : ["Acervo Viegas D'Abreu"],
      featured: false,
    });

    router.push('/admin');
  };

  const previewBg =
    SOLID_COLORS.find((c) => c.value === coverColor)?.preview || 'bg-[#9B2915]';

  return (
    <div className="flex-1 w-full max-w-[1136px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#F2EDE3] hover:text-[#D29F96] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Livros
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-[#EBE3D4] border-[3px] border-[#D29F96] rounded-[30px] shadow-coletivo-card p-6 sm:p-8 space-y-6 text-[#1A1917]">
          <div className="border-b border-[#ACA69B] pb-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#524F4A]">
              Cadastrar Novo Livro
            </h1>
            <p className="text-sm text-[#524F4A] mt-1">
              Insira os dados da obra para catalogação no acervo comunitário.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Título da Obra *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Pele Negra, Máscaras Brancas"
                required
                className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#9B2915]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#524F4A]">
                  Autor(a) / Organizador(a) *
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ex: Frantz Fanon"
                  required
                  className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#9B2915]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#524F4A]">
                  Editora
                </label>
                <input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="Ex: Ubu Editora"
                  className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#9B2915]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#524F4A]">
                  Ano
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
                  className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] focus:outline-none focus:border-[#9B2915]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#524F4A]">
                  Exemplares
                </label>
                <input
                  type="number"
                  min="1"
                  value={copies}
                  onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                  className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] focus:outline-none focus:border-[#9B2915]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#524F4A]">
                  ISBN
                </label>
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="978-85..."
                  className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#9B2915]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Palavras-chave / Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Ex: Pensamento Negro, Filosofia, Ensaio"
                className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#9B2915]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#524F4A]">
                Cor da Capa
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SOLID_COLORS.map((col) => (
                  <button
                    type="button"
                    key={col.value}
                    onClick={() => setCoverColor(col.value)}
                    className={`h-10 rounded-[10px] ${col.preview} text-white text-xs font-bold flex items-center justify-center border-2 transition-all cursor-pointer ${
                      coverColor === col.value
                        ? 'border-[#EBE3D4] ring-2 ring-[#9B2915]'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#524F4A]">
                Sinopse / Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Apresente brevemente o contexto da obra..."
                rows={3}
                className="w-full text-sm p-3 rounded-[10px] border border-[#ACA69B] bg-white text-[#1A1917] placeholder:text-[#AFAFAF] focus:outline-none focus:border-[#9B2915]"
              />
            </div>

            <div className="pt-4 border-t border-[#ACA69B] flex justify-end gap-3">
              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-[10px] bg-[#C8C1B4] hover:bg-[#ACA69B] text-[#1A1917] text-sm font-semibold"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] text-black text-sm font-bold shadow-coletivo-btn flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Catalogar Livro
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-[#C8C1B4] uppercase tracking-wider block">
            Pré-visualização
          </span>
          <div className="w-[168px]">
            <div
              className={`relative w-full aspect-[168/208] rounded-r-[5px] overflow-hidden shadow-md flex flex-col justify-between p-4 text-[#F2EDE3] ${previewBg}`}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(270deg, rgba(217, 217, 217, 0) 80%, rgba(0, 0, 0, 0.42) 100%)',
                }}
              />
              <div className="relative z-10 my-auto pl-1.5 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-75 line-clamp-1">
                  {author || 'Nome do Autor'}
                </p>
                <p className="text-base font-extrabold leading-snug line-clamp-4">
                  {title || 'Título do Livro'}
                </p>
              </div>
              <span className="relative z-10 pl-1.5 text-[10px] opacity-70">
                {year}
              </span>
            </div>
            <div className="pt-1.5 space-y-0.5">
              <p className="text-[18px] leading-[22px] text-[#F2EDE3] truncate">
                {title || 'Titulo do Livro'}
              </p>
              <p className="text-[14px] leading-[17px] text-[#F2EDE3]/90 truncate">
                {author || 'Autor Fulano de tal'}
              </p>
              <span className="mt-1.5 inline-block px-2.5 py-0.5 rounded-[5px] bg-[#D9D9D9] text-black text-[12px]">
                Disponível
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
