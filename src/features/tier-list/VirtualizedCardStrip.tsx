/* 
Virtualizer for large tier lists. Keeps the visible horizontal slice
mounted for each tier. The ordered ID arrays remain complete, so scrolling changes the rendered window 
without changing list data. 

estimateSize - Virtual windows are thus created here by reserving 108 pixels for each 96 pixel card including teh gap
getTotalSize() - preserves the full scrollbar width
itemIds - each virtual item uses its true id as the React Key and sortable ID
*/

import { useRef } from 'react'
import { useDroppable } from '@dnd-kit/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { TierItemCard } from './TierItemCard'

type StripProps = { itemIds: string[]; group: string }

export function VirtualizedCardStrip({ itemIds, group }: StripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { ref: dropRef, isDropTarget } = useDroppable({ id: group })
  const row = useVirtualizer({
    count: itemIds.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 108,
    horizontal: true,
    overscan: 4,
  })

  return (
    <div
      ref={(element) => {
        scrollRef.current = element
        dropRef(element)
      }}
      className={`min-w-0 flex-1 overflow-x-auto rounded-lg p-3 transition-colors ${isDropTarget ? 'bg-cyan-950/50 ring-2 ring-inset ring-cyan-400/70' : ''}`}
      aria-label={`Drop items in ${group === 'unranked' ? 'unranked' : 'this tier'}`}
    >
      <div className="relative h-24 min-w-full" style={{ width: Math.max(row.getTotalSize(), 1) }}>
        {row.getVirtualItems().map((virtual) => (
          <div key={itemIds[virtual.index]} className="absolute top-0" style={{ transform: `translateX(${virtual.start}px)` }}>
            <TierItemCard id={itemIds[virtual.index]} index={virtual.index} group={group} />
          </div>
        ))}
      </div>
    </div>
  )
}
