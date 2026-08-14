# VoiceRAG Design System

## Overview
VoiceRAG uses a warm, research-lab aesthetic with terminal-inspired typography and ASCII bracket markers. The design balances technical precision with approachable warmth.

## Typography
- **Primary Font**: Berkeley Mono (via Google Fonts or self-hosted)
- **Fallback**: JetBrains Mono → monospace
- **Display Font**: Same as primary (monospace throughout for research-lab feel)

## Color Palette
- **Canvas**: Warm cream (#FFF8F0) - main background
- **Foreground**: Near-black (#1A1A1A) - primary text
- **Card**: White (#FFFFFF) with subtle warm tint
- **Primary**: Deep navy (#1E3A5F) - buttons, links, active states
- **Accent**: Warm amber (#D97706) - highlights, warnings
- **Success**: Forest green (#059669)
- **Destructive**: Deep red (#DC2626)
- **Muted**: Warm gray (#6B7280)
- **Border**: Light warm gray (#E5E7EB)

## ASCII Bracket Markers
Used for section headers, status indicators, and navigation labels:
```
[SECTION NAME]
[STATUS]
[LABEL]
```

## Border Radius
- **Small**: 4px (0.25rem) - buttons, badges, small elements
- **Medium**: 8px (0.5rem) - cards, inputs
- **Large**: 12px (0.75rem) - modals, dropdowns

## Design Principles
1. **Research Lab Aesthetic**: Clean, organized, slightly technical
2. **Warmth Through Typography**: Monospace feels precise but friendly
3. **Clear Hierarchy**: Section headers use ASCII brackets for emphasis
4. **Status Clarity**: Color-coded indicators with ASCII symbols
5. **Consistent Spacing**: 8px grid system (space-2, space-4, space-6, space-8)

## Component Patterns

### Section Headers
```tsx
<div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-foreground">
  <span className="text-primary">[</span>
  SECTION NAME
  <span className="text-primary">]</span>
</div>
```

### Status Badges
```tsx
<div className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-xs font-bold">
  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
  STATUS
</div>
```

### Card Headers
```tsx
<div className="border-b border-border px-4 py-3">
  <div className="flex items-center justify-between">
    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
      [CARD TITLE]
    </h3>
    <Badge variant="success">ACTIVE</Badge>
  </div>
</div>
```

## Responsive Breakpoints
- **Mobile**: < 640px (single column, stacked)
- **Tablet**: 640px - 1024px (2 columns where appropriate)
- **Desktop**: > 1024px (full layout with sidebar)

## Animation Guidelines
- **Page transitions**: Subtle fade-in (opacity 0→1, 200ms)
- **Hover states**: Scale 1.02, shadow elevation
- **Active states**: Scale 0.98
- **Loading indicators**: Pulse animation on status dots
