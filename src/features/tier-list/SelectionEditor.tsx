// Card detail editor - control zoom, card name, crop X and Y inputs

import { useTierListStore } from './useTierListStore'

export function SelectionEditor() {
  const selectedId = useTierListStore((state) => state.selectedItemId)
  const item = useTierListStore((state) => selectedId ? state.itemsById[selectedId] : null)
  const updateItem = useTierListStore((state) => state.updateItem)

  if (!item) {
    return (
         <aside className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
            Select a card to adjust name, zoom and crop .
         </aside>
    )
  }

  return (
    <aside className="grid gap-4 rounded-xl border border-slate-700 bg-slate-900 p-4 shadow -xl">
      <label className="flex flex-col gap-1 text-sm font-semibold text-slate-300">
        Name
        <input 
          className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={item.name} 
          onChange={(event) => updateItem(item.id, { name: event.target.value })} 
        />
      </label>
      
      <label className="flex flex-col gap-1 text-sm font-semibold text-slate-300">
        Zoom ({item.zoom}x)
        <input 
          type="range" 
          min="1" 
          max="3" 
          step="0.1" 
          value={item.zoom} 
          onChange={(event) => updateItem(item.id, { zoom: Number(event.target.value) })} 
          className = "h-2 w-full cursor-pointer rounded-lg bg-slate-700-accent-cyan-400"
        />
      </label>
      
      <label className="flex flex-col gap-1 text-sm font-semibold text-slate-300">
        Crop X
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={item.cropX} 
          onChange={(event) => updateItem(item.id, { cropX: Number(event.target.value) })} 
          className="h-2 w-full cursor-pointer rounded-lg bg-slate-700 accent-cyan-400"
        />
      </label>
      
      <label className="flex flex-col gap-1 text-sm font-semibold text-slate-300">
        Crop Y
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={item.cropY} 
          onChange={(event) => updateItem(item.id, { cropY: Number(event.target.value) })} 
          className="h-2 w-full cursor-pointer rounded-lg bg-slate-700 accent-cyan-400"
        />
      </label>
    </aside>
  )
}