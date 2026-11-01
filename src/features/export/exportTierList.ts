// Exporting tierlist map



import { createExportPlan, type PlannedRow } from './createExportPlan'
import { loadImage } from './loadImage'

export async function exportTierList(tiers: any[], itemsById: any) {
  // 1. Calculate the full layout dimensions
  const plan = createExportPlan(tiers)
  
  // 2. Configure a 2x scaled off-screen canvas
  const scale = 2
  const canvas = document.createElement('canvas')
  canvas.width = plan.width * scale
  canvas.height = plan.height * scale
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas rendering is unavailable.')

  // Set background and keep design units in logical pixels
  context.scale(scale, scale)
  context.fillStyle = '#020617' // slate-950
  context.fillRect(0, 0, plan.width, plan.height)

  // 3. Paint each row and its cropped image cards
  // Explicitly type each row as PlannedRow in the loop to eliminate Error 2339!
  for (const row of plan.rows as PlannedRow[]) {
    // Draw colorful row label block
    context.fillStyle = row.color || '#1e293b'
    context.fillRect(0, row.y, plan.labelWidth, row.height)

    // Draw label text
    context.fillStyle = '#ffffff'
    context.font = 'bold 16px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(row.name ?? '', plan.labelWidth / 2, row.y + row.height / 2)

    // Render cards for this tier row
    for (let index = 0; index < row.itemIds.length; index++) {
      const itemId = row.itemIds[index]
      const item = itemsById[itemId]
      if (!item) continue

      const colIndex = index % row.columns
      const lineIndex = Math.floor(index / row.columns)

      const cardX = plan.labelWidth + plan.gap + colIndex * (plan.cardWidth + plan.gap)
      const cardY = row.y + plan.gap + lineIndex * (plan.cardHeight + plan.gap)

      try {
        const img = await loadImage(item.imageUrl)
        
        // Calculate zoom slice dimension (higher zoom = smaller source window)
        const sliceWidth = img.width / (item.zoom || 1)
        const sliceHeight = img.height / (item.zoom || 1)
        
        // Calculate slice coordinates based on crop position percentages
        const sliceX = (img.width - sliceWidth) * ((item.cropX ?? 50) / 100)
        const sliceY = (img.height - sliceHeight) * ((item.cropY ?? 50) / 100)

        // Draw cropped card image
        context.drawImage(
          img,
          sliceX, sliceY, sliceWidth, sliceHeight,
          cardX, cardY, plan.cardWidth, plan.cardHeight - 20
        )
      } catch (err) {
        console.error(`Failed to paint card ${item.name}:`, err)
      }

      // Draw card label
      context.fillStyle = '#cbd5e1'
      context.font = '10px sans-serif'
      context.textAlign = 'center'
      context.fillText(item.name, cardX + plan.cardWidth / 2, cardY + plan.cardHeight - 8, plan.cardWidth)
    }
  }

  // 4. Encode and download PNG
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('PNG encoding failed.'))
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'tierstudio-list.png'
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
      resolve()
    }, 'image/png')
  })
}
