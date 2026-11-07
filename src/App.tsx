import { DragDropProvider } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'
import { useEffect, useMemo, useState } from 'react'
import { TierList } from './features/tier-list/TierList'
import { useTierListStore } from './features/tier-list/useTierListStore'
import { ImageUpload } from './features/uploads/ImageUpload'
import { SelectionEditor } from './features/tier-list/SelectionEditor'
import { useAutosave } from './features/persistence/useAutosave'
import { createPublicList } from './features/sharing/createPublicList'
import { loadPublicList } from './features/sharing/loadPublicList'
import type { ItemsByTier } from './features/tier-list/types'

export default function App() {
  const byTier = useTierListStore((state) => state.itemIdsByTier)
  const unranked = useTierListStore((state) => state.unrankedItemIds)
  const replaceGroups = useTierListStore((state) => state.replaceGroups)
  const totalItems = useTierListStore((state) => Object.keys(state.itemsById).length)
  const pinnedIds = useTierListStore((state) => state.pinnedItemIds)
  const items = useTierListStore((state) => state.itemsById)
  const addTier = useTierListStore((state) => state.addTier)
  const resetBoard = useTierListStore((state) => state.resetBoard)
  const seedMockCards = useTierListStore((state) => state.seedMockCards)
  const loadPersistedState = useTierListStore((state) => state.loadPersistedState)
  const [listId, setListId] = useState<string>(() => crypto.randomUUID())
  const [isShared, setIsShared] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  useAutosave(listId)

  useEffect(() => {
    const match = window.location.pathname.match(/^\/lists\/([a-zA-Z0-9-]+)\/?$/)
    if (!match) return
    const sharedId = match[1]
    setListId(sharedId)
    setIsShared(true)
    loadPublicList(sharedId).then((data: any) => {
      const tiers = [...(data.tiers ?? [])].sort((a, b) => a.sort_order - b.sort_order)
      const items = Object.fromEntries((data.tier_items ?? []).map((item: any) => [item.id, {
        id: item.id, name: item.name, imageUrl: item.image_url ?? item.asset?.public_url ?? '', tierId: item.tier_id,
        sortOrder: item.sort_order ?? 0, cropX: item.crop_x ?? 50, cropY: item.crop_y ?? 50, zoom: item.zoom ?? 1, bannerMode: true,
      }]))
      const itemIdsByTier = Object.fromEntries(tiers.map((tier) => [tier.id, (data.tier_items ?? []).filter((item: any) => item.tier_id === tier.id).sort((a: any, b: any) => a.sort_order - b.sort_order).map((item: any) => item.id)]))
      loadPersistedState({ tiersById: Object.fromEntries(tiers.map((tier) => [tier.id, { id: tier.id, name: tier.name, color: tier.color }])), tierOrder: tiers.map((tier) => tier.id), itemsById: items, itemIdsByTier, unrankedItemIds: (data.tier_items ?? []).filter((item: any) => !item.tier_id).sort((a: any, b: any) => a.sort_order - b.sort_order).map((item: any) => item.id) })
    }).catch(() => setShareMessage('This shared template could not be loaded.'))
  }, [loadPersistedState])
  const groups = useMemo<ItemsByTier>(() => ({ ...byTier, unranked }), [byTier, unranked])
  const handleDragEnd = (event: Parameters<typeof move>[1]) => replaceGroups(move(groups, event) as ItemsByTier)
  const snapshot = () => { const state = useTierListStore.getState(); return { tiersById: state.tiersById, tierOrder: state.tierOrder, itemsById: state.itemsById, itemIdsByTier: state.itemIdsByTier, unrankedItemIds: state.unrankedItemIds } }
  const share = async () => { try { const url = await createPublicList(listId, snapshot()); await navigator.clipboard.writeText(url); setShareMessage('Share link copied'); window.history.replaceState({}, '', `/lists/${listId}`); setIsShared(true) } catch { setShareMessage('Sharing is unavailable until the Supabase tables are configured.') } }
  const newList = () => { window.history.pushState({}, '', '/'); setListId(crypto.randomUUID()); setIsShared(false); setShareMessage('') }

  return <div className="min-h-screen bg-[#f2f2f7] text-[#1c1c1e]">
    <header className="border-b border-[#d1d1d6] bg-white/90 px-5 py-4 backdrop-blur-xl sm:px-8"><div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8e8e93]">Tier list creator</p><h1 className="text-3xl font-semibold tracking-[-0.04em]">TierStudio</h1></div><div className="flex flex-wrap items-center gap-2">{isShared && <span className="rounded-full bg-[#e5e5ea] px-3 py-1 text-xs font-medium text-[#636366]">Shared view</span>}<button className="rounded-xl bg-[#007aff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#006ee6]" onClick={share} type="button">Share template</button><button className="rounded-xl bg-[#f2f2f7] px-4 py-2 text-sm font-semibold text-[#007aff]" onClick={newList} type="button">New list</button></div></div></header>
    <main className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-8"><section className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,.08)] sm:p-6"><div className="mb-4 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-lg font-semibold">Build your ranking</h2><p className="mt-1 text-sm text-[#8e8e93]">Paste an image or import files, then drag cards into a tier.</p></div><span className="text-sm tabular-nums text-[#8e8e93]">{totalItems} / 500 cards · 10 row maximum</span></div><ImageUpload /><div className="mt-3 flex items-center gap-3 text-sm text-[#636366]"><button type="button" className="rounded-lg bg-[#f2f2f7] px-3 py-2 font-semibold text-[#007aff]" onClick={seedMockCards}>Demo cards</button>{shareMessage && <span aria-live="polite">{shareMessage}</span>}</div></section>
      <DragDropProvider onDragEnd={handleDragEnd}><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"><section className="min-w-0 rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,.08)] sm:p-5"><div className="mb-3 flex flex-wrap justify-end gap-2"><button type="button" className="rounded-lg bg-[#f2f2f7] px-3 py-2 text-sm font-semibold text-[#007aff]" onClick={addTier} disabled={useTierListStore.getState().tierOrder.length >= 10}>Add row</button><button type="button" className="rounded-lg bg-[#f2f2f7] px-3 py-2 text-sm font-semibold text-[#636366]" onClick={resetBoard}>Reset rows</button></div><TierList /></section><aside className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,.08)]"><h2 className="border-b border-[#e5e5ea] pb-3 text-sm font-semibold">Card properties</h2>{pinnedIds.length > 0 && <div className="mb-4 border-b border-[#e5e5ea] pb-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8e8e93]">Pinned images</p><div className="flex flex-wrap gap-1">{pinnedIds.map((id) => items[id] && <img key={id} src={items[id].imageUrl} alt={items[id].name} className="h-12 w-12 rounded-lg object-cover" />)}</div></div>}<SelectionEditor /></aside></div></DragDropProvider>
      <footer className="text-center text-xs text-[#8e8e93]">Shared lists use /lists/&lt;uuid&gt; and remain viewable on refresh.</footer></main></div>
}
