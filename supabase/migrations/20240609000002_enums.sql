-- eHosp: Enum types

create type public.user_role as enum ('patient', 'doctor', 'admin');
create type public.account_status as enum ('active', 'suspended', 'banned', 'deleted');
create type public.gender_type as enum ('male', 'female', 'other', 'prefer_not_to_say');
create type public.doctor_status as enum ('pending', 'approved', 'rejected', 'suspended', 'banned');
create type public.consultation_type as enum ('clinic', 'home', 'video');
create type public.appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'refunded');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
create type public.transaction_status as enum ('created', 'authorized', 'captured', 'failed', 'refunded');
create type public.refund_status as enum ('pending', 'approved', 'processed', 'rejected');
create type public.case_status as enum ('open', 'in_review', 'assigned', 'closed', 'archived', 'removed');
create type public.case_application_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
create type public.report_reason as enum ('fraud', 'abuse', 'fake_information', 'harassment', 'misconduct', 'other');
create type public.report_status as enum ('pending', 'reviewing', 'warned', 'suspended', 'banned', 'dismissed');
create type public.payout_status as enum ('pending', 'processing', 'completed', 'failed');
create type public.notification_channel as enum ('email', 'sms', 'push', 'in_app');
create type public.document_type as enum ('degree_certificate', 'medical_license', 'identity_proof', 'other');
