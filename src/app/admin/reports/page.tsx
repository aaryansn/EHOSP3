import { createClient } from "@/lib/supabase/server";
import { dismissReport } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("id, reason, details, status, created_at, reporter_id, reported_user_id")
    .order("created_at", { ascending: false });

  const userIds = [...new Set((reports ?? []).flatMap((r) => [r.reporter_id, r.reported_user_id]))];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, full_name, email").in("id", userIds)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div>
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="mt-6 space-y-4">
        {(reports ?? []).map((r) => (
          <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium capitalize">{r.reason.replace(/_/g, " ")}</p>
                <p className="mt-1 text-sm text-slate-600">{r.details}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Reporter: {profileMap.get(r.reporter_id)?.full_name} → Reported: {profileMap.get(r.reported_user_id)?.full_name}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize">{r.status}</span>
                {r.status === "pending" && (
                  <form action={dismissReport.bind(null, r.id)} className="mt-2">
                    <Button size="sm" variant="outline" type="submit">Dismiss</Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
        {!reports?.length && <p className="text-slate-500">No reports yet.</p>}
      </div>
    </div>
  );
}
