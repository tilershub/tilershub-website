import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { AstroCookies } from 'astro'

const SUPABASE_URL = import.meta.env.SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY as string

export function createSupabaseServerClient(request: Request, cookies: AstroCookies) {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => parseCookieHeader(request.headers.get('Cookie') ?? ''),
      setAll: (cookiesToSet) =>
        cookiesToSet.forEach(({ name, value, options }) =>
          cookies.set(name, value, options as Parameters<AstroCookies['set']>[2])),
    },
  })
}
