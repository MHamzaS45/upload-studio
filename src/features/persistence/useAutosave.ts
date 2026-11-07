/* Debounce Hook 
- Document saves
 //  The store subscription observes edits without subscribing the component tree.
 //  The local snapshot is written immediately for crash recovery.
 //  The Supabase save waits until edits pause for approx. 750 milliseconds in order to limit writes

- returns
 // Supabase debounce timer for local backup 

 */

import { useEffect } from 'react'
import { useTierListStore, type TierListStore } from '../tier-list/useTierListStore'
import { saveTierList } from './saveTierList'

export function useAutosave(listId: string | null) {
  useEffect(() => {
    if (!listId) return
    let timer = 0

    return useTierListStore.subscribe((state: TierListStore) => {
      const snapshot = {
        tiersById: state.tiersById,
        tierOrder: state.tierOrder,
        itemsById: state.itemsById,
        itemIdsByTier: state.itemIdsByTier,
        unrankedItemIds: state.unrankedItemIds,
      }
      localStorage.setItem(`tierstudio:${listId}`, JSON.stringify(snapshot))
      
       window.clearTimeout(timer)
       timer = window.setTimeout(() => {
        saveTierList(listId, snapshot)
          .then(() => {
            localStorage.removeItem(`tierstudio:${listId}`)
          })
          .catch((err) => {
            console.error("Autosave failed:", err)
          })
      }, 750)
    })
  }, [listId])
}
