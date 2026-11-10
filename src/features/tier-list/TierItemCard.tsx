import { useSortable } from '@dnd-kit/react/sortable'
import { useTierListStore } from './useTierListStore'

type CardProps = { id: string; index: number; group: string }
export function TierItemCard({ id, index, group }: CardProps) {
  const item = useTierListStore((state) => state.itemsById[id])
  const sortable = useSortable({ id, index, group, type: 'item', accept: 'item' })
  const selectItem = useTierListStore((state) => state.selectItem)
  if (!item) return null
  return <button ref={sortable.ref} type="button" onClick={() => selectItem(id)} className={`theme-card group relative h-24 w-24 shrink-0 overflow-hidden rounded-none text-left ${sortable.isDragging ? 'invisible' : 'visible'}`} aria-label={`Edit ${item.name}`}>
    {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" className={`absolute inset-0 h-full w-full object-cover transition-opacity ${sortable.isDragging ? 'opacity-60' : ''}`} style={{ objectPosition: `${item.cropX}% ${item.cropY}%`, transform: `scale(${item.zoom})` }} />}
    <span className={`absolute inset-x-0 bottom-0 z-10 px-1.5 py-1 leading-tight ${item.bannerMode ? 'bg-white/80 backdrop-blur-sm' : 'drop-shadow-[0_1px_3px_rgba(0,0,0,.9)]'}`} style={{ color: item.labelColor ?? (item.bannerMode ? '#1c1c1e' : '#fff'), fontFamily: item.labelFont ?? 'system-ui', fontSize: `${item.labelSize ?? 11}px` }}>{item.name}</span>
  </button>
}
