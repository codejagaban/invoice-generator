# AI Agent Instructions for Invoice Generator

## Project Overview

This is a **Next.js 16** invoice generator application designed for small businesses and freelancers. The goal is to provide a minimal, focused tool for creating, editing, and managing invoices with features like PDF generation, email sending, and template management. The application uses TypeScript, Tailwind CSS v4, and React 19 with the App Router pattern exclusively (no Pages Router).

### Product Vision
**Target Users**: Small business owners, freelancers, and service providers
**Core Value**: Simple, fast invoice creation and management without unnecessary complexity
**Design Philosophy**: Clean, intuitive UI with black and white color scheme and modern Inter font

### MVP Features (Priority Order)
1. **Create & Edit Invoices** - Form-based invoice creation with live preview
2. **Invoice Dashboard** - List view with basic filtering and search
3. **PDF Generation** - Export invoices as PDF files
4. **Invoice Templates** - Save templates to speed up recurring invoices
5. **Email Integration** - Send invoices directly via email (future phase)

## Tech Stack
- **Framework**: Next.js 16.1.1 with App Router (`app/` directory)
- **Language**: TypeScript 5 with strict mode enabled
- **Styling**: Tailwind CSS 4 with PostCSS (`@tailwindcss/postcss`)
- **Fonts**: Inter font family from `next/font/google` (modern, clean typography)
- **Color Scheme**: Black and white with gray accents for a professional, minimalist look
- **Linting**: ESLint 9 with `eslint-config-next` (core web vitals + TypeScript)

## Architecture & File Structure

```
app/
├── page.tsx                    # Home/landing page
├── layout.tsx                  # Root layout with metadata & font setup
├── globals.css                 # Tailwind imports & theme variables
├── components/                 # Reusable UI components
│   ├── InvoiceForm.tsx        # Invoice creation/edit form
│   ├── InvoicePreview.tsx     # Invoice preview component
│   └── shared/                # Shared components (buttons, inputs, etc.)
├── invoices/                   # Invoice management routes
│   ├── page.tsx               # Invoice dashboard/list
│   ├── create/page.tsx        # Create new invoice
│   └── [id]/
│       ├── page.tsx           # Invoice detail view
│       └── edit/page.tsx      # Edit invoice
├── templates/                  # Invoice template routes
│   ├── page.tsx               # Templates list
│   └── [id]/page.tsx          # Template detail
├── api/
│   ├── invoices/              # Invoice CRUD endpoints
│   │   └── route.ts           # GET (list), POST (create)
│   ├── invoices/[id]/         # Single invoice endpoints
│   │   └── route.ts           # GET, PATCH (update), DELETE
│   ├── pdf/                   # PDF generation endpoint
│   │   └── route.ts           # POST (generate PDF)
│   ├── email/                 # Email sending endpoint (future)
│   │   └── route.ts           # POST (send email)
│   └── templates/             # Template endpoints
│       └── route.ts           # CRUD for templates
├── lib/                        # Utility functions
│   ├── types.ts               # TypeScript types (Invoice, Template, etc.)
│   ├── invoice.ts             # Invoice calculations and formatting
│   ├── storage.ts             # Data persistence logic
│   └── validation.ts          # Form validation schemas
└── public/                    # Static assets
```

**Key Pattern**: The `app/` directory uses file-based routing. New routes are created by adding files/folders: `app/invoices/page.tsx` → `/invoices`, `app/invoices/[id]/page.tsx` → `/invoices/[id]`.

## Core Development Conventions

### TypeScript
- Strict mode is enabled in `tsconfig.json`
- Path alias configured: `@/*` maps to project root (e.g., `import { MyComponent } from "@/app/components"`)
- Type imports: Use `import type { Type }` for TypeScript-only types
- Component types: Define functional components inline with `export default function ComponentName() {}`

### Styling
- **Tailwind CSS v4**: Use utility classes exclusively; minimal custom CSS
- **Color Palette**: Black (#000) for primary, white (#fff) for background, gray-500/600 for accents and secondary text
- **Dark mode**: Configured with `prefers-color-scheme` media query in `globals.css`
- **Theme variables**: CSS custom properties in `:root` for `--background` and `--foreground`
- **Font**: Inter from `next/font/google` deployed via CSS variable `--font-inter`
- **Spacing**: Use Tailwind's default spacing scale; be consistent with 4px base unit
- **Responsive**: Mobile-first approach; use `sm:`, `md:`, `lg:` breakpoints for responsive design

### Component Development
- **Server Components by default**: All app directory components are Server Components unless `"use client"` is declared
- **Metadata**: Define page metadata in `layout.tsx` using `export const metadata: Metadata`
- **Images**: Use `next/image` for optimized image rendering (see `app/page.tsx` for pattern)

## Development Workflows

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` (runs on `http://localhost:3000`) |
| Build for production | `npm run build` |
| Run production build | `npm start` |
| Lint code | `npm run lint` (ESLint with Next.js rules) |

## Critical Developer Knowledge

### Before Adding Features
- Check the Next.js documentation for App Router patterns (layouts, segments, loading states)
- Understand that `page.tsx` files are the visible routes; `layout.tsx` wraps multiple routes
- Invoice generation will likely need API routes: create `app/api/invoices/route.ts` for endpoints

### Common Patterns to Follow
- **API Routes**: Place API handlers in `app/api/[feature]/route.ts` with named exports (`GET`, `POST`, etc.)
- **Data fetching**: Use async components with `fetch()` or external libraries; Server Components fetch by default
- **Client interactions**: Only use `"use client"` when button/form/state management is needed (rare)
- **Error handling**: Export `error.tsx` in app segments for error UI boundaries

### Never
- Add or modify the Pages Router (`pages/` directory doesn't exist; stick to App Router)
- Import from node modules beyond what's in `package.json` without explicit approval
- Override ESLint rules without documenting the override in code

## Invoice Generator Specifics

### Core Data Types
- **Invoice**: Contains customer info, items (description, qty, rate), taxes, totals, status, timestamps
- **InvoiceItem**: Line items with optional discounts and tax rates
- **Template**: Saved invoice configuration for recurring invoices
- **Customer**: Basic info (name, email, address) stored with invoices

### Feature Implementation Order
1. **Create & Edit Invoices**: Start with `app/invoices/create/page.tsx` and form component
2. **Invoice Dashboard**: Build `app/invoices/page.tsx` with list view and filtering
3. **API Routes**: Implement CRUD endpoints in `app/api/invoices/route.ts` and `app/api/invoices/[id]/route.ts`
4. **PDF Generation**: Use library like `pdfkit` or `html2pdf` at `app/api/pdf/route.ts`
5. **Templates**: Add template save/load in `app/api/templates/route.ts`
6. **Email**: Integrate email service (Resend, SendGrid, etc.) at `app/api/email/route.ts`

### Data Persistence
- **Initial phase**: Use browser localStorage or file-based storage for simplicity
- **Future**: Add database (Prisma + PostgreSQL recommended) with migrations
- **Storage pattern**: Create `app/lib/storage.ts` with abstract interface for easy swap between storage layers

## Extension Points

- **Database**: Add `.env.local` for database URL, initialize Prisma or Drizzle ORM if needed
- **UI Components**: Create `app/components/` directory for reusable components
- **Utilities**: Create `app/lib/` for invoice calculation, formatting, and export logic
- **Styling**: Add component-scoped styles in separate CSS files or use Tailwind arbitrary values

---

**Last Updated**: February 18, 2026 - Updated with product requirements, feature priorities, and detailed architecture
