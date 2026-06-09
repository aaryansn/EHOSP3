import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/layout/dashboard-header";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/doctors", label: "Doctors" },
  { href: "/admin/patients", label: "Patients" },
  { href: "/admin/new-users", label: "New Users" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/cms", label: "CMS" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/admin");

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader portal="Admin" name={profile?.full_name} homeHref="/admin" links={links} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
