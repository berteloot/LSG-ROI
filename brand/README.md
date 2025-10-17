# LSG Brand System

This directory contains the complete brand system for Lean Solutions Group, providing consistent design tokens, components, and styling across the application.

## Files Overview

- `tokens.json` - Centralized design tokens (colors, typography, layout guidelines)
- `theme.css` - CSS custom properties for colors and typography
- `fonts.css` - FormaDJR font definitions (with Inter fallback)
- `motion.css` - Animation primitives following LSG motion principles
- `Logo.tsx` - Logo component with multiple variants
- `IconChevron.tsx` - Core chevron icon component
- `IconArrow.tsx` - Arrow icon component
- `IconCheck.tsx` - Check/checkmark icon component
- `IconClose.tsx` - Close/X icon component
- `usage-examples.tsx` - Example components showing proper usage

## Quick Start

The brand system is automatically imported in `layout.tsx`. You can start using the components and classes immediately:

```tsx
import Logo from '@/brand/Logo';
import { PrimaryButton, AccentChip } from '@/brand/usage-examples';

// Use the logo
<Logo variant="main" />
<Logo variant="shorthand" size={24} />
<Logo variant="stacked" color="var(--c-trust-navy)" />

// Use brand colors in Tailwind
<div className="bg-lean-blue text-white">
<div className="bg-neutral-paper text-lean-midnight">
<div className="bg-accent-aqua text-lean-trust">

// Use motion classes
<div className="lsg-reveal">Content appears with reveal animation</div>
<button className="lsg-emphasize">Button with emphasis animation</button>
```

## Color Usage Guidelines

- **Primary blues and neutrals**: Use for 30%+ of your design
- **Accent colors**: Use sparingly for highlights and special elements
- **Orange**: Use only for small accents and micro-interactions

## Logo Variants

- `main` - Full "Lean Solutions Group" with chevron
- `stacked` - Two-line stacked version
- `shorthand` - Compact "LSG" version

## Motion Principles

- `lsg-reveal` - Gentle downward reveal animation
- `lsg-emphasize` - Subtle scale emphasis
- `lsg-volume` - Volumetric 3D flip effect

## Typography

The system uses FormaDJR as the primary font with Inter as fallback. All typography is defined through CSS custom properties and Tailwind classes.

## Icon Guidelines

When creating new icons:
- Use 32x32 viewBox
- 2px stroke width
- Geometric, strong silhouettes
- Maintain optical balance across the set

## Brand Colors

### Primary Blues
- `--c-lean-blue: #0099ff` - Main brand color
- `--c-momentum-blue: #006ef2` - Secondary blue
- `--c-trust-navy: #002e66` - Dark navy
- `--c-midnight-core: #001f38` - Darkest blue

### Neutrals
- `--c-soft-slate: #e2e9ea` - Light gray
- `--c-paper-offwhite: #f5f5f7` - Background white
- `--c-altitude-white: #e3e8eb` - Off-white

### Accents
- `--c-lavender-mist: #a3a6fa` - Purple accent
- `--c-aqua-breeze: #abe8e5` - Aqua accent
- `--c-solar-orange: #ff8221` - Orange accent (use sparingly)
- `--c-sandstone: #d6d1bd` - Beige accent

## Usage Examples

See `usage-examples.tsx` for comprehensive examples of:
- Button variants and states
- Card layouts
- Input components
- Navigation elements
- Motion animations
- Icon usage

## Integration

The brand system is automatically loaded in `layout.tsx` and extends Tailwind CSS with:
- Custom color palette
- Typography scale
- Spacing system
- Animation classes
- Component utilities

All components follow LSG design principles and are fully accessible.
