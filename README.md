# Admin Console – Next.js + FastAPI

A high-performance admin dashboard built with **Next.js (App Router)** and **FastAPI**, designed for large datasets, low-latency APIs, and a responsive admin user experience.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Architecture Decisions](#architecture-decisions)
- [Performance Optimizations](#performance-optimizations)
- [UI / UX Considerations](#ui--ux-considerations)

---

## Overview

This project is an admin console for managing users, products, orders, and carts.  
It is built to handle **80k+ records** efficiently while keeping page loads fast and the UI predictable.

Key goals:
- Fast first load and pagination
- Scalable backend queries
- Clear separation of frontend and backend concerns
- Mobile-friendly admin layout

---

## Tech Stack

### Frontend
- **Next.js (App Router)**
- **React (Client Components for data fetching)**
- **TanStack Table**
- **Tailwind CSS**
- **TypeScript**

### Backend
- **FastAPI**
- **SQLAlchemy (Async)**
- **PostgreSQL**
- **Redis**
- **Alembic**

### Infrastructure
- **Docker / Docker Compose**
- **Monorepo Git setup**

---

## Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+

---

### Environment Variables

Create `.env` files as needed (do **not** commit them).

#### Frontend (`frontend/.env`)
```env
NEXT_PUBLIC_API_URL=http://backend:8000/api
```

#### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/app
REDIS_URL=redis://redis:6379
```

---

### Start the Project

Build and start all services:

```bash
docker compose up --build
```

Available services:
- Frontend → http://localhost:3000
- Backend API → http://localhost:8000
- PostgreSQL → internal Docker network
- Redis → internal Docker network

---

### Initialize Database (Migrations + Seed)

After the containers are running, execute:

```bash
docker compose exec backend ./init_db.sh
```

This script will:
- Run Alembic migrations
- Seed users, products, and orders
- Prepare the database for immediate use

⚠️ Run this **once** on first setup or after resetting the database.

---

## Architecture Decisions

### Client-side Data Fetching (Next.js)

All table data is fetched in **client components**, not Server Components.

**Why:**
- Avoids Next.js RSC serialization overhead
- Eliminates `_rsc` latency on first load
- Improves perceived and actual performance

Result:
- First load reduced from ~700ms → ~200–300ms

---

### Backend Pagination Strategy

- Offset pagination implemented initially
- Composite indexes added to keep pagination fast
- Cursor-based pagination planned for large-scale growth

Indexes focus on:
- `created_at`
- `status`
- primary join keys

---

### Two-step Orders Query

Order listing uses a two-step query:
1. Fetch paginated order IDs
2. Fetch related user and item data using `WHERE id = ANY(...)`

**Benefits:**
- Prevents large joins from exploding result sets
- Keeps pagination consistent
- Scales cleanly with large datasets

---

### Redis Caching

Redis is used to cache **list responses** only:
- Short TTL (30s)
- Parameter-based cache keys
- JSON serialization optimized for speed

This avoids caching write-heavy or transactional endpoints.

---

## Performance Optimizations

### Database
- Composite pagination indexes
- Trigram index for `ILIKE` search
- Memoized joins (Postgres 14+)
- Queries tuned using `EXPLAIN ANALYZE`

### API
- Async SQLAlchemy
- Minimal response payloads
- GZip compression
- Redis caching for hot paths

### Frontend
- Client-side fetching
- Debounced search input
- URL-driven pagination
- No unnecessary re-renders

### Observed Results

| Scenario       | Response Time |
|---------------|----------------|
| Cold load      | ~200–300 ms    |
| Warm cache     | ~10–30 ms      |
| Database query | ~10 ms         |

---

## UI / UX Considerations

### Responsive Layout
- Desktop: fixed sidebar
- Mobile: sliding off-canvas sidebar
- Overlay click-to-close
- No layout shift

### Admin Usability
- URL-based search and pagination
- Clear loading states
- Predictable navigation
- Keyboard-friendly interactions

### Data Tables
- Server-driven pagination totals
- Debounced search
- Sorting-ready architecture
- Large dataset friendly

---

## Notes

This project is intentionally designed for:
- Large datasets
- Admin-heavy workflows
- Long-term maintainability

Planned improvements:
- Cursor-based pagination
- List vs detail endpoint separation
- Role-based access control
- Background cache warming
