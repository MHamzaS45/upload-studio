
/**
 * @file App.tsx
 * @description Core page orchestrator for the TierStudio application.
 * Integrates real-time horizontal dnd-kit virtualization, global Zustand state,
 * on-demand database-level list provisioning, offline-first localStorage backup/restore,
 * and secure slug-based sharing configurations via Supabase.
 */

import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import { useEffect, useState } from 'react'
import { move } from '@dnd-kit/helpers'
import { TierList } from './features/tier-list/TierList'
import { useTierListStore } from './features/tier-list/useTierListStore'
import { ImageUpload } from './features/uploads/ImageUpload'
import type { ItemsByTier } from './features/tier-list/types'
import { SelectionEditor } from './features/tier-list/SelectionEditor'
import { useAutosave } from './features/persistence/useAutosave'
import { publishList } from './features/sharing/publishList'
import { ensureAnonymousUser, supabase } from './lib/supabase'
import { exportTierList } from './features/export/exportTierList'

/*
- Grab live store counters and seed action
  const totalItems = useTierListStore((state) => Object.keys(state.itemsById).length)
  const seedMockCards = useTierListStore((state) => state.seedMockCards)
  s
- To preserve session state history
  - Load session state
  const loadPersistedState = useTierListStore((state) => state.loadPersistedState)
  const listId = "test-list-uuid-123"
  - Save history
  useAutosave(listId)
  useEffect(() => {

*/


