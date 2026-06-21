export const prerender = false

import type { APIRoute } from 'astro'
import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-3-5-sonnet-20241022'

const SYSTEM_PROMPT = `You are an expert SEO content strategist and HTML content formatter for TilersHub.lk — Sri Lanka's leading tile and bathroom renovation marketplace.

Your task: analyze raw blog content and return a single JSON object. No markdown fences, no preamble, no explanation — ONLY the JSON.

JSON Schema (all fields required):
{
  "metaTitle": "catchy SEO title, strictly under 60 characters",
  "metaDescription": "compelling summary, strictly under 160 characters, includes target keyword naturally",
  "keywords": ["array of 5–10 highly relevant SEO keyword strings"],
  "formattedHtmlBody": "fully formatted semantic HTML string — body content only"
}

RULES for formattedHtmlBody:
1. NEVER use <h1> — reserved for page title. Use <h2> for main sections, <h3> for sub-sections.
2. Wrap every paragraph of prose in <p> tags. No bare text nodes.
3. Convert any bulleted or numbered lists into proper <ul>/<li> or <ol>/<li> elements.
4. Bold key terms with <strong>: tile brand names (Mega Tiles, Ideal Tiles, Lanka Tiles, Rocell, Euro), adhesive grades (C2 Adhesive, C1), material types (Porcelain, Ceramic, Granite, Marble, Travertine), quality grades (1st Quality, 2nd Quality), technical specs (R11, R10, slip resistance, water absorption), measurement specs.
5. At 2–4 logical content breaks where a visual would reinforce the text, insert this exact placeholder:
   <div class="image-placeholder" data-description="[concrete description of ideal photo or graphic]"></div>
6. Output ONLY inner body content. No <html>, <head>, <body>, doctype, page-level wrappers, or <style> blocks.
7. Preserve factual accuracy — do not invent specifications, prices, or brand claims not present in the source.`

export const POST: APIRoute = async ({ request }) => {
  // ── Key guard ──────────────────────────────────────────────────────────────
  const apiKey = import.meta.env.ANTHROPIC_API_KEY as string | undefined
  if (!apiKey?.startsWith('sk-')) {
    return json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' }, 500)
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let rawContent = ''
  let title = ''
  try {
    const body = await request.json() as { rawContent?: string; title?: string }
    rawContent = (body.rawContent ?? '').trim()
    title = (body.title ?? '').trim()
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400)
  }

  if (!rawContent) {
    return json({ error: 'rawContent is required and cannot be empty.' }, 400)
  }

  // ── Call Claude ────────────────────────────────────────────────────────────
  const client = new Anthropic({ apiKey })

  const userMessage = title
    ? `Blog Title: ${title}\n\nRaw Content to Process:\n${rawContent}`
    : `Raw Content to Process:\n${rawContent}`

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')

    const result = JSON.parse(raw) as {
      metaTitle: string
      metaDescription: string
      keywords: string[]
      formattedHtmlBody: string
    }

    // Validate expected shape
    if (!result.formattedHtmlBody || !result.metaTitle) {
      throw new Error('Claude returned unexpected JSON shape.')
    }

    return json(result, 200)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[seo-assistant] Claude error:', msg)
    return json({ error: `AI processing failed: ${msg}` }, 502)
  }
}

// ── Typed helper ─────────────────────────────────────────────────────────────
function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
