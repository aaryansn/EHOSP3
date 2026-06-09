"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveDoctor(doctorId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("doctor_profiles")
    .update({ status: "approved", approved_at: new Date().toISOString(), approved_by: user.id })
    .eq("id", doctorId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/doctors");
}

export async function rejectDoctor(doctorId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("doctor_profiles")
    .update({ status: "rejected", rejection_reason: "Application did not meet requirements" })
    .eq("id", doctorId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/doctors");
}

export async function updatePlatformSetting(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const key = formData.get("key") as string;
  const enabled = formData.get("enabled") === "true";

  const { error } = await supabase
    .from("platform_settings")
    .upsert({ key, value: { enabled } }, { onConflict: "key" });

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateCmsPage(slug: string, title: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("cms_pages")
    .update({ title, content, updated_by: user.id })
    .eq("slug", slug);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/cms");
}

export async function dismissReport(reportId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("reports").update({ status: "dismissed" }).eq("id", reportId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/reports");
}

export async function banUser(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ status: "banned" }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/patients");
}

export async function restoreUser(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ status: "active" }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/patients");
}
