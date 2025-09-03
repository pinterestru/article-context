import { Logo } from '@/components/shared/Logo'
import { Container } from '@/components/layout/Container'
import { siteConfig } from '@/config/sites/static'
import { VerificationBadge } from './VerificationBadge'

export async function HeaderTelegramHub() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="grid h-16 grid-cols-2 items-center md:grid-cols-3">
          <Logo 
            brandName={siteConfig.brand.name} 
            logoUrl={siteConfig.brand.logoUrl}
          />
          <div className="chide hidden md:flex md:justify-center">
            <VerificationBadge />
          </div>
          <div className="chide flex justify-end md:hidden">
            <VerificationBadge />
          </div>
          <div className="hidden md:block" />
        </div>
      </Container>
    </header>
  )
}