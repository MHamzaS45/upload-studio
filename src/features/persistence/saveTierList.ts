/* 
// Batching and Upserting Rows with Supabase
Being done ina  method that accounts for camel case and snake case discrepancies
between the Supabase and React environment
*/
import { supabase } from '../../lib/supabase'

export async function saveTierList(listId: string, snapshot: any) {
  if (!supabase) return
  // Map each tier and its sort order to database-ready rows
  const tiers = snapshot.tierOrder.map((id: string, sortOrder: number) => ({
    id: snapshot.tiersById[id].id,
    name: snapshot.tiersById[id].name,
    color: snapshot.tiersById[id].color,
    list_id: listId,
    sort_order: sortOrder,
  }))
  
  // Upsert all tiers in a single batch request
  const { error: tierError } = await supabase.from('tiers').upsert(tiers)
  if (tierError) throw tierError

  // Generate a fresh lookup of item ID instead of hardcoding { tier_id, sort_order } based on active state arrays
  const itemPositions: { [itemId: string]: { tier_id: string | null, sort_order: number } } = {}

  // Map ranked items from state lists
  snapshot.tierOrder.forEach((tierId: string) => {
    const itemIds = snapshot.itemIdsByTier[tierId] || []
    itemIds.forEach((itemId: string, index: number) => {
      itemPositions[itemId] = {
        tier_id: tierId,
        sort_order: index,
      }
    })
  })

  // Map unranked items from state lists
  const unrankedIds = snapshot.unrankedItemIds || []
  unrankedIds.forEach((itemId: string, index: number) => {
    itemPositions[itemId] = {
      tier_id: null,
      sort_order: index,
    }
  })

  // Map snapshotted items to safe, snake_case database rows matching your PostgreSQL schema
 
  const items = Object.values(snapshot.itemsById).map((item: any) => {
    const position = itemPositions[item.id] || { tier_id: null, sort_order: 0 }
    return {
      id: item.id,
      name: item.name,
      image_url: item.imageUrl,       
      tier_id: position.tier_id,       
      sort_order: position.sort_order,   
      crop_x: item.cropX ?? 50,        
      crop_y: item.cropY ?? 50,        
      list_id: listId,
    }
  })
  
  // Upsert all items in a single batch request
  const { error: itemError } = await supabase.from('tier_items').upsert(items)
  if (itemError) throw itemError
}
