'use server';

import { createClient } from '../../lib/supabase/server';
import { createAdminClient } from '../../lib/supabase/admin';
import { AllowedUser, AuthStatusResult } from '../../types/auth';

/**
 * Checks whether an email is permitted to log in, whether it is a first access
 * (requiring OTP and password creation), or if the user already has a password.
 */
export async function checkEmailStatus(email: string): Promise<AuthStatusResult> {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return {
      allowed: false,
      hasPassword: false,
      isFirstAccess: false,
      message: 'Por favor, informe um endereço de e-mail válido.',
    };
  }

  const supabase = await createClient();

  // 1. Try calling the PostgreSQL RPC function check_user_auth_status
  try {
    const { data, error } = await supabase.rpc('check_user_auth_status', {
      lookup_email: normalizedEmail,
    });

    if (!error && data) {
      return {
        allowed: !!data.allowed,
        hasPassword: !!data.hasPassword,
        isFirstAccess: !!data.isFirstAccess,
        name: data.name || undefined,
        message: data.message || undefined,
      };
    }
  } catch (rpcErr) {
    console.warn('RPC check_user_auth_status not available yet, falling back to direct queries:', rpcErr);
  }

  // 2. Resilient fallback if RPC is not yet created in the database:
  try {
    // Check allowed_users table directly
    const { data: allowedData } = await supabase
      .from('allowed_users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (allowedData) {
      return {
        allowed: true,
        hasPassword: !!allowedData.has_password,
        isFirstAccess: !allowedData.has_password,
        name: allowedData.name || undefined,
      };
    }

    // Check profiles table (existing registered community members)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (profileData) {
      return {
        allowed: true,
        hasPassword: true,
        isFirstAccess: false,
        name: profileData.name || undefined,
      };
    }

    // Fallback for default demo accounts
    const demoEmails = ['admin@cnviegas.org', 'leitor@cnviegas.org', 'beatriz@cnviegas.org', 'lucas@cnviegas.org'];
    if (demoEmails.includes(normalizedEmail)) {
      return {
        allowed: true,
        hasPassword: true,
        isFirstAccess: false,
      };
    }

    return {
      allowed: false,
      hasPassword: false,
      isFirstAccess: false,
      message: 'Este e-mail não possui autorização prévia. Entre em contato com a coordenação para solicitar acesso.',
    };
  } catch (err) {
    console.error('Erro ao verificar status do e-mail:', err);
    return {
      allowed: false,
      hasPassword: false,
      isFirstAccess: false,
      message: 'Erro ao verificar permissão do e-mail. Tente novamente mais tarde.',
    };
  }
}

/**
 * Admin action: authorizes a reader by inserting into allowed_users
 * and optionally sending a Supabase auth invite if service_role key is configured.
 */
export async function inviteReaderAction(input: {
  email: string;
  name?: string;
  role?: 'reader' | 'admin';
}): Promise<{ success: boolean; error?: string; data?: AllowedUser; inviteMethod?: string }> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const trimmedName = input.name?.trim() || null;
  const targetRole = input.role || 'reader';

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { success: false, error: 'Forneça um endereço de e-mail válido.' };
  }

  const supabase = await createClient();

  // Verify that the caller is authenticated as an admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Acesso não autenticado. Faça login como administrador.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Apenas coordenadores da biblioteca podem autorizar novos leitores.' };
  }

  let inviteMethod = 'allowed_table';

  // If service_role admin client is available, also trigger supabase.auth.admin.inviteUserByEmail
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(normalizedEmail, {
        data: {
          name: trimmedName || normalizedEmail.split('@')[0],
          role: targetRole,
        },
      });
      if (!inviteError) {
        inviteMethod = 'admin_api_and_table';
      } else {
        console.warn('supabase.auth.admin.inviteUserByEmail error (continuing with allowed_users table):', inviteError.message);
      }
    } catch (inviteException) {
      console.warn('Erro ao chamar inviteUserByEmail:', inviteException);
    }
  }

  // Insert or update public.allowed_users table
  try {
    const { data, error } = await supabase
      .from('allowed_users')
      .upsert(
        {
          email: normalizedEmail,
          name: trimmedName,
          role: targetRole,
          status: 'invited',
          invited_by: user.id,
          has_password: false,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: `Não foi possível salvar a autorização na tabela allowed_users: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data as AllowedUser,
      inviteMethod,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao registrar convite do leitor.',
    };
  }
}

/**
 * Admin action: fetches all allowed / invited readers
 */
export async function fetchAllowedUsersAction(): Promise<{ data: AllowedUser[]; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: 'Não autenticado.' };
  }

  try {
    const { data, error } = await supabase
      .from('allowed_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data || []) as AllowedUser[] };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Erro ao buscar leitores autorizados.',
    };
  }
}

/**
 * Admin action: deletes / revokes reader authorization
 */
export async function deleteAllowedUserAction(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Não autenticado.' };
  }

  try {
    const { error } = await supabase.from('allowed_users').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro ao remover autorização.',
    };
  }
}

/**
 * Completes the first access flag in allowed_users when the user creates their password
 */
export async function confirmPasswordCreatedAction(email: string): Promise<{ success: boolean }> {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = await createClient();

  try {
    // Try RPC first
    await supabase.rpc('complete_user_first_access', { user_email: normalizedEmail });
  } catch {
    // Fallback direct update
    try {
      await supabase
        .from('allowed_users')
        .update({
          status: 'active',
          has_password: true,
          activated_at: new Date().toISOString(),
        })
        .eq('email', normalizedEmail);
    } catch (err) {
      console.warn('Erro ao atualizar allowed_users pós senha:', err);
    }
  }

  return { success: true };
}
