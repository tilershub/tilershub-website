import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ginrgwaciblcvxvkbeyd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpbnJnd2FjaWJsY3Z4dmtiZXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjUyODMsImV4cCI6MjA5NDk0MTI4M30.vcfg0gTKSdyKgqggK3OAFwUYwLSfr-QkN2mRFFr_R1M'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const DISTRICTS = [
  'කොළඹ','ගම්පහ','කළුතර','මාතලේ','කෑගල්ල','නුවර',
  'නුවරඑළිය','ගාල්ල','මාතර','හම්බන්තොට','ජාෆ්නා',
  'මන්නාරම','වව්නියාව','මුලතිව්','කිලිනොච්චිය','මඩකළපුව',
  'අම්පාර','ත්‍රිකුණාමළය','කුරුණෑගල','පුත්තලම','අනුරාධපුර',
  'පොළොන්නරුව','බදුල්ල','මොණරාගල','රත්නපුර'
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

export function buildWhatsAppLink(phone, tilerName) {
  const msg = encodeURIComponent(
    `ආයුබෝවන්! 🙏\n\nමම *TilersHub* (www.tilershub.lk) හරහා ඔබව සොයාගතිමි.\n\nඔබගේ ටයිල් සේවාව ගැන දැනගැනීමට කැමැත්තෙමි.\n\n📌 *TilersHub.lk* විසින් සහතිකගත ලීඩ් එකක්\n\nස්තූතියි! 🏠`
  )
  return `https://wa.me/${phone}?text=${msg}`
}

export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}
