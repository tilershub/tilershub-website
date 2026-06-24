export const prerender = false

import type { APIRoute } from 'astro'
import { adminSupabase } from '../../../../lib/supabase.admin'

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user
  if (!user || user.email !== 'tilershub@gmail.com') {
    return json({ error: 'Forbidden' }, 403)
  }

  let sub: Record<string, unknown>
  try {
    sub = await request.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const { error: updateError } = await adminSupabase
    .from('provider_submissions')
    .update({ status: 'approved' })
    .eq('id', sub.id)

  if (updateError) return json({ error: updateError.message }, 400)

  // Duplicate check
  let existing = null
  if (sub.user_id) {
    const { data } = await adminSupabase.from('providers').select('id').eq('user_id', sub.user_id).maybeSingle()
    existing = data
  }
  if (!existing && sub.whatsapp) {
    const { data } = await adminSupabase.from('providers').select('id')
      .eq('whatsapp', sub.whatsapp).eq('name', sub.name).maybeSingle()
    existing = data
  }

  if (!existing) {
    const slug = slugify(String(sub.name || 'provider')) + '-' + Math.random().toString(36).slice(2, 6)
    const { error: insertError } = await adminSupabase.from('providers').insert({
      name: sub.name, provider_type: sub.provider_type,
      city: sub.city, district: sub.district,
      whatsapp: sub.whatsapp, phone: sub.phone,
      description: sub.description,
      profile_image: sub.profile_image, cover_image: sub.cover_image,
      gallery: sub.photo_urls || null,
      service_areas: sub.service_areas, services: sub.services,
      user_id: sub.user_id, slug, status: 'active', verification_status: 'none',
    })
    if (insertError) return json({ error: insertError.message }, 400)
  }

  return json({ ok: true }, 200)
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
