/* 
Main block - zustand store
*/

import { create } from 'zustand'
import type { ItemsByTier, Tier, TierItem } from './types'

const names = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
const colors = ['#fb7185', '#fb923c', '#facc15', '#a3e635', '#34d399', '#22d3ee', '#60a5fa', '#818cf8', '#c084fc', '#f472b6']

const tiers = names.map((name, index): Tier => ({ id: `00000000-0000-0000-0000-${index.toString().padStart(12, '0')}`, name, color: colors[index] }))

const tiersById = Object.fromEntries(tiers.map((tier) => [tier.id, tier]))
const itemIdsByTier = Object.fromEntries(tiers.map((tier) => [tier.id, []])) as ItemsByTier

// store type definitions
export type TierListStore = {
  tiersById: { [key: string]: Tier }
  tierOrder: string[]
  itemsById: { [key: string]: TierItem }
  itemIdsByTier: ItemsByTier
  unrankedItemIds: string[]
  selectedItemId: string | null
  selectItem: (id: string | null) => void
  replaceGroups: (groups: ItemsByTier) => void
  addItem: (item: TierItem) => void 
  seedMockCards: () => void
  loadPersistedState: (snapshot: any) => void 
  updateTier: (id: string, patch: { [K in keyof Tier]?: Tier[K] }) => void
  updateItem: (id: string, patch: { [K in keyof TierItem]?: TierItem[K] }) => void
}

// action block
const useBaseStore = create((set) => ({
  tiersById,
  tierOrder: tiers.map((tier) => tier.id),
  itemsById: {},
  itemIdsByTier,
  unrankedItemIds: [],
  selectedItemId: null,
  selectItem: (selectedItemId: string | null) => set({ selectedItemId }),
  replaceGroups: (groups: ItemsByTier) => set((state: TierListStore) => ({
    unrankedItemIds: groups.unranked ?? [],
    itemIdsByTier: Object.fromEntries(
      state.tierOrder.map((tierId: string) => [tierId, groups[tierId] ?? []]),
    ),
  })),
  addItem: (item: TierItem) => set((state: TierListStore) => {
    const totalItems = Object.keys(state.itemsById).length
    if (totalItems >= 500) {
      return state
    }
    return {
      itemsById: {
        ...state.itemsById,
        [item.id]: item,
      },
      unrankedItemIds: [...state.unrankedItemIds, item.id],
    }
  }),
  seedMockCards: () => set((state: TierListStore) => {
    const newItems: { [key: string]: TierItem } = { ...state.itemsById}
    const newUnrankedIds: string[] = [...state.unrankedItemIds]
    for (let i = 1; i <= 500; i++) {
      const id = `11111111-1111-1111-1111-${i.toString().padStart(12, '0')}`
      newItems[id] = {
        id,
        name: `Mock Card ${i}`,
         // Fast placeholders
        imageUrl: `https://picsum.photos/id/${i % 100}/100/100`,
        tierId: null,
        sortOrder: i - 1,
        cropX: 50,
        cropY: 50,
        zoom: 1
      }
      newUnrankedIds.push(id)
    }

    return {
      itemsById: newItems,
      unrankedItemIds: newUnrankedIds
    }
  }),
  loadPersistedState: (snapshot: any) => set(() => ({
    tiersById: snapshot.tiersById,
    tierOrder: snapshot.tierOrder,
    itemsById: snapshot.itemsById,
    itemIdsByTier: snapshot.itemIdsByTier,
    unrankedItemIds: snapshot.unrankedItemIds,
  })),
  updateTier: (id: string, patch: { [K in keyof Tier]?: Tier[K]}) => set((state: TierListStore) => ({
    tiersById: {
      ...state.tiersById,
      [id]: {
        ...state.tiersById[id],
        ...patch
      }
    }
  })),
  updateItem: (id: string, patch: { [K in keyof TierItem]?: TierItem[K] }) => set((state: TierListStore) => ({
    itemsById: {
      ...state.itemsById,
      [id]: {
        ...state.itemsById[id],
        ...patch
      }
    }
  })),
}))


// A single function signature with a fallback default generic.
// Define the interface to type both our custom hook and static methods
// Assign the subscribe method directly to our custom wrapper hook

interface UseTierListStore {
  <U = TierListStore>(selector?: (state: TierListStore) => U): U
  subscribe: (listener: (state: TierListStore) => void) => () => void
}

export const useTierListStore = Object.assign(
  <U = TierListStore>(selector?: (state: TierListStore) => U): U => {
    return useBaseStore(selector as any)
  },
  {
    subscribe: useBaseStore.subscribe,
  }
) as UseTierListStore

