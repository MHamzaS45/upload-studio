import { useTierListStore } from './useTierListStore'

export function SelectionEditor() {
  const selectedId = useTierListStore((state) => state.selectedItemId)
  const item = useTierListStore((state) => selectedId ? state.itemsById[selectedId] : null)
  const updateItem = useTierListStore((state) => state.updateItem)

  if (!item) return <p className="py-8 text-center text-sm text-[#8e8e93]">Select a card to edit its name, crop, zoom, or banner.</p>
  return <div className="grid gap-5 pt-5">
    <label className="grid gap-1.5 text-sm font-medium">Name<input className="rounded-xl border border-[#d1d1d6] bg-white px-3 py-2 outline-none focus:border-[#007aff]" value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} /></label>
    <label className="flex items-center justify-between text-sm font-medium">Banner mode<input type="checkbox" className="h-5 w-5 accent-[#007aff]" checked={item.bannerMode ?? false} onChange={(event) => updateItem(item.id, { bannerMode: event.target.checked })} /></label>
    <label className="grid gap-2 text-sm font-medium">Zoom <input type="range" min="1" max="3" step="0.1" value={item.zoom} onChange={(event) => updateItem(item.id, { zoom: Number(event.target.value) })} /></label>
    <label className="grid gap-2 text-sm font-medium">Horizontal crop <input type="range" min="0" max="100" value={item.cropX} onChange={(event) => updateItem(item.id, { cropX: Number(event.target.value) })} /></label>
    <label className="grid gap-2 text-sm font-medium">Vertical crop <input type="range" min="0" max="100" value={item.cropY} onChange={(event) => updateItem(item.id, { cropY: Number(event.target.value) })} /></label>
  </div>
}
