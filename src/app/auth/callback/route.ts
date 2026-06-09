import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const appUrl = getAppUrl(new URL(request.url).origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const path = redirect.startsWith("/") ? redirect : `/${redirect}`;
      return NextResponse.redirect(`${appUrl}${path}`);
    }
  }

  return NextResponse.redirect(`${appUrl}/login?error=auth_callback_failed`);
}
