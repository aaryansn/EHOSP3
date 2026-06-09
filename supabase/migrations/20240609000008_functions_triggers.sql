-- eHosp: Helper functions, triggers, and business logic

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Auth helpers (security definer for RLS)
create or replace function public.get_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and deleted_at is null;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active' and deleted_at is null
  );
$$;

create or replace function public.is_approved_doctor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.doctor_profiles dp
    join public.profiles p on p.id = dp.user_id
    where dp.user_id = auth.uid() and dp.status = 'approved' and dp.deleted_at is null
      and p.status = 'active' and p.deleted_at is null
  );
$$;

create or replace function public.get_doctor_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.doctor_profiles where user_id = auth.uid() and deleted_at is null limit 1;
$$;

-- Sync role to app_metadata (safe for client hints only — RLS uses profiles table)
create or replace function public.sync_role_to_app_metadata()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', new.role)
  where id = new.id;
  return new;
end;
$$;

-- Auto-create profile on signup
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
    insert into public.patient_profiles (user_id, gender, date_of_birth, address)
    values (
      new.id,
      (new.raw_user_meta_data->>'gender')::public.gender_type,
      (new.raw_user_meta_data->>'date_of_birth')::date,
      new.raw_user_meta_data->>'address'
    );
  elsif user_role = 'doctor' then
    declare
      auto_approve boolean := false;
    begin
      select coalesce((value->>'enabled')::boolean, false)
      into auto_approve
      from public.platform_settings
      where key = 'auto_approve_doctors'
      limit 1;

      insert into public.doctor_profiles (
        user_id, medical_council_number, specialty, years_of_experience, gender, clinic_address,
        clinic_visit_available, home_visit_available, video_consultation_available,
        clinic_fee, home_visit_fee, video_consultation_fee,
        status, approved_at, approved_by
      ) values (
        new.id,
        coalesce(new.raw_user_meta_data->>'medical_council_number', 'PENDING'),
        coalesce(new.raw_user_meta_data->>'specialty', 'General Physician'),
        coalesce((new.raw_user_meta_data->>'years_of_experience')::integer, 0),
        (new.raw_user_meta_data->>'gender')::public.gender_type,
        new.raw_user_meta_data->>'clinic_address',
        coalesce((new.raw_user_meta_data->>'clinic_visit_available')::boolean, true),
        coalesce((new.raw_user_meta_data->>'home_visit_available')::boolean, false),
        coalesce((new.raw_user_meta_data->>'video_consultation_available')::boolean, false),
        coalesce((new.raw_user_meta_data->>'clinic_fee')::numeric, 0),
        coalesce((new.raw_user_meta_data->>'home_visit_fee')::numeric, 0),
        coalesce((new.raw_user_meta_data->>'video_consultation_fee')::numeric, 0),
        case when auto_approve then 'approved' else 'pending' end,
        case when auto_approve then now() else null end,
        case when auto_approve then new.id else null end
      );
    end;
  end if;

  return new;
end;
$$;

-- Slot capacity management
create or replace function public.increment_slot_booking()
returns trigger
language plpgsql
as $$
begin
  if new.slot_id is not null then
    update public.appointment_slots
    set booked_count = booked_count + 1,
        is_available = (booked_count + 1) < max_capacity
    where id = new.slot_id
      and booked_count < max_capacity;

    if not found then
      raise exception 'Slot is full or unavailable';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.decrement_slot_booking()
returns trigger
language plpgsql
as $$
begin
  if old.slot_id is not null and old.status not in ('cancelled', 'refunded') then
    update public.appointment_slots
    set booked_count = greatest(booked_count - 1, 0),
        is_available = true
    where id = old.slot_id;
  end if;
  return old;
end;
$$;

-- Update doctor rating on review
create or replace function public.update_doctor_rating()
returns trigger
language plpgsql
as $$
begin
  update public.doctor_profiles
  set average_rating = (
    select coalesce(avg(rating)::numeric(3,2), 0)
    from public.reviews where doctor_id = new.doctor_id and deleted_at is null
  )
  where id = new.doctor_id;
  return new;
