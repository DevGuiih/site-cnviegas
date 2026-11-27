'use client';

import React, { useState, useEffect } from 'react';
import { AllowedUser } from '../../types/auth';
import {
  inviteReaderAction,
  fetchAllowedUsersAction,
  deleteAllowedUserAction,
} from '../../app/actions/auth-actions';
import {
  UserPlus,
  Mail,
  UserCheck,
  Clock,
  Trash2,
  Copy,
  Check,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Shield,
  Info,
} from 'lucide-react';

export function AdminReaderInvite() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'reader' | 'admin'>('reader');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [allowedUsers, setAllowedUsers] = useState<AllowedUser[]>([]);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadAllowedUsers = async () => {
    setFetching(true);
    const result = await fetchAllowedUsersAction();
    if (result.data) {
      setAllowedUsers(result.data);
    }
    setFetching(false);
  };

  useEffect(() => {
    loadAllowedUsers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const result = await inviteReaderAction({
      email: email.trim().toLowerCase(),
      name: name.trim() || undefined,
      role,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Erro ao registrar autorização do leitor.');
      return;
    }

    setSuccessMessage(
      `Acesso autorizado com sucesso para ${email}! O leitor já pode acessar o sistema com OTP e criar sua senha.`
    );
    setEmail('');
    setName('');
    setRole('reader');
    await loadAllowedUsers();
  };

  const handleDelete = async (id: string, readerEmail: string) => {
    if (!confirm(`Deseja realmente revogar a autorização de acesso para ${readerEmail}?`)) {
      return;
    }

    const res = await deleteAllowedUserAction(id);
    if (!res.success) {
      alert(`Falha ao remover autorização: ${res.error}`);
      return;
    }

    setAllowedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleCopyInstructions = (targetEmail: string, id: string) => {
    const text = `Olá! Seu acesso à Biblioteca Comunitária do Coletivo Negro Viegas D'Abreu foi liberado pela coordenação. Acesse o sistema pelo link: ${window.location.origin}/login e digite seu e-mail (${targetEmail}) para receber seu código de primeiro acesso (OTP) e cadastrar sua senha.`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const filteredUsers = allowedUsers.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.email.toLowerCase().includes(q) || (u.name && u.name.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-8">
      
      {/* Top Banner / Explanation */}
      <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
          <Info className="w-5 h-5" />
          <span>Como funciona a liberação de leitores (Convite + OTP + Senha)</span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Para garantir a segurança do acervo comunitário, apenas e-mails pré-autorizados pela
          coordenação conseguem entrar na plataforma. Ao liberar um leitor abaixo:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="font-bold text-black dark:text-white block mb-1">1. Liberação</span>
            <span className="text-zinc-500">O e-mail é registrado na lista de autorizados (`allowed_users`).</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="font-bold text-black dark:text-white block mb-1">2. Código OTP</span>
            <span className="text-zinc-500">Ao digitar o e-mail na tela de login, o leitor recebe um código no e-mail.</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="font-bold text-black dark:text-white block mb-1">3. Criação de Senha</span>
            <span className="text-zinc-500">A tela trava a navegação até o leitor cadastrar sua senha pessoal.</span>
          </div>
        </div>
      </div>

      {/* Main Invite Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-red-900" />
            <h2 className="text-base font-black text-black dark:text-white uppercase tracking-wider">
              Liberar Novo Leitor / Membro
            </h2>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="block font-bold">Autorização Concluída!</strong>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <strong className="block font-bold">Erro ao autorizar</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5 space-y-1">
            <label className="block text-xs font-bold text-black dark:text-white">
              Endereço de E-mail do Leitor *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="leitor@exemplo.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-900"
              />
            </div>
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="block text-xs font-bold text-black dark:text-white">
              Nome Completo do Leitor (Opcional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Beatriz Nascimento"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-900"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="block text-xs font-bold text-black dark:text-white">
              Perfil / Nível
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'reader' | 'admin')}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-black dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-900"
            >
              <option value="reader">Leitor Comunitário</option>
              <option value="admin">Coordenação / Admin</option>
            </select>
          </div>

          <div className="sm:col-span-12 flex justify-end">
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-6 py-3 rounded-xl bg-red-900 hover:bg-red-800 text-white text-xs font-bold shadow-md shadow-red-950/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-101"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Autorizando Acesso...' : 'Autorizar e Liberar Acesso do Leitor'}
            </button>
          </div>
        </form>
      </div>

      {/* List of Allowed Readers */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-black text-black dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-red-900" />
              Leitores Pré-Autorizados & Status de Primeiro Acesso
            </h3>
            <p className="text-xs text-zinc-500">
              Controle de quem possui autorização para solicitar OTP e acessar o acervo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar por e-mail ou nome..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:ring-1 focus:ring-red-900"
              />
            </div>

            <button
              onClick={loadAllowedUsers}
              disabled={fetching}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 text-zinc-600 dark:text-zinc-400 transition-colors"
              title="Atualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {fetching ? (
          <div className="py-12 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-red-900" />
            Carregando leitores autorizados...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
            <p>Nenhum leitor encontrado na lista de autorizações.</p>
            <p className="text-[11px] text-zinc-400">
              Utilize o formulário acima para registrar o primeiro leitor autorizado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
              <thead className="bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white font-bold uppercase text-[11px] border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Leitor / E-mail</th>
                  <th className="py-3 px-4">Perfil</th>
                  <th className="py-3 px-4">Status de Acesso</th>
                  <th className="py-3 px-4">Autorizado em</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredUsers.map((user) => {
                  const isPending = !user.has_password || user.status === 'invited';

                  return (
                    <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="py-3.5 px-4">
                        <strong className="text-black dark:text-white block text-sm">
                          {user.name || 'Sem nome registrado'}
                        </strong>
                        <span className="text-zinc-500 font-mono text-xs">{user.email}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            user.role === 'admin'
                              ? 'bg-red-900 text-white'
                              : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                          }`}
                        >
                          {user.role === 'admin' ? 'Coordenação' : 'Leitor'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                            <Clock className="w-3 h-3" />
                            Aguardando 1º Acesso (OTP)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                            <Check className="w-3 h-3" />
                            Ativo (Senha Cadastrada)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">
                        {user.created_at ? user.created_at.slice(0, 10) : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyInstructions(user.email, user.id)}
                            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 transition-colors"
                            title="Copiar mensagem de orientação para o leitor"
                          >
                            {copiedId === user.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(user.id, user.email)}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 transition-colors"
                            title="Revogar autorização de acesso"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
