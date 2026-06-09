-- eHosp: Row Level Security policies

alter table public.profiles enable row level security;
alter table public.patient_profiles enable row level security;
alter table public.doctor_profiles enable row level security;
alter table public.doctor_degrees enable row level security;
alter table public.doctor_working_hours enable row level security;
alter table public.doctor_documents enable row level security;
alter table public.doctor_banking enable row level security;
alter table public.appointment_slots enable row level security;
alter table public.appointments enable row level security;
alter table public.reviews enable row level security;
alter table public.transactions enable row level security;
alter table public.payment_breakdowns enable row level security;
alter table public.refund_requests enable row level security;
alter table public.payouts enable row level security;
alter table public.open_cases enable row level security;
alter table public.case_applications enable row level security;
alter table public.case_messages enable row level security;
alter table public.reports enable row level security;
alter table public.cms_pages enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_logs enable row level security;
alter table public.platform_settings enable row level security;
alter table public.otp_verifications enable row level security;

-- Profiles
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_select_public_doctors"
  on public.profiles for select
  using (
    exists (
      select 1 from public.doctor_profiles dp
      where dp.user_id = profiles.id and dp.status = 'approved' and dp.deleted_at is null
    )
  );

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid() and status = 'active')
  with check (id = auth.uid());

create policy "profiles_admin_all"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Patient profiles
create policy "patient_profiles_select_own"
  on public.patient_profiles for select
  using (user_id = auth.uid() or public.is_admin());

create policy "patient_profiles_doctor_appointment_patients"
  on public.patient_profiles for select
  using (
    public.is_approved_doctor() and exists (
      select 1 from public.appointments a
      join public.doctor_profiles dp on dp.id = a.doctor_id
      where a.patient_id = patient_profiles.user_id and dp.user_id = auth.uid()
    )
  );

create policy "patient_profiles_insert_own"
  on public.patient_profiles for insert
  with check (user_id = auth.uid());

create policy "patient_profiles_update_own"
  on public.patient_profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "patient_profiles_admin"
  on public.patient_profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Doctor profiles (public read for approved)
create policy "doctor_profiles_select_approved"
  on public.doctor_profiles for select
  using (status = 'approved' and deleted_at is null);

create policy "doctor_profiles_select_own"
  on public.doctor_profiles for select
  using (user_id = auth.uid());

create policy "doctor_profiles_insert_own"
  on public.doctor_profiles for insert
  with check (user_id = auth.uid());

create policy "doctor_profiles_update_own"
  on public.doctor_profiles for update
  using (user_id = auth.uid() and status in ('pending', 'approved'))
  with check (user_id = auth.uid());

create policy "doctor_profiles_admin"
  on public.doctor_profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Doctor degrees
create policy "doctor_degrees_public_read"
  on public.doctor_degrees for select
  using (
    exists (
      select 1 from public.doctor_profiles dp
      where dp.id = doctor_degrees.doctor_id and dp.status = 'approved' and dp.deleted_at is null
    )
  );

create policy "doctor_degrees_owner_crud"
  on public.doctor_degrees for all
  using (
    exists (select 1 from public.doctor_profiles dp where dp.id = doctor_degrees.doctor_id and dp.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.doctor_profiles dp where dp.id = doctor_degrees.doctor_id and dp.user_id = auth.uid())
  );

create policy "doctor_degrees_admin"
  on public.doctor_degrees for all
  using (public.is_admin())
  with check (public.is_admin());

-- Working hours
create policy "doctor_working_hours_public_read"
  on public.doctor_working_hours for select
  using (
    exists (
      select 1 from public.doctor_profiles dp
      where dp.id = doctor_working_hours.doctor_id and dp.status = 'approved'
    )
  );

create policy "doctor_working_hours_owner"
  on public.doctor_working_hours for all
  using (
    exists (select 1 from public.doctor_profiles dp where dp.id = doctor_working_hours.doctor_id and dp.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.doctor_profiles dp where dp.id = doctor_working_hours.doctor_id and dp.user_id = auth.uid())
  );

-- Documents (private)
create policy "doctor_documents_owner"
  on public.doctor_documents for all
  using (
    exists (select 1 from public.doctor_profiles dp where dp.id = doctor_documents.doctor_id and dp.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.doctor_profiles dp where dp.id = doctor_documents.doctor_id and dp.user_id = auth.uid())
  );

create policy "doctor_documents_admin"
  on public.doctor_documents for all
  using (public.is_admin())
  with check (public.is_admin());

-- Banking (doctor + admin only)
create policy "doctor_banking_owner"
  on public.doctor_banking for all
  using (
    exists (select 1 from public.doctor_profiles dp where dp.id = doctor_banking.doctor_id and dp.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.doctor_profiles dp where dp.id = doctor_banking.doctor_id and dp.user_id = auth.uid())
  );

create policy "doctor_banking_admin"
  on public.doctor_banking for select
  using (public.is_admin());

-- Appointment slots
create policy "appointment_slots_public_read"
  on public.appointment_slots for select
  using (
    exists (
      select 1 from public.doctor_profiles dp
      where dp.id = appointment_slots.doctor_id and dp.status = 'approved'
    )
  );

create policy "appointment_slots_doctor_manage"
  on public.appointment_slots for all
  using (
    exists (select 1 from public.doctor_profiles dp where dp.id = appointment_slots.doctor_id and dp.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.doctor_profiles dp where dp.id = appointment_slots.doctor_id and dp.user_id = auth.uid())
  );

-- Appointments
create policy "appointments_patient"
  on public.appointments for all
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

