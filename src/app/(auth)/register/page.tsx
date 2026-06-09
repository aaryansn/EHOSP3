"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthCallbackUrl } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    date_of_birth: "",
    address: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: getAuthCallbackUrl("/dashboard", window.location.origin),
        data: {
          role: "patient",
          full_name: form.full_name,
          phone: form.phone,
          gender: form.gender,
          date_of_birth: form.date_of_birth,
          address: form.address,
          area: form.area,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Patient Registration</CardTitle>
          <CardDescription>Create your eHosp patient account.</CardDescription>
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
              <label className="mb-1 block text-sm font-medium">Gender</label>
              <select className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm" value={form.gender} onChange={(e) => update("gender", e.target.value)} required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Date of Birth</label>
              <Input type="date" required value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Address</label>
              <Input required value={form.address} onChange={(e) => update("address", e.target.value)} />
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
            {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
            <Button type="submit" className="sm:col-span-2" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            Doctor? <Link href="/register/doctor" className="text-blue-600 hover:underline">Register as Doctor</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
