import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.SUPABASE_URL as string
const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string

export const adminSupabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
