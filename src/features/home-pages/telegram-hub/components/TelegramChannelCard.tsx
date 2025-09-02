import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, CheckCircle, ExternalLink } from 'lucide-react'
import type { TelegramChannel } from '../types'

interface TelegramChannelCardProps {
  channel: TelegramChannel
}

export function TelegramChannelCard({ channel }: TelegramChannelCardProps) {
  // Compact card design with smaller circular avatar
  return (
    <div className="group bg-card border-border hover:border-primary/30 overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        {/* Small circular avatar */}
        <div className="relative flex-shrink-0">
          <div className="bg-muted h-12 w-12 overflow-hidden rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={channel.avatar || channel.imageUrl}
              alt={channel.name}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </div>
          {channel.verified && (
            <div className="absolute -right-1 -bottom-1 rounded-full bg-green-500 p-0.5">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="group-hover:text-primary line-clamp-1 text-sm font-medium transition-colors">
              {channel.name}
            </h3>
            {channel.featured && (
              <Badge className="bg-primary/10 text-primary border-primary/20 h-4 px-1.5 py-0 text-[10px]">
                TOP
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground mb-2 line-clamp-3 text-xs">{channel.description}</p>

          {/* Stats and action */}
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <Users className="h-3 w-3" />
              <span>{formatSubscribers(channel.subscriberCount)}</span>
            </div>

            <Button
              asChild
              size="sm"
              variant="ghost"
              className="hover:text-primary h-7 px-2 text-xs"
            >
              <a
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <span>Перейти в канал</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Format subscriber count to compact format
function formatSubscribers(count: number | string): string {
  const num = typeof count === 'string' ? parseInt(count.replace(/[^\d]/g, ''), 10) : count

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K`
  }
  return num.toString()
}
