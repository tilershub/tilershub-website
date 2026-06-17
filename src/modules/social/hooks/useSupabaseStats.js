import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase.js'

export function useSupabaseStats() {
  const [stats, setStats] = useState({ projects: '—', tilers: '—', bids: '—' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    try {
      const [
        { count: projects },
        { count: tilers },
        { count: bids },
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('tilers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('bids').select('*', { count: 'exact', head: true }),
      ])
      setStats({
        projects: (projects ?? 0).toLocaleString(),
        tilers:   (tilers   ?? 0).toLocaleString(),
        bids:     (bids     ?? 0).toLocaleString(),
      })
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchStats])

  return { stats, loading, error, refresh: fetchStats }
}
