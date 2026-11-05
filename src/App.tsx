import { DragDropProvider } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'
import { useEffect, useMemo, useState } from 'react'
import { TierList } from './features/tier-list/TierList'
import { useTierListStore } from './features/tier-list/useTierListStore'
import { ImageUpload } from './features/uploads/ImageUpload'
import { SelectionEditor } from './features/tier-list/SelectionEditor'
import { useAutosave } from './features/persistence/useAutosave'
import type { ItemsByTier } from './features/tier-list/types'

export default function App() {
  const byTier = useTierListStore((state) => state.itemIdsByTier)
  const unranked = useTierListStore((state) => state.unrankedItemIds)
  const replaceGroups = useTierListStore((state) => state.replaceGroups)
  const totalItems = useTierListStore((state) => Object.keys(state.itemsById).length)
  const seedMockCards = useTierListStore((state) => state.seedMockCards)
  const [listId, setListId] = useState('local-draft')
  const [isShared, setIsShared] = useState(false)

  useAutosave(listId)

  useEffect(() => {
    const match = window.location.pathname.match(/^\/lists\/([a-zA-Z0-9-]+)\/?$/)
    if (!match) return
    setListId(match[1])
    setIsShared(true)
  }, [])

  const groups = useMemo<ItemsByTier>(() => ({ ...byTier, unranked }), [byTier, unranked])

  const handleDragEnd = (event: Parameters<typeof move>[1]) => {
    const next = move(groups, event) as ItemsByTier
    replaceGroups(next)
  }

  const handleNewList = () => {
    window.history.pushState({}, '', '/')
    setListId('local-draft')
    setIsShared(false)
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] text-[#1c1c1e]">
      <header className="border-b border-[#d1d1d6] bg-white/90 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8e8e93]">Tier list creator</p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#1c1c1e]">TierStudio</h1>
          </div>
          <div className="flex items-center gap-2">
            {isShared && <span className="rounded-full bg-[#e5e5ea] px-3 py-1 text-xs font-medium text-[#636366]">Shared view</span>}
            <button className="rounded-xl bg-[#007aff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#006ee6]" onClick={handleNewList} type="button">New list</button>
            <button className="rounded-xl bg-[#f2f2f7] px-4 py-2 text-sm font-semibold text-[#007aff] transition hover:bg-[#e5e5ea]" onClick={() => seedMockCards()} type="button">Demo cards</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-8">
        <section className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,.08)] sm:p-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Build your ranking</h2>
              <p className="mt-1 text-sm text-[#8e8e93]">Paste an image or import files, then drag cards into a tier.</p>
            </div>
            <span className="text-sm tabular-nums text-[#8e8e93]">{totalItems} / 500 cards</span>
          </div>
          <ImageUpload />
        </section>

        <DragDropProvider onDragEnd={handleDragEnd}>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <section className="min-w-0 rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,.08)] sm:p-5">
              <TierList />
            </section>
            <aside className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,.08)]">
              <h2 className="border-b border-[#e5e5ea] pb-3 text-sm font-semibold">Card properties</h2>
              <SelectionEditor />
            </aside>
          </div>
        </DragDropProvider>

        <footer className="text-center text-xs text-[#8e8e93]">Shared lists use /lists/&lt;uuid&gt; and remain viewable on refresh.</footer>
      </main>
    </div>
  )
}
