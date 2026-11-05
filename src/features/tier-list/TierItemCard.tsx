import { useSortable } from '@dnd-kit/react/sortable'
import { useTierListStore } from './useTierListStore'

type CardProps = { id: string; index: number; group: string }

export function TierItemCard({ id, index, group }: CardProps) {
  const item = useTierListStore((state) => state.itemsById[id])
  const sortable = useSortable({ id, index, group, type: 'item', accept: 'item' })
  const selectItem = useTierListStore((state) => state.selectItem)

  if (!item) return null
  return (
    <button ref={sortable.ref} type="button" onClick={() => selectItem(id)} className={`group relative h-24 w-24 shrink-0 overflow-hidden rounded-none bg-white text-left ${sortable.isDragging ? 'opacity-30' : ''}`} aria-label={`Move ${item.name}`}>
      {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: `${item.cropX}% ${item.cropY}%`, transform: `scale(${item.zoom})` }} />}
      <span className={`absolute inset-x-0 bottom-0 z-10 px-1.5 py-1 text-[11px] font-semibold leading-tight ${item.bannerMode ? 'bg-white/80 text-[#1c1c1e] backdrop-blur-sm' : 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,.9)]'}`}>{item.name}</span>
    </button>
  )
}