export default function App() {
  const byTier = useTierListStore((state) => state.itemIdsByTier)
  const unranked = useTierListStore((state) => state.unrankedItemIds)
  const replaceGroups = useTierListStore((state) => state.replaceGroups)
  
  const totalItems = useTierListStore((state) => Object.keys(state.itemsById).length)
  const seedMockCards = useTierListStore((state) => state.seedMockCards)
  const loadPersistedState = useTierListStore((state) => state.loadPersistedState)
  
  // 2. Pull itemsById from the store to act as the current baseline for comparison
  const itemsById = useTierListStore((state) => state.itemsById)
  const tierOrder = useTierListStore((state) => state.tierOrder)
  const tiersById = useTierListStore((state) => state.tiersById)

  // 3. Declare state to track if a different local draft is available to recover
  const [localDraft, setLocalDraft] = useState<any | null>(null)
  
  // 4. Add Local state to control the template sharing feedback loop 
  // (Refer to src\features\sharing\publishList.ts for more info)
  const [isPublishing, setIsPublishing] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  
  // Custom states for export progress feedback
  const [isExporting, setIsExporting] = useState(false)

  // Dyanmic ID replaced during live routing
  const [listId, setListId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // 5. Async handler
  const handleShare = async () => { 
    if (!listId) return
    setIsPublishing(true)
    try {
      const url = await publishList(listId)
      setShareUrl(url)
      await navigator.clipboard.writeText(url)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (error) {
      console.error("Failed to publish list:", error)
    } finally {
      setIsPublishing(false)
    }
  }

  // Async Export Handler
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const exportTiers = tierOrder.map((id) => ({
        id,
        name: tiersById[id]?.name,
        color: tiersById[id]?.color,
        itemIds: byTier[id] || [],
      }))
      await exportTierList(exportTiers, itemsById)
    } catch (error) {
      console.error("PNG render pipeline failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  useAutosave(listId)
  
  // Inline session and database sync lifecycle
  useEffect(() => {
    async function configureSession() {
      try {
        const user = await ensureAnonymousUser()
        
        // SELF-HEALING CURE: Map the list ID directly to the active user's session ID.
        // This makes list clashing mathematically impossible and guarantees RLS checks pass!
        const activeId = user.id
        setListId(activeId)

        const { error } = await supabase
          .from('tier_lists')
          .upsert({
            id: activeId,
            owner_id: user.id,
            title: 'My Custom Tier List',
            is_public: false
          }, { onConflict: 'id' })
        if (error) throw error
      } catch (error) {
        console.error("Failed to provision active board session:", error)
      } finally {
        setIsLoading(false)
      }
    }
    configureSession()
  }, [])

  useEffect(() => {
    if (!listId) return
    const saved = localStorage.getItem(`tierstudio:${listId}`)
    if (saved) {
      try {
        const parsedLocal = JSON.parse(saved)
        const matchesActive = JSON.stringify(parsedLocal.itemsById) === JSON.stringify(itemsById)
      
        if (!matchesActive) {
          setLocalDraft(parsedLocal)
        }
      } catch (error) {
        console.error("Failed to parse saved session:", error)
      }
    }
  }, [listId, itemsById])

  const groups: ItemsByTier = { ...byTier, unranked }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin border-t-2 border-r-2 border-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.4)]"></div>
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 animate-pulse">
          // INITIATING SECURE TERMINAL CONNECTION //
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] text-white">
      <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-8">
        
        {/* Cyberpunk Header */}
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b-2 border-cyan-500/20 pb-6 backdrop-blur-sm bg-slate-950/40 p-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.05)]">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-pink-500 to-indigo-400 drop-shadow-[0_2px_10px_rgba(34,211,238,0.3)]">
              TierStudio
            </h1>
            <div className="flex items-center gap-2 mt-1.5 font-mono text-[10px] tracking-widest text-cyan-400/80 uppercase">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>\\_// SYS_STATUS: ONLINE \\_// VERSION: 0.1.0_JUMP \\_//</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Unsaved Local Draft Warning */}
            {localDraft && (
              <div className="flex items-center gap-3 rounded-lg border-2 border-amber-500/40 bg-amber-950/20 px-3 py-1.5 font-mono text-xs shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <span className="text-amber-400 font-bold tracking-wider animate-pulse">⚠️ UNSAVED DRAFT FOUND</span>
                <button
                  type="button"
                  onClick={() => {
                    loadPersistedState(localDraft)
                    setLocalDraft(null)
                  }}
                  className="rounded border border-amber-500 bg-amber-500/20 px-2.5 py-0.5 font-black uppercase text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all duration-300"
                >
                  Restore
                </button>
              </div>
            )}

            {/* Glowing Holographic Share Button */}
            <button
              type="button"
              disabled={isPublishing}
              onClick={handleShare}
              className={`rounded-lg px-4 py-2 font-mono text-xs font-black uppercase tracking-wider transition-all duration-300 focus:outline-none flex items-center gap-1.5 border-2 ${
                shareUrl 
                  ? 'border-emerald-400 bg-emerald-950/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:bg-emerald-400 hover:text-slate-950' 
                  : 'border-cyan-400 bg-cyan-950/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:bg-cyan-400 hover:text-slate-950 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]'
              }`}
            >
              {isPublishing ? (
                <span className="animate-pulse">// PUBLISHING...</span>
              ) : shareUrl ? (
                <> PUBLISHED TEMPLATE </>
              ) : (
                <> SHARE TEMPLATE</>
              )}
            </button>

            {/* 2k1 Styled Volt-Green Export Button */}
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className={`rounded-lg px-4 py-2 font-mono text-xs font-black uppercase tracking-wider transition-all duration-300 focus:outline-none flex items-center gap-1.5 border-2 border-lime-400 bg-lime-950/30 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.2)] hover:bg-lime-400 hover:text-slate-950 hover:shadow-[0_0_25px_rgba(163,230,53,0.4)] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isExporting ? (
                <span className="animate-pulse">// EXPORTING...</span>
              ) : (
                <>EXPORT AS PNG</>
              )}
            </button>
            
            {/* Realtime Core Counter */}
            <div className="rounded-lg border-2 border-slate-800 bg-slate-900/60 px-3 py-2 font-mono text-xs">
              <span className="text-slate-400">CARDS: </span>
              <strong className="text-cyan-400">{totalItems}</strong>
              <span className="text-slate-600"> / 500</span>
            </div>
            
            {/* Tactical Seed Button */}
            <button
              onClick={() => seedMockCards()}
              type="button"
              className="rounded-lg border-2 border-rose-500 bg-rose-950/20 px-4 py-2 font-mono text-xs font-bold text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] focus:outline-none"
            >
              SEED CARDS
            </button>
          </div>
        </header>

        {/* Share Link Alert Console */}
        {shareUrl && (
          <div className="mb-8 p-4 rounded-xl border-2 border-cyan-400/40 bg-cyan-950/30 backdrop-blur-md flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            <div className="space-y-1 font-mono">
              <h4 className="text-xs font-black uppercase text-cyan-300"> BROADCAST LIVE</h4>
              <p className="text-xs text-slate-300 break-all">
                PUBLIC_URL: <a href={shareUrl} target="_blank" className="text-cyan-400 underline hover:text-cyan-300 transition-colors">{shareUrl}</a>
              </p>
            </div>
            {showToast && (
              <span className="text-[10px] font-mono font-black uppercase bg-cyan-400 text-slate-950 px-3 py-1.5 rounded shadow-[0_0_10px_rgba(34,211,238,0.3)] animate-bounce">
                COPIED_TO_CLIPBOARD
              </span>
            )}
          </div>
        )}

        {/* Image Upload Core Terminal */}
        <section className="mb-8 rounded-xl border-2 border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <ImageUpload />
        </section>

        {/* Drag & Drop Workspace layout */}
        <DragDropProvider onDragEnd={(event) => replaceGroups(move(groups, event) as ItemsByTier)}>
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6 rounded-xl border-2 border-slate-800/80 bg-slate-900/30 p-6 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
              <TierList />
            </div>
            
            <aside className="space-y-4 rounded-xl border-2 border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400 border-b border-slate-800 pb-3">
                // PROPERTIES_EDITOR
              </h2>
              <SelectionEditor />
            </aside>
          </div>

          <DragOverlay>
            {(source) => (
              <div className="rounded-xl border-2 border-cyan-400 bg-cyan-950/80 p-4 font-mono font-black text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                {source.id}
              </div>
            )}
          </DragOverlay>
        </DragDropProvider>
      </main>
    </div>
  )
}
