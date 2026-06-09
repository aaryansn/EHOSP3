import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/layout/dashboard-header";

const links = [
  { href: "/patient", label: "Overview" },
  { href: "/patient/appointments", label: "Appointments" },
  { href: "/patient/cases", label: "Open Cases" },
  { href: "/patient/search", label: "Find Doctors" },
  { href: "/patient/bills", label: "Bills" },
];

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/patient");

  const { data: profile } = await supabase.from("profiles").select("role, full_name, email_verified").eq("id", user.id).single();
  if (profile?.role !== "patient" && profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        portal="Patient"
        name={profile?.full_name}
        homeHref="/patient"
        links={links}
        subtitle={
          !profile?.email_verified ? (
            <p className="text-xs text-amber-600">Verify your email when possible for better account security.</p>
          ) : null
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
