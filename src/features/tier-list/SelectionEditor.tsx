import { useRef } from 'react'
import { useTierListStore } from './useTierListStore'

const fonts = ['system-ui', 'Georgia', 'Arial', 'Trebuchet MS', 'Courier New']

export function SelectionEditor() {
  const selectedId = useTierListStore((state) => state.selectedItemId)
  const item = useTierListStore((state) => selectedId ? state.itemsById[selectedId] : null)
  const updateItem = useTierListStore((state) => state.updateItem)
  const togglePinned = useTierListStore((state) => state.togglePinned)
  const pinned = useTierListStore((state) => selectedId ? state.pinnedItemIds.includes(selectedId) : false)
  const replaceInput = useRef<HTMLInputElement>(null)
  if (!item) return <p className="py-8 text-center text-sm text-[#8e8e93]">Select a card to edit its image, label, crop, or zoom.</p>
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" role="dialog" aria-modal="true" aria-label="Edit tier image">
    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
      <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-[#8e8e93]">Card properties</p><h2 className="text-xl font-semibold">Edit image</h2></div><button type="button" onClick={() => useTierListStore.getState().selectItem(null)} className="rounded-lg px-2 py-1 text-xl text-[#636366] hover:bg-[#f2f2f7]" aria-label="Close editor">×</button></div>
      <div className="grid gap-4">
        <label className="grid gap-1.5 text-sm font-medium">Label<input maxLength={80} className="rounded-xl border border-[#d1d1d6] px-3 py-2 outline-none focus:border-[#007aff]" value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} /></label>
        <div className="grid grid-cols-2 gap-3"><label className="grid gap-1.5 text-sm font-medium">Font<select className="rounded-xl border border-[#d1d1d6] px-3 py-2" value={item.labelFont ?? 'system-ui'} onChange={(event) => updateItem(item.id, { labelFont: event.target.value })}>{fonts.map((font) => <option key={font}>{font}</option>)}</select></label><label className="grid gap-1.5 text-sm font-medium">Size<input type="range" min="10" max="28" value={item.labelSize ?? 12} onChange={(event) => updateItem(item.id, { labelSize: Number(event.target.value) })} /></label></div>
        <label className="grid gap-1.5 text-sm font-medium">Label color<input type="color" className="h-10 w-full rounded-lg" value={item.labelColor ?? '#1c1c1e'} onChange={(event) => updateItem(item.id, { labelColor: event.target.value })} /></label>
        <label className="flex items-center justify-between text-sm font-medium">Banner mode<input type="checkbox" className="h-5 w-5 accent-[#007aff]" checked={item.bannerMode ?? false} onChange={(event) => updateItem(item.id, { bannerMode: event.target.checked })} /></label>
        <div className="grid gap-2 text-sm font-medium">Zoom<input type="range" min="1" max="3" step="0.1" value={item.zoom} onChange={(event) => updateItem(item.id, { zoom: Number(event.target.value) })} /></div>
        <div className="grid gap-2 text-sm font-medium">Horizontal crop<input type="range" min="0" max="100" value={item.cropX} onChange={(event) => updateItem(item.id, { cropX: Number(event.target.value) })} /></div>
        <div className="grid gap-2 text-sm font-medium">Vertical crop<input type="range" min="0" max="100" value={item.cropY} onChange={(event) => updateItem(item.id, { cropY: Number(event.target.value) })} /></div>
        <div className="flex flex-wrap gap-2"><button type="button" className="rounded-xl bg-[#007aff] px-3 py-2 text-sm font-semibold text-white" onClick={() => replaceInput.current?.click()}>Replace image</button><button type="button" className="rounded-xl bg-[#f2f2f7] px-3 py-2 text-sm font-semibold text-[#007aff]" onClick={() => togglePinned(item.id)}>{pinned ? 'Unpin image' : 'Pin image'}</button><input ref={replaceInput} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) updateItem(item.id, { imageUrl: URL.createObjectURL(file) }); event.currentTarget.value = '' }} /></div>
      </div>
    </div>
  </div>
}