end;
$$;

-- Admin audit log helper
create or replace function public.log_admin_action(
  p_action text,
  p_entity_type text,
  p_entity_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    insert into public.admin_logs (admin_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata);
  end if;
end;
$$;

-- Nearby doctors search (PostGIS)
drop function if exists public.search_nearby_doctors(double precision,double precision,integer,text,text,public.consultation_type,numeric,numeric,public.gender_type,integer,integer,integer);
create function public.search_nearby_doctors(
  p_lat double precision default null,
  p_lng double precision default null,
  p_radius_km integer default 10,
  p_pincode text default null,
  p_specialty text default null,
  p_consultation_type public.consultation_type default null,
  p_min_rating numeric default null,
  p_max_fee numeric default null,
  p_gender public.gender_type default null,
  p_min_experience integer default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  doctor_id uuid,
  user_id uuid,
  full_name text,
  specialty text,
  years_of_experience integer,
  average_rating numeric,
  clinic_fee numeric,
  home_visit_fee numeric,
  video_consultation_fee numeric,
  distance_km double precision,
  clinic_address text,
  area text,
  city text,
  state text,
  pincode text,
  handle text,
  latitude double precision,
  longitude double precision,
  service_radius_km integer,
  clinic_visit_available boolean,
  home_visit_available boolean,
  video_consultation_available boolean,
  profile_photo_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    dp.id as doctor_id,
    dp.user_id,
    p.full_name,
    dp.specialty,
    dp.years_of_experience,
    dp.average_rating,
    dp.clinic_fee,
    dp.home_visit_fee,
    dp.video_consultation_fee,
    case when p_lat is not null and p_lng is not null then
      st_distance(
        dp.location,
        st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography
      ) / 1000.0
      else null end as distance_km,
    dp.clinic_address,
    dp.area,
    dp.city,
    dp.state,
    dp.pincode,
    dp.handle,
    dp.latitude,
    dp.longitude,
    dp.service_radius_km,
    dp.clinic_visit_available,
    dp.home_visit_available,
    dp.video_consultation_available,
    dp.profile_photo_url
  from public.doctor_profiles dp
  join public.profiles p on p.id = dp.user_id
  where dp.deleted_at is null
    and p.status = 'active'
    and p.deleted_at is null
    and (p_lat is null or p_lng is null or dp.location is not null)
    and (p_lat is null or p_lng is null or st_dwithin(
      dp.location,
      st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography,
      p_radius_km * 1000
    ))
    and (p_specialty is null or dp.specialty ilike '%' || p_specialty || '%')
    and (p_pincode is null or dp.pincode = p_pincode)
    and (p_min_rating is null or dp.average_rating >= p_min_rating)
    and (p_gender is null or dp.gender = p_gender)
    and (p_min_experience is null or dp.years_of_experience >= p_min_experience)
    and (
      p_consultation_type is null
      or (p_consultation_type = 'clinic' and dp.clinic_visit_available)
      or (p_consultation_type = 'home' and dp.home_visit_available)
      or (p_consultation_type = 'video' and dp.video_consultation_available)
    )
    and (
      p_max_fee is null
      or (
        (p_consultation_type = 'clinic' and dp.clinic_fee <= p_max_fee)
        or (p_consultation_type = 'home' and dp.home_visit_fee <= p_max_fee)
        or (p_consultation_type = 'video' and dp.video_consultation_fee <= p_max_fee)
        or (p_consultation_type is null and least(dp.clinic_fee, dp.home_visit_fee, dp.video_consultation_fee) <= p_max_fee)
      )
    )
  order by case when p_lat is null or p_lng is null then 0 else st_distance(
      dp.location,
      st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography
    ) / 1000.0 end asc
  limit p_limit offset p_offset;
$$;

-- Encrypt banking (requires app.encryption_key setting)
create or replace function public.encrypt_banking_account(p_account_number text)
returns bytea
language plpgsql
security definer
set search_path = public
as $$
declare
  enc_key text;
begin
  enc_key := current_setting('app.encryption_key', true);
  if enc_key is null or enc_key = '' then
    enc_key := 'ehosp-dev-key-change-in-production';
  end if;
  return pgp_sym_encrypt(p_account_number, enc_key);
end;
$$;

-- Apply updated_at triggers
do $$
declare
  t text;
  trg_name text;
begin
  foreach t in array array[
    'profiles', 'patient_profiles', 'doctor_profiles', 'doctor_degrees',
    'doctor_working_hours', 'appointment_slots', 'appointments', 'reviews',
    'transactions', 'refund_requests', 'payouts', 'open_cases',
    'case_applications', 'reports', 'cms_pages', 'doctor_banking'
  ]
  loop
    trg_name := format('trg_%s_updated_at', t);
    if not exists (
      select 1
      from pg_trigger
      join pg_class on pg_trigger.tgrelid = pg_class.oid
      join pg_namespace on pg_class.relnamespace = pg_namespace.oid
      where pg_trigger.tgname = trg_name
        and pg_namespace.nspname = 'public'
        and pg_class.relname = t
    ) then
      execute format(
        'create trigger %I
         before update on public.%I
         for each row execute function public.set_updated_at();',
        trg_name, t
      );
    end if;
  end loop;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    join pg_class on pg_trigger.tgrelid = pg_class.oid
    join pg_namespace on pg_class.relnamespace = pg_namespace.oid
    where pg_trigger.tgname = 'trg_profiles_sync_role'
      and pg_namespace.nspname = 'public'
      and pg_class.relname = 'profiles'
  ) then
    execute 'create trigger trg_profiles_sync_role after insert or update of role on public.profiles for each row execute function public.sync_role_to_app_metadata()';
  end if;

  if not exists (
    select 1
    from pg_trigger
    join pg_class on pg_trigger.tgrelid = pg_class.oid
    join pg_namespace on pg_class.relnamespace = pg_namespace.oid
    where pg_trigger.tgname = 'on_auth_user_created'
      and pg_namespace.nspname = 'auth'
      and pg_class.relname = 'users'
  ) then
    execute 'create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user()';
  end if;

  if not exists (
    select 1
    from pg_trigger
    join pg_class on pg_trigger.tgrelid = pg_class.oid
    join pg_namespace on pg_class.relnamespace = pg_namespace.oid
    where pg_trigger.tgname = 'trg_appointment_book_slot'
      and pg_namespace.nspname = 'public'
      and pg_class.relname = 'appointments'
  ) then
    execute 'create trigger trg_appointment_book_slot after insert on public.appointments for each row execute function public.increment_slot_booking()';
  end if;

  if not exists (
    select 1
    from pg_trigger
    join pg_class on pg_trigger.tgrelid = pg_class.oid
    join pg_namespace on pg_class.relnamespace = pg_namespace.oid
    where pg_trigger.tgname = 'trg_appointment_cancel_slot'
      and pg_namespace.nspname = 'public'
      and pg_class.relname = 'appointments'
  ) then
    execute 'create trigger trg_appointment_cancel_slot after update of status on public.appointments for each row when (old.status is distinct from new.status and new.status in (''cancelled'', ''refunded'')) execute function public.decrement_slot_booking()';
  end if;

  if not exists (
    select 1
    from pg_trigger
    join pg_class on pg_trigger.tgrelid = pg_class.oid
    join pg_namespace on pg_class.relnamespace = pg_namespace.oid
    where pg_trigger.tgname = 'trg_review_update_rating'
      and pg_namespace.nspname = 'public'
      and pg_class.relname = 'reviews'
  ) then
    execute 'create trigger trg_review_update_rating after insert or update on public.reviews for each row execute function public.update_doctor_rating()';
  end if;
end;
$$;
