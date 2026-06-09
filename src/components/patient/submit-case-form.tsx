"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOpenCase } from "@/lib/actions/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CONSULTATION_TYPES } from "@/lib/constants";

export function SubmitCaseForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      await createOpenCase(fd);
      router.push("/patient/cases");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`grid gap-4 ${compact ? "sm:grid-cols-2" : ""}`}>
      <div className={compact ? "sm:col-span-2" : ""}>
        <label className="mb-1 block text-sm font-medium">Symptoms *</label>
        <Input name="symptoms" required placeholder="e.g. Fever, headache for 3 days" />
      </div>
      <div className={compact ? "sm:col-span-2" : ""}>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea name="description" className="min-h-20 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm" placeholder="More details..." />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Age</label>
        <Input name="patient_age" type="number" min={1} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Gender</label>
        <select name="patient_gender" className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm" required>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className={compact ? "sm:col-span-2" : ""}>
        <label className="mb-1 block text-sm font-medium">Location / Address</label>
        <Input name="address" required placeholder="City or full address" />
      </div>
      <div className={compact ? "sm:col-span-2" : ""}>
        <label className="mb-1 block text-sm font-medium">Preferred consultation</label>
        <select name="preferred_consultation_type" className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
          {CONSULTATION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <Button type="submit" disabled={loading} className={compact ? "sm:col-span-2" : ""}>
        {loading ? "Submitting..." : "Submit Case"}
      </Button>
    </form>
  );
}
