# Tic-Tac-Toe Game Design Guidelines

## Design Approach

**Reference-Based Aesthetic**: Draw inspiration from modern lifestyle apps appealing to women 25-40 (Pinterest, Headspace, Calm, Spotify's softer interfaces). The game should feel elegant, playful yet sophisticated - not childish or overly cute. Think refined casual, like a well-designed mobile game rather than a basic web game.

**Core Principles**:
- Sophisticated playfulness: Mature design with delightful micro-moments
- Clean, uncluttered interface: Focus on the game board as the hero element
- Polished, premium feel: Attention to detail in every element
- Approachable yet refined: Welcoming without being overly decorative

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, and 24 consistently (p-4, gap-6, mb-8, etc.)

**Game Layout Structure**:
- Single-column centered layout with max-width container (max-w-2xl)
- Game board as the central focal point (large, prominent, centered)
- Score/status bar above the board (compact, elegant)
- Action buttons/modals overlay the interface when triggered
- Responsive: Full mobile-friendly with adequate touch targets (minimum 48px)

## Typography

**Font Selection**: Use 2 Google Fonts via CDN
- Primary: DM Sans (headings, UI elements) - modern, friendly, professional
- Secondary: Inter (body text, game status) - clean, highly legible

**Type Hierarchy**:
- Game Title/Header: text-2xl to text-3xl, font-medium
- Status Messages: text-lg, font-normal
- Board Symbols (X/O): text-6xl to text-7xl, font-bold
- Button Text: text-base, font-medium
- Promo Code: text-4xl, font-bold, tracking-wider (monospace treatment)
- Secondary Text: text-sm, font-normal

## Component Library

### Game Board
- 3x3 grid with generous spacing (gap-4)
- Square cells with aspect-ratio-square enforcement
- Large, easily tappable cells (minimum 80px on mobile, 120px on desktop)
- Rounded corners (rounded-xl to rounded-2xl)
- Subtle depth treatment (soft shadows, not heavy drop shadows)
- Hover states: gentle scale transform (scale-105) and slight shadow increase
- Active cells: Clear visual feedback without being jarring

### Cell States
- Empty: Clean, inviting appearance with subtle border
- Player (X): Distinctive styling, bold presence
- Computer (O): Different visual treatment from X, equally bold
- Winning combination: Enhanced highlight treatment, celebratory feel

### Modals/Overlays
- **Win Modal**: Celebratory without being overwhelming
  - Large promo code display (center focus)
  - Encouraging congratulatory message (text-xl, mb-4)
  - Clear "Play Again" button (primary CTA)
  - Subtle confetti or sparkle effect (CSS-only, no heavy animations)
  - Backdrop blur (backdrop-blur-md) for elegant overlay

- **Loss Modal**: Encouraging, not discouraging
  - Friendly message: "Nice try! Want to play again?"
  - Prominent "Play Again" button
  - Optional "How to Win" tips section
  - Same backdrop blur treatment

### Buttons
- **Primary CTA** (Play Again, Start Game): Large, rounded-full or rounded-xl, px-8 py-3
- **Secondary actions**: More subtle styling, rounded-lg, px-6 py-2
- All buttons: font-medium, tracking-wide, uppercase or sentence case consistently
- Touch-friendly: Minimum 44px height on mobile

### Status Bar
- Compact header showing: Current turn, Score tracker
- Flexbox layout: justify-between for balance
- Rounded container with subtle background treatment
- Icons from Heroicons for X/O indicators (circle, x-mark)

### Navigation/Header (minimal)
- Clean top bar with game title
- Reset/New Game button (subtle, secondary style)
- No heavy navigation - keep focus on gameplay

## Component Enrichment

**Enhanced Game Interface**:
- Score tracker: Running tally of Player Wins | Draws | Computer Wins
- Move counter: "Move #3" for engagement tracking
- Difficulty selector toggle (Easy/Medium/Hard) - adds replay value
- Sound toggle button (muted/unmuted state)
- Animated turn indicator: "Your Turn" / "Computer Thinking..."

**Win Screen Enrichment**:
- Promo code with copy-to-clipboard button (icon: clipboard from Heroicons)
- Social share prompt: "Share your win!" with share icon
- Streak counter: "3 wins in a row!" if applicable
- Telegram confirmation: Small success message "✓ Sent to Telegram"

**Polish Details**:
- Smooth transitions on all interactions (transition-all duration-200)
- Subtle pulse animation on whose turn it is
- Computer "thinking" animation (brief, 300-500ms pause)
- Disabled state styling for cells during computer turn

## Animations

**Minimal, Purposeful Animations**:
- Cell click: Quick scale-down then return (duration-150)
- Symbol appearance: Fade-in + slight scale (duration-300)
- Win line: Draw-through animation on winning combination (duration-500)
- Modal entrance: Fade + slight slide up (duration-300)
- Promo code reveal: Gentle fade-in with scale effect
- NO: Continuous loops, distracting particles, or heavy animation libraries

## Responsive Behavior

**Mobile-First Approach**:
- Stack everything vertically on mobile
- Game board: Touch-optimized cells (minimum 80px × 80px)
- Modals: Full-width on mobile (rounded corners only on top)
- Font sizes scale down appropriately (text-5xl on mobile vs text-7xl desktop)

**Breakpoint Strategy**:
- Base (mobile): Single column, stacked layout
- md: Slightly larger board, more breathing room
- lg: Maximum size, optimal desktop experience

## Accessibility

- Clear focus states on all interactive elements (ring-2 ring-offset-2)
- Keyboard navigation support for board cells
- ARIA labels: "Empty cell", "Your move: X", "Computer move: O"
- High contrast between text and backgrounds
- Screen reader announcements for game state changes

## Technical Assets

**Icons**: Heroicons via CDN
- x-mark (for X moves)
- circle (for O moves)  
- clipboard (copy promo code)
- arrow-path (restart game)
- speaker-wave / speaker-x-mark (sound toggle)

**No Images Required**: This is a game interface - rely on clean typography and shapes. The game board itself is the visual hero.

---

**Final Notes**: This design balances sophistication with playfulness, creating an experience that feels premium and polished while remaining approachable. Every element serves the gameplay experience while appealing to the refined aesthetic preferences of the target demographic.