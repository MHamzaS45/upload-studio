import { useEffect, useState } from 'react'
import { useTierListStore } from '../tier-list/useTierListStore'

const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const MAX_FILE_SIZE = 5 * 1024 * 1024

export function ImageUpload() {
  const [message, setMessage] = useState('Ready to import')
  const addItem = useTierListStore((state) => state.addItem)

  function addImage(file: File) {
    if (!ACCEPTED_TYPES.has(file.type)) { setMessage('Only PNG, JPEG, and WebP images are allowed.'); return }
    if (file.size > MAX_FILE_SIZE) { setMessage('Images must be smaller than 5 MB.'); return }
    const imageUrl = URL.createObjectURL(file)
    addItem({ id: crypto.randomUUID(), name: file.name || 'Pasted image', imageUrl, tierId: null, sortOrder: Date.now(), cropX: 50, cropY: 50, zoom: 1, bannerMode: true })
    setMessage('Image added to unranked')
  }

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const file = Array.from(event.clipboardData?.files ?? [])[0]
      if (!file) return
      event.preventDefault()
      addImage(file)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  })

  return <div className="flex flex-wrap items-center gap-3">
    <label className="cursor-pointer rounded-xl bg-[#007aff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#006ee6]">Import images<input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => Array.from(event.target.files ?? []).forEach(addImage)} /></label>
    <span className="text-sm text-[#636366]" aria-live="polite">{message}</span>
    <span className="ml-auto text-xs text-[#8e8e93]">Ctrl/⌘ V to paste · PNG, JPEG, WebP · max 5 MB</span>
  </div>
}
