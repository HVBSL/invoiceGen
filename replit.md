# Invoice Generator Application

## Overview

This is a professional invoice generator web application built with React and Express. The application enables users to create, manage, and export invoices with support for client management, business information configuration, and real-time calculations. It features a modern, responsive interface with dark mode support and follows professional billing application design patterns.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server with HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing instead of React Router

**State Management:**
- React Context API for global state (invoice context, theme context)
- Local state with useState/useEffect hooks for component-level state
- LocalStorage for persistent data storage (invoices, clients, business info)
- TanStack Query (React Query) for potential server-side data fetching

**UI Component Library:**
- Shadcn/ui component system (New York style variant)
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management

**Design System:**
- Supports light/dark themes with CSS custom properties
- Responsive breakpoints (mobile, tablet, desktop, print)
- Professional color palette optimized for business documents
- Consistent spacing system using Tailwind units

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for RESTful API endpoints
- HTTP server created with Node's built-in `http` module
- Currently configured for in-memory storage with `MemStorage` class
- Drizzle ORM configured for PostgreSQL database integration (ready for implementation)

**Data Layer:**
- Storage interface pattern (`IStorage`) for abstraction between in-memory and database implementations
- Schema validation using Zod with shared types between client/server
- LocalStorage on frontend; backend prepared for database persistence

**Build Process:**
- ESBuild for server-side bundling with selective dependency bundling
- Vite for client-side bundling
- Separate build outputs (dist/public for client, dist for server)

### Data Models & Validation

**Core Entities:**
- **Invoice**: Comprehensive invoice with status tracking (draft, sent, paid, overdue), line items, dates, and calculations
- **Client**: Customer information with contact details
- **BusinessInfo**: User's business details including logo, contact info, and tax ID
- **LineItem**: Individual invoice items with quantity, price, and tax rate

**Validation:**
- Zod schemas defined in `shared/schema.ts` for runtime validation
- Type inference from schemas ensures type safety across the stack
- Shared validation logic between frontend forms and backend API

### Styling & Theme System

**CSS Architecture:**
- Tailwind CSS with extensive custom configuration
- CSS custom properties for theme values (HSL color format)
- Dark mode implementation using class-based strategy
- Responsive design with mobile-first approach

**Component Styling:**
- Utility classes for rapid development
- Consistent shadow, border, and spacing tokens
- Print-optimized styles for invoice PDF generation
- Hover and active state elevation effects

### Key Features

**Invoice Management:**
- Create, edit, duplicate, and delete invoices
- Real-time calculations for subtotals, taxes, and totals
- Support for multiple line items with individual tax rates
- Discount application
- Invoice status workflow (draft → sent → paid/overdue)

**Client Management:**
- Centralized client database
- Quick client selection during invoice creation
- Client information reuse across multiple invoices

**Export & Print:**
- Print-optimized invoice preview
- PDF export capability via browser print dialog
- Responsive preview with business branding

**Settings:**
- Business information configuration
- Logo upload with base64 encoding
- Data management (clear all data option)
- Statistics dashboard

## External Dependencies

### UI & Styling
- **Radix UI**: Comprehensive set of accessible component primitives (@radix-ui/react-*)
- **Tailwind CSS**: Utility-first CSS framework with PostCSS
- **Shadcn/ui**: Pre-built component system built on Radix UI
- **Lucide React**: Icon library for consistent iconography

### Forms & Validation
- **React Hook Form**: Form state management with @hookform/resolvers
- **Zod**: Schema validation for TypeScript
- **drizzle-zod**: Integration between Drizzle ORM and Zod schemas

### Database (Configured, Not Yet Implemented)
- **Drizzle ORM**: Type-safe ORM for PostgreSQL
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **Neon Database**: Serverless PostgreSQL platform (via DATABASE_URL environment variable)

### State Management & Data Fetching
- **TanStack Query**: Server state management and caching
- **Date-fns**: Date manipulation and formatting utilities

### Development Tools
- **TypeScript**: Static type checking
- **Vite**: Frontend build tool with plugins for Replit integration
- **ESBuild**: Fast JavaScript bundler for production server builds
- **tsx**: TypeScript execution for development server

### Utilities
- **clsx & tailwind-merge**: Conditional className utilities
- **class-variance-authority**: Component variant management
- **nanoid**: Unique ID generation

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Code navigation enhancement
- **@replit/vite-plugin-dev-banner**: Development mode indicator

### Session Management (Dependencies Present, Not Implemented)
- **express-session**: Session middleware
- **connect-pg-simple**: PostgreSQL session store (ready for use when database is added)