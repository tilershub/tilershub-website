import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = (import.meta.env.SUPABASE_URL as string) || 'https://ginrgwaciblcvxvkbeyd.supabase.co'

export function createAdminSupabase(serviceRoleKey: string) {
  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
