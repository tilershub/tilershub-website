import { migrationRedirect } from './lib/migration.js'
import { defineMiddleware } from 'astro:middleware'
import { createSupabaseServerClient } from './lib/supabase.server'

export const onRequest = defineMiddleware(async (context, next) => {
  const destination = migrationRedirect(context.url)
  if (destination) return context.redirect(destination, 301)
  const supabase = createSupabaseServerClient(context.request, context.cookies)
  const { data: { user } } = await supabase.auth.getUser()
  context.locals.supabase = supabase
  context.locals.user = user
  return next()
})
