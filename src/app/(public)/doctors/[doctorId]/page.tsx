import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PrintPageButton } from "@/components/ui/print-page-button";

import { CopyProfileLinkButton } from "@/components/ui/copy-profile-link-button";

type Props = { params: { doctorId: string } };

export default async function DoctorDetailPage({ params }: Props) {
  const supabase = await createClient();
  const { data: doctor } = await supabase
    .from("doctor_profiles")
    .select(
      "id, user_id, handle, medical_council_number, specialty, years_of_experience, clinic_address, area, city, state, pincode, clinic_fee, home_visit_fee, video_consultation_fee, clinic_visit_available, home_visit_available, video_consultation_available, average_rating, bio, profile_photo_url, location, service_radius_km, status"
    )
    .eq("id", params.doctorId)
    .single();

  if (!doctor) {
    notFound();
  }

  const { data: user } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", doctor.user_id)
    .single();

  const displayLocation = [doctor.clinic_address, doctor.area, doctor.city, doctor.state, doctor.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="h-24 w-24 overflow-hidden rounded-3xl bg-slate-100">
            {doctor.profile_photo_url ? (
              <img src={doctor.profile_photo_url} alt={user?.full_name ?? "Doctor"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-bold text-slate-500">D</div>
            )}
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600">Doctor Details</p>
            <h1 className="text-3xl font-bold text-slate-900">Dr. {user?.full_name ?? "Doctor"}</h1>
            <p className="mt-2 text-slate-600">{doctor.specialty} · {doctor.years_of_experience} years experience</p>
            {doctor.handle && <p className="mt-1 text-sm text-slate-500">@{doctor.handle}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <CopyProfileLinkButton doctorId={params.doctorId} />
          <PrintPageButton />
          <Link href="/login?redirect=/doctor" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Book Appointment
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          {doctor.bio && (
            <div>
              <h2 className="text-lg font-semibold">About</h2>
              <p className="mt-2 text-slate-600">{doctor.bio}</p>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Registration No.</p>
              <p className="mt-1 font-semibold">{doctor.medical_council_number}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Rating</p>
              <p className="mt-1 font-semibold">{doctor.average_rating?.toFixed(1) ?? "0.0"} / 5</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Service radius</p>
              <p className="mt-1 font-semibold">{doctor.service_radius_km} km</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Status</p>
              <p className="mt-1 font-semibold capitalize">{doctor.status}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-5">
            <h3 className="text-base font-semibold">Contact</h3>
            <p className="mt-2 text-sm text-slate-700">Email: {user?.email ?? "—"}</p>
            <p className="text-sm text-slate-700">Phone: {user?.phone ?? "—"}</p>
            <p className="text-sm text-slate-700">Clinic: {doctor.clinic_address}</p>
            <p className="text-sm text-slate-700">Location: {displayLocation || "Not set"}</p>
          </div>
        </div>

        <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Consultation Fees</h3>
            <p className="text-slate-600">Clinic: ₹{doctor.clinic_fee}</p>
            <p className="text-slate-600">Home: ₹{doctor.home_visit_fee}</p>
            <p className="text-slate-600">Video: ₹{doctor.video_consultation_fee}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Available for</h3>
            <p className="text-slate-600">Clinic visits: {doctor.clinic_visit_available ? "Yes" : "No"}</p>
            <p className="text-slate-600">Home visits: {doctor.home_visit_available ? "Yes" : "No"}</p>
            <p className="text-slate-600">Video consults: {doctor.video_consultation_available ? "Yes" : "No"}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
