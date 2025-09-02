import type { PromocodeData } from '../types'

interface PromocodeSourceData {
  id: string
  title?: string
  name?: string
  code?: string
  description?: string
  targetUrl?: string
  storeName?: string
  storeLabel?: string
  store_name?: string
  storeImage?: string
  storeLogo?: string
  store_image?: string
  slug?: string
}

/**
 * Transform any promocode data source to the simplified PromocodeData structure
 */
export function transformToPromocodeData(source: PromocodeSourceData): PromocodeData | null {
  if (!source) return null

  // Title is required, if we can't get one, return null
  const title = source.title || source.name
  if (!title) return null

  // Direct mapping for already transformed data
  return {
    id: source.id,
    title,
    code: source.code,
    description: source.description,
    targetUrl: source.targetUrl,
    storeName: source.storeName || source.storeLabel || source.store_name,
    storeImage: source.storeImage || source.storeLogo || source.store_image,
    slug: source.slug,
  }
}
