import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader><CardTitle>Verify Your Email</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">Email verification improves account security. You can continue using the platform while waiting for verification.</p>
          <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
        </CardContent>
      </Card>
    </div>
  );
}
