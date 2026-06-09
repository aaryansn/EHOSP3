"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function updateVideoMeetLinkAction(formData: FormData) {
  await updateVideoMeetLink((formData.get("video_meet_link") as string) ?? "");
}

export async function updateVideoMeetLink(videoMeetLink: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const trimmed = videoMeetLink.trim();
  if (trimmed && !/^https?:\/\/.+/i.test(trimmed)) {
    throw new Error("Please enter a valid URL (https://...)");
  }

  const { error } = await supabase
    .from("doctor_profiles")
    .update({ video_meet_link: trimmed || null })
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/doctor/profile");
}
export async function ensureDoctorProfile(supabase: SupabaseClient, userId: string) {
  const { data: doctor } = await supabase.from("doctor_profiles").select("*").eq("user_id", userId).single();
  if (doctor) return doctor;

  const { data: profile } = await supabase.from("profiles").select("full_name, email, phone").eq("id", userId).single();
  const clinicAddress = profile?.full_name ? `${profile.full_name}'s clinic` : "Clinic address not set";

  const { data: newDoctor, error } = await supabase.from("doctor_profiles").insert({
    user_id: userId,
    medical_council_number: "PENDING",
    specialty: "General Physician",
    years_of_experience: 0,
    gender: null,
    bio: null,
    profile_photo_url: null,
    clinic_address: clinicAddress,
      handle: null,
    status: "pending",
  }).select().single();

  if (error) throw new Error(error.message);
  return newDoctor;
}
export async function updateDoctorProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await ensureDoctorProfile(supabase, user.id);
  const serviceRadius = Number(formData.get("service_radius_km")) || 10;
  if (serviceRadius <= 0 || serviceRadius > 100) {
    throw new Error("Service radius must be between 1 and 100 km.");
  }

  const maxPatients = Number(formData.get("max_patients_per_slot")) || 1;
  if (maxPatients < 1 || maxPatients > 50) {
    throw new Error("Max patients per slot must be between 1 and 50.");
  }

  const { error } = await supabase
    .from("doctor_profiles")
    .update({
      bio: formData.get("bio") as string,
      specialty: formData.get("specialty") as string,
      years_of_experience: Number(formData.get("years_of_experience")),
      clinic_address: formData.get("clinic_address") as string,
      area: formData.get("area") as string || null,
      city: formData.get("city") as string || null,
      state: formData.get("state") as string || null,
      pincode: formData.get("pincode") as string || null,
      handle: formData.get("handle") as string || null,
      service_radius_km: serviceRadius,
      clinic_fee: Number(formData.get("clinic_fee")),
      home_visit_fee: Number(formData.get("home_visit_fee")),
      video_consultation_fee: Number(formData.get("video_consultation_fee")),
      clinic_visit_available: formData.get("clinic_visit_available") === "on",
      home_visit_available: formData.get("home_visit_available") === "on",
      video_consultation_available: formData.get("video_consultation_available") === "on",
      max_patients_per_slot: maxPatients,
    })
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/doctor/profile");
}

export async function saveBankingDetails(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const doctor = await ensureDoctorProfile(supabase, user.id);

  const accountNumber = formData.get("account_number") as string;
  const { data: encrypted, error: encError } = await supabase.rpc("encrypt_banking_account", {
    p_account_number: accountNumber,
  });

  if (encError) throw new Error(encError.message);

  const { error } = await supabase.from("doctor_banking").upsert({
    doctor_id: doctor.id,
    account_holder_name: formData.get("account_holder_name") as string,
    bank_name: formData.get("bank_name") as string,
    account_number_encrypted: encrypted,
    ifsc_code: formData.get("ifsc_code") as string,
    upi_id: (formData.get("upi_id") as string) || null,
  }, { onConflict: "doctor_id" });

  if (error) throw new Error(error.message);
  revalidatePath("/doctor/profile");
}

export async function addWorkingHours(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const doctor = await ensureDoctorProfile(supabase, user.id);

  const { error } = await supabase.from("doctor_working_hours").insert({
    doctor_id: doctor.id,
    day_of_week: Number(formData.get("day_of_week")),
    start_time: formData.get("start_time") as string,
    end_time: formData.get("end_time") as string,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/doctor/availability");
}

export async function acceptCase(caseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const doctor = await ensureDoctorProfile(supabase, user.id);
  if (!doctor || doctor.status !== "approved") {
    throw new Error("You must be verified by admin before accepting cases.");
  }

  const { error } = await supabase.from("case_applications").insert({
    case_id: caseId,
    doctor_id: doctor.id,
    message: "I can help with this case. Payment required before treatment begins.",
    status: "accepted",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/doctor/cases");
}

export async function requestVerificationHelp(message: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const doctor = await ensureDoctorProfile(supabase, user.id);

  const { error } = await supabase.from("verification_help_requests").insert({
    doctor_id: doctor.id,
    message,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/doctor/profile");
}

export async function savePrescriptionAndBill(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const appointmentId = formData.get("appointment_id") as string;
  const medicines = JSON.parse(formData.get("medicines") as string || "[]");

  const doctor = await ensureDoctorProfile(supabase, user.id);

  const { data: doctorProfile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  const { data: appointment } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", appointmentId)
    .single();

  if (!appointment || appointment.payment_status !== "paid") {
    throw new Error("Treatment can only begin after patient payment is confirmed.");
  }

  const { data: patientProfile } = await supabase.from("profiles").select("full_name").eq("id", appointment.patient_id).single();

  const { data: rx, error: rxError } = await supabase.from("prescriptions").insert({
    appointment_id: appointmentId,
    doctor_id: doctor.id,
    patient_id: appointment.patient_id,
    diagnosis: formData.get("diagnosis") as string,
    medicines,
    advice: formData.get("advice") as string,
  }).select().single();

  if (rxError) throw new Error(rxError.message);

  const billNumber = `EHOSP-${Date.now()}`;
  const { error: billError } = await supabase.from("bills").insert({
    bill_number: billNumber,
    appointment_id: appointmentId,
    doctor_id: doctor.id,
    patient_id: appointment.patient_id,
    doctor_name: doctorProfile?.full_name ?? "Doctor",
    doctor_registration_number: doctor.medical_council_number,
    patient_name: patientProfile?.full_name ?? "Patient",
    consultation_type: appointment.consultation_type,
    diagnosis: formData.get("diagnosis") as string,
    line_items: medicines,
    subtotal: Number(formData.get("subtotal") || 0),
    platform_fee: Number(formData.get("platform_fee") || 0),
    total: Number(formData.get("total") || 0),
    prescription_id: rx.id,
  });

  if (billError) throw new Error(billError.message);

  await supabase.from("appointments").update({ status: "completed" }).eq("id", appointmentId);
  revalidatePath("/doctor/calendar");
  return billNumber;
}
