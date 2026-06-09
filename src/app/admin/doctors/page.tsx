import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { approveDoctor, rejectDoctor } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export default async function AdminDoctorsPage() {
  const supabase = await createClient();
  const { data: doctors } = await supabase
    .from("doctor_profiles")
    .select("id, user_id, specialty, status, medical_council_number")
    .order("created_at", { ascending: false });

  const userIds = (doctors ?? []).map((d) => d.user_id);
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, full_name, email").in("id", userIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div>
      <h1 className="text-2xl font-bold">Doctor Management</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Specialty</th>
              <th className="px-4 py-3 text-left">Council No.</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(doctors ?? []).map((doc) => {
              const profile = profileMap.get(doc.user_id);
              return (
                <tr key={doc.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{profile?.full_name ?? "—"}</div>
                    <Link href={`/doctors/${doc.id}`} className="text-blue-600 hover:underline text-xs">View details</Link>
                  </td>
                  <td className="px-4 py-3">{doc.specialty}</td>
                  <td className="px-4 py-3">{doc.medical_council_number}</td>
                  <td className="px-4 py-3 capitalize">{doc.status}</td>
                  <td className="px-4 py-3">
                    {doc.status === "pending" && (
                      <div className="flex gap-2">
                        <form action={approveDoctor.bind(null, doc.id)}>
                          <Button size="sm" type="submit">Approve</Button>
                        </form>
                        <form action={rejectDoctor.bind(null, doc.id)}>
                          <Button size="sm" variant="destructive" type="submit">Reject</Button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
