import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PrintBillButton } from "@/components/doctor/print-bill-button";

type Props = { params: Promise<{ billNumber: string }> };

export default async function BillPage({ params }: Props) {
  const { billNumber } = await params;
  const supabase = await createClient();

  const { data: bill } = await supabase
    .from("bills")
    .select("*")
    .eq("bill_number", billNumber)
    .single();

  if (!bill) notFound();

  const medicines = (bill.line_items as { name: string; dosage: string; frequency: string; timing: string; duration: string }[]) ?? [];

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 print:p-4" id="bill-print">
      <div className="border-b border-slate-200 pb-4 text-center">
        <h1 className="text-2xl font-bold text-blue-600">eHosp</h1>
        <p className="text-sm text-slate-500">Medical Bill & Prescription</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-semibold">Doctor</p>
          <p>{bill.doctor_name}</p>
          <p className="text-slate-500">Reg. No: {bill.doctor_registration_number}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">Bill #{bill.bill_number}</p>
          <p className="text-slate-500">{new Date(bill.created_at).toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-4 text-sm">
        <p><strong>Patient:</strong> {bill.patient_name}</p>
        <p><strong>Consultation:</strong> <span className="capitalize">{bill.consultation_type}</span></p>
        <p><strong>Diagnosis:</strong> {bill.diagnosis}</p>
      </div>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b bg-slate-50">
            <th className="py-2 text-left">Medicine</th>
            <th className="py-2 text-left">Dosage</th>
            <th className="py-2 text-left">Frequency</th>
            <th className="py-2 text-left">Timing</th>
            <th className="py-2 text-left">Duration</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((m, i) => (
            <tr key={i} className="border-b">
              <td className="py-2">{m.name}</td>
              <td className="py-2">{m.dosage}</td>
              <td className="py-2">{m.frequency}</td>
              <td className="py-2">{m.timing}</td>
              <td className="py-2">{m.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 border-t pt-4 text-right">
        <p>Subtotal: ₹{bill.subtotal}</p>
        <p>Platform fee: ₹{bill.platform_fee}</p>
        <p className="text-lg font-bold">Total: ₹{bill.total}</p>
      </div>
      <div className="mt-8 print:hidden">
        <PrintBillButton />
      </div>
    </div>
  );
}
