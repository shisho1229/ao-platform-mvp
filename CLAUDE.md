# CLAUDE.md - AI Assistant Guide for AO Platform MVP

> **Last Updated:** 2025-12-10
> **Project Version:** 0.1.0
> **Purpose:** Comprehensive guide for AI assistants working on this codebase

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Development Setup](#development-setup)
5. [Coding Conventions](#coding-conventions)
6. [Database Patterns](#database-patterns)
7. [API Conventions](#api-conventions)
8. [Component Patterns](#component-patterns)
9. [Common Workflows](#common-workflows)
10. [Important Considerations](#important-considerations)

---

## Project Overview

**Project Name:** `ao-platform-mvp`
**Type:** Minimum Viable Product for AO (総合型選抜 - General Admissions) Consulting Platform
**Target Users:** Japanese high school students preparing for university entrance exams

### Core Features

1. **Experience Sharing (体験記)** - Browse success stories from students who passed AO admissions
2. **Consultation Booking (無料相談予約)** - Multi-step form for booking free consultations
3. **Document Library (書類)** - Reference documents like motivation letters (planned feature)
4. **Staff Management (スタッフ)** - Authentication system for cram school staff (infrastructure ready)

### Architecture

- **Full-Stack Web Application** using Next.js 15 App Router
- **Monolithic structure** with client and server code colocated
- **PostgreSQL database** managed via Prisma ORM
- **Client-heavy interactivity** with React 19

---

## Tech Stack

### Frontend
- **React** 19.0.0 - UI framework
- **Next.js** 15.1.4 - Meta-framework with App Router
- **TypeScript** 5.x - Type safety (strict mode enabled)
- **Tailwind CSS** 4.x - Utility-first CSS framework
- **Lucide React** 0.556.0 - Icon library

### Backend/Database
- **Prisma** 5.22.0 - ORM for PostgreSQL
- **PostgreSQL** - Primary database
- **bcryptjs** 3.0.3 - Password hashing for staff accounts
- **NextAuth** 5.0.0-beta.30 - Authentication (installed but not yet integrated)

### Development
- **ESLint** 9.x - Linting with Next.js config
- **ts-node** 10.9.2 - TypeScript execution for seeding
- **PostCSS** - CSS processing with Tailwind plugin

---

## Project Structure

```
/home/user/ao-platform-mvp/
├── app/                          # Next.js App Router (routing & pages)
│   ├── page.tsx                  # Home page (/)
│   ├── layout.tsx                # Root layout with fonts & metadata
│   ├── globals.css               # Global Tailwind styles
│   ├── api/                      # API Routes
│   │   ├── experiences/
│   │   │   ├── route.ts          # GET all experiences
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET single experience, increment view count
│   │   └── consultations/
│   │       └── route.ts          # POST new consultation booking
│   ├── experiences/
│   │   └── [id]/
│   │       └── page.tsx          # Dynamic experience detail page
│   └── consultation/
│       └── page.tsx              # Consultation booking page
│
├── components/                   # Reusable React components
│   ├── HomePage.tsx              # Main home page component (client)
│   ├── ConsultationForm.tsx      # Multi-step consultation form (client)
│   └── ExperienceDetail.tsx      # Experience detail view (client)
│
├── lib/                          # Utility functions & shared code
│   └── prisma.ts                 # Prisma client singleton
│
├── prisma/                       # Database configuration
│   ├── schema.prisma             # Prisma schema (4 models)
│   └── seed.ts                   # Database seeding script
│
├── public/                       # Static assets (SVG icons)
│
└── Configuration files:
    ├── tsconfig.json             # TypeScript config (strict mode, path aliases)
    ├── next.config.ts            # Next.js config
    ├── eslint.config.mjs         # ESLint flat config
    ├── postcss.config.mjs        # PostCSS/Tailwind config
    └── package.json              # Dependencies & scripts
```

### Key Directories Explained

- **`/app`** - All routing, pages, and API endpoints (Next.js App Router convention)
- **`/components`** - Shared React components (all use `'use client'` directive)
- **`/lib`** - Utility functions (currently only Prisma singleton)
- **`/prisma`** - Database schema and seeding

---

## Development Setup

### Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
# Create .env.local with:
# DATABASE_URL="postgresql://user:password@localhost:5432/ao_platform"

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev

# 5. Seed database with sample data
npx prisma db seed

# 6. Start development server
npm run dev
```

### Available Scripts

```json
{
  "dev": "next dev",           // Start dev server at http://localhost:3000
  "build": "next build",       // Production build
  "start": "next start",       // Start production server
  "lint": "eslint"            // Run linter
}
```

### Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string

**Example `.env.local`:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ao_platform_dev"
```

### Database Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Create new migration
npx prisma migrate dev --name description_of_change

# Reset database (⚠️ destructive)
npx prisma migrate reset

# Apply migrations in production
npx prisma migrate deploy
```

---

## Coding Conventions

### TypeScript

**Configuration:**
- **Strict mode enabled** - Always maintain type safety
- **Path alias** - Use `@/` to import from root (e.g., `import { prisma } from '@/lib/prisma'`)
- **No implicit any** - All types must be explicit

**Example:**
```typescript
// ✅ Good
import { prisma } from '@/lib/prisma'
import type { Experience } from '@prisma/client'

async function getExperience(id: string): Promise<Experience | null> {
  return await prisma.experience.findUnique({ where: { id } })
}

// ❌ Bad
import { prisma } from '../../lib/prisma'  // Don't use relative imports from root
async function getExperience(id) {          // Missing types
  return await prisma.experience.findUnique({ where: { id } })
}
```

### React & Next.js

**Component Conventions:**
- **Client Components** - All interactive components use `'use client'` directive at top
- **PascalCase** for component files and names
- **Functional Components** only (no class components)
- **TypeScript** for all components

**Example:**
```tsx
'use client'

import { useState } from 'react'
import type { FC } from 'react'

interface Props {
  initialValue: string
}

export const MyComponent: FC<Props> = ({ initialValue }) => {
  const [value, setValue] = useState(initialValue)

  return <div>{value}</div>
}
```

### File Naming

- **Pages** - `page.tsx` (Next.js App Router convention)
- **Layouts** - `layout.tsx`
- **API Routes** - `route.ts`
- **Components** - `ComponentName.tsx` (PascalCase)
- **Utilities** - `utilityName.ts` (camelCase)

### Styling

**Tailwind CSS Conventions:**
- **Utility-first approach** - Use Tailwind classes directly
- **Responsive design** - Mobile-first with responsive prefixes (`md:`, `lg:`)
- **Consistent spacing** - Use 4px base unit (`px-4`, `py-8`, etc.)
- **Color palette:**
  - Primary: Blue (`bg-blue-500`, `text-blue-600`)
  - Accent: Purple (`bg-purple-500`, `text-purple-600`)
  - Success: Green (`bg-green-600`, `text-green-700`)
  - Neutral: Gray (`bg-gray-100`, `text-gray-700`)

**Example:**
```tsx
// ✅ Good - Tailwind classes
<button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  Submit
</button>

// ❌ Bad - Inline styles or custom CSS
<button style={{ padding: '12px 24px', backgroundColor: '#3b82f6' }}>
  Submit
</button>
```

### Icons

- **Use Lucide React** for all icons
- **Consistent sizing** - `size={24}` for standard icons, `size={20}` for smaller

**Common icons in this project:**
```tsx
import { Award, BookOpen, Phone, Calendar, Clock, ChevronRight } from 'lucide-react'
```

---

## Database Patterns

### Prisma Schema Overview

The database has **4 models**:

1. **Experience** (体験記) - Student success stories
2. **Consultation** (無料相談予約) - Consultation bookings
3. **Staff** (塾スタッフ) - Cram school staff accounts
4. **Document** (塾の書類) - Reference documents

### Common Patterns

**UUID Primary Keys:**
```prisma
id String @id @default(uuid())
```

**Timestamps:**
```prisma
createdAt DateTime @default(now())
```

**View Tracking:**
```prisma
viewCount Int @default(0)
```

**Text Fields for Long Content:**
```prisma
content String @db.Text  // Use @db.Text for essays, descriptions, etc.
```

### Prisma Client Usage

**Always use the singleton pattern:**

```typescript
// ✅ Good - Use the singleton
import { prisma } from '@/lib/prisma'

export async function GET() {
  const experiences = await prisma.experience.findMany()
  return Response.json(experiences)
}

// ❌ Bad - Don't create new PrismaClient instances
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()  // Memory leak in development!
```

**Common Queries:**

```typescript
// Find many with pagination
const experiences = await prisma.experience.findMany({
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: 0
})

// Find unique by ID
const experience = await prisma.experience.findUnique({
  where: { id: experienceId }
})

// Create record
const consultation = await prisma.consultation.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    // ... other fields
  }
})

// Update record (e.g., increment view count)
await prisma.experience.update({
  where: { id: experienceId },
  data: { viewCount: { increment: 1 } }
})
```

### Database Seeding

When modifying seed data in `prisma/seed.ts`:

```bash
# Run seed script
npx prisma db seed

# Or reset and seed
npx prisma migrate reset  # ⚠️ Deletes all data
```

---

## API Conventions

All API routes follow Next.js App Router conventions in `/app/api/`.

### Route Handler Pattern

**File:** `app/api/[resource]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all resources
export async function GET(request: NextRequest) {
  try {
    const resources = await prisma.resource.findMany()
    return NextResponse.json(resources)
  } catch (error) {
    console.error('Failed to fetch resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

// POST new resource
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const resource = await prisma.resource.create({ data: body })
    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error('Failed to create resource:', error)
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}
```

### Existing API Endpoints

#### GET `/api/experiences`
```typescript
// Response: Experience[]
// Features:
// - Returns all experiences (max 20)
// - Sorted by createdAt DESC
// - No authentication required
```

#### GET `/api/experiences/[id]`
```typescript
// Response: Experience | { error: 'Experience not found' }
// Features:
// - Returns single experience by ID
// - ⚠️ Side effect: Increments viewCount on each fetch
// - Returns 404 if not found
```

#### POST `/api/consultations`
```typescript
// Request Body:
{
  name: string
  email: string
  phone: string
  grade: string              // 'high3' | 'high2' | 'high1' | 'graduate'
  university: string
  faculty: string
  concerns: string
  consultationType: string   // 'online' | 'offline'
  preferredDate: string      // ISO date format
  preferredTime: string      // "HH:MM-HH:MM"
  jukuName: string           // Defaults to 'AO義塾'
}

// Response: { success: true, trackingId: string }
// Status: 201 on success, 500 on error
```

### API Best Practices

1. **Error Handling** - Always wrap database calls in try/catch
2. **Status Codes** - Use appropriate HTTP status codes (200, 201, 400, 404, 500)
3. **Logging** - Use `console.error()` for errors (production should use proper logging)
4. **Validation** - Currently no validation; consider adding Zod schemas for inputs
5. **Authentication** - Currently no auth; all endpoints are public

---

## Component Patterns

### Component Structure

All components in `/components` are **client components** and follow this structure:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { IconName } from 'lucide-react'
import type { TypeName } from '@prisma/client'

export const ComponentName = () => {
  // 1. State declarations
  const [data, setData] = useState<TypeName[]>([])
  const [loading, setLoading] = useState(true)

  // 2. Effects
  useEffect(() => {
    // Data fetching logic
  }, [])

  // 3. Event handlers
  const handleClick = () => {
    // Handler logic
  }

  // 4. Render
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Component JSX */}
    </div>
  )
}
```

### Data Fetching Pattern

**Client-side fetching with useEffect:**

```tsx
'use client'

import { useState, useEffect } from 'react'

export const DataComponent = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/resource')
        if (!response.ok) throw new Error('Failed to fetch')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>読み込み中...</div>
  if (error) return <div>エラー: {error}</div>

  return <div>{/* Render data */}</div>
}
```

### Form Handling Pattern

**Multi-step form example (see ConsultationForm.tsx):**

```tsx
'use client'

import { useState } from 'react'

export const MultiStepForm = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    field1: '',
    field2: '',
    // ... other fields
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Submit failed')

      const result = await response.json()
      // Handle success
    } catch (error) {
      alert('エラーが発生しました')
    }
  }

  return (
    <div>
      {step === 1 && <Step1 data={formData} onChange={handleChange} />}
      {step === 2 && <Step2 data={formData} onChange={handleChange} />}
      {step === 3 && <Step3 data={formData} onSubmit={handleSubmit} />}
    </div>
  )
}
```

### Existing Components

#### HomePage.tsx
- **Location:** `/components/HomePage.tsx`
- **Purpose:** Main landing page
- **Features:**
  - Fetches top experiences from `/api/experiences`
  - Displays hero section with gradient background
  - Shows experience cards with university/faculty info
  - CTA button for consultation booking
- **State:** `experiences[]`, `loading`

#### ExperienceDetail.tsx
- **Location:** `/components/ExperienceDetail.tsx`
- **Purpose:** Display single experience with tabs
- **Features:**
  - Fetches experience from `/api/experiences/[id]`
  - Tab navigation (基本情報, 面接, 志望理由書, 対策)
  - Back button navigation
  - CTA for consultation
- **State:** `experience`, `loading`, `activeTab`

#### ConsultationForm.tsx
- **Location:** `/components/ConsultationForm.tsx`
- **Purpose:** Multi-step consultation booking
- **Features:**
  - 3-step form with progress indicator
  - Form validation (client-side)
  - Submits to `/api/consultations`
  - Success page with tracking ID
- **State:** `step`, `formData`, `submitting`, `trackingId`

---

## Common Workflows

### Adding a New Page

1. Create page file in `/app/[route]/page.tsx`
2. If interactive, create component in `/components/PageName.tsx`
3. Import and use component in page file

```tsx
// app/new-page/page.tsx
import { NewPageComponent } from '@/components/NewPageComponent'

export default function NewPage() {
  return <NewPageComponent />
}

// components/NewPageComponent.tsx
'use client'

export const NewPageComponent = () => {
  return <div>New Page Content</div>
}
```

### Adding a New API Endpoint

1. Create route file: `/app/api/[resource]/route.ts`
2. Implement handler functions (GET, POST, etc.)
3. Add Prisma queries with error handling

```typescript
// app/api/resources/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const resources = await prisma.resource.findMany()
    return NextResponse.json(resources)
  } catch (error) {
    console.error('Failed to fetch resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}
```

### Adding a New Database Model

1. Add model to `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name add_model_name`
3. Update seed file if needed: `prisma/seed.ts`
4. Generate Prisma client: `npx prisma generate`

```prisma
// prisma/schema.prisma
model NewModel {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())

  @@map("new_models")
}
```

### Modifying an Existing Feature

1. **Read the relevant files first** - Understand existing code before modifying
2. **Update components** - Make UI changes in `/components`
3. **Update API routes** - Modify data fetching/mutations in `/app/api`
4. **Update database** - If schema changes needed, create migration
5. **Test locally** - Run `npm run dev` and verify changes
6. **Check TypeScript** - Run `npm run build` to catch type errors

### Debugging

```bash
# View database records
npx prisma studio

# Check TypeScript errors
npx tsc --noEmit

# Run linter
npm run lint

# View logs
# Development server logs appear in terminal where `npm run dev` runs
```

---

## Important Considerations

### Security

**Current State:**
- ❌ No authentication on API endpoints (all public)
- ❌ No input validation/sanitization
- ❌ No rate limiting
- ✅ Password hashing with bcryptjs (for Staff model)
- ✅ Environment variables for sensitive data

**Recommendations for Future:**
- Implement NextAuth.js for staff authentication
- Add Zod schemas for API input validation
- Add rate limiting middleware (e.g., `@upstash/ratelimit`)
- Sanitize user inputs to prevent XSS/injection attacks
- Add CORS configuration for production

### Performance

**Current Optimization Opportunities:**
- Consider server-side rendering for experience list (currently client-side)
- Add image optimization with Next.js `<Image>` component
- Implement pagination for experiences list
- Add loading skeletons instead of text loading states
- Consider React Server Components for non-interactive parts

### Localization

**Current Language Strategy:**
- UI text: Japanese (体験記, 相談予約, etc.)
- Code/variables: English (experience, consultation, etc.)
- Comments: Mix of Japanese and English

**If adding multi-language support:**
- Consider `next-intl` or `next-i18next`
- Externalize all UI strings to translation files

### Testing

**Current State:**
- ❌ No tests configured
- ❌ No testing framework installed

**Recommendations:**
- Add Jest + React Testing Library for component tests
- Add Playwright or Cypress for E2E tests
- Add Vitest for unit tests

### Git Workflow

**Branch Naming:**
- Feature branches: `claude/feature-name-session-id`
- Always develop on designated branch
- Never push to main without permission

**Commit Messages:**
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Example: `feat: 無料相談予約フォームを追加`

### Japanese Business Context

**Understanding AO (総合型選抜):**
- Comprehensive university admissions process in Japan
- Emphasizes essays, interviews, and extracurriculars over test scores
- Students need guidance on motivation letters (志望理由書) and interview prep

**Key Terms:**
- 体験記 (Taiken-ki) - Experience/success story
- 無料相談 (Muryou soudan) - Free consultation
- 塾 (Juku) - Cram school/tutoring service
- 志望理由書 (Shibou riyuu-sho) - Motivation letter
- 面接 (Mensetsu) - Interview

---

## Quick Reference

### File Paths for Common Tasks

| Task | File Path |
|------|-----------|
| Home page UI | `/components/HomePage.tsx` |
| Experience detail UI | `/components/ExperienceDetail.tsx` |
| Consultation form UI | `/components/ConsultationForm.tsx` |
| Experiences API | `/app/api/experiences/route.ts` |
| Single experience API | `/app/api/experiences/[id]/route.ts` |
| Consultations API | `/app/api/consultations/route.ts` |
| Database schema | `/prisma/schema.prisma` |
| Seed data | `/prisma/seed.ts` |
| Prisma singleton | `/lib/prisma.ts` |
| Global styles | `/app/globals.css` |
| TypeScript config | `/tsconfig.json` |

### Key Dependencies Reference

```json
{
  "next": "^15.1.4",           // Framework
  "react": "^19.0.0",          // UI library
  "prisma": "^5.22.0",         // ORM
  "@prisma/client": "^5.22.0", // Database client
  "lucide-react": "^0.556.0",  // Icons
  "bcryptjs": "^3.0.3",        // Password hashing
  "next-auth": "^5.0.0-beta.30", // Auth (not configured)
  "tailwindcss": "^4"          // Styling
}
```

### Environment Setup Checklist

- [ ] `npm install` completed
- [ ] `.env.local` created with `DATABASE_URL`
- [ ] PostgreSQL database created
- [ ] `npx prisma generate` executed
- [ ] `npx prisma migrate dev` executed
- [ ] `npx prisma db seed` executed
- [ ] `npm run dev` runs successfully
- [ ] Can access http://localhost:3000

---

## Getting Help

If you encounter issues:

1. **Check Prisma logs** - Database connection issues are common
2. **Verify environment variables** - Ensure `DATABASE_URL` is set correctly
3. **Clear Next.js cache** - Delete `.next/` folder and rebuild
4. **Check TypeScript errors** - Run `npm run build` to see all errors
5. **Review Prisma schema** - Ensure migrations are applied

**Useful Commands:**
```bash
# Clear everything and start fresh
rm -rf node_modules .next
npm install
npx prisma generate
npx prisma migrate reset  # ⚠️ Deletes data
npm run dev
```

---

**End of CLAUDE.md**

> This document should be updated whenever major architectural changes, new patterns, or important conventions are introduced to the codebase.
