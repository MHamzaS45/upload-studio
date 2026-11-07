import { create } from 'zustand'
import type { ItemsByTier, Tier, TierItem } from './types'

const names = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
const colors = ['#fb7185', '#fb923c', '#facc15', '#a3e635', '#34d399', '#22d3ee', '#60a5fa', '#818cf8', '#c084fc', '#f472b6']
const tiers = names.map((name, index): Tier => ({ id: `00000000-0000-0000-0000-${index.toString().padStart(12, '0')}`, name, color: colors[index] }))
const createGroups = () => Object.fromEntries(tiers.map((tier) => [tier.id, []])) as ItemsByTier

export type TierListStore = {
  tiersById: Record<string, Tier>; tierOrder: string[]; itemsById: Record<string, TierItem>
  itemIdsByTier: ItemsByTier; unrankedItemIds: string[]; selectedItemId: string | null; pinnedItemIds: string[]
  selectItem: (id: string | null) => void; togglePinned: (id: string) => void
  replaceGroups: (groups: ItemsByTier) => void; addItem: (item: TierItem) => boolean
  seedMockCards: () => void; loadPersistedState: (snapshot: any) => void
  updateTier: (id: string, patch: Partial<Tier>) => void; updateItem: (id: string, patch: Partial<TierItem>) => void
  addTier: () => void; deleteTier: (id: string) => void; resetBoard: () => void
}

const initialTiers = Object.fromEntries(tiers.map((tier) => [tier.id, tier]))
const useBaseStore = create<TierListStore>((set) => ({
  tiersById: initialTiers, tierOrder: tiers.map((tier) => tier.id), itemsById: {}, itemIdsByTier: createGroups(), unrankedItemIds: [], selectedItemId: null, pinnedItemIds: [],
  selectItem: (selectedItemId) => set({ selectedItemId }),
  togglePinned: (id) => set((state) => ({ pinnedItemIds: state.pinnedItemIds.includes(id) ? state.pinnedItemIds.filter((itemId) => itemId !== id) : [...state.pinnedItemIds, id] })),
  replaceGroups: (groups) => set((state) => ({ unrankedItemIds: groups.unranked ?? [], itemIdsByTier: Object.fromEntries(state.tierOrder.map((tierId) => [tierId, groups[tierId] ?? []])) })),
  addItem: (item) => {
    let added = false
    set((state) => {
      if (Object.keys(state.itemsById).length >= 500 || state.itemsById[item.id]) return state
      added = true
      return { itemsById: { ...state.itemsById, [item.id]: item }, unrankedItemIds: [...state.unrankedItemIds, item.id] }
    })
    return added
  },
  seedMockCards: () => set((state) => {
    const items = { ...state.itemsById }; const ids = [...state.unrankedItemIds]
    for (let i = 1; i <= 500 && Object.keys(items).length < 500; i++) { const id = `11111111-1111-1111-1111-${i.toString().padStart(12, '0')}`; if (items[id]) continue; items[id] = { id, name: `Mock Card ${i}`, imageUrl: `https://picsum.photos/id/${i % 100}/100/100`, tierId: null, sortOrder: i, cropX: 50, cropY: 50, zoom: 1, bannerMode: true }; ids.push(id) }
    return { itemsById: items, unrankedItemIds: ids }
  }),
  loadPersistedState: (snapshot) => set((state) => ({ ...state, ...snapshot, pinnedItemIds: snapshot.pinnedItemIds ?? [] })),
  updateTier: (id, patch) => set((state) => ({ tiersById: { ...state.tiersById, [id]: { ...state.tiersById[id], ...patch, name: String(patch.name ?? state.tiersById[id]?.name ?? '').slice(0, 12) } } })),
  updateItem: (id, patch) => set((state) => ({ itemsById: { ...state.itemsById, [id]: { ...state.itemsById[id], ...patch } } })),
  addTier: () => set((state) => { if (state.tierOrder.length >= 10) return state; const id = crypto.randomUUID(); const tier = { id, name: `Tier ${state.tierOrder.length + 1}`, color: '#d1d1d6' }; return { tiersById: { ...state.tiersById, [id]: tier }, tierOrder: [...state.tierOrder, id], itemIdsByTier: { ...state.itemIdsByTier, [id]: [] } } }),
  deleteTier: (id) => set((state) => { if (state.tierOrder.length <= 1) return state; const moved = state.itemIdsByTier[id] ?? []; const { [id]: _removed, ...tiersById } = state.tiersById; const { [id]: _group, ...itemIdsByTier } = state.itemIdsByTier; return { tiersById, tierOrder: state.tierOrder.filter((tierId) => tierId !== id), itemIdsByTier, unrankedItemIds: [...state.unrankedItemIds, ...moved] } }),
  resetBoard: () => set((state) => ({ itemIdsByTier: createGroups(), unrankedItemIds: [...state.unrankedItemIds, ...state.tierOrder.flatMap((id) => state.itemIdsByTier[id] ?? [])] })),
}))

export const useTierListStore = Object.assign(useBaseStore, { subscribe: useBaseStore.subscribe, getState: useBaseStore.getState })
