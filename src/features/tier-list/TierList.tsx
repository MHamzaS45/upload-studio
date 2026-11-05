import { TierRow } from './TierRow'
import { useTierListStore } from './useTierListStore'
import { VirtualizedCardStrip } from './VirtualizedCardStrip'

export function TierList() {
  const tierOrder = useTierListStore((state) => state.tierOrder)
  const unrankedItemIds = useTierListStore((state) => state.unrankedItemIds)

  return (
    <div className="overflow-hidden rounded-xl border border-[#d1d1d6]">
      {tierOrder.map((tierId) => <TierRow key={tierId} tierId={tierId} />)}
      <section className="grid min-h-28 grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[7rem_minmax(0,1fr)]">
        <div className="grid place-items-center bg-[#d1d1d6] p-2 text-center text-sm font-bold">Unranked</div>
        <div className="flex min-w-0 items-stretch bg-[#f2f2f7]">
          <VirtualizedCardStrip itemIds={unrankedItemIds} group="unranked" />
          {unrankedItemIds.length === 0 && <p className="flex items-center px-4 text-sm text-[#8e8e93]">Paste or import cards here</p>}
        </div>
      </section>
    </div>
  )
}
