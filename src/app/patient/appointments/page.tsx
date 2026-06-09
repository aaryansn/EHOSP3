import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Stethoscope, CreditCard } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-slate-100 text-slate-600",
};

export default async function PatientAppointmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, appointment_date, start_time, end_time, consultation_type, status, payment_status, symptoms, doctor_id")
    .eq("patient_id", user!.id)
    .order("appointment_date", { ascending: true });

  const doctorIds = [...new Set((appointments ?? []).map((a) => a.doctor_id))];
  const { data: doctors } = doctorIds.length
    ? await supabase.from("doctor_profiles").select("id, specialty, user_id").in("id", doctorIds)
    : { data: [] };
  const userIds = (doctors ?? []).map((d) => d.user_id);
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] };

  const doctorNameMap = new Map(
    (doctors ?? []).map((d) => [d.id, profiles?.find((p) => p.id === d.user_id)?.full_name ?? d.specialty])
  );

  const grouped = (appointments ?? []).reduce<Record<string, typeof appointments>>((acc, a) => {
    const key = a.appointment_date;
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(a);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold">My Appointments</h1>
      <p className="mt-1 text-slate-500">Your consultation schedule</p>

      <div className="mt-8 space-y-8">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-600">
              <Calendar className="h-5 w-5" />
              {new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {items?.map((a) => (
                <Card key={a.id} className="overflow-hidden border-l-4 border-l-blue-500">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{doctorNameMap.get(a.doctor_id)}</p>
                        <p className="text-sm text-slate-500 capitalize">{a.consultation_type} consultation</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${statusColors[a.status] ?? "bg-slate-100"}`}>
                        {a.status}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p className="flex items-center gap-2"><Clock className="h-4 w-4" />{a.start_time?.slice(0, 5)} – {a.end_time?.slice(0, 5)}</p>
                      <p className="flex items-center gap-2"><Stethoscope className="h-4 w-4" />{a.symptoms ?? "No symptoms noted"}</p>
                      <p className="flex items-center gap-2"><CreditCard className="h-4 w-4" />Payment: <span className="capitalize">{a.payment_status}</span></p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
        {!appointments?.length && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
            No appointments yet. <a href="/patient/search" className="text-blue-600 hover:underline">Find a doctor</a> to book.
          </p>
        )}
      </div>
    </div>
  );
}
