import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, FileText, Search } from "lucide-react";
import { SubmitCaseForm } from "@/components/patient/submit-case-form";

export default async function PatientDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ count: appointmentCount }, { count: caseCount }, { data: upcoming }] = await Promise.all([
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("patient_id", user!.id),
    supabase.from("open_cases").select("*", { count: "exact", head: true }).eq("patient_id", user!.id),
    supabase.from("appointments").select("id, appointment_date, start_time, consultation_type, status, payment_status")
      .eq("patient_id", user!.id).gte("appointment_date", new Date().toISOString().split("T")[0])
      .order("appointment_date").limit(3),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-slate-500">Manage your health appointments and open cases</p>
        </div>
        <Button asChild>
          <Link href="/patient/cases"><Plus className="h-4 w-4" /> Submit Open Case</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{appointmentCount ?? 0}</p>
            <Link href="/patient/appointments" className="text-sm text-blue-600 hover:underline">View calendar →</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Open Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{caseCount ?? 0}</p>
            <Link href="/patient/cases" className="text-sm text-blue-600 hover:underline">View cases →</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Search className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Find Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-2">Search nearby verified doctors</p>
            <Link href="/patient/search" className="text-sm text-blue-600 hover:underline">Search now →</Link>
          </CardContent>
        </Card>
      </div>

      {upcoming && upcoming.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Upcoming</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {upcoming.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                <span className="capitalize">{a.consultation_type} · {a.appointment_date} {a.start_time?.slice(0, 5)}</span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 capitalize">{a.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Quick — Post an Open Case</CardTitle></CardHeader>
        <CardContent>
          <SubmitCaseForm compact />
        </CardContent>
      </Card>
    </div>
  );
}