create policy "appointments_doctor"
  on public.appointments for select
  using (
    exists (select 1 from public.doctor_profiles dp where dp.id = appointments.doctor_id and dp.user_id = auth.uid())
  );

create policy "appointments_doctor_update"
  on public.appointments for update
  using (
    exists (select 1 from public.doctor_profiles dp where dp.id = appointments.doctor_id and dp.user_id = auth.uid())
  );

create policy "appointments_admin"
  on public.appointments for all
  using (public.is_admin())
  with check (public.is_admin());

-- Reviews
create policy "reviews_public_read"
  on public.reviews for select
  using (deleted_at is null);

create policy "reviews_patient_insert"
  on public.reviews for insert
  with check (
    patient_id = auth.uid()
    and exists (
      select 1 from public.appointments a
      where a.id = reviews.appointment_id
        and a.patient_id = auth.uid()
        and a.status = 'completed'
    )
  );

create policy "reviews_patient_update_own"
  on public.reviews for update
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

-- Transactions
create policy "transactions_patient"
  on public.transactions for select
  using (patient_id = auth.uid());

create policy "transactions_doctor"
  on public.transactions for select
  using (
    exists (select 1 from public.doctor_profiles dp where dp.id = transactions.doctor_id and dp.user_id = auth.uid())
  );

create policy "transactions_admin"
  on public.transactions for all
  using (public.is_admin())
  with check (public.is_admin());

-- Payment breakdowns
create policy "payment_breakdowns_via_transaction"
  on public.payment_breakdowns for select
  using (
    exists (
      select 1 from public.transactions t
      where t.id = payment_breakdowns.transaction_id
        and (t.patient_id = auth.uid() or public.is_admin() or exists (
          select 1 from public.doctor_profiles dp where dp.id = t.doctor_id and dp.user_id = auth.uid()
        ))
    )
  );

create policy "payment_breakdowns_admin_write"
  on public.payment_breakdowns for all
  using (public.is_admin())
  with check (public.is_admin());

-- Refunds
create policy "refund_requests_patient"
  on public.refund_requests for select
  using (requested_by = auth.uid());

create policy "refund_requests_patient_insert"
  on public.refund_requests for insert
  with check (requested_by = auth.uid());

create policy "refund_requests_admin"
  on public.refund_requests for all
  using (public.is_admin())
  with check (public.is_admin());

-- Payouts
create policy "payouts_doctor"
  on public.payouts for select
  using (
    exists (select 1 from public.doctor_profiles dp where dp.id = payouts.doctor_id and dp.user_id = auth.uid())
  );

create policy "payouts_admin"
  on public.payouts for all
  using (public.is_admin())
  with check (public.is_admin());

-- Open cases (patients own, approved doctors browse)
create policy "open_cases_patient"
  on public.open_cases for all
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

create policy "open_cases_doctor_read"
  on public.open_cases for select
  using (public.is_approved_doctor() and status in ('open', 'assigned', 'in_review'));

create policy "open_cases_admin"
  on public.open_cases for all
  using (public.is_admin())
  with check (public.is_admin());

-- Case applications
create policy "case_applications_doctor"
  on public.case_applications for all
  using (
    public.is_approved_doctor() and exists (
      select 1 from public.doctor_profiles dp where dp.id = case_applications.doctor_id and dp.user_id = auth.uid()
    )
  )
  with check (
    public.is_approved_doctor() and exists (
      select 1 from public.doctor_profiles dp where dp.id = case_applications.doctor_id and dp.user_id = auth.uid()
    )
  );

create policy "case_applications_patient_read"
  on public.case_applications for select
  using (
    exists (select 1 from public.open_cases oc where oc.id = case_applications.case_id and oc.patient_id = auth.uid())
  );

create policy "case_applications_admin"
  on public.case_applications for all
  using (public.is_admin())
  with check (public.is_admin());

-- Case messages
create policy "case_messages_participants"
  on public.case_messages for all
  using (
    sender_id = auth.uid()
    or exists (select 1 from public.open_cases oc where oc.id = case_messages.case_id and oc.patient_id = auth.uid())
    or (public.is_approved_doctor() and exists (
      select 1 from public.case_applications ca
      join public.doctor_profiles dp on dp.id = ca.doctor_id
      where ca.case_id = case_messages.case_id and dp.user_id = auth.uid()
    ))
  )
  with check (sender_id = auth.uid());

-- Reports
create policy "reports_reporter"
  on public.reports for insert
  with check (reporter_id = auth.uid());

create policy "reports_reporter_read"
  on public.reports for select
  using (reporter_id = auth.uid());

create policy "reports_admin"
  on public.reports for all
  using (public.is_admin())
  with check (public.is_admin());

-- CMS (public read, admin write)
create policy "cms_pages_public_read"
  on public.cms_pages for select
  using (is_published = true);

create policy "cms_pages_admin"
  on public.cms_pages for all
  using (public.is_admin())
  with check (public.is_admin());

-- Notifications
create policy "notifications_own"
  on public.notifications for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Admin logs
create policy "admin_logs_admin"
  on public.admin_logs for select
  using (public.is_admin());

create policy "admin_logs_insert"
  on public.admin_logs for insert
  with check (public.is_admin());

-- Platform settings
create policy "platform_settings_public_read"
  on public.platform_settings for select
  using (key in ('refund_policy', 'video_recording_enabled'));

create policy "platform_settings_admin"
  on public.platform_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- OTP
create policy "otp_own"
  on public.otp_verifications for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Grant execute on search function
grant execute on function public.search_nearby_doctors to authenticated, anon;
