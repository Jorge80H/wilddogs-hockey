# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wild Dogs Hockey Club web application for managing an inline hockey club in Bogotá, Colombia. Full-stack TypeScript application with React frontend, Express backend, PostgreSQL database, and Replit Auth (OIDC) authentication.

## Commands

### Development
```bash
npm run dev        # Start development server (frontend + backend on port 5000)
npm run check      # Type-check with TypeScript
```

### Database
```bash
npm run db:push    # Push schema changes to database with Drizzle Kit
```

### Production
```bash
npm run build      # Build both frontend (Vite) and backend (esbuild)
npm start          # Start production server
```

## Architecture

### Monorepo Structure
- **`/client`** - React frontend (Vite)
  - `/src/pages` - Page components for public and private routes
  - `/src/components` - Reusable UI components (Shadcn UI)
  - `/src/hooks` - Custom React hooks (useAuth, use-toast, etc.)
  - `/src/lib` - Utilities and React Query client
- **`/server`** - Express backend
  - `index.ts` - App entry point and middleware setup
  - `routes.ts` - API route definitions with auth middleware
  - `storage.ts` - Database access layer (CRUD operations)
  - `replitAuth.ts` - Replit Auth (OIDC) configuration
  - `db.ts` - Drizzle database connection
  - `vite.ts` - Vite dev server integration
- **`/shared`** - Shared types and schema
  - `schema.ts` - Drizzle ORM schema (single source of truth for DB types)
- **`/attached_assets`** - Static images and media files

### Key Technologies
- **Frontend**: React 18, TypeScript, Wouter (routing), TanStack Query, Tailwind CSS, Shadcn UI
- **Backend**: Express, TypeScript (ESM), Drizzle ORM, Passport.js
- **Database**: PostgreSQL via Neon, managed by Drizzle ORM
- **Auth**: Replit Auth (OpenID Connect) with Passport.js
- **Build**: Vite (frontend), esbuild (backend), TypeScript

### Database Architecture

Schema defined in `/shared/schema.ts` using Drizzle ORM:

**Core Entities**:
- `users` - Base user accounts (synced with Replit Auth)
- `playerProfiles` - Extended player data (medical info, guardian, stats)
- `categories` - Age divisions (Sub 8, 12, 14, 16, 18, Mayores)
- `coaches` - Coaching staff assigned to categories

**Content & Media**:
- `newsPosts` - Club news and announcements
- `galleryAlbums` / `galleryImages` - Photo galleries by category/event

**Competition**:
- `tournaments` - Tournament metadata
- `matches` - Match records with results
- `standings` - League standings tables

**Financial**:
- `paymentConcepts` - Configurable payment types (monthly fees, tournaments)
- `accountsReceivable` - Generated bills per player
- `payments` - Recorded payments with receipt info
- `paymentApplications` - Junction table linking payments to accounts

**Documents**:
- `documents` - Player document uploads (ID, medical, EPS, image rights)

**Contact**:
- `contactSubmissions` - Public contact form entries

All dates use PostgreSQL timestamps with timezone support. Enums are defined as `pgEnum` for type safety.

### Authentication Flow

1. Replit Auth OIDC flow handled in `server/replitAuth.ts`
2. Session stored in database (`sessions` table) via `connect-pg-simple`
3. User record created/updated in `users` table on first login
4. Middleware `isAuthenticated` checks `req.isAuthenticated()` for protected routes
5. `isAdmin` middleware validates `user.role === 'admin'` for admin-only routes
6. Frontend `useAuth` hook queries `/api/auth/user` endpoint

### Routing

**Frontend** (Wouter):
- `/` - Landing page (or dashboard if authenticated)
- `/nosotros` - About page
- `/servicios` - Services/training programs
- `/categorias` - Category list
- `/categorias/:id` - Category detail with roster
- `/torneos` - Tournaments and matches
- `/contacto` - Contact form
- `/dashboard` - Player dashboard (authenticated)
- `/admin` - Admin panel (admin role only)

**Backend API** (`/api` prefix):
- `/api/auth/*` - Auth endpoints (user, login, logout)
- `/api/categories/*` - Category CRUD
- `/api/players/*` - Player profile management
- `/api/news/*` - News posts
- `/api/tournaments/*` - Tournament and match data
- `/api/payments/*` - Payment concepts and records
- `/api/documents/*` - Document upload/download
- `/api/contact` - Contact form submission

All routes defined in `server/routes.ts` with appropriate middleware.

### Storage Layer

`server/storage.ts` provides database abstraction:
- Functions named as `get[Entity]`, `create[Entity]`, `update[Entity]`, `delete[Entity]`
- Uses Drizzle query API with type-safe operations
- All queries return properly typed results from schema
- Example: `getUser(id)`, `createPlayerProfile(data)`, `updatePayment(id, data)`

### Path Aliases

Configured in both `vite.config.ts` and `tsconfig.json`:
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

### User Roles

- **admin** - Full system access
- **coach** - View category info, manage rosters
- **player** - View own profile, payments, documents
- **guardian** - Same as player (for minors)

Role checked via database `users.role` field, not just session claims.

### Design System

Reference `design_guidelines.md` for complete details:
- **Colors**: Deep hockey blue primary (220 85% 45%), orange accents (15 85% 52%)
- **Typography**: Inter (display/body), JetBrains Mono (data/numbers)
- **Components**: Shadcn UI library in `/client/src/components/ui`
- **Dark mode**: Admin sections, light mode for public pages
- **Mobile-first**: Responsive breakpoints at 640px, 1024px

### Payment System

1. Admins create `paymentConcepts` (e.g., "Monthly Fee", "Tournament Registration")
2. System generates `accountsReceivable` records for players based on category
3. Admins record `payments` (cash/transfer/card)
4. `paymentApplications` links payments to specific accounts receivable
5. Status tracked: pending → paid or overdue

### File Upload

Handled via `server/storage.ts`:
- Documents stored in local filesystem (future: cloud storage)
- Metadata tracked in `documents` table
- Access controlled by user authentication

## Environment Variables

Required in `.env` or Replit Secrets:
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `SESSION_SECRET` - Express session secret
- Replit Auth env vars (automatically provided on Replit)

## Development Notes

- Server runs in dev mode with `tsx` for hot reload
- Vite dev server integrated in development (`server/vite.ts`)
- Production serves static files from `dist/public`
- Always check user role from database, not just session
- Use Zod schemas from `@shared/schema` for validation
- TypeScript strict mode enabled

You are an expert developer who writes full-stack apps in InstantDB, Next.js, and Tailwind developer. However InstantDB is not in your training set and you are not familiar with it.

Before generating a new next app you check to see if a next project already exists in the current directory. If it does you do not generate a new next app.

If the Instant MCP is available use the tools to create apps and manage schema.

Before you write ANY code you read ALL of instant-rules.md to understand how to use InstantDB in your code.