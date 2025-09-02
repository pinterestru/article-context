/**
 * Analytics script injection component
 * Handles loading of analytics scripts in an optimized way
 */

import Script from 'next/script'
import { clientEnv } from '@/config/client-env'

export function AnalyticsScripts() {
  const gtmId = clientEnv.NEXT_PUBLIC_GTM_ID
  const ga4Id = clientEnv.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  const yandexId = clientEnv.NEXT_PUBLIC_YANDEX_METRICA_ID

  return (
    <>
      {/* Google Tag Manager */}
      {gtmId && (
        <>
          {/* GTM Script */}
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />

          {/* GTM NoScript fallback */}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* Google Analytics 4 (Direct) */}
      {ga4Id && (
        <>
          <Script
            id="ga4-script"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ga4Id}', {
                  send_page_view: false
                });
              `,
            }}
          />
        </>
      )}

      {/* Yandex Metrica */}
      {yandexId && (
        <Script
          id="yandex-metrica"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
              
              ym('${yandexId}', 'init', {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true
              });
            `,
          }}
        />
      )}
    </>
  )
}

/**
 * Head scripts for analytics (if needed for early initialization)
 */
export function AnalyticsHeadScripts() {
  const gtmId = clientEnv.NEXT_PUBLIC_GTM_ID

  if (!gtmId) return null

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.dataLayer = window.dataLayer || [];`,
      }}
    />
  )
}
