import { Container } from '@/components/layout/Container'
import { cn } from '@/lib/utils/cn'
import type { StaticPageProps } from '../../types'

export function CookiesPageDefault({ className }: StaticPageProps) {
  const lastUpdated = "January 1, 2024"
  
  return (
    <main className={cn('min-h-screen py-8 md:py-12', className)}>
      <Container>
        <article className="mx-auto max-w-4xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Cookie Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </header>
          
          <div className="prose max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">What Are Cookies</h2>
              <div className="text-muted-foreground">
                <p>Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">How We Use Cookies</h2>
              <div className="text-muted-foreground">
                <p>We use cookies for the following purposes:</p>
                <ul>
                  <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
                  <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our website</li>
                  <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
                  <li><strong>Marketing cookies:</strong> Track your activity across websites to deliver relevant advertisements</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Third-Party Cookies</h2>
              <div className="text-muted-foreground">
                <p>We use services from third parties that may set cookies on your device:</p>
                <ul>
                  <li><strong>Google Analytics:</strong> For analyzing website traffic and usage patterns</li>
                  <li><strong>Affiliate networks:</strong> To track referrals and commissions</li>
                  <li><strong>Social media platforms:</strong> For social sharing functionality</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Managing Cookies</h2>
              <div className="text-muted-foreground">
                <p>You can control and manage cookies through your browser settings. Most browsers allow you to:</p>
                <ul>
                  <li>View what cookies are stored and delete them individually</li>
                  <li>Block third-party cookies</li>
                  <li>Block all cookies from being set</li>
                  <li>Delete all cookies when you close your browser</li>
                </ul>
                <p>Please note that blocking cookies may impact your experience on our website.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Updates to This Policy</h2>
              <div className="text-muted-foreground">
                <p>We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
              </div>
            </section>
          </div>
        </article>
      </Container>
    </main>
  )
}