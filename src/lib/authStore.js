import { atom } from 'nanostores'
import { supabase } from './supabase'

export const $user = atom(null)
export const $profile = atom(null)
export const $authLoading = atom(true)

async function fetchProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  $profile.set(data)
}

if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data: { session } }) => {
    $user.set(session?.user ?? null)
    if (session?.user) fetchProfile(session.user.id)
    $authLoading.set(false)
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    $user.set(session?.user ?? null)
    if (session?.user) fetchProfile(session.user.id)
    else $profile.set(null)
  })
}

export async function signUp(email, password, role, profileData) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  const userId = data.user.id
  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    role,
    full_name: profileData.full_name,
    phone: profileData.phone,
    district: profileData.district,
  })
  if (profileError) throw profileError
  if (role === 'tiler') {
    const { error: tilerError } = await supabase.from('tilers').insert({
      user_id: userId,
      bio: profileData.bio,
      experience_years: profileData.experience_years,
      daily_rate_min: profileData.daily_rate_min,
      daily_rate_max: profileData.daily_rate_max,
      services: profileData.services,
      availability: profileData.availability || 'available',
    })
    if (tilerError) throw tilerError
  }
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}
