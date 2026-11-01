import { TierRow } from './TierRow' 
import { useTierListStore } from './useTierListStore'
import { VirtualizedCardStrip } from './VirtualizedCardStrip'

// Components controls row order. tierOrder used to map over and render each of the rnaked rows
export function TierList() {
  
  const tierOrder = useTierListStore((state) => state.tierOrder)
  const unrankedItemIds = useTierListStore((state) => state.unrankedItemIds)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 shadow-2xl">
      {tierOrder.map((tierId: string) => (
        <TierRow key={tierId} tierId={tierId} />
      ))}
      <section className="grid min-h-32 grid-cols-[5rem_minmax(0,1fr)] bg-slate-800">
        <h2 className="grid place-items-center p-2 text-center text-sm font-bold">Unranked</h2>
        <div className="flex min-w-0 items-center bg-slate-800 text-slate-400">
          <VirtualizedCardStrip itemIds={unrankedItemIds} group="unranked" />
          {unrankedItemIds.length === 0 ? (
            <p className="text-sm text-slate-500 pl-4">Images waiting to be ranked appear here.</p>
          ) : null}
        </div>
      </section>
    </div>
  )
}