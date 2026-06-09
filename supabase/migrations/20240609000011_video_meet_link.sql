-- Doctor-provided Google Meet (or other) link for video consultations

alter table public.doctor_profiles
add column if not exists video_meet_link text;

comment on column public.doctor_profiles.video_meet_link is
  'Google Meet or other video conference URL shared with patients for video consultations';
