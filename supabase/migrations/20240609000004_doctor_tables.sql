-- eHosp: Doctor profiles, degrees, availability, documents, banking

create table public.doctor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  medical_council_number text not null,
  specialty text not null,
  years_of_experience integer not null default 0 check (years_of_experience >= 0),
  gender public.gender_type,
  bio text,
  profile_photo_url text,
  handle text,
  clinic_address text,
  location geography (point, 4326),
  latitude double precision generated always as (st_y (location::geometry)) stored,
  longitude double precision generated always as (st_x (location::geometry)) stored,
  service_radius_km integer not null default 10 check (service_radius_km > 0 and service_radius_km <= 100),
  clinic_visit_available boolean not null default true,
  home_visit_available boolean not null default false,
  video_consultation_available boolean not null default false,
  clinic_fee numeric(10, 2) not null default 0 check (clinic_fee >= 0),
  home_visit_fee numeric(10, 2) not null default 0 check (home_visit_fee >= 0),
  video_consultation_fee numeric(10, 2) not null default 0 check (video_consultation_fee >= 0),
  max_patients_per_slot integer not null default 1 check (max_patients_per_slot >= 1 and max_patients_per_slot <= 50),
  status public.doctor_status not null default 'pending',
  rejection_reason text,
  show_public_stats boolean not null default true,
  total_patients integer not null default 0,
  monthly_patients integer not null default 0,
  average_rating numeric(3, 2) not null default 0 check (average_rating >= 0 and average_rating <= 5),
  total_consultations integer not null default 0,
  approved_at timestamptz,
  approved_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint doctor_profiles_council_unique unique (medical_council_number)
);

create index idx_doctor_profiles_user on public.doctor_profiles (user_id);
create index idx_doctor_profiles_status on public.doctor_profiles (status) where deleted_at is null;
create index idx_doctor_profiles_specialty on public.doctor_profiles (specialty) where status = 'approved' and deleted_at is null;
create index idx_doctor_profiles_location on public.doctor_profiles using gist (location);
create index idx_doctor_profiles_rating on public.doctor_profiles (average_rating desc) where status = 'approved';

create table public.doctor_degrees (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctor_profiles (id) on delete cascade,
  degree_name text not null,
  institution text not null,
  year_obtained integer not null check (year_obtained >= 1950 and year_obtained <= extract(year from now())::integer),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_doctor_degrees_doctor on public.doctor_degrees (doctor_id) where deleted_at is null;

create table public.doctor_working_hours (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctor_profiles (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint doctor_working_hours_time_check check (end_time > start_time),
  constraint doctor_working_hours_unique unique (doctor_id, day_of_week, start_time, end_time)
);

create index idx_doctor_working_hours_doctor on public.doctor_working_hours (doctor_id, day_of_week);

-- Alias table name from spec (view for doctor_availability)
create view public.doctor_availability
with (security_invoker = true) as
select * from public.doctor_working_hours;

create table public.doctor_documents (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctor_profiles (id) on delete cascade,
  document_type public.document_type not null,
  file_url text not null,
  file_name text,
  verified boolean not null default false,
  verified_by uuid references public.profiles (id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_doctor_documents_doctor on public.doctor_documents (doctor_id) where deleted_at is null;

create table public.doctor_banking (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null unique references public.doctor_profiles (id) on delete cascade,
  account_holder_name text not null,
  bank_name text not null,
  account_number_encrypted bytea not null,
  ifsc_code text not null,
  upi_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
