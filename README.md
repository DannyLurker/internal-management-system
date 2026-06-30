# Internal Management System

An internal hotel management system designed to empower hotel staff with precise auditing mechanisms and real-time inventory/storage tracking. Built to be extended into a Point of Sale (POS), ordering, and booking application.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (Strict Mode)
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React Server Components (RSC), TanStack Query
- **Validation:** Zod schemas
- **Testing:** Playwright (E2E)

## Developed Features

The following features have been implemented and tested:

- **Authentication** - User authentication and session management
- **Locations** - Manage hotel locations (CRUD operations)
- **Categories** - Organize items into categories (CRUD operations)
- **Items** - Manage inventory items with attributes, pricing, and stock tracking (CRUD operations)
- **Stock** - Track stock quantities, movements, and costs with location-based management (CRUD operations)

## Getting Started

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma migrate dev

# Run development server
npm run dev
```

## Testing

```bash
# Run Playwright tests
npx playwright test

# View test report
npx playwright show-report
```

## Project Structure

- `features/` - Modular domain layer with business logic
- `app/` - Next.js routing layer
- `shared/` - Cross-cutting concerns and utilities
- `tests/` - Playwright test suites
