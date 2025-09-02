# Build-Time Theme System

This project implements a build-time theming system that allows complete visual transformation through environment variables. Each build produces a website with a specific theme baked into the CSS.

## How It Works

1. **Theme Selection**: Set the `THEME_NAME` environment variable before building
2. **Theme Copy**: A build script copies the selected theme to `active-theme.css`
3. **CSS Import**: The active theme is imported into the global styles
4. **Build Output**: The theme is compiled into the final CSS bundle

## Available Themes

- **`default`**: Clean, professional design with blue accents
- **`dark`**: Dark backgrounds with high contrast and cyan accents
- **`corporate`**: Traditional, neutral colors with a professional feel
- **`modern`**: Bold gradients, vibrant colors, contemporary design

## Usage

### Development

```bash
# Use default theme
npm run dev

# Use a specific theme
THEME_NAME=dark npm run dev
```

### Production Build

```bash
# Build with default theme
npm run build

# Build with specific theme
THEME_NAME=modern npm run build
```

### Environment Variables

Add to your `.env` file:

```bash
THEME_NAME=default  # Options: default, dark, corporate, modern
```

## Creating Custom Themes

1. Create a new CSS file in `src/styles/themes/`
2. Copy the structure from an existing theme
3. Override all CSS variables with your custom values
4. Add the theme name to the `env.ts` schema

Example custom theme (`src/styles/themes/brand-x.css`):

```css
/**
 * Brand X Theme - Custom colors and styling
 */

@layer theme {
  :root {
    /* Colors */
    --color-background: #your-color;
    --color-foreground: #your-color;
    /* ... all other variables */
  }
}
```

Then update `src/config/env.ts`:

```typescript
THEME_NAME: z.enum(['default', 'dark', 'corporate', 'modern', 'brand-x']).default('default'),
```

## Theme Structure

Each theme must define these CSS variables:

### Colors

- Background and foreground colors
- Primary, secondary, accent colors
- Semantic colors (success, warning, error, info)
- Component-specific colors (card, featured)
- Gradient colors

### Typography

- Font families (sans, mono)

### Spacing & Layout

- Container padding
- Section spacing
- Border radius values

### Effects

- Animation durations
- Shadow values

## Architecture Benefits

- **Zero Runtime Overhead**: Theme is baked into CSS at build time
- **Simple Deployment**: Just change env variable and rebuild
- **Complete Transformation**: Every visual aspect can be customized
- **Type Safety**: Theme validated at build time
- **Easy Partner Customization**: Add new themes without touching core code

## Technical Implementation

1. **Theme Files**: Located in `src/styles/themes/`
2. **Selection Script**: `scripts/select-theme.mjs` copies the selected theme
3. **Git Ignored**: `src/styles/active-theme.css` is generated and not committed
4. **Build Integration**: Theme selection runs automatically before dev/build

## Best Practices

1. **Test All Themes**: Ensure components work with all theme variations
2. **Use CSS Variables**: Never hardcode colors in components
3. **Document Variables**: Comment what each variable controls
4. **Maintain Consistency**: Keep the same variable structure across themes
5. **Preview Themes**: Build and test each theme before deployment
