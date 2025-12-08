# Tic-Tac-Toe Game Design Guidelines

## Design Approach

**Feminine Rose/Blush Pink Aesthetic**: A sophisticated, elegant design specifically for women aged 25-40. The theme features soft pink tones, floral decorative elements, and delicate accents like hearts and flowers. Think refined femininity - not childish or overly cute, but graceful and modern like premium lifestyle apps (Pinterest, Glossier, Charlotte Tilbury).

**Core Principles**:
- Sophisticated femininity: Elegant pink palette with tasteful floral accents
- Clean, uncluttered interface: Focus on the game board as the hero element
- Polished, premium feel: Attention to detail in every element with decorative touches
- Warm and inviting: Soft colors and gentle animations create a welcoming atmosphere

## Color System

**Light Mode - Rose/Blush Pink Theme**:
- Background: Soft blush pink (HSL 340 30% 97%)
- Cards: Warm off-white with pink undertone (HSL 340 25% 98%)
- Primary: Vibrant rose pink (HSL 340 72% 55%) - used for player X, buttons, accents
- Muted: Gentle pink-gray (HSL 340 20% 92%)
- Borders: Soft pink-tinted borders (HSL 340 20% 90%)
- Text: Deep rose-tinted dark (HSL 340 25% 15%)

**Dark Mode - Rose/Blush Pink Theme**:
- Background: Deep rose-charcoal (HSL 340 20% 8%)
- Cards: Elevated rose-dark (HSL 340 18% 11%)
- Primary: Brighter rose pink (HSL 340 72% 62%) - more luminous for dark mode
- Muted: Dark pink-charcoal (HSL 340 18% 16%)
- All colors maintain the rose/pink undertone even in dark mode

## Decorative Elements

**Floral Accents**:
- Corner flourishes: Abstract floral SVG patterns in page corners (low opacity)
- Scattered flower decorations: Subtle background pattern elements
- Flower2 icons from Lucide: Used in headers, buttons, and modals
- All floral elements at 10-30% opacity to remain subtle

**Heart Accents**:
- Filled hearts in primary color for special moments (win celebrations)
- Heart icons in turn indicators and score separators
- Hearts as list item bullets in tips sections

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, and 24 consistently

**Game Layout Structure**:
- Single-column centered layout with max-width container (max-w-md)
- Decorative floral corners in all four page corners
- Background flower decorations scattered subtly
- Game board as the central focal point (large, prominent, centered)
- Score card with decorative dividers above the board
- Header with flower icon and title

## Typography

**Font Selection**:
- Primary: DM Sans (headings, UI elements) - modern, friendly, professional
- Body: System fonts for clean readability

**Type Hierarchy**:
- Game Title/Header: text-xl to text-2xl, font-medium, tracking-tight
- Status Messages: text-lg, font-medium
- Board Symbols (X/O): text-5xl to text-7xl, stroke-[3]
- Button Text: text-lg, font-medium
- Promo Code: text-3xl to text-4xl, font-bold, tracking-wider, font-mono, text-primary
- Secondary Text: text-sm, font-normal

## Component Library

### Game Board
- 3x3 grid with gap-3 to gap-4
- Cells with rounded-2xl corners
- Subtle pink-tinted borders (border-primary/10)
- Hover: Scale up slightly, enhance shadow, border becomes more visible
- Winning cells: Gradient background with ring and shadow in primary color

### Cell States
- Empty: Clean with faint heart on hover
- Player (X): Primary rose color, bold stroke, slight drop shadow
- Computer (O): Muted foreground color
- Winning combination: Gradient background, ring, and shadow highlight

### Score Card
- Card with overflow-visible for decorative elements
- Heart decoration centered above the card
- Circular avatar-style icons for player/computer
- Flower decorations as dividers between score sections
- Gradient divider lines

### Modals/Overlays
- **Win Modal**: 
  - Flower decorations in corners
  - Animated sparkle icon with rotation effect
  - Hearts flanking "Congratulations!" title
  - Gradient promo code container with border
  - Rounded-full button with flower icon and shadow

- **Loss Modal**: 
  - Single flower decoration at top
  - Tips section with heart bullets
  - Sparkle icon in tips header
  - Encouraging "Try Again" message with flower icon

- **Draw Modal**: 
  - Flower decorations in corners
  - Heart between player symbols
  - Animated pulse on X and O icons
  - Play Again button with flower icon

### Buttons
- Primary CTA: Rounded-full, shadow-lg with shadow-primary/20
- Flower icons in buttons for feminine touch
- Outline variant with border-primary/30

### Header
- Flower2 icon next to game title
- Backdrop blur with semi-transparent background
- Clean border separation

## Animations

**Framer Motion Effects**:
- Symbol appearance: Scale + rotate from -180 to 0 for playful entrance
- Modal entrance: Scale from 0.9 + slide up with spring physics
- Win modal sparkle: Gentle rotation animation (10deg/-10deg oscillation)
- X/O icons in draw modal: Subtle pulse scaling effect

**CSS Animations**:
- Flower icons: animate-spin for loading states
- Pulse animation for thinking/loading text

## Responsive Behavior

**Mobile-First**:
- Touch-optimized cells (minimum 80px touch target)
- Full-width modals on mobile
- Condensed header spacing

**Breakpoint Adjustments**:
- md: Larger board cells, increased padding
- lg: Maximum visual comfort

## Accessibility

- Clear focus states (ring-2 ring-primary ring-offset-2)
- Keyboard navigation support
- ARIA labels on all interactive elements
- High contrast maintained between text and backgrounds
- Icon aria-hidden="true" with descriptive button labels

## Technical Assets

**Icons (Lucide React)**:
- X (player moves)
- Circle (computer moves)
- Flower2 (decorative, buttons, header)
- Heart (decorative, accents)
- Sparkles (win celebration)
- Copy / Check (promo code copy)
- RotateCcw (reset game)

**Custom SVG Components**:
- FloralDecoration: 8-petal flower pattern for background
- FloralCorner: Abstract floral vine pattern for page corners

---

**Final Notes**: This design creates an elegant, feminine experience with rose/blush pink tones, tasteful floral decorations, and heart accents. The aesthetic appeals to women 25-40 by balancing sophistication with warmth, creating a premium feel while remaining playful and inviting.
