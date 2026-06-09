import { createClient } from "@/lib/supabase/server";
import { addWorkingHours, ensureDoctorProfile } from "@/lib/actions/doctor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function DoctorAvailabilityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const doctor = await ensureDoctorProfile(supabase, user!.id);
  const { data: hours } = await supabase
    .from("doctor_working_hours")
    .select("*")
    .eq("doctor_id", doctor?.id ?? "")
    .order("day_of_week");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Availability</h1>
        <p className="text-slate-500">Set your working hours · Max {doctor?.max_patients_per_slot ?? 1} patients per 30-min slot</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Add Working Hours</CardTitle></CardHeader>
        <CardContent>
          <form action={addWorkingHours} className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Day</label>
              <select name="day_of_week" className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Start</label>
              <Input name="start_time" type="time" required defaultValue="09:00" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">End</label>
              <Input name="end_time" type="time" required defaultValue="17:00" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">Add</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(hours ?? []).map((h) => (
          <Card key={h.id}>
            <CardContent className="p-4">
              <p className="font-medium">{DAYS[h.day_of_week]}</p>
              <p className="text-sm text-slate-600">{h.start_time?.slice(0, 5)} – {h.end_time?.slice(0, 5)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
