-- eHosp: Transactions, payment breakdowns, refunds, payouts

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments (id),
  patient_id uuid not null references public.profiles (id),
  doctor_id uuid not null references public.doctor_profiles (id),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'INR',
  status public.transaction_status not null default 'created',
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  razorpay_signature text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_transactions_appointment on public.transactions (appointment_id);
create index idx_transactions_patient on public.transactions (patient_id);
create index idx_transactions_doctor on public.transactions (doctor_id);
create index idx_transactions_status on public.transactions (status);
create index idx_transactions_paid_at on public.transactions (paid_at desc) where paid_at is not null;

create table public.payment_breakdowns (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null unique references public.transactions (id) on delete cascade,
  doctor_fee numeric(12, 2) not null default 0,
  platform_commission numeric(12, 2) not null default 0,
  gateway_fee numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create table public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions (id),
  appointment_id uuid not null references public.appointments (id),
  requested_by uuid not null references public.profiles (id),
  status public.refund_status not null default 'pending',
  reason text,
  hours_before_appointment numeric(8, 2),
  doctor_fee_refund_percent numeric(5, 2) not null default 0,
  platform_fee_refund_percent numeric(5, 2) not null default 0,
  gateway_fee_refund_percent numeric(5, 2) not null default 0,
  doctor_fee_refund_amount numeric(12, 2) not null default 0,
  platform_fee_refund_amount numeric(12, 2) not null default 0,
  gateway_fee_refund_amount numeric(12, 2) not null default 0,
  total_refund_amount numeric(12, 2) not null default 0,
  razorpay_refund_id text,
  processed_by uuid references public.profiles (id),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_refund_requests_appointment on public.refund_requests (appointment_id);
create index idx_refund_requests_status on public.refund_requests (status);

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctor_profiles (id),
  amount numeric(12, 2) not null check (amount > 0),
  status public.payout_status not null default 'pending',
  period_start date,
  period_end date,
  reference_note text,
  processed_by uuid references public.profiles (id),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_payouts_doctor on public.payouts (doctor_id);
create index idx_payouts_status on public.payouts (status);
