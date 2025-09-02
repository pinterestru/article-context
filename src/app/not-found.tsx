import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/shared/Button'

export default async function NotFound() {
  const t = await getTranslations('errors.404');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-foreground mb-2 text-6xl font-bold">404</h1>
        <h2 className="text-foreground mb-4 text-2xl font-semibold">{t('title')}</h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-md">
          {t('description')}
        </p>
        <Link href="/">
          <Button color="primary" size="lg">
            {t('returnHome')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
