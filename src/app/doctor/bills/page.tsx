import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ensureDoctorProfile } from "@/lib/actions/doctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ranges = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "Last 30 days" },
] as const;

type Props = { searchParams?: { range?: string } };

function getRangeStart(range: string) {
  const now = new Date();
  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (range === "week") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  }
  if (range === "month") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
  }
  return null;
}

export default async function DoctorBillsPage({ searchParams }: Props) {
  const range = searchParams?.range ?? "all";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const doctor = await ensureDoctorProfile(supabase, user!.id);

  const query = supabase.from("bills").select("id, bill_number, patient_name, consultation_type, total, created_at").eq("doctor_id", doctor.id).order("created_at", { ascending: false });
  const rangeStart = getRangeStart(range);
  if (rangeStart) {
    query.gte("created_at", rangeStart.toISOString());
  }

  const { data: bills } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Bills</h1>
        <p className="mt-2 text-slate-600">Download your bills and prescriptions by day, week, or month.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {ranges.map((option) => (
          <Link
            key={option.value}
            href={`/doctor/bills?range=${option.value}`}
            className={`rounded-full border px-4 py-2 text-sm ${range === option.value ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 text-slate-700"}`}
          >
            {option.label}
          </Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Bill #</th>
              <th className="px-4 py-3 text-left">Patient</th>
              <th className="px-4 py-3 text-left">Consultation</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {(bills ?? []).map((bill) => (
              <tr key={bill.id} className="border-t border-slate-200">
                <td className="px-4 py-3">{bill.bill_number}</td>
                <td className="px-4 py-3">{bill.patient_name}</td>
                <td className="px-4 py-3 capitalize">{bill.consultation_type}</td>
                <td className="px-4 py-3">₹{bill.total}</td>
                <td className="px-4 py-3">{new Date(bill.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link href={`/doctor/bills/${bill.bill_number}`} className="text-blue-600 hover:underline">Download PDF</Link>
                </td>
              </tr>
            ))}
            {!bills?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">No bills found for this period.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
