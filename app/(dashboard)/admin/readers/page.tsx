'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLibrary } from '../../../../context/LibraryContext';
import { Plus, Search } from 'lucide-react';

function formatDateBr(dateStr?: string) {
  if (!dateStr) return '—';
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export default function AdminReadersPage() {
  const { users, loans } = useLibrary();
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q))
    );
  }, [users, search]);

  const getReaderStatus = (userId: string) => {
    const activeLoans = loans.filter(
      (l) => l.userId === userId && l.status !== 'returned'
    );
    const hasOverdue = activeLoans.some((l) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(l.dueDate);
      due.setHours(0, 0, 0, 0);
      return l.status === 'overdue' || due < today;
    });

    if (hasOverdue) return 'Em atraso';
    if (activeLoans.length > 0) return 'Emprestado';
    return 'Regular';
  };

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-6">
      {/* Top-right Action Pill matching Figma "Tela do Admin - Leitores" */}
      <div className="max-w-[1136px] mx-auto flex justify-end">
        <Link
          href="/admin/invite"
          className="px-7 py-2.5 rounded-[50px] bg-[#EBE3D4] border-[3px] border-[#D29F96] shadow-coletivo-card inline-flex items-center gap-3 text-[#9B2915] hover:bg-[#F4F0E8] transition-colors"
        >
          <Plus className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3.5]" />
          <span className="text-2xl sm:text-[40px] font-extrabold leading-none">
            Leitores
          </span>
        </Link>
      </div>

      {/* Main Cream Panel */}
      <div className="max-w-[1136px] mx-auto bg-[#EBE3D4] rounded-[32px] sm:rounded-[50px] p-5 sm:p-10 lg:px-[69px] lg:py-10 shadow-coletivo-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-[48px] font-extrabold text-[#524F4A] leading-tight">
            Leitores
          </h1>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#524F4A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar leitor..."
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
                  <th className="py-3.5 px-4 border-r-2 border-black w-[34%]">
                    Nome
                  </th>
                  <th className="py-3.5 px-3 border-r-2 border-black text-center w-[17%]">
                    Status atual
                  </th>
                  <th className="py-3.5 px-4 border-r-2 border-black w-[29%]">
                    Email
                  </th>
                  <th className="py-3.5 px-3 text-center w-[20%]">
                    Registrado desde:
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr className="bg-[#F4F0E8]">
                    <td
                      colSpan={4}
                      className="py-16 px-4 text-center text-base text-[#524F4A]"
                    >
                      Nenhum leitor encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    const statusLabel = getReaderStatus(user.id);
                    const rowBg =
                      index % 2 === 0 ? 'bg-[#F4F0E8]' : 'bg-[#ACA69B]';

                    return (
                      <tr
                        key={user.id}
                        className={`${rowBg} text-black text-sm sm:text-base lg:text-[18px] font-medium`}
                      >
                        <td className="py-3 px-4 border-r-2 border-black">
                          <span className="font-semibold block leading-snug">
                            {user.name}
                          </span>
                          <span className="text-xs text-[#3B3935]">
                            {user.role === 'admin' ? 'Admin' : 'Leitor'}
                            {user.phone ? ` • ${user.phone}` : ''}
                          </span>
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
                        <td className="py-3 px-4 border-r-2 border-black truncate max-w-[240px]">
                          {user.email}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {formatDateBr(user.joinedAt)}
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
