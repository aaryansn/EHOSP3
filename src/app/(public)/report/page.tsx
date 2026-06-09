"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REPORT_REASONS } from "@/lib/constants";

export default function ReportPage() {
  const [reportedEmail, setReportedEmail] = useState("");
  const [reason, setReason] = useState("misconduct");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage("Please login to submit a report.");
      setLoading(false);
      return;
    }
    const { data: reported } = await supabase.from("profiles").select("id").eq("email", reportedEmail).single();
    if (!reported) {
      setMessage("User not found.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_user_id: reported.id,
      reason,
      details,
    });
    setMessage(error ? error.message : "Report submitted. Our team will review it.");
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Report a User</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Reported user email</label>
          <Input required type="email" value={reportedEmail} onChange={(e) => setReportedEmail(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Reason</label>
          <select className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REPORT_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Details</label>
          <textarea className="min-h-24 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm" required value={details} onChange={(e) => setDetails(e.target.value)} />
        </div>
        {message && <p className="text-sm text-slate-600">{message}</p>}
        <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Report"}</Button>
      </form>
    </div>
  );
}
