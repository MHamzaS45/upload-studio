import { useSortable } from '@dnd-kit/react/sortable'
import { useTierListStore } from './useTierListStore'


type CardProps = { id: string; index: number; group: string }
/* 
 Subscribe to this item's details from itemsById in the store
 Register this card for pointer and keyboard sorting.
*/

export function TierItemCard({ id, index, group }: CardProps) {
  const item = useTierListStore((state) => state.itemsById[id])
  const sortable = useSortable({ id, index, group, type: 'item', accept: 'item' })
  const selectItem = useTierListStore((state) => state.selectItem)

  return (
    <button
      ref={sortable.ref}
      type="button"
      onClick={() => selectItem(id)}
      className={`h-24 w-24 shrink-0 rounded-xl border border-slate-600 bg-gradient-to-br from-cyan-500 to-indigo-600 p-2 text-sm font-bold text-white shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-300 ${sortable.isDragging ? 'opacity-30' : ''}`}
      aria-label={`Move ${item?.name ?? id}`}
     
    >
      {item?.imageUrl ? (
        <img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          className="h-16 w-full rounded-md object-cover"
          style={{ objectPosition: `${item.cropX}% ${item.cropY}%`, transform: `scale(${item.zoom})`,}
        }
        />
      ) : null}
      <span className="line-clamp-2">{item?.name ?? id}</span>
    </button>
  )
}