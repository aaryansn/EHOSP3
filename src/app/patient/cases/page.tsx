import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubmitCaseForm } from "@/components/patient/submit-case-form";

export default async function PatientCasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: cases } = await supabase
    .from("open_cases")
    .select("id, symptoms, description, status, preferred_consultation_type, created_at, patient_age")
    .eq("patient_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Open Cases</h1>
          <p className="text-slate-500">Doctors can view and apply to help you</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Post a New Case</CardTitle></CardHeader>
        <CardContent><SubmitCaseForm /></CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Cases</h2>
        {(cases ?? []).map((c) => (
          <Card key={c.id}>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{c.symptoms}</p>
                  <p className="mt-1 text-sm text-slate-600">{c.description}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Age {c.patient_age} · {c.preferred_consultation_type} · {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium capitalize text-blue-700">{c.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {!cases?.length && <p className="text-slate-500">No cases posted yet.</p>}
      </div>
    </div>
  );
}
