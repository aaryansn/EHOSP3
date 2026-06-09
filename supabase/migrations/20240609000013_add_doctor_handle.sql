-- eHosp: Add doctor handle to doctor_profiles for shareable doctor URLs

alter table public.doctor_profiles
  add column if not exists handle text;

create unique index if not exists idx_doctor_profiles_handle
  on public.doctor_profiles (lower(handle))
  where handle is not null;
