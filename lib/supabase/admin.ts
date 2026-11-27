import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a server-side Supabase client with the service_role key,
 * which bypasses RLS and allows invoking supabase.auth.admin methods
 * (e.g. inviteUserByEmail, listUsers, deleteUser).
 * 
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is not configured in .env.local.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
