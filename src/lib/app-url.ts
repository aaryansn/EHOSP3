const LOCAL_DEV_URL = "http://localhost:3000";

/**
 * Canonical app URL for auth redirects (email confirm, password reset).
 * Set NEXT_PUBLIC_APP_URL in .env.local / Vercel — must match Supabase Auth → URL Configuration.
 */
export function getAppUrl(origin?: string) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const currentOrigin = origin?.replace(/\/$/, "");

  // Browser on production while env still says localhost → use real origin
  if (currentOrigin && currentOrigin !== LOCAL_DEV_URL) {
    if (!configured || configured === LOCAL_DEV_URL) {
      return currentOrigin;
    }
  }

  if (configured) return configured;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (currentOrigin) return currentOrigin;

  return LOCAL_DEV_URL;
}

export function getAuthCallbackUrl(redirectPath = "/dashboard", origin?: string) {
  const base = getAppUrl(origin);
  const path = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
  return `${base}/auth/callback?redirect=${encodeURIComponent(path)}`;
}
