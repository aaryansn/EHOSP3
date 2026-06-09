import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { banUser, restoreUser } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export default async function AdminPatientsPage() {
  const supabase = await createClient();
  const [{ data: patients }, { data: cases }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, phone, status, created_at")
      .eq("role", "patient")
      .order("created_at", { ascending: false }),
    supabase.from("open_cases").select("id, patient_id"),
  ]);

  const caseCounts = new Map<string, number>();
  (cases ?? []).forEach((c) => {
    if (!c.patient_id) return;
    caseCounts.set(c.patient_id, (caseCounts.get(c.patient_id) ?? 0) + 1);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Patient Management</h1>
        <p className="mt-2 text-slate-600">Review patient accounts, see open case counts, and ban or restore users.</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Open Cases</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(patients ?? []).map((p) => (
              <tr key={p.id} className="border-t border-slate-200">
                <td className="px-4 py-3">
                  <details className="space-y-2">
                    <summary className="font-semibold text-slate-900 cursor-pointer">{p.full_name}</summary>
                    <div className="space-y-1 text-xs text-slate-600">
                      <p>Registered: {new Date(p.created_at).toLocaleDateString()}</p>
                      <p>Open cases: {caseCounts.get(p.id) ?? 0}</p>
                      <p>Status: {p.status}</p>
                    </div>
                  </details>
                </td>
                <td className="px-4 py-3">{p.email}</td>
                <td className="px-4 py-3">{p.phone ?? "—"}</td>
                <td className="px-4 py-3">{caseCounts.get(p.id) ?? 0}</td>
                <td className="px-4 py-3 capitalize">{p.status}</td>
                <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {p.status === "banned" ? (
                      <form action={restoreUser.bind(null, p.id)}>
                        <Button size="sm" variant="outline" type="submit">Restore</Button>
                      </form>
                    ) : (
                      <form action={banUser.bind(null, p.id)}>
                        <Button size="sm" variant="destructive" type="submit">Ban</Button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
