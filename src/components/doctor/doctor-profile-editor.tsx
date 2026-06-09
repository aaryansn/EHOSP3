"use client";

import { useState } from "react";
import {
  updateDoctorProfile,
  updateVideoMeetLinkAction,
  saveBankingDetails,
  requestVerificationHelp,
} from "@/lib/actions/doctor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPECIALTIES } from "@/lib/constants";
import { Pencil } from "lucide-react";

type Doctor = {
  bio: string | null;
  specialty: string;
  years_of_experience: number;
  clinic_address: string | null;
  area: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  handle: string | null;
  service_radius_km: number;
  clinic_fee: number;
  home_visit_fee: number;
  video_consultation_fee: number;
  clinic_visit_available: boolean;
  home_visit_available: boolean;
  video_consultation_available: boolean;
  max_patients_per_slot: number;
  video_meet_link: string | null;
  status: string;
  medical_council_number: string;
};

type Review = { rating: number; review_text: string | null; created_at: string };

type Props = {
  doctor: Doctor;
  email: string;
  fullName: string;
  phone: string | null;
  reviews: Review[];
};

export function DoctorProfileEditor({ doctor, email, fullName, phone, reviews }: Props) {
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");
  const [helpMsg, setHelpMsg] = useState("");
  const [helpText, setHelpText] = useState("");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Doctor Profile</h1>
          <p className="text-slate-500">Council No: {doctor.medical_council_number}</p>
        </div>
        <Button type="button" variant={editing ? "outline" : "default"} onClick={() => setEditing(!editing)}>
          <Pencil className="h-4 w-4" /> {editing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Identity (read-only)</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm text-slate-600">
          <p><strong>Name:</strong> {fullName}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Phone:</strong> {phone ?? "—"}</p>
          <p><strong>Status:</strong> <span className="capitalize">{doctor.status}</span></p>
          {doctor.handle && <p><strong>Handle:</strong> @{doctor.handle}</p>}
        </CardContent>
      </Card>

      {doctor.status === "pending" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader><CardTitle className="text-amber-900">Verification Help</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-amber-800">Contact admin to speed up verification. You cannot accept cases until approved.</p>
            <textarea
              className="min-h-20 w-full rounded-lg border p-3 text-sm"
              placeholder="Message to admin..."
              value={helpText}
              onChange={(e) => setHelpText(e.target.value)}
            />
            <Button
              size="sm"
              type="button"
              onClick={async () => {
                try {
                  await requestVerificationHelp(helpText);
                  setHelpMsg("Request sent to admin!");
                } catch (e) {
                  setHelpMsg(e instanceof Error ? e.message : "Failed");
                }
              }}
            >
              Send Help Request
            </Button>
            {helpMsg && <p className="text-sm">{helpMsg}</p>}
          </CardContent>
        </Card>
      )}

      <form
        action={async (fd) => {
          await updateDoctorProfile(fd);
          setMsg("Profile saved");
          setEditing(false);
        }}
      >
        <Card>
          <CardHeader><CardTitle>Professional Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Bio</label>
              <textarea name="bio" disabled={!editing} defaultValue={doctor.bio ?? ""} className="min-h-20 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm disabled:bg-slate-50" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Specialty</label>
              <select name="specialty" disabled={!editing} defaultValue={doctor.specialty} className="flex h-10 w-full rounded-lg border px-3 text-sm disabled:bg-slate-50">
                {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Experience (years)</label>
              <Input name="years_of_experience" type="number" disabled={!editing} defaultValue={doctor.years_of_experience} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Clinic Address</label>
              <Input name="clinic_address" disabled={!editing} defaultValue={doctor.clinic_address ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Handle</label>
              <Input name="handle" disabled={!editing} defaultValue={doctor.handle ?? ""} placeholder="doctor-handle" />
              <p className="text-xs text-slate-500">Choose a short handle for your public profile.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Area</label>
              <Input name="area" disabled={!editing} defaultValue={doctor.area ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">City</label>
              <Input name="city" disabled={!editing} defaultValue={doctor.city ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">State</label>
              <Input name="state" disabled={!editing} defaultValue={doctor.state ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Pincode</label>
              <Input name="pincode" disabled={!editing} defaultValue={doctor.pincode ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Service Radius (km)</label>
              <Input name="service_radius_km" type="number" min={1} max={100} disabled={!editing} defaultValue={doctor.service_radius_km} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Max patients / slot</label>
              <Input name="max_patients_per_slot" type="number" disabled={!editing} defaultValue={doctor.max_patients_per_slot} />
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="clinic_visit_available" disabled={!editing} defaultChecked={doctor.clinic_visit_available} /> Clinic Visit
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="home_visit_available" disabled={!editing} defaultChecked={doctor.home_visit_available} /> Home Visit
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="video_consultation_available" disabled={!editing} defaultChecked={doctor.video_consultation_available} /> Video Consultation
              </label>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Clinic Fee (₹)</label>
              <Input name="clinic_fee" type="number" disabled={!editing} defaultValue={doctor.clinic_fee} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Home Visit Fee (₹)</label>
              <Input name="home_visit_fee" type="number" disabled={!editing} defaultValue={doctor.home_visit_fee} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Video Fee (₹)</label>
              <Input name="video_consultation_fee" type="number" disabled={!editing} defaultValue={doctor.video_consultation_fee} />
            </div>
            {editing && (
              <div className="sm:col-span-2">
                <Button type="submit">Save Changes</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader><CardTitle>Video Meet Link</CardTitle></CardHeader>
        <CardContent>
          <form action={updateVideoMeetLinkAction} className="flex gap-2">
            <Input name="video_meet_link" defaultValue={doctor.video_meet_link ?? ""} placeholder="https://meet.google.com/..." className="flex-1" />
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Bank Account Details</CardTitle></CardHeader>
        <CardContent>
          <form action={saveBankingDetails} className="grid gap-4 sm:grid-cols-2">
            <Input name="account_holder_name" placeholder="Account holder name" required />
            <Input name="bank_name" placeholder="Bank name" required />
            <Input name="account_number" placeholder="Account number" required />
            <Input name="ifsc_code" placeholder="IFSC code" required />
            <Input name="upi_id" placeholder="UPI ID (optional)" className="sm:col-span-2" />
            <Button type="submit" className="sm:col-span-2">Save Banking Details</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {reviews.length ? reviews.map((r, i) => (
            <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
              <p className="font-medium">{"⭐".repeat(r.rating)}</p>
              <p className="text-slate-600">{r.review_text}</p>
              <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
          )) : <p className="text-slate-500">No reviews yet.</p>}
        </CardContent>
      </Card>

      {msg && <p className="text-sm text-green-600">{msg}</p>}
    </div>
  );
}
