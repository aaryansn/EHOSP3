"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthCallbackUrl } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SPECIALTIES } from "@/lib/constants";

export default function DoctorRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    medical_council_number: "",
    specialty: SPECIALTIES[0],
    years_of_experience: "0",
    gender: "",
    clinic_address: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    clinic_fee: "500",
    home_visit_fee: "800",
    video_consultation_fee: "400",
    clinic_visit_available: true,
    home_visit_available: false,
    video_consultation_available: true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: getAuthCallbackUrl("/dashboard", window.location.origin),
        data: {
          role: "doctor",
          full_name: form.full_name,
          phone: form.phone,
          medical_council_number: form.medical_council_number,
          specialty: form.specialty,
          years_of_experience: form.years_of_experience,
          gender: form.gender || null,
          clinic_address: form.clinic_address,
          area: form.area,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          clinic_fee: form.clinic_fee,
          home_visit_fee: form.home_visit_fee,
          video_consultation_fee: form.video_consultation_fee,
          clinic_visit_available: form.clinic_visit_available,
          home_visit_available: form.home_visit_available,
          video_consultation_available: form.video_consultation_available,
        },
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Doctor Registration</CardTitle>
          <CardDescription>Submit your application. Admin approval required before accepting appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Full Name</label>
              <Input required value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Mobile</label>
              <Input type="tel" required value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <Input type="password" required minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Council Registration No.</label>
              <Input required value={form.medical_council_number} onChange={(e) => update("medical_council_number", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Specialty</label>
              <select className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm" value={form.specialty} onChange={(e) => update("specialty", e.target.value)}>
                {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Years of Experience</label>
              <Input type="number" min={0} required value={form.years_of_experience} onChange={(e) => update("years_of_experience", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Clinic Address</label>
              <Input required value={form.clinic_address} onChange={(e) => update("clinic_address", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Area</label>
              <Input value={form.area} onChange={(e) => update("area", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">City</label>
              <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">State</label>
              <Input value={form.state} onChange={(e) => update("state", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Pincode</label>
              <Input value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.clinic_visit_available} onChange={(e) => update("clinic_visit_available", e.target.checked)} />
                Clinic Visit
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.home_visit_available} onChange={(e) => update("home_visit_available", e.target.checked)} />
                Home Visit
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.video_consultation_available} onChange={(e) => update("video_consultation_available", e.target.checked)} />
                Video Consultation
              </label>
            </div>
            {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
            <Button type="submit" className="sm:col-span-2" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            Patient? <Link href="/register" className="text-blue-600 hover:underline">Register as Patient</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
