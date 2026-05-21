import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email, password, role, profileData) {
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
      })
      if (tilerError) throw tilerError
    }
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
