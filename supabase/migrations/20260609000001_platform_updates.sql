-- eHosp: Platform updates for doctor auto-creation, location fields, and case assignment locking

alter table public.doctor_profiles
  add column if not exists area text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists pincode text;

alter table public.patient_profiles
  add column if not exists area text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists pincode text;

create index if not exists idx_doctor_profiles_pincode on public.doctor_profiles (pincode) where deleted_at is null;
create index if not exists idx_patient_profiles_pincode on public.patient_profiles (pincode) where deleted_at is null;

-- Update user signup handling to persist optional location metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role public.user_role;
  user_name text;
begin
  user_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'patient');
  user_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  insert into public.profiles (id, role, full_name, email, phone, email_verified)
  values (
    new.id,
    user_role,
    user_name,
    new.email,
    new.phone,
    coalesce(new.email_confirmed_at is not null, false)
  );

  if user_role = 'patient' then
    insert into public.patient_profiles (user_id, gender, date_of_birth, address, area, city, state, pincode)
    values (
      new.id,
      (new.raw_user_meta_data->>'gender')::public.gender_type,
      (new.raw_user_meta_data->>'date_of_birth')::date,
      new.raw_user_meta_data->>'address',
      new.raw_user_meta_data->>'area',
      new.raw_user_meta_data->>'city',
      new.raw_user_meta_data->>'state',
      new.raw_user_meta_data->>'pincode'
    );
  elsif user_role = 'doctor' then
    insert into public.doctor_profiles (
      user_id, medical_council_number, specialty, years_of_experience, gender, clinic_address,
      area, city, state, pincode,
      clinic_visit_available, home_visit_available, video_consultation_available,
      clinic_fee, home_visit_fee, video_consultation_fee
    ) values (
      new.id,
      coalesce(new.raw_user_meta_data->>'medical_council_number', 'PENDING'),
      coalesce(new.raw_user_meta_data->>'specialty', 'General Physician'),
      coalesce((new.raw_user_meta_data->>'years_of_experience')::integer, 0),
      (new.raw_user_meta_data->>'gender')::public.gender_type,
      new.raw_user_meta_data->>'clinic_address',
      new.raw_user_meta_data->>'area',
      new.raw_user_meta_data->>'city',
      new.raw_user_meta_data->>'state',
      new.raw_user_meta_data->>'pincode',
      coalesce((new.raw_user_meta_data->>'clinic_visit_available')::boolean, true),
      coalesce((new.raw_user_meta_data->>'home_visit_available')::boolean, false),
      coalesce((new.raw_user_meta_data->>'video_consultation_available')::boolean, false),
      coalesce((new.raw_user_meta_data->>'clinic_fee')::numeric, 0),
      coalesce((new.raw_user_meta_data->>'home_visit_fee')::numeric, 0),
      coalesce((new.raw_user_meta_data->>'video_consultation_fee')::numeric, 0)
    );
  end if;

  return new;
end;
$$;

-- Automatically create doctor_profiles when a user's role changes to doctor.
create or replace function public.handle_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'doctor' then
    if not exists (select 1 from public.doctor_profiles dp where dp.user_id = new.id and dp.deleted_at is null) then
      insert into public.doctor_profiles (
        user_id, medical_council_number, specialty, years_of_experience, gender, clinic_address,
        area, city, state, pincode,
        service_radius_km, clinic_visit_available, home_visit_available, video_consultation_available,
        clinic_fee, home_visit_fee, video_consultation_fee, max_patients_per_slot, status
      ) values (
        new.id,
        'PENDING',
        'General Physician',
        0,
        null,
        'Clinic address not set',
        null,
        null,
        null,
        null,
        10,
        true,
        false,
        false,
        0,
        0,
        0,
        1,
        'pending'
      );
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_profiles_role_change
after update of role on public.profiles
for each row
execute function public.handle_role_change();

-- Enforce single open case assignment and lock open cases once accepted.
create or replace function public.assign_open_case()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'accepted' then
    update public.open_cases
    set assigned_doctor_id = new.doctor_id,
        status = 'assigned'
    where id = new.case_id
      and status = 'open';

    if not found then
      raise exception 'Open case is no longer available for assignment';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_case_applications_assign_open_case
after insert on public.case_applications
for each row
execute function public.assign_open_case();

-- Enforce service radius defaults.
alter table public.doctor_profiles
  alter column service_radius_km set default 10;
