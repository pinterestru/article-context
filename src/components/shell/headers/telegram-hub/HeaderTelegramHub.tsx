import { Logo } from '@/components/shared/Logo'
import { Container } from '@/components/layout/Container'
import { siteConfig } from '@/config/sites/static'
import { VerificationBadge } from './VerificationBadge'

export async function HeaderTelegramHub() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Logo 
            brandName={siteConfig.brand.name} 
            logoUrl={siteConfig.brand.logoUrl}
          />
          <VerificationBadge />
        </div>
      </Container>
    </header>
  )
}