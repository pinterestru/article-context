import { StaticPageLayout } from '../../components/StaticPageLayout'
import type { StaticPageProps } from '../../types'

export function PrivacyPageDefault({ className }: StaticPageProps) {
  const lastUpdated = "Last updated: January 1, 2024"
  
  return (
    <StaticPageLayout 
      title="Privacy Policy"
      lastUpdated={lastUpdated}
      className={className}
    >
      <section>
        <h2>Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you use our services or contact us for support.</p>
        <ul>
          <li><strong>Usage Information:</strong> We collect information about your interactions with our website, including pages visited, links clicked, and other actions.</li>
          <li><strong>Device Information:</strong> We collect information about the device you use to access our services, including device type, operating system, and browser type.</li>
          <li><strong>Cookie Information:</strong> We use cookies and similar tracking technologies to collect information about your browsing activities.</li>
        </ul>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Detect, prevent, and address technical issues</li>
        </ul>
      </section>

      <section>
        <h2>Information Sharing</h2>
        <p>We do not sell, trade, or otherwise transfer your personal information to third parties. We may share your information in the following situations:</p>
        <ul>
                  <li><strong>With your consent:</strong> We may share your information with your explicit consent.</li>
                  <li><strong>For legal reasons:</strong> We may disclose your information if required by law or in response to valid legal requests.</li>
                  <li><strong>Business transfers:</strong> In connection with any merger, sale of company assets, or acquisition.</li>
        </ul>
      </section>

      <section>
        <h2>Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us through the contact information provided on our website.</p>
      </section>
    </StaticPageLayout>
  )
}