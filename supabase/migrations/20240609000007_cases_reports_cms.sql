-- eHosp: Open cases, reports, CMS, notifications, admin logs

create table public.open_cases (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id),
  symptoms text not null,
  description text,
  patient_age integer check (patient_age > 0 and patient_age < 150),
  patient_gender public.gender_type,
  address text,
  location geography (point, 4326),
  preferred_consultation_type public.consultation_type not null default 'clinic',
  status public.case_status not null default 'open',
  assigned_doctor_id uuid references public.doctor_profiles (id),
  moderated_by uuid references public.profiles (id),
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_open_cases_patient on public.open_cases (patient_id);
create index idx_open_cases_status on public.open_cases (status) where deleted_at is null;
create index idx_open_cases_location on public.open_cases using gist (location);

create table public.case_applications (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.open_cases (id) on delete cascade,
  doctor_id uuid not null references public.doctor_profiles (id),
  message text,
  proposed_fee numeric(10, 2),
  status public.case_application_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint case_applications_unique unique (case_id, doctor_id)
);

create index idx_case_applications_case on public.case_applications (case_id);
create index idx_case_applications_doctor on public.case_applications (doctor_id);

create table public.case_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.open_cases (id) on delete cascade,
  sender_id uuid not null references public.profiles (id),
  message text not null,
  created_at timestamptz not null default now()
);

create index idx_case_messages_case on public.case_messages (case_id, created_at);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id),
  reported_user_id uuid not null references public.profiles (id),
  reason public.report_reason not null,
  details text,
  status public.report_status not null default 'pending',
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_reports_status on public.reports (status);
create index idx_reports_reported_user on public.reports (reported_user_id);

create table public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null default '',
  meta_description text,
  is_published boolean not null default true,
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  channel public.notification_channel not null default 'in_app',
  title text not null,
  body text not null,
  data jsonb default '{}'::jsonb,
  read_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on public.notifications (user_id, created_at desc);
create index idx_notifications_unread on public.notifications (user_id) where read_at is null;

create table public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index idx_admin_logs_admin on public.admin_logs (admin_id, created_at desc);
create index idx_admin_logs_entity on public.admin_logs (entity_type, entity_id);

create table public.otp_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  phone text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  verified_at timestamptz,
  attempts integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_otp_verifications_user on public.otp_verifications (user_id, created_at desc);

-- Default CMS pages
insert into public.cms_pages (slug, title, content) values
  ('terms', 'Terms & Conditions', '<h1>Terms & Conditions</h1><p>Update via Admin CMS.</p>'),
  ('privacy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>Update via Admin CMS.</p>'),
  ('refund-policy', 'Refund Policy', '<h1>Refund Policy</h1><p>More than 6 hours: full doctor fee refund. Less than 6 hours: configurable by admin.</p>'),
  ('faq', 'Frequently Asked Questions', '<h1>FAQ</h1><p>Update via Admin CMS.</p>'),
  ('about', 'About Us', '<h1>About eHosp</h1><p>Your trusted healthcare platform.</p>');
