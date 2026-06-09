import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureDoctorProfile } from "@/lib/actions/doctor";
import { DoctorProfileEditor } from "@/components/doctor/doctor-profile-editor";

export default async function DoctorProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", user.id)
    .single();

  const doctor = await ensureDoctorProfile(supabase, user.id);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating, review_text, created_at")
    .eq("doctor_id", doctor.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <DoctorProfileEditor
      doctor={doctor}
      email={profile?.email ?? ""}
      fullName={profile?.full_name ?? ""}
      phone={profile?.phone ?? null}
      reviews={reviews ?? []}
    />
  );
}
