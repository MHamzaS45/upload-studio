import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
if (!url || !key) throw new Error('Supabase environment variables are missing from your local files.')

export const supabase = createClient(url, key)

export async function ensureAnonymousUser() {
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session?.user) return sessionData.session.user

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  if (!data.user) throw new Error('Anonymous sign-in did not return a user.')
  return data.user
} 