"use client";

import { useState } from "react";
import { savePrescriptionAndBill } from "@/lib/actions/doctor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";

type Medicine = {
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  duration: string;
};

const TIMING = ["Before food", "After food", "With food", "Empty stomach", "At bedtime"];

export function PrescriptionForm({ appointmentId }: { appointmentId: string }) {
  const [open, setOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [advice, setAdvice] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: "", dosage: "", frequency: "", timing: "After food", duration: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [billNumber, setBillNumber] = useState("");

  function updateMed(i: number, field: keyof Medicine, value: string) {
    setMedicines((m) => m.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.set("appointment_id", appointmentId);
    fd.set("diagnosis", diagnosis);
    fd.set("advice", advice);
    fd.set("medicines", JSON.stringify(medicines.filter((m) => m.name)));
    fd.set("subtotal", "500");
    fd.set("platform_fee", "50");
    fd.set("total", "550");
    try {
      const num = await savePrescriptionAndBill(fd);
      setBillNumber(num);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  if (billNumber) {
    return (
      <div className="text-right">
        <p className="text-sm text-green-600">Bill {billNumber} created</p>
        <Button size="sm" variant="outline" asChild>
          <a href={`/doctor/bills/${billNumber}`} target="_blank">Download PDF</a>
        </Button>
      </div>
    );
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <FileText className="h-4 w-4" /> Prescribe & Bill
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
      <Input placeholder="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
      {medicines.map((m, i) => (
        <div key={i} className="grid gap-2 rounded border border-slate-200 bg-white p-2">
          <Input placeholder="Medicine name" value={m.name} onChange={(e) => updateMed(i, "name", e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Dosage (e.g. 500mg)" value={m.dosage} onChange={(e) => updateMed(i, "dosage", e.target.value)} />
            <Input placeholder="Frequency (e.g. 1-0-1)" value={m.frequency} onChange={(e) => updateMed(i, "frequency", e.target.value)} />
          </div>
          <select className="h-9 rounded-lg border px-2" value={m.timing} onChange={(e) => updateMed(i, "timing", e.target.value)}>
            {TIMING.map((t) => <option key={t}>{t}</option>)}
          </select>
          <Input placeholder="Duration (e.g. 5 days)" value={m.duration} onChange={(e) => updateMed(i, "duration", e.target.value)} />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => setMedicines([...medicines, { name: "", dosage: "", frequency: "", timing: "After food", duration: "" }])}>
        + Add medicine
      </Button>
      <textarea className="w-full rounded-lg border p-2" placeholder="Advice / notes" value={advice} onChange={(e) => setAdvice(e.target.value)} />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>{loading ? "Saving..." : "Complete & Generate Bill"}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
