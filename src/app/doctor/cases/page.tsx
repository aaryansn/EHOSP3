import { createClient } from "@/lib/supabase/server";
import { ensureDoctorProfile } from "@/lib/actions/doctor";
import { AcceptCaseButton } from "@/components/doctor/accept-case-button";
import { Card, CardContent } from "@/components/ui/card";

export default async function DoctorCasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const doctor = await ensureDoctorProfile(supabase, user!.id);

  const { data: cases } = await supabase
    .from("open_cases")
    .select("id, symptoms, description, patient_age, patient_gender, address, preferred_consultation_type, status, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  const canAccept = doctor?.status === "approved";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Open Cases Marketplace</h1>
        {!canAccept && (
          <p className="mt-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You must be verified by admin before accepting cases.{" "}
            <a href="/doctor/profile" className="font-medium underline">Request verification help</a>
          </p>
        )}
        <p className="mt-1 text-slate-500">Payment must be received before you begin treatment</p>
      </div>

      <div className="grid gap-4">
        {(cases ?? []).map((c) => (
          <Card key={c.id}>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-lg">{c.symptoms}</p>
                    <p className="mt-2 text-sm text-slate-500">Age {c.patient_age} · {c.patient_gender} · {c.address} · {c.preferred_consultation_type}</p>
                  </div>
                  <details className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <summary className="cursor-pointer font-semibold text-slate-800">View case details</summary>
                    <p className="mt-3 text-sm text-slate-700">{c.description ?? "No additional description provided."}</p>
                  </details>
                </div>
                {canAccept && <AcceptCaseButton caseId={c.id} />}
              </div>
            </CardContent>
          </Card>
        ))}
        {!cases?.length && <p className="text-slate-500">No open cases right now.</p>}
      </div>
    </div>
  );
}
