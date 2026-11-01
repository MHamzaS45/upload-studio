// Dynamically Provision Lists on the Client


import { supabase } from '../../lib/supabase'

export async function initializeUserList() {
  // 1. Check if this active authenticated session already has a list in the database
  const { data: existingLists, error: fetchError } = await supabase
    .from('tier_lists')
    .select('id')
    .limit(1)

  if (fetchError) throw fetchError

  // 2. If a list already exists, return its dynamic UUID!
  if (existingLists && existingLists.length > 0) {
    return existingLists[0].id
  }

  // 3. If no list exists, dynamically create a brand-new one!
  const { data: newList, error: createError } = await supabase
    .from('tier_lists')
    .insert({
      title: 'My Custom Tier List',
      is_public: false
    })
    .select('id')
    .single()

  if (createError) throw createError
  return newList.id
}
