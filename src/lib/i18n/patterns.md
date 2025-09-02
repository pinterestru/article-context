# Translation Patterns for Next-Intl

This file demonstrates best practices for using translations in both Server and Client components.

## Server Component Pattern

Server components should use `getTranslations` from `next-intl/server`. This is an async function that loads translations on the server.

**Example:**
```tsx
import { getTranslations } from 'next-intl/server';

export default async function ServerComponent() {
  const t = await getTranslations('namespace');
  return <h1>{t('title')}</h1>;
}
```

## Client Component Pattern

Client components should use the `useTranslations` hook. This hook provides translations in the client.

**Example:**
```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function ClientComponent() {
  const t = useTranslations('namespace');
  return <button>{t('button.label')}</button>;
}
```

## Namespace Organization

Use namespaces to organize translations:

| Namespace | Purpose |
|-----------|---------|
| `common` | Shared translations across the app |
| `errors` | Error messages |
| `header`/`footer` | Shell components |
| `promocode` | Promocode-related text |
| `article` | Article-related text |
| `compliance` | Legal and compliance text |

**Example:**
```tsx
const t = await getTranslations('promocode');
// Access: promocode.button.copy, promocode.card.discount, etc.
```

## Interpolation

Use interpolation for dynamic values.

**Translation file:**
```json
{
  "welcome": "Welcome, {name}!",
  "items": "You have {count} items"
}
```

**Usage:**
```tsx
t('welcome', { name: 'John' }) // "Welcome, John!"
t('items', { count: 5 }) // "You have 5 items"
```

## Rich Text (HTML)

For translations containing HTML elements.

**Translation file:**
```json
{
  "terms": "By continuing, you agree to our <link>Terms of Service</link>"
}
```

**Usage:**
```tsx
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations();
  return (
    <p>
      {t.rich('terms', {
        link: (chunks) => <a href="/terms">{chunks}</a>
      })}
    </p>
  );
}
```

## Multiple Namespaces

Loading multiple namespaces in a single component.

**Server Component:**
```tsx
const tCommon = await getTranslations('common');
const tPromo = await getTranslations('promocode');
```

**Client Component:**
```tsx
const tCommon = useTranslations('common');
const tPromo = useTranslations('promocode');
```

## Error Handling

Handle missing translations gracefully.

**Provide fallback:**
```tsx
const title = t('page.title', { default: 'Default Title' });
```

**Check if key exists:**
```tsx
if (t.has('optional.key')) {
  return t('optional.key');
}
```

## Date & Time Formatting

Use the utility functions for locale-aware date formatting.

```tsx
import { formatDate, formatRelativeTime } from '@/lib/i18n/utils';

// Format date
formatDate(new Date()) // "December 25, 2023" (en) or "25 декабря 2023" (ru)

// Relative time
formatRelativeTime(date) // "2 hours ago" or "2 часа назад"
```

## Common Patterns to Avoid

### ❌ DON'T: Use translations in server actions directly

```tsx
async function serverAction() {
  const t = useTranslations(); // This won't work!
}
```

### ✅ DO: Pass translated strings from components

```tsx
function Component() {
  const t = useTranslations();
  const action = serverAction.bind(null, t('success.message'));
}
```

### ❌ DON'T: Concatenate translations

```tsx
const message = t('hello') + ' ' + t('world');
```

### ✅ DO: Use proper interpolation

```tsx
const message = t('greeting', { name: 'World' });
```

## Additional Tips

1. **Type Safety**: The translation keys are type-safe when using TypeScript
2. **Performance**: Translations are loaded at build time for server components
3. **Locale Detection**: The locale is determined from the `NEXT_LOCALE` cookie
4. **Fallback**: If a translation is missing, the key is displayed in development mode