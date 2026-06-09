-- eHosp: Run all migrations in order (for psql / SQL Editor)
-- Usage: paste entire file OR run via psql -f supabase/run-all-migrations.sql

\echo 'Running migration 01: extensions'
\i supabase/migrations/20240609000001_extensions.sql

\echo 'Running migration 02: enums'
\i supabase/migrations/20240609000002_enums.sql

\echo 'Running migration 03: profiles'
\i supabase/migrations/20240609000003_profiles.sql

\echo 'Running migration 04: doctor tables'
\i supabase/migrations/20240609000004_doctor_tables.sql

\echo 'Running migration 05: appointments'
\i supabase/migrations/20240609000005_appointments.sql

\echo 'Running migration 06: payments'
\i supabase/migrations/20240609000006_payments.sql

\echo 'Running migration 07: cases, reports, cms'
\i supabase/migrations/20240609000007_cases_reports_cms.sql

\echo 'Running migration 08: functions & triggers'
\i supabase/migrations/20240609000008_functions_triggers.sql

\echo 'Running migration 09: RLS policies'
\i supabase/migrations/20240609000009_rls_policies.sql

\echo 'Running migration 10: storage'
\i supabase/migrations/20240609000010_storage.sql

\echo 'Done. Run seed.sql to verify.'
