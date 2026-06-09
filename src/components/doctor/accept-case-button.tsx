"use client";

import { acceptCase } from "@/lib/actions/doctor";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function AcceptCaseButton({ caseId }: { caseId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAccept() {
    setLoading(true);
    setError("");
    try {
      await acceptCase(caseId);
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={handleAccept} disabled={loading}>{loading ? "..." : "Accept Case"}</Button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
