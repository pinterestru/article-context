# Translation Keys Structure

This document outlines the complete translation key structure needed for the affiliate-article-ui project.

## Translation Namespaces

### common
- loading: "Loading..."
- error: "Error"
- tryAgain: "Try again"
- tryAgainButton: "Try Again"
- refreshPage: "Refresh Page"
- returnHome: "Return Home"
- goHome: "Go home"
- close: "Close"
- copied: "Copied!"
- reportIssue: "Report issue"
- home: "Home"

### errors
- 404:
  - title: "Page not found"
  - description: "The page you are looking for doesn't exist or has been moved."
  - articleTitle: "Article Not Found"
  - articleDescription: "The article you're looking for doesn't exist."
- general:
  - title: "Something went wrong!"
  - description: "An unexpected error occurred. Our team has been notified."
  - reset: "Try resetting the page"
- article:
  - title: "Unable to Load Article"
  - notFound: "Article not found"
  - errorLoading: "Error loading article"
  - description: "We encountered an error while loading this article. Please try again or return to the homepage."
  - technicalDetails: "Error details"

### header
- brandName: "Affiliate UI"

### footer
- about:
  - title: "About"
  - description: "Your trusted source for the best affiliate deals and promocodes."
- quickLinks:
  - title: "Quick Links"
  - home: "Home"
  - privacyPolicy: "Privacy Policy"
  - termsOfService: "Terms of Service"
  - sitemap: "Sitemap"
  - cookiePolicy: "Cookie Policy"
- contact:
  - title: "Contact"
  - email: "support@example.com"
  - hours: "24/7 Support"
- copyright: "© {year} Affiliate UI. All rights reserved."

### promocode
- card:
  - discount: "{discount}% OFF"
  - flatDiscount: "${amount} OFF"
  - expiresIn: "Expires {when}"
  - today: "today"
  - tomorrow: "tomorrow"
  - inDays: "in {days} days"
  - expired: "Expired"
- button:
  - clickToCopy: "Click to copy"
  - clickToReveal: "Click to reveal"
  - copied: "Copied!"
- error:
  - failedToLoad: "Failed to load promocode"
  - tryAgain: "Try again"
- toast:
  - copySuccess: "Promocode copied to clipboard!"
  - copyError: "Failed to copy promocode"
  - trackingError: "Failed to track click"

### article
- list:
  - noArticles: "No articles found"
  - errorLoading: "Error loading articles"
- metadata:
  - readingTime: "{minutes} min read"
  - publishedOn: "Published on {date}"

### compliance
- affiliate:
  - disclosure: "This article contains affiliate links. We may earn a commission on purchases made through these links at no extra cost to you."
  - transparencyNote: "We believe in transparency and only recommend products we trust."
- gdpr:
  - notice: "We use cookies to enhance your experience. By continuing to browse, you agree to our use of cookies."
  - privacyLink: "Privacy Policy"
  - managePreferences: "Manage Preferences"

### theme
- toggle:
  - light: "Switch to light theme"
  - dark: "Switch to dark theme"
  - system: "Switch to system theme"

### home
- hero:
  - title: "Welcome to Affiliate Article UI"
  - subtitle: "Modern affiliate article system with advanced features"
- features:
  - title: "Features"
  - cloaking: "Advanced Cloaking"
  - promocodes: "Interactive Promocodes"
  - analytics: "Comprehensive Analytics"