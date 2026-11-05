export type Tier = { id: string; name: string; color: string }

export type TierItem = {
  id: string
  name: string
  imageUrl: string
  tierId: string | null
  sortOrder: number
  cropX: number
  cropY: number
  zoom: number
  bannerMode?: boolean
}

export type ItemsByTier = Record<string, string[]>
