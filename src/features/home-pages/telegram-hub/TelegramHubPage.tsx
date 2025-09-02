import { Container } from '@/components/layout/Container'
import { TelegramChannelCard } from './components/TelegramChannelCard'
import { TelegramChannelsBanner } from './components/TelegramChannelsBanner.client'
import channelsData from './data/channels.json'
import type { CategoryKey, TelegramChannel } from './types'

// Type for the channels data structure
type ChannelsData = {
  channel_structure_example: Record<string, unknown>
  categories: Record<string, string>
  [key: string]: unknown[] | Record<string, unknown>
}

// Category order for display
const CATEGORY_ORDER: CategoryKey[] = [
  'programming',
  'marketing',
  'management',
  'design',
  'analytics',
  'languages',
  'ege',
]

const CHANNELS_PER_CATEGORY = 12

// Transform channels data from categories to flat array with category info
function transformChannelsData(): TelegramChannel[] {
  const channels: TelegramChannel[] = []

  // Process each category in the defined order
  CATEGORY_ORDER.forEach((categoryKey) => {
    const categoryData = (channelsData as ChannelsData)[categoryKey]
    // Skip if no data or not an array (like channel_structure_example)
    if (!categoryData || !Array.isArray(categoryData)) return

    const categoryChannels = categoryData as unknown[]
    categoryChannels.forEach((channel: unknown, index: number) => {
      const channelData = channel as Record<string, unknown>
      channels.push({
        ...channelData,
        id: `${categoryKey}-${index}`,
        category: categoryKey,
        subscriberCount: (channelData.subscriberCount as number) || 0,
        subscribers: `${(channelData.subscriberCount as number) || 0} подписчиков`,
        imageUrl: (channelData.avatar as string) || (channelData.imageUrl as string) || '',
        language: 'ru' as const,
        // Mark first 3 channels in each category as featured
        featured: index < 3,
      } as TelegramChannel)
    })
  })

  return channels
}

// Group channels by category for section rendering
function groupChannelsByCategory(
  allChannels: TelegramChannel[]
): Record<string, TelegramChannel[]> {
  const grouped: Record<string, TelegramChannel[]> = {}

  CATEGORY_ORDER.forEach((category) => {
    grouped[category] = allChannels
      .filter((channel) => channel.category === category)
      .slice(0, CHANNELS_PER_CATEGORY) // Take only first 12 channels per category
  })

  return grouped
}

export function TelegramHubPage() {
  // Server-side data processing
  const allChannels = transformChannelsData()
  const channelsByCategory = groupChannelsByCategory(allChannels)

  // Render all categories view
  const renderAllCategories = () => {
    return (
      <>
        {CATEGORY_ORDER.map((category) => {
          const categoryChannels = channelsByCategory[category]
          if (!categoryChannels || categoryChannels.length === 0) return null

          return (
            <section key={category} className="space-y-6">
              {/* Category header - centered */}
              <div className="text-center">
                <h2 className="text-2xl font-bold">
                  {(channelsData as ChannelsData).categories[category]}
                </h2>
              </div>

              {/* Channel grid - 3 columns */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryChannels.map((channel) => (
                  <TelegramChannelCard key={channel.id} channel={channel} />
                ))}
              </div>
            </section>
          )
        })}
      </>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="py-12">
        <TelegramChannelsBanner />
      </div>

      <Container>
        <div className="py-8">
          {/* Main content area */}
          <div className="space-y-16">{renderAllCategories()}</div>
        </div>
      </Container>
    </main>
  )
}
