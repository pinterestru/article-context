import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/config/sites/static'

/**
 * The props for the Logo component. All are optional.
 */
interface LogoProps {
  className?: string
  /** The URL for the logo image. If not provided, uses site config. */
  logoUrl?: string | null
  /** The brand name text. If not provided, uses site config or falls back to translations. */
  brandName?: string | null
  /** The destination URL for the link. Defaults to '/'. */
  href?: string
}

/**
 * A flexible Logo component that displays a brand image and name,
 * wrapped in a link. It accepts optional props to override the
 * default image, name, and link. Falls back to site configuration
 * from the SITE_CONFIG environment variable when props are not provided.
 */
export function Logo({ className, logoUrl, brandName, href = '/' }: LogoProps) {
  // Use provided values, falling back to site config
  const finalBrandName = brandName || siteConfig.brand.name
  const finalLogoUrl = logoUrl || siteConfig.brand.logoUrl

  return (
    <Link
      href={href as Route}
      className={cn('text-foreground flex items-center gap-2 no-underline', className)}
      aria-label={`${finalBrandName} - Homepage`}
    >
      <Image
        src={finalLogoUrl}
        alt={`${finalBrandName} Logo`}
        width={32}
        height={32}
        priority // Ensures the logo loads quickly, important for LCP.
      />
      <span className="text-lg font-semibold">{finalBrandName}</span>
    </Link>
  )
}
