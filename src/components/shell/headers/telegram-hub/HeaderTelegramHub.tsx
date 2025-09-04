import { Logo } from '@/components/shared/Logo'
import { Container } from '@/components/layout/Container'
import { siteConfig } from '@/config/sites/static'
import { VerificationBadge } from './VerificationBadge'

export async function HeaderTelegramHub() {
  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Logo brandName={siteConfig.brand.name} logoUrl={siteConfig.brand.logoUrl} />
          <VerificationBadge />
        </div>
      </Container>
    </header>
  )
}
