-- eHosp: Storage buckets and policies

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('doctor-documents', 'doctor-documents', false, 10485760, array['image/jpeg', 'image/png', 'application/pdf']),
  ('case-attachments', 'case-attachments', false, 10485760, array['image/jpeg', 'image/png', 'application/pdf']),
  ('consultation-files', 'consultation-files', false, 20971520, array['image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do nothing;

-- Avatars: users upload to own folder
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_owner_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Doctor documents: doctor folder + admin
create policy "doctor_documents_owner_read"
  on storage.objects for select
  using (
    bucket_id = 'doctor-documents'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_admin()
    )
  );

create policy "doctor_documents_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'doctor-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "doctor_documents_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'doctor-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "doctor_documents_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'doctor-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Case attachments
create policy "case_attachments_participants"
  on storage.objects for select
  using (
    bucket_id = 'case-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "case_attachments_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'case-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Consultation files (video chat)
create policy "consultation_files_participants"
  on storage.objects for select
  using (
    bucket_id = 'consultation-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "consultation_files_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'consultation-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
