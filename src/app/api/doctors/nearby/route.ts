import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  radius_km: z.number().min(1).max(100).default(10),
  pincode: z.string().nullable().optional(),
  specialty: z.string().nullable().optional(),
  consultation_type: z.enum(["clinic", "home", "video"]).nullable().optional(),
  min_rating: z.number().nullable().optional(),
  max_fee: z.number().nullable().optional(),
  limit: z.number().min(1).max(50).default(20),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const params = schema.parse(body);
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("search_nearby_doctors", {
      p_lat: params.lat ?? null,
      p_lng: params.lng ?? null,
      p_radius_km: params.radius_km,
      p_pincode: params.pincode ?? null,
      p_specialty: params.specialty ?? null,
      p_consultation_type: params.consultation_type ?? null,
      p_min_rating: params.min_rating ?? null,
      p_max_fee: params.max_fee ?? null,
      p_gender: null,
      p_min_experience: null,
      p_limit: params.limit,
      p_offset: 0,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ doctors: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
