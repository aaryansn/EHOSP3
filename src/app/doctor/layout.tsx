import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureDoctorProfile } from "@/lib/actions/doctor";
import { DashboardHeader } from "@/components/layout/dashboard-header";

const links = [
  { href: "/doctor", label: "Overview" },
  { href: "/doctor/calendar", label: "Calendar" },
  { href: "/doctor/availability", label: "Availability" },
  { href: "/doctor/cases", label: "Open Cases" },
  { href: "/doctor/bills", label: "Bills" },
  { href: "/doctor/profile", label: "Profile" },
];

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/doctor");

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  if (profile?.role !== "doctor" && profile?.role !== "admin") redirect("/dashboard");

  const doctor = await ensureDoctorProfile(supabase, user.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        portal="Doctor"
        name={profile?.full_name}
        homeHref="/doctor"
        links={links}
        subtitle={
          doctor?.status === "pending" ? (
            <p className="text-xs text-amber-600">
              Pending admin approval —{" "}
              <Link href="/doctor/profile" className="underline">request verification help</Link>
            </p>
          ) : doctor?.status === "approved" ? (
            <p className="text-xs text-green-600">Verified · You can accept paid cases</p>
          ) : null
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
