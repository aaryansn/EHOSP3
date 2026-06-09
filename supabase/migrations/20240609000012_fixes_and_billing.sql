-- Fix phone storage, safe doctor signup, prescriptions & bills

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role public.user_role;
  user_name text;
  user_phone text;
  user_gender public.gender_type;
begin
  user_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'patient');
  user_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  user_phone := coalesce(
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.phone, '')
  );

  begin
    user_gender := nullif(new.raw_user_meta_data->>'gender', '')::public.gender_type;
  exception when others then
    user_gender := null;
  end;

  insert into public.profiles (id, role, full_name, email, phone, email_verified)
  values (
    new.id,
    user_role,
    user_name,
    new.email,
    user_phone,
    coalesce(new.email_confirmed_at is not null, false)
  );

  if user_role = 'patient' then
    insert into public.patient_profiles (user_id, gender, date_of_birth, address)
    values (
      new.id,
      user_gender,
      nullif(new.raw_user_meta_data->>'date_of_birth', '')::date,
      nullif(new.raw_user_meta_data->>'address', '')
    );
  elsif user_role = 'doctor' then
    insert into public.doctor_profiles (
      user_id, medical_council_number, specialty, years_of_experience, gender, clinic_address,
      clinic_visit_available, home_visit_available, video_consultation_available,
      clinic_fee, home_visit_fee, video_consultation_fee
    ) values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data->>'medical_council_number', ''), 'PENDING'),
      coalesce(nullif(new.raw_user_meta_data->>'specialty', ''), 'General Physician'),
      coalesce((new.raw_user_meta_data->>'years_of_experience')::integer, 0),
      user_gender,
      nullif(new.raw_user_meta_data->>'clinic_address', ''),
      coalesce((new.raw_user_meta_data->>'clinic_visit_available')::boolean, true),
      coalesce((new.raw_user_meta_data->>'home_visit_available')::boolean, false),
      coalesce((new.raw_user_meta_data->>'video_consultation_available')::boolean, false),
      coalesce((new.raw_user_meta_data->>'clinic_fee')::numeric, 0),
      coalesce((new.raw_user_meta_data->>'home_visit_fee')::numeric, 0),
      coalesce((new.raw_user_meta_data->>'video_consultation_fee')::numeric, 0)
    );
  end if;

  return new;
exception when others then
  raise exception 'Database error saving new user: %', sqlerrm;
end;
$$;

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments (id) on delete set null,
  case_id uuid references public.open_cases (id) on delete set null,
  doctor_id uuid not null references public.doctor_profiles (id),
  patient_id uuid not null references public.profiles (id),
  diagnosis text,
  medicines jsonb not null default '[]'::jsonb,
  advice text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  bill_number text not null unique,
  appointment_id uuid references public.appointments (id),
  transaction_id uuid references public.transactions (id),
  doctor_id uuid not null references public.doctor_profiles (id),
  patient_id uuid not null references public.profiles (id),
  doctor_name text not null,
  doctor_registration_number text not null,
  patient_name text not null,
  consultation_type public.consultation_type,
  diagnosis text,
  line_items jsonb not null default '[]'::jsonb,
  subtotal numeric(12, 2) not null default 0,
  platform_fee numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  prescription_id uuid references public.prescriptions (id),
  created_at timestamptz not null default now()
);

create index if not exists idx_prescriptions_appointment on public.prescriptions (appointment_id);
create index if not exists idx_bills_appointment on public.bills (appointment_id);
create index if not exists idx_bills_patient on public.bills (patient_id);
create index if not exists idx_bills_doctor on public.bills (doctor_id);

alter table public.prescriptions enable row level security;
alter table public.bills enable row level security;

create policy "prescriptions_patient" on public.prescriptions for select using (patient_id = auth.uid());
create policy "prescriptions_doctor" on public.prescriptions for all using (
  exists (select 1 from public.doctor_profiles dp where dp.id = prescriptions.doctor_id and dp.user_id = auth.uid())
);
create policy "prescriptions_admin" on public.prescriptions for all using (public.is_admin());

create policy "bills_patient" on public.bills for select using (patient_id = auth.uid());
create policy "bills_doctor" on public.bills for select using (
  exists (select 1 from public.doctor_profiles dp where dp.id = bills.doctor_id and dp.user_id = auth.uid())
);
create policy "bills_doctor_insert" on public.bills for insert with check (
  exists (select 1 from public.doctor_profiles dp where dp.id = bills.doctor_id and dp.user_id = auth.uid())
);
create policy "bills_admin" on public.bills for all using (public.is_admin());

create table if not exists public.verification_help_requests (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctor_profiles (id) on delete cascade,
  message text not null,
  status text not null default 'open',
  admin_reply text,
  created_at timestamptz not null default now()
);

alter table public.verification_help_requests enable row level security;

create policy "verification_help_doctor" on public.verification_help_requests for all using (
  exists (select 1 from public.doctor_profiles dp where dp.id = verification_help_requests.doctor_id and dp.user_id = auth.uid())
);
create policy "verification_help_admin" on public.verification_help_requests for all using (public.is_admin());
