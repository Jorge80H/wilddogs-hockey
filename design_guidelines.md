# Wild Dogs Hockey Club - Design Guidelines

## Design Approach

**Hybrid Strategy**: Sports-inspired visual identity for public sections + streamlined utility design for administrative tools, drawing inspiration from professional sports team websites (FC Barcelona, NBA teams) combined with Material Design principles for data management interfaces.

## Core Design Principles

1. **Energy & Motion**: Convey the dynamic nature of hockey through bold layouts and strategic visual hierarchy
2. **Community & Trust**: Build confidence in parents/guardians while creating team belonging for players  
3. **Colombian Context**: Modern international sports aesthetic adapted for Bogotá audience
4. **Dual Purpose**: Inspiring public face + efficient internal management

## Color Palette

### Primary Brand Colors
**Dark Mode** (default for admin sections):
- Primary: 220 85% 45% (Deep Hockey Blue)
- Background: 220 15% 12% (Charcoal)
- Surface: 220 12% 16% (Elevated Dark)
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 70%

**Light Mode** (public sections):
- Primary: 220 85% 48% (Vibrant Blue)
- Secondary: 15 85% 52% (Energy Orange - accent sparingly)
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Text: 220 15% 15%

**Semantic Colors**:
- Success/Paid: 142 70% 45%
- Warning/Due Soon: 38 92% 50%
- Error/Overdue: 0 72% 51%
- Info: 199 89% 48%

## Typography

**Font Families**:
- Display/Headers: 'Inter' (700-900 weights) - bold, modern, sports-appropriate
- Body Text: 'Inter' (400-600 weights)
- Data/Numbers: 'JetBrains Mono' for statistics, scores, financial figures

**Scale**:
- Hero Headlines: text-6xl to text-8xl (bold, uppercase for impact)
- Section Headers: text-4xl to text-5xl
- Subsections: text-2xl to text-3xl
- Body: text-base to text-lg
- Captions: text-sm

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 8, 12, 16, 20, 24, 32 for consistent rhythm

**Container Strategy**:
- Full-width: Public hero sections, image backgrounds
- Constrained: max-w-7xl for content sections
- Reading width: max-w-4xl for text-heavy content

**Section Padding**:
- Desktop: py-20 to py-32
- Mobile: py-12 to py-16

## Public Section Components

### Home Page
- **Hero Section** (90vh): Full-screen action photo background with bold team name overlay, CTA buttons ("Únete al Club", "Ver Categorías") with backdrop blur
- **Club Stats Strip**: 4-column metrics (Años de Historia, Jugadores Activos, Torneos Ganados, Categorías)
- **News Slider**: Large cards with images, headlines, dates (3-4 recent posts)
- **Quick Access Grid**: 2x2 on desktop to Categories, Services, Tournaments, Contact
- **Photo Gallery Preview**: Masonry grid showcasing team moments
- **CTA Banner**: Final conversion section with enrollment call-to-action

### Categories Pages (Sub 8, Sub 12, Sub 14, Sub 16, Sub 18, Mayores)
- **Hero**: Category-specific action photo, age range, training schedule
- **Player Roster**: Grid layout (3-4 columns desktop, 1 mobile) with player cards containing photo, name, number, position - hover reveals basic stats
- **Coaching Staff**: Horizontal card layout with photos, names, roles, brief bio
- **Achievements Timeline**: Visual chronology of category victories
- **Gallery**: 3-column grid of category photos

### Tournaments & Results
- **Upcoming Matches**: Card-based list with team logos, date/time, venue, map link
- **Recent Results**: Score cards with expandable match details and statistics
- **Standings Table**: Responsive data table with team rankings, points, goals
- **Tournament Calendar**: Monthly view with color-coded matches by category

## Private Section Components (Dark Mode)

