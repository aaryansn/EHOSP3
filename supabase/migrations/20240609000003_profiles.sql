-- eHosp: Core profiles (extends auth.users)

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'patient',
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  status public.account_status not null default 'active',
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint profiles_email_unique unique (email),
  constraint profiles_phone_unique unique (phone)
);

create index idx_profiles_role on public.profiles (role) where deleted_at is null;
create index idx_profiles_status on public.profiles (status) where deleted_at is null;
create index idx_profiles_email on public.profiles (email);

create table public.patient_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  gender public.gender_type,
  date_of_birth date,
  address text,
  location geography (point, 4326),
  latitude double precision generated always as (st_y (location::geometry)) stored,
  longitude double precision generated always as (st_x (location::geometry)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_patient_profiles_user on public.patient_profiles (user_id);
create index idx_patient_profiles_location on public.patient_profiles using gist (location);

create table public.platform_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

insert into public.platform_settings (key, value, description) values
  ('refund_policy', '{"hours_threshold": 6, "late_doctor_fee_refund_percent": 0, "early_doctor_fee_refund_percent": 100, "early_gateway_fee_refund_percent": 0}', 'Refund policy configuration'),
  ('platform_commission_percent', '{"percent": 10}', 'Platform commission on doctor fees'),
  ('video_recording_enabled', '{"enabled": false}', 'Enable Daily.co session recording'),
  ('otp_expiry_minutes', '{"minutes": 10}', 'OTP verification expiry'),
  ('auto_approve_doctors', '{"enabled": false}', 'Automatically approve new doctor registrations');
