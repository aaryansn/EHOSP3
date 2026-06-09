-- eHosp: Appointment slots & appointments

create table public.appointment_slots (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctor_profiles (id) on delete cascade,
  slot_date date not null,
  start_time time not null,
  end_time time not null,
  consultation_type public.consultation_type not null,
  max_capacity integer not null default 1 check (max_capacity >= 1),
  booked_count integer not null default 0 check (booked_count >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointment_slots_time_check check (end_time > start_time),
  constraint appointment_slots_capacity_check check (booked_count <= max_capacity),
  constraint appointment_slots_unique unique (doctor_id, slot_date, start_time, consultation_type)
);

create index idx_appointment_slots_doctor_date on public.appointment_slots (doctor_id, slot_date);
create index idx_appointment_slots_available on public.appointment_slots (doctor_id, slot_date, is_available)
  where is_available = true and booked_count < max_capacity;

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id),
  doctor_id uuid not null references public.doctor_profiles (id),
  slot_id uuid references public.appointment_slots (id),
  consultation_type public.consultation_type not null,
  status public.appointment_status not null default 'pending',
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  symptoms text,
  notes text,
  patient_address text,
  patient_location geography (point, 4326),
  payment_status public.payment_status not null default 'pending',
  daily_room_name text,
  daily_room_url text,
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles (id),
  cancellation_reason text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_appointments_patient on public.appointments (patient_id, appointment_date desc);
create index idx_appointments_doctor on public.appointments (doctor_id, appointment_date desc);
create index idx_appointments_status on public.appointments (status);
create index idx_appointments_date on public.appointments (appointment_date, start_time);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments (id),
  patient_id uuid not null references public.profiles (id),
  doctor_id uuid not null references public.doctor_profiles (id),
  rating smallint not null check (rating between 1 and 5),
  review_text text,
  consultation_type public.consultation_type not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_reviews_doctor on public.reviews (doctor_id) where deleted_at is null;
create index idx_reviews_patient on public.reviews (patient_id);
