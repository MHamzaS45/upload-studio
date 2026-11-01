/*
complete export layout calculation
Wrapping preserves the full width by having:

 Small lists avoid a wide empty canvas because the widest populated tier chooses the column count.
 Rows longer than 10 cards wrap onto additional lines.
 Every tier receives a height based on its own wrapped line count.
*/

const LABEL_WIDTH = 120
const CARD_WIDTH = 120
const CARD_HEIGHT = 120
const GAP = 8
const MAX_COLUMNS = 10

export type ExportTier = { 
  id: string; itemIds: string[]; name?: string; color?: string}


export type PlannedRow = ExportTier & {
  y: number
  height: number
  columns: number
}

export function createExportPlan(tiers: ExportTier[]) {
  // Let the widest populated tier choose the useful canvas width.
  
  const widest = Math.max(1, ...tiers.map((tier) => tier.itemIds.length))
  const columns = Math.min(MAX_COLUMNS, widest)
  const contentWidth = columns * (CARD_WIDTH + GAP) + GAP
  const width = LABEL_WIDTH + contentWidth

  let y = 0
  
  const rows: PlannedRow[] = tiers.map((tier) => {
    const lines = Math.max(1, Math.ceil(tier.itemIds.length / columns))
    const height = lines * (CARD_HEIGHT + GAP) + GAP
    const planned = { ...tier, y, height, columns }
    y += height
    return planned
  })

  return { width, height: y, rows, labelWidth: LABEL_WIDTH, cardWidth: CARD_WIDTH, cardHeight: CARD_HEIGHT, gap: GAP }
}