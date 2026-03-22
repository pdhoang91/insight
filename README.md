# Insight — Full-Stack Blog Platform

A modern, production-ready blog platform with rich text editing, multi-language support, and a microservice architecture.

**Design:** [Figma](https://www.figma.com/design/8r7QUxl9I8UtviPyqbtMsp/The-Blog---A-Web-Personal-Blog--Community-?node-id=614-383&t=4EKpambpOk6wBWXm-0)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Reference](#api-reference)
- [Caching Strategy](#caching-strategy)
- [Authentication & Authorization](#authentication--authorization)
- [Internationalization](#internationalization)
- [Image & Storage](#image--storage)
- [Infrastructure & Deployment](#infrastructure--deployment)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)

---

## Overview

Insight is a community blog platform similar to Medium. Users can write richly-formatted posts with a WYSIWYG editor, browse content by category/tag/author, search full-text, and interact through comments and claps. The platform is fully bilingual (Vietnamese / English) with language preference stored in a cookie — no locale prefix in the URL.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Nginx                            │
│  Port 80 (→ HTTPS redirect)  |  Port 443 (SSL/TLS)     │
│  Rate limiting: API 30r/s, Auth 5r/min, Upload 10r/min  │
└────────┬──────────────┬──────────────┬──────────────────┘
         │              │              │
         ▼              ▼              ▼
   ┌──────────┐  ┌────────────┐  ┌────────────────┐
   │ Frontend │  │  Backend   │  │ Search Service │
   │ Next.js  │  │   Go/Gin   │  │    Go/Gin      │
   │ :3456    │  │   :81      │  │    :83         │
   └──────────┘  └─────┬──────┘  └───────┬────────┘
                       │                 │
              ┌────────┴─────────────────┘
              │
     ┌────────┴────────┐
     │                 │
┌────▼────┐      ┌─────▼──────┐
│Postgres │      │   Redis    │
│   :5432 │      │   :6379    │
└─────────┘      └────────────┘
```

**Request routing (Nginx):**

| Path | Upstream |
|------|----------|
| `/_next/` | Frontend (static assets, 1-year cache) |
| `/api/search/` | Search Service |
| `/api/images/`, `/api/auth/`, `/api/images/upload/` | Backend (with rate limits) |
| `/api/` | Backend |
| `/images/` | Backend |
| `/` | Frontend |

---

## Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.7 (App Router, Turbopack) |
| UI | React 18, TailwindCSS 3.3, Framer Motion 11 |
| Icons | Phosphor Icons, React Icons |
| Editor | TipTap 2.9 (ProseMirror-based WYSIWYG) |
| Data Fetching | SWR 2.2 (client), Next.js fetch with `revalidate` (SSR) |
| i18n | next-intl 4.8 |
| HTTP Client | Axios |
| Fonts | Cabinet Grotesk (display), Source Serif 4 (body), JetBrains Mono (code) |

### Backend (Main API)
| Layer | Technology |
|-------|-----------|
| Language | Go 1.25 |
| Framework | Gin 1.10 |
| ORM | GORM 1.25 |
| Auth | JWT v4, Google OAuth 2.0 |
| Cache | Redis (go-redis v9) + in-memory fallback |
| Storage | AWS S3 (SDK v2) |

### Backend (Search Service)
| Layer | Technology |
|-------|-----------|
| Language | Go 1.25 |
| Framework | Gin |
| Search | PostgreSQL full-text search |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Database | PostgreSQL 13 |
| Cache | Redis 7 Alpine |
| Reverse Proxy | Nginx (SSL, rate limiting, gzip) |
| SSL | Let's Encrypt (Certbot) |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions → SSH deploy |
| Migrations | Custom Go migration runner |

---

## Project Structure

```
insight/
├── frontend/                    # Next.js application
│   ├── app/
│   │   ├── [locale]/            # All routes under locale segment
│   │   │   ├── page.js          # Home
│   │   │   ├── write/           # Create post
│   │   │   ├── edit/[id]/       # Edit post
│   │   │   ├── p/[slug]/        # Post detail
│   │   │   ├── [username]/      # User profile
│   │   │   ├── category/[name]/ # Posts by category
│   │   │   ├── tag/[name]/      # Posts by tag
│   │   │   ├── archive/         # Archive browser
│   │   │   ├── search/          # Search results
│   │   │   ├── layout.js        # Root layout (fonts, i18n provider)
│   │   │   └── ClientProviders.js # SWR config, auth context, navbar
│   │   └── api/
│   │       ├── image-proxy/     # Image proxy route
│   │       └── revalidate/      # ISR revalidation trigger
│   ├── components/
│   │   ├── Editor/              # TipTap editor + toolbars + slash commands
│   │   ├── Post/                # Post list, detail, engagement
│   │   ├── Navbar/              # Desktop & mobile nav
│   │   ├── Auth/                # Login modal
│   │   ├── Sidebar/             # Explore panel
│   │   ├── Category/, Tag/, Archive/, Search/
│   │   └── Shared/              # LanguageTogglePill, LoadingSpinner, etc.
│   ├── context/
│   │   ├── UserContext.js       # Logged-in user state, auth modal
│   │   └── PostContext.js       # Publish/update handlers
│   ├── hooks/                   # 18 SWR-based custom hooks
│   ├── services/                # API call modules (post, auth, image, etc.)
│   ├── utils/
│   │   ├── axiosPublicInstance.js
│   │   ├── axiosPrivateInstance.js  # Injects JWT from localStorage
│   │   ├── renderContent.js         # TipTap JSON → HTML (client)
│   │   └── renderContentServer.js   # TipTap JSON → HTML (server)
│   ├── messages/
│   │   ├── vi.json              # Vietnamese translations
│   │   └── en.json              # English translations
│   ├── i18n.js                  # next-intl config
│   ├── proxy.js                 # Next.js middleware (locale cookie detection)
│   └── next.config.js
│
├── backend/
│   ├── application/             # Main Go API service
│   │   ├── main.go              # Bootstrap, background jobs
│   │   ├── internal/
│   │   │   ├── router.go        # All route definitions
│   │   │   ├── controller/      # 11 controllers
│   │   │   ├── service/         # Business logic
│   │   │   ├── repository/      # Data access layer (GORM)
│   │   │   ├── entities/        # Database models
│   │   │   ├── dto/             # Request/response types
│   │   │   └── middleware/      # Auth, admin guards
│   │   └── pkg/
│   │       ├── cache/           # Two-tier cache (Redis + in-memory)
│   │       └── storage/         # S3 provider
│   ├── search-service/          # Full-text search microservice (port 83)
│   └── migrate/                 # SQL migration scripts + Go runner
│
├── nginx/
│   └── nginx.conf               # Reverse proxy, SSL, rate limiting
├── certbot/                     # Let's Encrypt SSL management
├── docker-compose.yml
├── Makefile
└── .github/workflows/main.yml   # CI/CD pipeline
```

---

## Features

### For Readers
- Browse home feed with latest and popular posts
- Browse by category, tag, or author
- Full-text search across all posts
- Archive browser (by year/month)
- Nested comments with replies
- Clap/engagement system

### For Writers
- WYSIWYG editor (TipTap/ProseMirror) with:
  - Bubble toolbar on text selection (bold, italic, underline, link, etc.)
  - Floating toolbar via `/` slash commands (headings, images, code blocks, tables, YouTube, etc.)
  - Keyboard shortcuts: `Ctrl+Enter` to publish, `F11` fullscreen
  - Image upload directly from editor → stored on S3/CDN
  - Character count
- Cover image upload
- Category and tag assignment
- Draft → Publish workflow

### For Admins
- Category management (create, update, delete)
- Post moderation (admin delete)
- Role-based access control (RBAC)

---

## API Reference

### Public Endpoints
```
POST   /auth/register
POST   /auth/login
GET    /auth/google
GET    /auth/google/callback

GET    /home                          # Home feed (latest + popular + categories)
GET    /posts                         # Paginated post list
GET    /posts/:id
GET    /p/:slug                       # Post by URL slug
GET    /posts/popular

GET    /archive/summary
GET    /archive/:year/:month

GET    /search/posts                  # Full-text search (via search-service)

GET    /categories
GET    /categories/popular
GET    /categories/top
GET    /categories/:name/posts

GET    /tags
GET    /tags/popular
GET    /tags/:name/posts

GET    /users/:id
GET    /users/:id/posts
GET    /public/:username/profile
GET    /public/:username/posts

GET    /comments/:id/replies
GET    /images/**
```

### Protected Endpoints (`/api`, requires JWT)
```
GET    /api/profile
GET    /api/me
PUT    /api/users/:id
DELETE /api/profile

POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id

POST   /api/comments
PUT    /api/comments/:id
DELETE /api/comments/:id

POST   /api/replies
DELETE /api/replies/:id

POST   /api/tags
POST   /api/images/upload/v2/:type    # Upload to S3
DELETE /api/images/v2/:id
```

### Admin Endpoints (`/admin`, requires JWT + admin role)
```
POST   /admin/categories
PUT    /admin/categories/id/:id
DELETE /admin/categories/id/:id
DELETE /admin/posts/:id
```

---

## Caching Strategy

The platform uses a **three-layer caching approach**:

### 1. Next.js SSR Cache (Frontend)
Server components fetch data with `revalidate` intervals:
- Home data: revalidated every **120 seconds**
- Static assets (`/_next/`): cached by Nginx for **1 year**
- Images: cached by Nginx for **1 day**

### 2. SWR Client Cache (Frontend)
Configured globally in `ClientProviders.js`:
```js
{
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 10_000,   // 10s deduplication window
  errorRetryCount: 2,
  errorRetryInterval: 1000,
}
```
Each data hook (posts, profile, categories, etc.) uses SWR, so data is shared and deduplicated across components.

### 3. Backend Two-Tier Cache (Redis + In-Memory)
`/backend/application/pkg/cache/` implements a two-tier cache:
- **Primary:** Redis 7 (distributed, shared across instances)
- **Fallback:** In-memory cache (used when Redis is unavailable)
- Cached data: post lists, home feed, archive summaries, engagement scores

**Background jobs running in `main.go`:**
| Job | Interval | Purpose |
|-----|----------|---------|
| Engagement score recalculation | Every 5 minutes | Keeps popular/trending scores fresh |
| View count flush | Every 30 seconds | Batches DB writes for post views |

---

## Authentication & Authorization

- **JWT tokens** signed with `JWT_SECRET`, stored in browser `localStorage`
- Sent as `Authorization: Bearer <token>` via `axiosPrivateInstance`
- Token payload includes `role` field for RBAC
- **Google OAuth 2.0** flow via `/auth/google` → `/auth/google/callback`
- **Roles:**
  - Regular user — read, write own posts, comment
  - Writer — can create posts (checked with `canWritePosts()`)
  - Admin — full category management, delete any post
  - Super admin — checked via `isSuperAdmin()`
- Backend enforces roles via `AuthMiddleware` and `AdminMiddleware`

---

## Internationalization

- **Languages supported:** Vietnamese (`vi`, default), English (`en`)
- **Storage:** Language preference stored in cookie `NEXT_LOCALE` (1 year, SameSite=Lax)
- **No locale in URL:** `localePrefix: 'never'` — routes are always `/`, `/p/slug`, etc.
- **Detection order (middleware):** Cookie `NEXT_LOCALE` → `Accept-Language` header → default (`vi`)
- **Message files:** `frontend/messages/vi.json`, `frontend/messages/en.json`
- **Server rendering:** `next-intl` server components receive locale via Next.js middleware rewrite (transparent, no URL change)
- Adding a new language: add to `locales` array in `i18n.js`, add message file, add to `LANGUAGES` in `LanguageTogglePill`

---

## Image & Storage

- **Storage provider:** AWS S3
- **CDN:** Optional CDN domain via `AWS_CDN_DOMAIN` env var
- **Upload path:** `/uploads/{userID}/{date}/{type}/{filename}`
- **Image types:** `avatar`, `cover`, `editor`
- **Upload flow:**
  1. Client calls `POST /api/images/upload/v2/:type` with multipart/form-data
  2. Backend validates, resizes if needed, uploads to S3
  3. Returns public URL (CDN or direct S3)
  4. Editor/form stores the returned URL
- **Image proxy:** `/api/image-proxy` Next.js route for proxying external images
- **Nginx:** Images at `/images/` served directly from backend with 1-day cache headers

---

## Infrastructure & Deployment

### Docker Compose Services
| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `postgres` | postgres:13 | 5433 (ext) | Primary database |
| `redis` | redis:7-alpine | 6379 (int) | Cache & session |
| `nginx` | nginx:latest | 80, 443 | Reverse proxy, SSL |
| `certbot` | certbot/certbot | — | Let's Encrypt renewal |
| `frontend` | custom (Node 22) | 3456 (int) | Next.js app |
| `application` | custom (Go) | 81 (int) | Main API |
| `search-service` | custom (Go) | 83 (int) | Search microservice |
| `db-migrate` | custom (Go) | — | Runs SQL migrations on startup |

### CI/CD Pipeline
Push to `main` branch triggers GitHub Actions:
1. SSH into production server
2. `git pull origin main`
3. `docker-compose up -d --build`
4. `docker system prune -f`

### Nginx Features
- HTTP → HTTPS redirect (except ACME challenge)
- SSL/TLS with Let's Encrypt certificates
- Gzip compression
- Security headers: HSTS, X-Frame-Options, X-XSS-Protection, CSP
- Rate limiting: API 30 req/s, Auth 5 req/min, Upload 10 req/min

---

## Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 22+ (for frontend only development)
- Go 1.25+ (for backend only development)

### Start full stack
```bash
make up
```

### Start frontend only
```bash
cd frontend
npm install
npm run dev        # http://localhost:3456
```

### Database migrations
```bash
# Run all pending migrations
make migrate

# Create a new migration
make migrate-create NAME=add_new_table

# Connect to DB shell
make db-shell
```

### Useful Make commands
```bash
make build         # Build all Docker images in parallel
make up            # Start all services
make down          # Stop all services
make migrate       # Run database migrations
```

---

## Environment Variables

Create a `.env` file at the project root based on `.env.example`:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=...
DB_PASSWORD=...
DB_NAME=...

# Auth
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URL=...

# Redis
REDIS_ADDR=redis:6379

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_BUCKET_NAME=...
AWS_CDN_DOMAIN=...         # Optional CDN domain for image URLs

# Frontend
NEXT_PUBLIC_BASE_API_URL=http://localhost:81
```
