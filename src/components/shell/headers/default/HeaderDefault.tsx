import { Logo } from '@/components/shared/Logo'
import { Container } from '@/components/layout/Container'
import { getTranslations } from 'next-intl/server'
import { siteConfig } from '@/config/sites/static'



export async function HeaderDefault() {
  const t = await getTranslations('header')
  
  return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Container>
            <div className="flex h-14 items-center">
              <Logo 
                brandName={siteConfig.brand.name || t('brandName')} 
                logoUrl={siteConfig.brand.logoUrl}
              />
            </div>
          </Container>
        </header>
      )
}