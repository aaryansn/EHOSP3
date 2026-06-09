import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const checks: Record<string, string> = {
    app: "ok",
    supabase: "unknown",
    timestamp: new Date().toISOString(),
  };

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      checks.supabase = "missing_env";
      return NextResponse.json({ status: "degraded", checks }, { status: 503 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("cms_pages").select("slug").limit(1);

    checks.supabase = error ? `error: ${error.message}` : "ok";
    const healthy = checks.supabase === "ok";

    return NextResponse.json(
      { status: healthy ? "healthy" : "degraded", checks },
      { status: healthy ? 200 : 503 }
    );
  } catch (err) {
    checks.supabase = err instanceof Error ? err.message : "error";
    return NextResponse.json({ status: "degraded", checks }, { status: 503 });
  }
}
