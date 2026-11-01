// publish.ts helper

import { supabase } from '../../lib/supabase'

/*
The generated slug is independent from the title, so renaming does not 
break an existing link. The public flag unlocks select policies only.
The returned URL uses the current deployment origin.
*/
export async function publishList(listId: string) {
  const slug = crypto.randomUUID().replaceAll('-', '')
  const { data, error } = await supabase
    .from('tier_lists')
    .update({ is_public: true, public_slug: slug })
    .eq('id', listId)
    .select('public_slug')
    .single()
  if (error) throw error

  return `${window.location.origin}/share/${data.public_slug}`
}