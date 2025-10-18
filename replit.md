# Wild Dogs Hockey Club - Web Application

## Project Overview
Comprehensive web application for managing the Wild Dogs inline hockey club in Bogotá, Colombia. The platform provides public information pages, player management, financial tracking, and administrative tools.

## Architecture
- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js with Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OIDC)
- **File Storage**: Local filesystem with future cloud storage integration

## Key Features

### Public Pages (Unauthenticated)
- **Home**: Hero section, news slider, club stats, quick access grid, gallery preview, CTAs
- **About**: Club history, mission, vision, values, leadership team, facilities
- **Services**: Training programs, schedules, membership plans, enrollment process
- **Categories**: 6 age divisions (Sub 8, 12, 14, 16, 18, Mayores) with player rosters, coaching staff, achievements
- **Tournaments**: Upcoming matches, past results, standings tables, filters
- **Contact**: Form submission, club information, map integration

### Private Pages (Authenticated Players)
- **Dashboard**: Personal profile, statistics, category info
- **Payment Status**: View pending/paid accounts, payment history, download receipts
- **Documents**: Upload required documents (ID, medical, EPS, image rights)
- **Profile Management**: Update contact info, change photo

### Admin Panel (Authenticated Administrators)
- **User Management**: Approve/reject registrations, manage roles, filter users
- **Content Management**: Create/edit news posts, manage galleries, update category info
- **Player Management**: Update rosters, assign jersey numbers, manage statistics
- **Tournament Management**: Create tournaments, record match results, update standings
- **Financial Management**: Configure payment concepts, record payments, generate reports
- **Financial Dashboard**: View income, accounts receivable, payment status by category

## Database Schema
- **Users & Auth**: sessions, users (with Replit Auth integration)
- **Players**: player_profiles (extended user data with medical, guardian, stats)
- **Structure**: categories, coaches, category_achievements
- **Content**: news_posts, gallery_albums, gallery_images
- **Tournaments**: tournaments, matches, standings
- **Payments**: payment_concepts, accounts_receivable, payments, payment_applications
- **Documents**: documents (player document uploads)
- **Contact**: contact_submissions

## User Roles
- **Admin**: Full access to all features
- **Coach**: View category info, manage team rosters
- **Player**: View own profile, payments, upload documents
- **Guardian**: Same as player (for minors)

## Payment System
- Administrators configure payment concepts (monthly fees, tournament registrations, etc.)
- System automatically generates accounts receivable based on player category
- Manual payment recording with receipt generation
- Payment history and status tracking
- Financial reports and dashboards

## Design System
- **Colors**: Deep hockey blue primary (220 85% 45%), energy orange accents (15 85% 52%)
- **Typography**: Inter for display/body, JetBrains Mono for data/numbers
- **Components**: Shadcn UI component library
- **Layout**: Responsive mobile-first design
- **Theme**: Light mode for public pages, dark mode for admin sections

## Recent Changes
- Initial schema definition with all required tables
- Image generation for hero, categories, placeholders
- Design guidelines established for sports club aesthetic
