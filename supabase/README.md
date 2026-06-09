# eHosp — Supabase Database Setup

This folder contains the complete PostgreSQL + PostGIS schema for **eHosp**.

## Prerequisites

- [Supabase](https://supabase.com) project (free tier works)
- PostGIS enabled (migration `000001` handles this)
- Optional: [Supabase CLI](https://supabase.com/docs/guides/cli)

## Migration Files (run in order)

| File | Description |
|------|-------------|
| `20240609000001_extensions.sql` | PostGIS, pgcrypto, uuid-ossp |
| `20240609000002_enums.sql` | All enum types |
| `20240609000003_profiles.sql` | profiles, patient_profiles, platform_settings |
| `20240609000004_doctor_tables.sql` | doctor_profiles, degrees, hours, documents, banking |
| `20240609000005_appointments.sql` | appointment_slots, appointments, reviews |
| `20240609000006_payments.sql` | transactions, breakdowns, refunds, payouts |
| `20240609000007_cases_reports_cms.sql` | open cases, reports, CMS, notifications |
| `20240609000008_functions_triggers.sql` | Auth hooks, slot capacity, nearby search |
| `20240609000009_rls_policies.sql` | Row Level Security for all tables |
| `20240609000010_storage.sql` | Storage buckets and policies |
| `20240609000011_video_meet_link.sql` | Doctor Google Meet link column |
| `20240609000012_fixes_and_billing.sql` | Phone fix, prescriptions, bills, verification help |

## Option A: Supabase Dashboard (recommended for first setup)

1. Open your project → **SQL Editor**
2. Run each migration file **in numeric order**
3. Confirm no errors between files
4. Run `seed.sql` for verification queries

## Option B: Supabase CLI

```bash
# Link project (one time)
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push

# Or reset local and apply
supabase start
supabase db reset
```

## Option C: Single combined script

```bash
# From project root (requires psql)
psql "$DATABASE_URL" -f supabase/run-all-migrations.sql
```

## Post-migration checklist

- [ ] `select postgis_version();` returns a version
- [ ] Tables visible in Table Editor
- [ ] Storage buckets: `avatars`, `doctor-documents`, `case-attachments`, `consultation-files`
- [ ] RLS enabled on all public tables
- [ ] CMS pages seeded (terms, privacy, faq, about, refund-policy)

## Auth configuration (Supabase Dashboard) — required for email links

1. **Authentication → Providers**: Enable Email
2. **Authentication → URL Configuration**:
   - **Site URL**: set to your live app URL (e.g. `https://your-app.vercel.app`), **not** localhost if you deploy
   - **Redirect URLs** (add every environment you use):
     - `http://localhost:3000/auth/callback`
     - `https://your-app.vercel.app/auth/callback`
3. Set the same URL in your app env: `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`
4. Redeploy after changing env vars on Vercel

If confirmation emails still open `localhost`, the Supabase **Site URL** is still set to localhost — update it in the dashboard.
4. Enable **Phone** provider for OTP (optional, requires SMS provider)
5. **Database → Settings**: Set `app.encryption_key` for banking encryption (production)

## Create first admin user

After registering a user via the app:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

## Nearby doctor search test

```sql
select * from public.search_nearby_doctors(
  19.0760,  -- latitude (Mumbai)
  72.8777,  -- longitude
  20,       -- radius km
  null,     -- specialty
  null,     -- consultation type
  null,     -- min rating
  null,     -- max fee
  null,     -- gender
  null,     -- min experience
  10,       -- limit
  0         -- offset
);
```

## Storage folder structure

```
avatars/{user_id}/profile.jpg
doctor-documents/{user_id}/license.pdf
case-attachments/{user_id}/{case_id}/file.pdf
consultation-files/{appointment_id}/shared.pdf
```

## Security notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in the browser
- RLS policies use `profiles.role` — not `user_metadata`
- Banking account numbers are encrypted with `pgcrypto`
- Use Supabase Vault for `app.encryption_key` in production
