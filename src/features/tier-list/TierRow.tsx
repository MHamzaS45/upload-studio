// Row Title and Color Editor functionality

import { useTierListStore } from './useTierListStore'
import { VirtualizedCardStrip } from './VirtualizedCardStrip'

type TierRowProps = { tierId: string }


/*  Render virtualized strip instead of mapping all cards directly  

after guard clause (prevent empty ) 
   Controlled Label and Color Selection Block 
   Controlled Input for Tier Label Name 
   Controlled Color Picker  for Tier Row Customization 
   Render Virtualized Card Area 
   Prevent against empty selects
*/

export function TierRow({ tierId }: TierRowProps) {
  const tier = useTierListStore((state) => state.tiersById[tierId])
  const itemIds = useTierListStore((state) => state.itemIdsByTier[tierId])
  const updateTier = useTierListStore((state) =>state.updateTier)

  if (!tier) return null
  return (
    <section className="grid min-h-28 grid-cols-[8rem_minmax(0,1fr)] border-b border-slate-700">
      <div className="flex flex-col items-center justify-between p-3 text-center transition-colors"
        style={{ backgroundColor: tier.color }}
      >
        <input
          className="w-full bg-transparent text-center text-2xl font-black text-slate-950 outline-none border-b border-transparent focus:border-slate-950/20 placeholder:text-slate-800/30"
          value={tier.name}
          onChange={(event) => updateTier(tierId, { name: event.target.value })}
          placeholder="Rename..."
          aria-label={`Rename ${tier.name} tier`}
        />

        <label className="mt-1 flex items-center gap-1.5 cursor-pointer rounded-md bg-slate-950/20 px-1.5 py-0.5 text-[10px] font-bold text-slate-950 hover:bg-slate-950/30">
          Color
          <input
            type="color"
            className="h-4 w-4 cursor-pointer rounded border-0 bg-transparent outline-none"
            value={tier.color}
            onChange={(event) => updateTier(tierId, { color: event.target.value })}
            aria-label={`Change color for ${tier.name} tier`}
          />
        </label>
      </div>

      <div className="flex min-w-0 items-center bg-slate-900" aria-label={`${tier.name} tier, ${itemIds.length} items`}>
        <VirtualizedCardStrip itemIds={itemIds} group={tierId} />
        {itemIds.length === 0 ? (
          <p className="text-sm text-slate-500 pl-4">Drop ranked items here.</p>
        ) : null}
      </div>

    </section>
  )
}