### Dashboard Layout
- **Sidebar Navigation**: Fixed left panel (240px) with icons + labels, collapsible on mobile
- **Top Bar**: User profile, notifications, quick actions
- **Main Content**: max-w-7xl container with card-based layouts

### Player Profile
- **Profile Header**: Large card with photo, name, category, jersey number
- **Status Indicators**: Pills showing payment status, document status, participation level
- **Statistics Dashboard**: Grid of metric cards (Partidos Jugados, Goles, Asistencias)
- **Payment Section**: Table of pending/paid amounts with status badges
- **Documents**: Upload area with file list and status icons

### Financial Management
- **Payment Dashboard**: 3-column KPI cards (Total Recaudado, Por Cobrar, En Mora)
- **Accounts Table**: Sortable/filterable data table with player names, amounts, due dates, actions
- **Payment Recording Form**: Stepped form for logging payments with receipt generation
- **Charts**: Line graphs for income trends, pie charts for payment distribution by category

### Administrative Tools
- **User Management**: Data table with filters, search, bulk actions
- **Content Editor**: WYSIWYG editor for news/announcements
- **Roster Manager**: Drag-and-drop interface for organizing player lists
- **Approval Queue**: Card-based review system for pending registrations

## Component Library

### Buttons
- Primary: Solid blue with white text
- Secondary: Outline with blue border
- Success: Green for confirmations
- Danger: Red for deletions
- On-image buttons: Always with backdrop-blur-sm

### Cards
- Shadow: shadow-md with hover:shadow-lg transition
- Borders: rounded-lg (8px radius)
- Padding: p-6 standard, p-4 compact

### Forms
- Input fields: Full-width with clear labels above
- Dark mode inputs: Darker background (220 12% 14%) with lighter borders
- Validation: Inline error messages in red, success in green
- File uploads: Drag-and-drop zones with preview

### Data Tables
- Sticky headers for long lists
- Striped rows for readability (even rows slightly darker)
- Hover state: subtle highlight
- Sortable columns with arrow indicators
- Responsive: Stack to cards on mobile

### Navigation
- Public: Horizontal menu with logo left, links center, CTA button right
- Sticky on scroll with background blur
- Mobile: Hamburger menu with slide-out drawer
- Private: Vertical sidebar with icon-first design

## Images

### Required Photography
1. **Home Hero**: Wide action shot of team playing (1920x1080+), vibrant and energetic
2. **Category Heroes**: Each category needs action photo (1600x900)
3. **Player Photos**: Headshots (400x400) against neutral background
4. **Coach Photos**: Professional headshots (300x300)
5. **Gallery Images**: Varied aspect ratios, minimum 800px wide
6. **About Section**: Team group photo, facility images, trophy shots

### Image Treatment
- Public sections: Full-bleed backgrounds with gradient overlays (dark gradient from bottom for text legibility)
- Player cards: Circular crops with subtle border
- News/Galleries: Maintain aspect ratios, use object-cover for consistency
- Optimize all images for web (WebP format preferred)

## Animations

**Use Sparingly**:
- Fade-in on scroll for section entries (intersection observer)
- Subtle hover lifts on cards (transform: translateY(-4px))
- Smooth transitions on state changes (transition-all duration-200)
- Loading spinners for async operations
- **No auto-playing sliders** - user-controlled only

## Accessibility

- WCAG AA contrast ratios minimum
- Focus indicators on all interactive elements (2px blue ring)
- Alt text for all images
- Semantic HTML structure
- Keyboard navigation support
- Screen reader labels for icon-only buttons
- Form labels always visible (no placeholder-only inputs)

## Responsive Breakpoints

- Mobile: < 640px (single column, stacked layout)
- Tablet: 640px - 1024px (2 columns for grids)
- Desktop: 1024px+ (full multi-column layouts)

Priority: Mobile-first approach for public sections, desktop-optimized for admin panels

---

This design creates a professional, energetic digital presence that honors the Wild Dogs hockey spirit while providing robust utility for club management.