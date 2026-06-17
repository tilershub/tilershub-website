const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL   = 'claude-sonnet-4-6'

const CAMPAIGN_CTX = {
  user:     'Target: Sri Lankan homeowners planning tiling or bathroom/kitchen renovation. Goal: get them to post a project free at tilershub.lk/post-project. TilersHub connects homeowners with verified local tilers — free, no registration. Tone: helpful, friendly, aspirational.',
  provider: 'Target: Sri Lankan tilers and contractors seeking steady work. Goal: get them to join free at tilershub.lk/join-as-tiler. TilersHub sends verified job leads to registered pros. Tone: opportunity-focused, practical, income-driven.',
}

export const ANGLES = {
  user: [
    { value: 'social_proof', label: 'Social Proof — stats & trust' },
    { value: 'how_it_works', label: 'How It Works — step by step' },
    { value: 'value_prop',   label: 'Value Prop — free & easy' },
    { value: 'fomo',         label: 'FOMO — neighbours already using it' },
    { value: 'before_after', label: 'Before & After — transformation' },
    { value: 'urgency',      label: 'Urgency — book before busy season' },
    { value: 'seasonal',     label: 'Seasonal — festival / New Year reno' },
    { value: 'pain_point',   label: 'Pain Point — hassle of finding a tiler' },
  ],
  provider: [
    { value: 'income',      label: 'Income Opportunity — earn more' },
    { value: 'job_volume',  label: 'Job Volume — open projects now' },
    { value: 'how_to_join', label: 'How to Join — simple 3 steps' },
    { value: 'credibility', label: 'Credibility — get verified badge' },
    { value: 'success',     label: 'Success Story — tiler testimonial' },
    { value: 'competitive', label: 'Competitive Edge — vs finding work alone' },
    { value: 'seasonal',    label: 'Seasonal — peak season incoming' },
    { value: 'no_fee',      label: 'No Fee — join completely free' },
  ],
}

function getApiKey() {
  return import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.PUBLIC_ANTHROPIC_API_KEY
}

async function callClaude(prompt, maxTokens = 4096) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('MISSING_KEY')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Anthropic API error ${res.status}`)
  }

  const data = await res.json()
  let text = (data.content?.[0]?.text || '').trim()
  text = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(text)
}

export async function generatePosts({ campaign, format, platform, angle, numPosts, stats }) {
  const slidesNote = format === 'carousel'
    ? 'Include "slides": array of exactly 5 objects [{headline,body,design_note}]. Slide 1=hook/cover, 2-4=content, 5=CTA.'
    : ''
  const reelNote = format === 'reel'
    ? 'Include "script": voiceover text broken into scene cues for a 15-30 second Reel.'
    : ''

  const prompt = `You are a social media strategist for TilersHub.lk — Sri Lanka's #1 tiling & renovation platform.

CAMPAIGN: ${campaign === 'user' ? '🏠 Homeowner Campaign' : '🔨 Provider Campaign'}
${CAMPAIGN_CTX[campaign]}

FORMAT: ${format === 'single' ? 'Single Image post' : format === 'carousel' ? 'Carousel (5 slides)' : 'Reel / Short Video'}
PLATFORM: ${platform}
CONTENT ANGLE: ${angle.replace(/_/g, ' ')}
NUMBER OF POSTS: ${numPosts}

LIVE PLATFORM STATS (inject 1-2 per post for authenticity):
• ${stats.projects} projects posted by homeowners
• ${stats.tilers} active verified tilers
• ${stats.bids} bids placed by pros

LANGUAGE: English. Sinhala words sparingly for cultural warmth (e.g. "ලොකු project ekak", "Ayubowan").
${slidesNote}
${reelNote}

Return ONLY a valid JSON array — no markdown wrapper, no explanation. Schema for each of the ${numPosts} post(s):
{"caption":"full caption with emojis + hashtags","hook":"scroll-stopping opener (1-2 sentences)","cta":"call-to-action text","image_description":"visual brief for Canva / AI image gen (2-3 sentences)","suggested_time":"HH:MM"${format === 'carousel' ? ',"slides":[{"headline":"","body":"","design_note":""}]' : ''}${format === 'reel' ? ',"script":"scene cues + voiceover"' : ''}}`

  return callClaude(prompt)
}

export async function planWeek({ campaign, stats }) {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })

  const angleValues = ANGLES[campaign].map(a => a.value).join(', ')

  const prompt = `Plan a 7-day social media calendar for TilersHub.lk (${campaign === 'user' ? 'homeowner' : 'provider'} campaign).
Week: ${days[0]} (Mon) to ${days[6]} (Sun)
Context: ${CAMPAIGN_CTX[campaign]}
Stats: ${stats.projects} projects, ${stats.tilers} tilers, ${stats.bids} bids.

Plan 3-5 posts — skip 2-3 rest days. Choose best days, times, formats, angles.
Return ONLY a valid JSON array:
[{"date":"YYYY-MM-DD","time":"HH:MM","format":"single|carousel|reel","platform":"FB+IG|Facebook|Instagram","angle":"${angleValues.split(', ')[0]}","note":"one-line content idea"}]
Valid angle values: ${angleValues}`

  return callClaude(prompt, 1024)
}
