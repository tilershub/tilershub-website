/**
 * Server-side secret lookup.
 *
 * On Cloudflare, a value set with `wrangler secret put` is only ever on the
 * request's runtime env — `import.meta.env` carries build-time values, so a
 * route that reads a secret from there works locally and silently returns
 * undefined on the deployed Worker. Check the runtime first, fall back to the
 * build env for `astro dev`.
 *
 * Import this only from `.astro` frontmatter, API routes and middleware.
 * Never from a `.jsx` component — those are bundled for the browser.
 */
export function serverSecret(locals: App.Locals, name: string): string | undefined {
  const runtime = (locals as { runtime?: { env?: Record<string, string> } }).runtime
  return runtime?.env?.[name] ?? (import.meta.env[name] as string | undefined)
}
