"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createOpenCase(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("open_cases").insert({
    patient_id: user.id,
    symptoms: formData.get("symptoms") as string,
    description: formData.get("description") as string,
    patient_age: Number(formData.get("patient_age")),
    patient_gender: formData.get("patient_gender") as string,
    address: formData.get("address") as string,
    preferred_consultation_type: formData.get("preferred_consultation_type") as string,
    status: "open",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/patient/cases");
  revalidatePath("/patient");
}
