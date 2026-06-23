import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ginrgwaciblcvxvkbeyd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpbnJnd2FjaWJsY3Z4dmtiZXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjUyODMsImV4cCI6MjA5NDk0MTI4M30.vcfg0gTKSdyKgqggK3OAFwUYwLSfr-QkN2mRFFr_R1M'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'tilershub-auth-token',
  },
})

export const DISTRICTS = [
  'කොළඹ','ගම්පහ','කළුතර','මාතලේ','කෑගල්ල','නුවර',
  'නුවරඑළිය','ගාල්ල','මාතර','හම්බන්තොට','ජාෆ්නා',
  'මන්නාරම','වව්නියාව','මුලතිව්','කිලිනොච්චිය','මඩකළපුව',
  'අම්පාර','ත්‍රිකුණාමළය','කුරුණෑගල','පුත්තලම','අනුරාධපුර',
  'පොළොන්නරුව','බදුල්ල','මොණරාගල','රත්නපුර'
]

export const DISTRICTS_EN = [
  'Colombo','Gampaha','Kalutara','Matale','Kegalle','Kandy',
  'Nuwara Eliya','Galle','Matara','Hambantota','Jaffna',
  'Mannar','Vavuniya','Mullaitivu','Kilinochchi','Batticaloa',
  'Ampara','Trincomalee','Kurunegala','Puttalam','Anuradhapura',
  'Polonnaruwa','Badulla','Monaragala','Ratnapura'
]

export const SERVICES = [
  'මහල් ටයිල් කිරීම',
  'නාන කාමර ප්‍රතිසංස්කරණය',
  'කුස්සිය ටයිල් කිරීම',
  'පඩිපෙළ ටයිල් කිරීම',
  'බිත්ති ටයිල් කිරීම',
  'බාහිර ටයිල් කිරීම',
  'දිය ආරක්ෂාකරණය',
  'ග්‍රොට්ටිං සහ නිම කිරීම'
]

export const SERVICES_EN = [
  'Floor Tiling', 'Wall Tiling', 'Bathroom Tiling', 'Kitchen Tiling',
  'Staircase Tiling', 'Outdoor Tiling', 'Large Tile Installation',
  'Waterproofing', 'Grouting & Finishing',
  'Tile Cutting', 'Tile Routing',
  'Bathroom Renovation', 'Full Construction',
  'Bathroom Plumbing', 'Shower Cubicle',
  'Hand Railing', 'Vanity Cupboard',
  'Bathroom Lighting', 'Bathroom Wiring', 'Electrical Works',
  'Ipanel Ceiling',
]

export const PROJECT_TYPES = [
  'Floor Tiling',
  'Bathroom Tiling',
  'Bathroom Renovation',
  'Granite Works',
  'Tile Cutting',
  'Routering',
  'Waterproofing',
  'Tile Shop Inquiry'
]

export const PROFESSIONS = [
  { value: 'tiler',                label: 'Tiler',               si: 'ටයිල් ශිල්පී',           icon: '🪚' },
  { value: 'contractor',           label: 'Contractor',           si: 'කොන්ත්‍රාත්කරු',           icon: '🏗️' },
  { value: 'electrician',          label: 'Electrician',          si: 'විදුලි ශිල්පී',           icon: '⚡' },
  { value: 'plumber',              label: 'Plumber',              si: 'ජලනල කාර්මික',               icon: '🔧' },
  { value: 'carpenter',            label: 'Carpenter',            si: 'ලී ශිල්පී',               icon: '🪵' },
  { value: 'painter',              label: 'Painter',              si: 'පින්තාරු ශිල්පී',         icon: '🖌️' },
  { value: 'mason',                label: 'Mason / Bricklayer',   si: 'ගල් ශිල්පී',              icon: '🧱' },
  { value: 'construction_company', label: 'Construction Company', si: 'ඉදිකිරීම් සමාගම',         icon: '🏢' },
  { value: 'interior_designer',    label: 'Interior Designer',    si: 'අභ්‍යන්තර සැලසුම්කරු',   icon: '🛋️' },
  { value: 'tile_shop',            label: 'Tile Shop',            si: 'ටයිල් සාප්පුව',           icon: '🔲' },
  { value: 'bathroom_shop',        label: 'Bathroom Shop',        si: 'නාන කාමර සාප්පුව',        icon: '🛁' },
  { value: 'supplier',             label: 'Supplier',             si: 'සැපයුම්කරු',              icon: '📦' },
  { value: 'workshop',             label: 'Workshop',             si: 'වැඩ පොළ',                 icon: '✂️' },
  { value: 'brand_dealer',         label: 'Brand Dealer',         si: 'බ්‍රෑන්ඩ් නියෝජිතයා',    icon: '✦' },
  { value: 'tool_supplier',        label: 'Tool Supplier',        si: 'මෙවලම් සැපයුම්කරු',       icon: '🔨' },
]

