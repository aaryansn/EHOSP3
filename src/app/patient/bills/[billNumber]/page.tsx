import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PrintBillButton } from "@/components/doctor/print-bill-button";

type Props = { params: Promise<{ billNumber: string }> };

export default async function PatientBillViewPage({ params }: Props) {
  const { billNumber } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bill } = await supabase.from("bills").select("*").eq("bill_number", billNumber).single();
  if (!bill || bill.patient_id !== user.id) notFound();

  const medicines = (bill.line_items as { name: string; dosage: string; frequency: string; timing: string; duration: string }[]) ?? [];

  return (
    <div className="mx-auto max-w-2xl bg-white p-8">
      <div className="border-b pb-4 text-center">
        <h1 className="text-2xl font-bold text-blue-600">eHosp Bill</h1>
        <p className="text-sm text-slate-500">#{bill.bill_number}</p>
      </div>
      <div className="mt-6 text-sm space-y-2">
        <p><strong>Doctor:</strong> {bill.doctor_name} (Reg: {bill.doctor_registration_number})</p>
        <p><strong>Diagnosis:</strong> {bill.diagnosis}</p>
      </div>
      <table className="mt-6 w-full text-sm">
        <thead><tr className="border-b bg-slate-50"><th className="py-2 text-left">Medicine</th><th>Dosage</th><th>Timing</th></tr></thead>
        <tbody>
          {medicines.map((m, i) => (
            <tr key={i} className="border-b"><td className="py-2">{m.name}</td><td>{m.dosage}</td><td>{m.timing}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="mt-6 text-right text-lg font-bold">Total: ₹{bill.total}</p>
      <div className="mt-6"><PrintBillButton /></div>
    </div>
  );
}
