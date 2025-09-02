/**
 * Types for Telegram directory homepage
 */

export type CategoryKey = 
  | 'all' 
  | 'programming' 
  | 'marketing' 
  | 'management' 
  | 'design' 
  | 'analytics' 
  | 'lifestyle' 
  | 'languages' 
  | 'kids' 
  | 'content-creation' 
  | 'business-courses' 
  | 'higher-education'
  | 'ege'

export interface TelegramChannel {
  id: string
  name: string
  description: string
  category: CategoryKey
  url: string
  subscribers: string
  subscriberCount: number // для сортировки
  imageUrl: string
  avatar?: string // circular avatar image
  language: 'ru' | 'en' | 'mixed'
  featured?: boolean
  verified?: boolean
  rating?: number // 1-5
  lastUpdated?: string // "2025-01-15"
}

export interface TelegramChannelsData {
  channels: TelegramChannel[]
  categories: Record<CategoryKey, string>
}