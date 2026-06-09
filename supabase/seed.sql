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
