import { createClient } from "@/lib/supabase/server";
import { ensureDoctorProfile } from "@/lib/actions/doctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DoctorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const doctor = await ensureDoctorProfile(supabase, user!.id);

  const { count: todayAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("doctor_id", doctor?.id ?? "")
    .eq("appointment_date", new Date().toISOString().split("T")[0]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
      <p className="mt-1 text-slate-500">Status: <span className="capitalize">{doctor?.status ?? "—"}</span></p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Today</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{todayAppointments ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Rating</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{doctor?.average_rating ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Consultations</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{doctor?.total_consultations ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Monthly Patients</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{doctor?.monthly_patients ?? 0}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
