import { createClient } from "@/lib/supabase/server";
import { ensureDoctorProfile } from "@/lib/actions/doctor";
import { Card, CardContent } from "@/components/ui/card";
import { PrescriptionForm } from "@/components/doctor/prescription-form";
import { Calendar, Clock, User } from "lucide-react";

export default async function DoctorCalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const doctor = await ensureDoctorProfile(supabase, user!.id);

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, appointment_date, start_time, end_time, consultation_type, status, payment_status, symptoms, patient_id")
    .eq("doctor_id", doctor.id)
    .order("appointment_date", { ascending: true });

  const patientIds = [...new Set((appointments ?? []).map((a) => a.patient_id))];
  const { data: patients } = patientIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", patientIds)
    : { data: [] };
  const patientMap = new Map((patients ?? []).map((p) => [p.id, p.full_name]));

  const grouped = (appointments ?? []).reduce<Record<string, NonNullable<typeof appointments>>>((acc, a) => {
    if (!acc[a.appointment_date]) acc[a.appointment_date] = [];
    acc[a.appointment_date]!.push(a);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-slate-500">Start treatment only after payment is confirmed (paid).</p>
      </div>

      {sortedDates.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {sortedDates.map((date) => (
            <section key={date} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" })}</p>
                <h2 className="text-xl font-semibold text-slate-900">{new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</h2>
              </div>
              <div className="space-y-4">
                {grouped[date].map((a) => (
                  <Card key={a.id} className={`border ${a.status === "completed" ? "border-slate-200 bg-slate-50" : "border-blue-100 bg-white"}`}>
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold">{patientMap.get(a.patient_id)}</p>
                          <p className="text-xs text-slate-500">
                            {a.start_time?.slice(0, 5)} · <span className="capitalize">{a.consultation_type}</span>
                          </p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${a.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {a.payment_status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{a.symptoms}</p>
                      <p className="text-sm text-slate-500">Status: <span className="capitalize">{a.status}</span></p>
                      {a.payment_status === "paid" && a.status !== "completed" && (
                        <PrescriptionForm appointmentId={a.id} />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed p-12 text-center text-slate-500">No appointments scheduled.</p>
      )}
    </div>
  );
}
