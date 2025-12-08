# Tic-Tac-Toe Game with Promo Codes

## Overview

This is a single-player Tic-Tac-Toe game built with React, TypeScript, and Express. Players compete against a computer opponent and receive promotional codes when they win. The application features a modern, elegant design inspired by lifestyle apps, with a focus on sophisticated playfulness and a clean interface. Winning games trigger Telegram notifications with promo codes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server for fast HMR (Hot Module Replacement)
- **Wouter** for lightweight client-side routing
- **TanStack Query** (React Query) for server state management and API calls
- **Framer Motion** for animations and micro-interactions

**UI Framework:**
- **Shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- Custom spacing primitives (2, 4, 6, 8, 12, 16, 24) for consistent layout
- **Typography:** DM Sans (headings/UI) and Inter (body text) via Google Fonts CDN

**Design System:**
- Single-column centered layout (max-w-2xl)
- Mobile-first responsive design with minimum 48px touch targets
- Sophisticated color palette using HSL with CSS custom properties
- Soft shadows and rounded corners (rounded-xl to rounded-2xl)
- Hover and active states with gentle transforms and elevation changes

**State Management:**
- Local component state for game logic (board state, current player, scores)
- Game state includes: 9-cell board, player turns, win detection, score tracking
- No global state management library - React Query handles server state

### Backend Architecture

**Technology Stack:**
- **Express.js** for the HTTP server
- **TypeScript** with ES modules
- **Node.js** HTTP server for serving the application

**API Design:**
- RESTful endpoint: `POST /api/notify` for Telegram notifications
- JSON request/response format
- Zod schema validation for type-safe API contracts
- Error handling with appropriate HTTP status codes (400, 500)

**Build Process:**
- **esbuild** for fast server bundling with selective dependency bundling
- Allowlist approach for bundling specific dependencies to reduce cold start times
- **Vite** for client build with optimized production output
- Development mode with HMR and Replit-specific plugins (cartographer, dev-banner, runtime-error-modal)

**Development vs Production:**
- Development: Vite middleware mode with Express
- Production: Serves pre-built static files from dist/public
- Environment-based configuration (NODE_ENV)

### Data Storage Solutions

**In-Memory Storage:**
- Simple `MemStorage` class implementing `IStorage` interface
- Map-based user storage (no database persistence in current implementation)
- Promo code generation using random 5-digit numbers

**Database Configuration:**
- **Drizzle ORM** configured for PostgreSQL
- Schema defined in `shared/schema.ts`
- Migration support via drizzle-kit
- Database URL from environment variables
- **Note:** Database is configured but not currently used for game state - storage is in-memory only

### Game Logic Architecture

**Core Game Mechanics:**
- 3x3 grid with null/"X"/"O" cell values
- Win detection via 8 possible winning combinations (rows, columns, diagonals)
- Computer AI with two-level strategy:
  1. Block player wins (defensive)
  2. Create computer wins (offensive)
  3. Fallback to random available moves
- Game states: playing, won, lost, draw
- Persistent score tracking (player, computer, draws)

**Promo Code System:**
- Generated on player wins only
- 5-digit random codes (10000-99999 range)
- Displayed in modal with copy-to-clipboard functionality
- Sent via Telegram notification on win

### External Dependencies

**Third-Party Services:**
- **Telegram Bot API** for win notifications
  - Requires `TELEGRAM_BOT_TOKEN` environment variable
  - Requires `TELEGRAM_CHAT_ID` environment variable
  - Sends messages via HTTP POST to Telegram API
  - Notifications include promo codes or loss status

**UI Component Libraries:**
- **Radix UI** primitives for accessible, unstyled components (dialogs, buttons, cards, etc.)
- **Lucide React** for icon components (X, Circle, RotateCcw, Sparkles, Copy, Check)
- **class-variance-authority** for component variant management
- **cmdk** for command palette components
- **embla-carousel-react** for carousel functionality

**Development Tools:**
- **Replit-specific plugins** for enhanced development experience
- **PostCSS** with Tailwind and Autoprefixer
- **tsx** for TypeScript execution in development

**Session Management:**
- **express-session** configured (via dependencies)
- **connect-pg-simple** for PostgreSQL session store
- Currently not actively used for game state

**Type Safety:**
- **Zod** for runtime schema validation
- **drizzle-zod** for database schema to Zod conversion
- TypeScript strict mode enabled
- Shared types between client and server in `shared/` directory