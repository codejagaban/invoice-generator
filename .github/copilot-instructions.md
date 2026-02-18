# AI Agent Instructions for Invoice Generator

## Project Overview

This is a **Next.js 16** invoice generator application using TypeScript, Tailwind CSS v4, and React 19. The project uses the App Router pattern exclusively (no Pages Router).

## Tech Stack
- **Framework**: Next.js 16.1.1 with App Router (`app/` directory)
- **Language**: TypeScript 5 with strict mode enabled
- **Styling**: Tailwind CSS 4 with PostCSS (`@tailwindcss/postcss`)
- **Fonts**: Geist font family from `next/font/google`
- **Linting**: ESLint 9 with `eslint-config-next` (core web vitals + TypeScript)

## Architecture & File Structure

```
app/
├── page.tsx          # Home page component (entry point)
├── layout.tsx        # Root layout with metadata & font setup
└── globals.css       # Tailwind imports & theme variables
public/               # Static assets
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
- **Dark mode**: Configured with `prefers-color-scheme` media query in `globals.css`
- **Theme variables**: CSS custom properties in `:root` for `--background` and `--foreground`
- **Font variables**: Geist Sans/Mono font families available via CSS variables

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

For the invoice feature, expect to:
1. Create an `app/invoices/` route segment with components and API routes
2. Use form handling (consider `next/form` for progressive enhancement)
3. Generate files (PDF export): integrate a library like `pdfkit` or `jsPDF` as an API endpoint
4. Store data: If database is needed, create `app/api/db/` utilities and initialize in migrations

## Extension Points

- **Database**: Add `.env.local` for database URL, initialize Prisma or Drizzle ORM if needed
- **UI Components**: Create `app/components/` directory for reusable components
- **Utilities**: Create `app/lib/` for invoice calculation, formatting, and export logic
- **Styling**: Add component-scoped styles in separate CSS files or use Tailwind arbitrary values

---

**Last Updated**: Generated for Next.js invoice generator scaffold. Update this document as patterns emerge during development.
