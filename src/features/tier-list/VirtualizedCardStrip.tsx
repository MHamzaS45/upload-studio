/* 
Virtualizer for large tier lists. Keeps the visible horizontal slice
mounted for each tier. The ordered ID arrays remain complete, so scrolling changes the rendered window 
without changing list data. 

estimateSize - Virtual windows are thus created here by reserving 108 pixels for each 96 pixel card including teh gap
getTotalSize() - preserves the full scrollbar width
itemIds - each virtual item uses its true id as the React Key and sortable ID
*/

import { useDroppable } from '@dnd-kit/react'
import { TierItemCard } from './TierItemCard'

type StripProps = { itemIds: string[]; group: string }

export function VirtualizedCardStrip({ itemIds, group }: StripProps) {
  const { ref: dropRef, isDropTarget } = useDroppable({ id: group })

  return (
    <div
      ref={dropRef}
      className={`min-w-0 flex-1 overflow-x-auto rounded-lg p-3 transition-colors ${isDropTarget ? 'bg-[#dbeafe] ring-2 ring-inset ring-[#007aff]/50' : ''}`}
      aria-label={`Drop items in ${group === 'unranked' ? 'unranked' : 'this tier'}`}
    >
      <div className="flex min-h-24 min-w-max items-start gap-3">
        {itemIds.map((id, index) => <TierItemCard key={id} id={id} index={index} group={group} />)}
      </div>
    </div>
  )
}
