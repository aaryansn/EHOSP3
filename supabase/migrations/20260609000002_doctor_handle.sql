-- eHosp: Add doctor handle for shareable profile links

alter table public.doctor_profiles
add column if not exists handle text unique;

create index if not exists idx_doctor_profiles_handle on public.doctor_profiles (handle) where handle is not null and deleted_at is null;
