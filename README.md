# eHosp

**eHosp** is a production-ready healthcare platform connecting patients and doctors for home visits, clinic appointments, video consultations, and an open medical case marketplace.

Built with **Next.js 15**, **React 19**, **Supabase** (PostgreSQL + PostGIS), **Tailwind CSS**, **Razorpay**, and **Daily.co**.

---

## Quick Start

### 1. Prerequisites

- Node.js 20+
- npm or pnpm
- [Supabase](https://supabase.com) project

### 2. Clone & install

```bash
cd ehosp2
npm install
cp .env.example .env.local
```

### 3. Configure environment

Edit `.env.local` with your credentials:


| Variable                        | Required     | Description            |
| ------------------------------- | ------------ | ---------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes          | Supabase project URL   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes          | Supabase anon key      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes          | Server-side operations |
| `RAZORPAY_KEY_ID`               | For payments | Razorpay dashboard     |
| `RAZORPAY_KEY_SECRET`           | For payments | Razorpay dashboard     |
| `DAILY_API_KEY`                 | For video    | Daily.co dashboard     |


### 4. Set up database

Apply SQL migrations — see **[supabase/README.md](./supabase/README.md)** for full instructions.

**Fast path (Supabase SQL Editor):** Run each file in `supabase/migrations/` in order (01 → 10).

### 5. Run locally

```bash
-- eHosp: Development seed data
-- Run AFTER migrations. Replace UUIDs if auth users already exist.

-- Note: Create test users via Supabase Auth first, then link profiles.
-- Example test coordinates: Mumbai (19.0760, 72.8777)

-- Sample platform settings update
update public.platform_settings
set value = '{"percent": 12}'::jsonb
where key = 'platform_commission_percent';

-- Verify PostGIS
select postgis_version();

-- Verify nearby search (returns empty until doctors are seeded)
select * from public.search_nearby_doctors(19.0760, 72.8777, 20) limit 5;

```

- App: [http://localhost:3000](http://localhost:3000)
- Health: [http://localhost:3000/api/health](http://localhost:3000/api/health)

### 6. Create admin user

Register via `/register`, then in Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

---

## Project Structure

```
ehosp2/
├── supabase/
│   ├── migrations/          # 10 ordered SQL migration files
│   ├── seed.sql               # Verification queries
│   ├── run-all-migrations.sql # Combined runner (psql)
│   └── README.md              # Database setup guide
├── docs/
│   └── TESTING.md             # Manual test flows
├── src/
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # UI & layout components
│   ├── lib/                   # Supabase, utils, server actions
│   └── middleware.ts          # Auth session & route protection
├── .env.example
└── README.md
```

---

## Features


| Module                               | Status          |
| ------------------------------------ | --------------- |
| Database schema + RLS + PostGIS      | ✅ Complete      |
| Auth (email, register, login, reset) | ✅ Scaffold      |
| Patient / Doctor / Admin dashboards  | ✅ Scaffold      |
| Doctor discovery (PostGIS search)    | ✅ API + UI      |
| CMS pages (terms, privacy, FAQ)      | ✅ DB + pages    |
| Appointments & slot capacity         | ✅ DB triggers   |
| Payments (Razorpay)                  | 🔲 Schema ready |
| Video (Daily.co)                     | 🔲 Schema ready |
| PWA / Push notifications             | 🔲 Planned      |


---

## Documentation

- [Database Setup](./supabase/README.md)
- [Testing Guide](./docs/TESTING.md)

---

## Deploy to Vercel

```bash
vercel
```

Set all environment variables in the Vercel dashboard. Add production redirect URLs in Supabase Auth settings.

---

## Credentials Needed

To enable all features, provide:

1. Supabase Project URL
2. Supabase Anon Key
3. Supabase Service Role Key
4. Razorpay Key ID & Secret
5. Daily.co API Key

Share these in `.env.local` (never commit to git).