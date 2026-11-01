import { ensureAnonymousUser, supabase } from '../../lib/supabase'

/*  
Direct browser uploads avoid sending image bodies through a Vercel Function. The object path starts with the 
authenticated user ID so the Storage policy can verify ownership
*/
export async function uploadAsset(blob: Blob) {
  const user = await ensureAnonymousUser()
  const path = `${user.id}/${crypto.randomUUID()}.webp`

  
  const { error } = await supabase.storage.from('tier-assets').upload(path, blob, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from('tier-assets').getPublicUrl(path)
  return { ownerId: user.id, path, publicUrl: data.publicUrl }
}