import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

export default async function PatientBillsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: bills } = await supabase
    .from("bills")
    .select("bill_number, doctor_name, total, diagnosis, created_at, consultation_type")
    .eq("patient_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">My Bills</h1>
      <div className="mt-6 space-y-3">
        {(bills ?? []).map((b) => (
          <Card key={b.bill_number}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{b.bill_number}</p>
                <p className="text-sm text-slate-600">Dr. {b.doctor_name} · {b.diagnosis}</p>
                <p className="text-xs text-slate-400">{new Date(b.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">₹{b.total}</p>
                <Link href={`/patient/bills/${b.bill_number}`} className="text-sm text-blue-600 hover:underline">View / Print</Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {!bills?.length && <p className="text-slate-500">No bills yet.</p>}
      </div>
    </div>
  );
}
