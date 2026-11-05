import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(url || 'https://placeholder.invalid', key || 'preview-placeholder-key')

export async function ensureAnonymousUser() {
  if (!supabase) throw new Error('Supabase is not configured for this preview.')
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session?.user) return sessionData.session.user

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  if (!data.user) throw new Error('Anonymous sign-in did not return a user.')
  return data.user
} 
