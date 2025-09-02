# User Interface Design Goals

## Overall UX Vision
The interface must deliver an immediate, frictionless experience for high-intent promocode seekers while maintaining the appearance of a legitimate review article. The design should prioritize mobile-first interactions with prominent promocode widgets that feel native to the content, not intrusive overlays. Visual hierarchy must guide users to conversion actions within 15-30 seconds.

## Key Interaction Paradigms
- **One-click code reveal**: Single tap to reveal and auto-copy promocodes with smooth animations
- **Instant visual feedback**: Clear confirmation when codes are copied with animated success states
- **Progressive disclosure**: Show discount amount first, then reveal code on interaction with slide/fade effects
- **Contextual placement**: Promocode widgets integrated naturally within article flow
- **Mobile gesture optimization**: Large touch targets, swipe-friendly navigation
- **Animated transitions**: Smooth reveal animations for code display and copy confirmation

## Core Screens and Views
- Article Landing Page (primary view with review content + promocode widgets)
- Promocode Modal/Dialog (expanded view with code details and CTA)
- Loading State (skeleton screen while fetching article/promocodes)
- Error State (fallback for API failures, maintains compliant appearance)

## Accessibility: WCAG AA
Full WCAG AA compliance to ensure broad accessibility and reduce detection patterns. Includes proper ARIA labels, keyboard navigation, and screen reader support.

## Branding
Clean, modern design that adapts to partner brand colors via CSS variables. Neutral base theme with accent colors pulled from partner logos. Typography should feel editorial/review-like rather than promotional.

## Target Device and Platforms: Web Responsive
- Primary: Mobile web (70% of traffic) - optimized for iOS Safari and Chrome Android
- Secondary: Desktop browsers - full responsive design from 320px to 4K
- Progressive enhancement approach - core functionality works without JavaScript
