export const prerender = false

import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user
  if (!user) return json({ error: 'Unauthorized' }, 401)

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const { data: provider } = await locals.supabase
    .from('providers').select('slug').eq('user_id', user.id).maybeSingle()

  const { error } = await locals.supabase
    .from('bids')
    .insert({ ...body, user_id: user.id, provider_slug: provider?.slug ?? null })

  if (error) return json({ error: error.message }, 400)
  return json({ ok: true }, 200)
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
