import { TelegramChannelCard } from './TelegramChannelCard'
import type { TelegramChannel } from '../types'

interface TelegramChannelGridProps {
  channels: TelegramChannel[]
}

export function TelegramChannelGrid({ channels }: TelegramChannelGridProps) {
  if (channels.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Каналы не найдены</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {channels.map((channel) => (
        <TelegramChannelCard key={channel.id} channel={channel} />
      ))}
    </div>
  )
}