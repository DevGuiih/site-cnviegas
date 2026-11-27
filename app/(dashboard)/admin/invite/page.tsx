'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { AdminReaderInvite } from '../../../../components/admin/AdminReaderInvite';

export default function AdminInvitePage() {
  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 bg-white dark:bg-black text-black dark:text-white">
      
      {/* Top Breadcrumb & Header */}
      <div>
        <Link
          href="/admin/readers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-red-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Lista de Leitores
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white flex items-center gap-2">
          <UserPlus className="w-7 h-7 text-red-900" />
          Liberação de Acesso de Leitores
        </h1>
        <p className="text-xs text-zinc-500">
          Biblioteca Coletivo Negro Viegas D&apos;Abreu • Gestão de convites, autorizações prévias e controle de acesso
        </p>
      </div>

      <AdminReaderInvite />

    </div>
  );
}
