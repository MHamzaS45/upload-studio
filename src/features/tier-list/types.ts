// Describe one editable ranking level.
export type Tier = {
  id: string
  name: string
  color: string
}

// Keep visual edits separate from the stored image asset.
export type TierItem = {
  id: string
  name: string
  imageUrl: string
  tierId: string | null
  sortOrder: number
  cropX: number
  cropY: number
  zoom: number
}

export type ItemsByTier = Record<string, string[]>