export const PROFESSION_LABELS = Object.fromEntries(PROFESSIONS.map(p => [p.value, p.label]))

export const PROVIDER_TYPES = PROFESSIONS

export const VERIFICATION_BADGES = {
  listed: { label: 'Listed', color: '#64748b', bg: '#f1f5f9' },
  th_verified: { label: 'TH Verified', color: '#0f766e', bg: '#f0fdfa' },
  th_certified_pro: { label: 'Certified Pro', color: '#1d4ed8', bg: '#eff6ff' },
  th_master: { label: 'TH Master', color: '#7c3aed', bg: '#f5f3ff' },
}

export const BUDGET_RANGES = [
  'Below Rs. 500,000',
  'Rs. 500,000 – 1,000,000',
  'Rs. 1,000,000 – 2,000,000',
  'Above Rs. 2,000,000',
]

export function buildWhatsAppLink(phone, name) {
  const n = (phone || '').replace(/\D/g, '')
  const normalized = n.startsWith('94') ? n : '94' + n.replace(/^0/, '')
  const who = name ? `*${name}*` : 'ඔබව'
  const msg = encodeURIComponent(
    `ආයුබෝවන්! 🙏\n\nමම *TilersHub* (www.tilershub.lk) හරහා ${who} සොයාගතිමි.\n\nඔබගේ සේවාව ගැන දැනගැනීමට කැමැත්තෙමි.\n\n📌 *TilersHub.lk* Lead\nස්තූතියි! 🏠`
  )
  return `https://wa.me/${normalized}?text=${msg}`
}

export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadProviderPhoto(submissionId, file, index) {
  const ext = file.name.split('.').pop()
  const path = `submissions/${submissionId}/${index}.${ext}`
  const { error } = await supabase.storage.from('provider-photos').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('provider-photos').getPublicUrl(path)
  return data.publicUrl
}

export async function fetchProviders({ type, district, search } = {}) {
  let q = supabase.from('providers').select('*').eq('status', 'active')
  if (type) q = q.eq('provider_type', type)
  if (district) q = q.contains('service_areas', [district])
  if (search) q = q.ilike('name', `%${search}%`)
  q = q.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function fetchProviderBySlug(slug) {
  const { data, error } = await supabase.from('providers').select('*').eq('slug', slug).eq('status', 'active').single()
  if (error) return null
  return data
}

export async function fetchBrands() {
  const { data } = await supabase.from('brands').select('*').eq('status', 'active').order('is_featured', { ascending: false })
  return data || []
}

export async function fetchBrandBySlug(slug) {
  const { data } = await supabase.from('brands').select('*').eq('slug', slug).eq('status', 'active').single()
  return data || null
}

export async function fetchHeroBanners() {
  const { data } = await supabase.from('hero_banners').select('*').eq('is_active', true).order('sort_order')
  return data || []
}

export async function submitProject(fields) {
  const { error } = await supabase.from('projects').insert(fields)
  if (error) throw error
}

export async function submitProviderApplication(fields) {
  const { error } = await supabase.from('provider_submissions').insert(fields)
  if (error) throw error
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function signInWithOtp(email) {
  const redirectTo = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : '/auth/callback'
  return supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
}

export async function signInWithGoogle() {
  const redirectTo = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : 'https://tilershub.lk/auth/callback'
  return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signOut() {
  return supabase.auth.signOut()
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session?.user ?? null))
}
