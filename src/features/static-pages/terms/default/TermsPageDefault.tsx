import { Container } from '@/components/layout/Container'
import { cn } from '@/lib/utils/cn'
import type { StaticPageProps } from '../../types'

export function TermsPageDefault({ className }: StaticPageProps) {
  const lastUpdated = "January 1, 2024"
  
  return (
    <main className={cn('min-h-screen py-8 md:py-12', className)}>
      <Container>
        <article className="mx-auto max-w-4xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </header>
          
          <div className="prose max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Acceptance of Terms</h2>
              <div className="text-muted-foreground">
                <p>By accessing and using this website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Use License</h2>
              <div className="text-muted-foreground">
                <p>Permission is granted to temporarily access the materials on our website for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul>
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or public display</li>
                  <li>Attempt to reverse engineer any software contained on our website</li>
                  <li>Remove any copyright or proprietary notations from the materials</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Disclaimer</h2>
              <div className="text-muted-foreground">
                <p>The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Limitations</h2>
              <div className="text-muted-foreground">
                <p>In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use materials on our website, even if we have been notified of the possibility of such damage.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Affiliate Links</h2>
              <div className="text-muted-foreground">
                <p>This website contains affiliate links. We may receive a commission for purchases made through these links. This does not affect the price you pay for products or services.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Modifications</h2>
              <div className="text-muted-foreground">
                <p>We may revise these terms of service at any time without notice. By using this website, you agree to be bound by the current version of these terms of service.</p>
              </div>
            </section>
          </div>
        </article>
      </Container>
    </main>
  )
}