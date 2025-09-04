'use client'

import { usePathname } from 'next/navigation'
import { Megaphone } from 'lucide-react'

export function VerificationBadge() {
  const pathname = usePathname()

  if (pathname.startsWith('/article')) {
    // Show verification badge on article pages
    return (
      <div className="chide border-border bg-muted max-w-[200px] rounded-md border px-4 py-2">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-xs leading-tight font-medium">
            Мы вручную проверили
            <br />
            каждый промокод
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
      className="border-border bg-muted hover:bg-muted/80 max-w-[250px] cursor-pointer rounded-md border px-3 py-2 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="">
          <Megaphone className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-xs leading-tight font-medium">Продвинем ваш канал</p>
          <p className="text-primary mt-1 text-xs font-medium">Узнать подробнее</p>
        </div>
      </div>
    </div>
  )
}
