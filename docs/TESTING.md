# eHosp — Testing Guide

## 1. Environment setup

Copy `.env.example` to `.env.local` and fill in credentials:

```bash
cp .env.example .env.local
```

Required for basic testing:

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (server only) |

Optional (feature-specific):

| Variable | Feature |
|----------|---------|
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payments |
| `DAILY_API_KEY` | Video consultations |
| `NEXT_PUBLIC_APP_URL` | Auth redirects |

## 2. Database setup

Follow [supabase/README.md](../supabase/README.md) to apply all migrations.

Quick verify:

```sql
select count(*) from information_schema.tables where table_schema = 'public';
-- Expect 20+ tables

select slug from cms_pages;
-- terms, privacy, faq, about, refund-policy
```

## 3. Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Health check: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## 4. Manual test flows

### Patient registration

1. Go to `/register`
2. Fill: name, email, phone, password, gender, DOB, address
3. Confirm email (check Supabase Auth → Users)
4. Login at `/login`
5. Access `/patient` dashboard

### Doctor registration

1. Go to `/register/doctor`
2. Fill all required fields + upload documents
3. Status should be `pending` in `doctor_profiles`
4. Promote to admin and approve:

```sql
-- Make yourself admin
update profiles set role = 'admin' where email = 'your@email.com';

-- Approve doctor
update doctor_profiles set status = 'approved', approved_at = now()
where user_id = (select id from profiles where email = 'doctor@example.com');
```

5. Login as doctor → `/doctor` dashboard

### Doctor discovery (PostGIS)

1. Set patient location:

```sql
update patient_profiles
set location = st_setsrid(st_makepoint(72.8777, 19.0760), 4326)::geography
where user_id = (select id from profiles where email = 'patient@example.com');
```

2. Set doctor location + approve
3. Visit `/search` — doctors should appear sorted by distance

### Appointment booking

1. Doctor creates slots in dashboard (or insert via SQL)
2. Patient books at `/search/[doctorId]`
3. Verify slot `booked_count` increments
4. Verify slot closes when `booked_count >= max_capacity`

### Open cases

1. Patient posts case at `/patient/cases/new`
2. Approved doctor sees case at `/doctor/cases`
3. Doctor applies; patient sees applications

### CMS pages

1. Visit `/terms`, `/privacy`, `/faq`
2. Admin edits at `/admin/cms`

### Reports

1. Visit `/report` while logged in
2. Submit report against a user
3. Admin reviews at `/admin/reports`

## 5. API endpoints to test

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | App + DB connectivity |
| `/api/webhooks/razorpay` | POST | Payment webhook (Razorpay dashboard) |

## 6. RLS verification

Test as different roles using Supabase client or SQL with `set request.jwt.claim.sub`:

- Patients cannot read other patients' profiles
- Non-approved doctors cannot browse open cases
- Only completed appointment patients can insert reviews
- Banking details hidden from other users

## 7. Build & production check

```bash
npm run build
npm run start
```

Deploy to Vercel:

```bash
vercel --prod
```

Set all env vars in Vercel project settings.

## 8. Known limitations (initial scaffold)

- SMS OTP requires external provider configuration in Supabase
- Razorpay webhook needs public URL (use ngrok for local testing)
- Daily.co rooms created on appointment confirmation (needs API key)
- Push notifications require service worker setup (PWA)

## 9. Troubleshooting

| Issue | Fix |
|-------|-----|
| `postgis` extension error | Enable in Supabase Dashboard → Database → Extensions |
| Auth redirect loop | Check `NEXT_PUBLIC_APP_URL` and Supabase redirect URLs |
| RLS blocks inserts | Ensure user is authenticated; check policy matches role |
| Storage upload fails | Verify bucket exists and folder path is `{user_id}/...` |
| Nearby search empty | Doctor must be `approved` with non-null `location` |
