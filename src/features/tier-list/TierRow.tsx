import { useTierListStore } from './useTierListStore'
import { VirtualizedCardStrip } from './VirtualizedCardStrip'

type TierRowProps = { tierId: string }

export function TierRow({ tierId }: TierRowProps) {
  const tier = useTierListStore((state) => state.tiersById[tierId])
  const itemIds = useTierListStore((state) => state.itemIdsByTier[tierId] ?? [])
  const updateTier = useTierListStore((state) => state.updateTier)
  const deleteTier = useTierListStore((state) => state.deleteTier)
  if (!tier) return null
  return <section className="theme-tier-row grid min-h-28 grid-cols-[5.5rem_minmax(0,1fr)] border-b last:border-b-0 sm:grid-cols-[7rem_minmax(0,1fr)]">
    <div className="relative flex flex-col items-center justify-center gap-2 p-2 text-center" style={{ backgroundColor: tier.color }}>
      <input maxLength={12} className="w-full bg-transparent text-center text-2xl font-bold tracking-tight text-[#1c1c1e] outline-none" value={tier.name} onChange={(event) => updateTier(tierId, { name: event.target.value })} aria-label={`Rename ${tier.name} tier`} />
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-black/60">
        <label className="cursor-pointer">Color<input type="color" className="sr-only" value={tier.color} onChange={(event) => updateTier(tierId, { color: event.target.value })} aria-label={`Change ${tier.name} color`} /></label>
        <button type="button" onClick={() => deleteTier(tierId)} className="rounded px-1.5 py-1 hover:bg-black/10" aria-label={`Delete ${tier.name} tier`}>Delete</button>
      </div>
    </div>
    <div className="flex min-w-0 items-stretch bg-[#f2f2f7]" aria-label={`${tier.name} tier, ${itemIds.length} items`}>
      <VirtualizedCardStrip itemIds={itemIds} group={tierId} />
      {itemIds.length === 0 && <p className="flex items-center px-4 text-sm text-[#8e8e93]">Drop cards here</p>}
    </div>
  </section>
}
