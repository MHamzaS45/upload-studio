import { useTierListStore } from './useTierListStore'
import { VirtualizedCardStrip } from './VirtualizedCardStrip'

type TierRowProps = { tierId: string }

export function TierRow({ tierId }: TierRowProps) {
  const tier = useTierListStore((state) => state.tiersById[tierId])
  const itemIds = useTierListStore((state) => state.itemIdsByTier[tierId])
  const updateTier = useTierListStore((state) => state.updateTier)

  if (!tier) return null
  return (
    <section className="grid min-h-28 grid-cols-[5.5rem_minmax(0,1fr)] border-b border-white/50 last:border-b-0 sm:grid-cols-[7rem_minmax(0,1fr)]">
      <div className="flex flex-col items-center justify-center gap-2 p-2 text-center" style={{ backgroundColor: tier.color }}>
        <input className="w-full bg-transparent text-center text-2xl font-bold tracking-tight text-[#1c1c1e] outline-none" value={tier.name} onChange={(event) => updateTier(tierId, { name: event.target.value })} aria-label={`Rename ${tier.name} tier`} />
        <label className="cursor-pointer text-[10px] font-semibold uppercase tracking-wide text-black/60">Color<input type="color" className="sr-only" value={tier.color} onChange={(event) => updateTier(tierId, { color: event.target.value })} aria-label={`Change ${tier.name} color`} /></label>
      </div>
      <div className="flex min-w-0 items-stretch bg-[#f2f2f7]" aria-label={`${tier.name} tier, ${itemIds.length} items`}>
        <VirtualizedCardStrip itemIds={itemIds} group={tierId} />
        {itemIds.length === 0 && <p className="flex items-center px-4 text-sm text-[#8e8e93]">Drop cards here</p>}
      </div>
    </section>
  )
}
