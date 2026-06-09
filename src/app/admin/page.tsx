import { createClient } from "@/lib/supabase/server";
import { updatePlatformSetting } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: patients },
    { count: doctors },
    { count: pendingDoctors },
    { count: appointments },
    { count: reports },
    { data: settingRows },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "patient"),
    supabase.from("doctor_profiles").select("*", { count: "exact", head: true }),
    supabase.from("doctor_profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("appointments").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("platform_settings").select("value").eq("key", "auto_approve_doctors"),
  ]);

  const autoApproveEnabled = (settingRows?.[0]?.value as any)?.enabled ?? false;

  const stats = [
    { label: "Patients", value: patients ?? 0 },
    { label: "Doctors", value: doctors ?? 0 },
    { label: "Pending Applications", value: pendingDoctors ?? 0 },
    { label: "Appointments", value: appointments ?? 0 },
    { label: "Pending Reports", value: reports ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader><CardTitle className="text-sm">{s.label}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{s.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Doctor auto-approval</h2>
            <p className="mt-2 text-sm text-slate-600">
              {autoApproveEnabled
                ? "New doctor registrations will be approved automatically."
                : "New doctor registrations require admin approval."
              }
            </p>
          </div>
          <form action={updatePlatformSetting} className="flex items-center gap-3">
            <input type="hidden" name="key" value="auto_approve_doctors" />
            <input type="hidden" name="enabled" value={autoApproveEnabled ? "false" : "true"} />
            <Button type="submit" variant={autoApproveEnabled ? "destructive" : "outline"}>
              {autoApproveEnabled ? "Disable auto-approve" : "Enable auto-approve"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
