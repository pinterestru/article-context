'use client'

import { usePathname } from 'next/navigation'

export function VerificationBadge() {
  const pathname = usePathname()
  
  // Only show on article pages
  if (!pathname.startsWith('/article')) {
    return null
  }

  return (
    <div className="max-w-[200px] rounded-md border border-border bg-muted px-4 py-2">
      <p className="text-xs font-medium leading-tight text-muted-foreground">
        Мы вручную проверили<br />каждый промокод
      </p>
    </div>
  )
}