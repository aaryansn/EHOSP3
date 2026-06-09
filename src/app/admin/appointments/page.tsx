import { createClient } from "@/lib/supabase/server";
export default async function AdminAppointmentsPage() {
  const supabase = await createClient();
  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, appointment_date, start_time, consultation_type, status, payment_status, patient_id, doctor_id")
    .order("appointment_date", { ascending: false })
    .limit(50);

  const patientIds = [...new Set((appointments ?? []).map((a) => a.patient_id))];
  const doctorIds = [...new Set((appointments ?? []).map((a) => a.doctor_id))];

  const [{ data: patients }, { data: doctors }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", patientIds),
    supabase.from("doctor_profiles").select("id, user_id, specialty").in("id", doctorIds),
  ]);

  const doctorUserIds = (doctors ?? []).map((d) => d.user_id);
  const { data: doctorProfiles } = doctorUserIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", doctorUserIds)
    : { data: [] };

  const patientMap = new Map((patients ?? []).map((p) => [p.id, p.full_name]));
  const doctorMap = new Map(
    (doctors ?? []).map((d) => {
      const name = (doctorProfiles ?? []).find((p) => p.id === d.user_id)?.full_name ?? d.specialty;
      return [d.id, name];
    })
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">Appointments</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Patient</th>
              <th className="px-4 py-3 text-left">Doctor</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Payment</th>
            </tr>
          </thead>
          <tbody>
            {(appointments ?? []).map((a) => (
              <tr key={a.id} className="border-t border-slate-200">
                <td className="px-4 py-3">{a.appointment_date}</td>
                <td className="px-4 py-3">{a.start_time?.slice(0, 5)}</td>
                <td className="px-4 py-3">{patientMap.get(a.patient_id) ?? "—"}</td>
                <td className="px-4 py-3">{doctorMap.get(a.doctor_id) ?? "—"}</td>
                <td className="px-4 py-3 capitalize">{a.consultation_type}</td>
                <td className="px-4 py-3 capitalize">{a.status}</td>
                <td className="px-4 py-3 capitalize">{a.payment_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
