import { supabase } from '../../lib/supabase'

export async function loadPublicList(slug: string) {
  // Load the parent plus ordered child records in one read model.
  const { data, error } = await supabase
    .from('tier_lists')
    .select(`
      id, title, public_slug,
      tiers(id, name, color, sort_order),
      tier_items(id, tier_id, asset_id, name, sort_order, crop_x, crop_y, zoom)
    `)
    .eq('public_slug', slug)
    .eq('is_public', true)
    .single()
  if (error) throw error
  return data
}