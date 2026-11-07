import { supabase } from '../../lib/supabase'
import { saveTierList } from '../persistence/saveTierList'

export async function createPublicList(listId: string, snapshot: unknown) {
  const { error } = await supabase.from('tier_lists').upsert({ id: listId, title: 'TierStudio template', public_slug: listId, is_public: true }, { onConflict: 'id' })
  if (error) throw error
  await saveTierList(listId, snapshot)
  return `${window.location.origin}/lists/${encodeURIComponent(listId)}`
}
