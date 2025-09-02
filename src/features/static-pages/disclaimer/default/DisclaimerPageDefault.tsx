import { StaticPageLayout } from '../../components/StaticPageLayout'
import type { StaticPageProps } from '../../types'

export function DisclaimerPageDefault({ className }: StaticPageProps) {
  const lastUpdated = "Last updated: January 1, 2024"
  
  return (
    <StaticPageLayout 
      title="Disclaimer"
      lastUpdated={lastUpdated}
      className={className}
    >
      <section>
        <h2>General Disclaimer</h2>
        <p>The information provided on this website is for general informational purposes only. While we strive to keep the information up to date and accurate, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on the website.</p>
      </section>

      <section>
        <h2>Affiliate Disclosure</h2>
        <p>This website participates in affiliate marketing programs. We may receive compensation for purchases made through links on this site. These affiliate relationships do not influence our editorial content or recommendations. We only recommend products and services that we believe will provide value to our users.</p>
      </section>

      <section>
        <h2>No Professional Advice</h2>
        <p>The content on this website is not intended to be a substitute for professional advice. Always seek the advice of qualified professionals for any questions you may have regarding specific topics covered on this site.</p>
      </section>

      <section>
        <h2>External Links</h2>
        <p>This website may contain links to external websites that are not provided or maintained by us. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.</p>
      </section>

      <section>
        <h2>Limitation of Liability</h2>
        <p>In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.</p>
      </section>
    </StaticPageLayout>
  )
}