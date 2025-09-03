'use client'

import { usePathname } from 'next/navigation'
import { Megaphone } from 'lucide-react'

const channelData = {
  name: "Навигатор ЕГЭ и ОГЭ",
  description: "Путеводитель по подготовке к экзаменам",
  url: "https://t.me/navigator_ege",
  subscriberCount: 7127,
  avatar: "https://static2.tgstat.ru/channels/_100/8e/8ef63a2c85d274efc67025c8dac3b629.jpg"
}

export function VerificationBadge() {
  const pathname = usePathname()
  
  if (pathname.startsWith('/article')) {
    // Show verification badge on article pages
    return (
      <div className="max-w-[200px] rounded-md border border-border bg-muted px-4 py-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium leading-tight text-muted-foreground">
            Мы вручную проверили<br />каждый промокод
          </p>
        </div>
      </div>
    )
  }

  const handleScrollToForm = () => {
    const footer = document.querySelector('footer')
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Show promotional badge for footer form on all other pages
  return (
    <div 
      onClick={handleScrollToForm}
      className="max-w-[250px] rounded-md border border-border bg-muted px-3 py-2 cursor-pointer hover:bg-muted/80 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="">
          <Megaphone className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground leading-tight">
            Продвинем ваш канал
          </p>
          <p className="text-xs text-primary font-medium mt-1">
            Узнать подробнее
          </p>
        </div>
      </div>
    </div>
  )
}