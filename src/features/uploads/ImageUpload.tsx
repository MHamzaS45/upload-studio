import { useState } from 'react'
import { runImageQueue } from './runImageQueue'
import { useTierListStore } from '../tier-list/useTierListStore'
import { uploadAsset } from './uploadAsset'

export function ImageUpload() {
  const [progress, setProgress] = useState('Ready')
  const addItem = useTierListStore((state) => state.addItem)

  async function handleFiles(files: FileList | null) {
    if (!files) return
    try {
      setProgress('Optimizing images...')
      
      const images = await runImageQueue([...files], (done, total) => 
        setProgress(`Optimizing: ${done} of ${total}`)
      )
      let count = 1
      for (const { file, blob } of images) {
        setProgress(`Uploading ${count} of ${images.length}...`)

        const tempUrl = URL.createObjectURL(blob)
        try {
          const { publicUrl } = await uploadAsset(blob)
          addItem({
            id: crypto.randomUUID(),
            name: file.name,
            imageUrl: publicUrl, 
            tierId: null,
            sortOrder: count - 1,
            cropX: 50,
            cropY: 50,
            zoom: 1
          })
        } finally {
          
          URL.revokeObjectURL(tempUrl)
        }

        count++
      }

      setProgress(`${images.length} images uploaded!`)
    } catch (error) {
      console.error('Upload failed:', error)
      setProgress('Upload failed. Please check your storage bucket permissions.')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="cursor-pointer rounded-lg bg-cyan-300 px-4 py-2 font-bold text-slate-950">
        Import Images
        <input 
          className="sr-only" 
          type="file" 
          accept="image/*" 
          multiple 
          onChange={(event) => void handleFiles(event.target.files)} 
        />
      </label>
      <span aria-live="polite" className="text-sm text-slate-300">{progress}</span>
    </div>
  )
}