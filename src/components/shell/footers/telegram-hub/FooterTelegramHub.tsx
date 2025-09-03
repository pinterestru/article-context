import { Container } from '@/components/layout/Container'
import Link from 'next/link'
import { siteConfig } from '@/config/sites/static'
import { Logo } from '@/components/shared/Logo'

export async function FooterTelegramHub() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <Container>
        <div className="flex flex-col gap-6 py-8 md:py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* About Section */}
            <div className="space-y-3">
              <Logo className="mb-3" href="#" />
              <p className="text-sm text-muted-foreground">
                {siteConfig.brand.name} — это коллекция образовательных каналов. 
                Мы помогаем найти качественный контент для вашего развития.
              </p>
              
              {/* Contact Information */}
              {siteConfig.contact && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  {siteConfig.contact.legalName && (
                    <p>{siteConfig.contact.legalName}</p>
                  )}
                  {siteConfig.contact.legalInfo && (
                    <p>{siteConfig.contact.legalInfo}</p>
                  )}
                  {siteConfig.contact.address && (
                    <p>{siteConfig.contact.address}</p>
                  )}
                  {siteConfig.contact.email && (
                    <p>Email: <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-foreground transition-colors">{siteConfig.contact.email}</a></p>
                  )}
                  {siteConfig.contact.phone && (
                    <p>Тел: <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-foreground transition-colors">{siteConfig.contact.phone}</a></p>
                  )}
                  {siteConfig.contact.businessHours && (
                    <p>{siteConfig.contact.businessHours}</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Quick Links Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Быстрые ссылки</h3>
              <nav className="flex flex-col space-y-2">
                <Link href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Главная
                </Link>
                <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Политика конфиденциальности
                </Link>
                <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Условия использования
                </Link>
              </nav>
            </div>
            
            {/* Legal Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Правовая информация</h3>
              <nav className="flex flex-col space-y-2">
                <Link href="/cookies" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Политика Cookie
                </Link>
                <Link href="/disclaimer" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Отказ от ответственности
                </Link>
                <a href="https://telegram.org/tos" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Условия Telegram
                </a>
              </nav>
            </div>
          </div>
          
          {/* Copyright Section */}
          <div className="flex flex-col items-center gap-4 border-t border-border pt-6 md:flex-row md:justify-between">
            <p className="text-sm text-muted-foreground">
              © {currentYear} {siteConfig.brand.name}. Все права защищены.
            </p>
            <p className="text-xs text-muted-foreground text-center md:text-right">
              {siteConfig.brand.name} не связан с Telegram Messenger LLP
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}