import { Container } from '@/components/layout/Container'
import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'

interface StaticPageLayoutProps {
  title: string
  lastUpdated: string
  children: ReactNode
  className?: string
}

export function StaticPageLayout({ title, lastUpdated, children, className }: StaticPageLayoutProps) {
  return (
    <main className={cn('min-h-screen py-8 md:py-12', className)}>
      <Container>
        <article className="mx-auto max-w-4xl">
          <header className="mb-8 md:mb-12">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lastUpdated}
            </p>
          </header>
          
          <div className="prose max-w-none">
            {children}
          </div>
        </article>
      </Container>
    </main>
  )
}