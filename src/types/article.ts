export interface Article {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  author: string
  publishedAt: string
  tags: string[]
  ecommerceStoreId?: string
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    [key: string]: unknown
  }
  error?: {
    code: string
    message: string
    details?: unknown
  }
}
