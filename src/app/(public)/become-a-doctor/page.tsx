import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Join as a Doctor" };

export default function BecomeADoctorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
      <h1 className="text-3xl font-bold">Join eHosp as a Doctor</h1>
      <p className="mt-4 text-lg text-slate-600">
        Reach more patients with clinic visits, home visits, and video consultations.
        Submit your credentials for admin verification.
      </p>
      <ul className="mt-8 space-y-2 text-left text-slate-600">
        <li>✓ Set your own fees and availability</li>
        <li>✓ Define home visit service radius</li>
        <li>✓ Browse open medical cases</li>
        <li>✓ Secure payouts to your bank account</li>
      </ul>
      <Button size="lg" className="mt-10" asChild>
        <Link href="/register/doctor">Start Application</Link>
      </Button>
    </div>
  );
}
