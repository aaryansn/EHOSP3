import Link from "next/link";
import { Home, Video, MapPin, Search, Shield } from "lucide-react";
import { SearchDoctors } from "@/components/search/search-doctors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Home,
    title: "Home Doctor Visits",
    description: "Qualified doctors visit you at home within your chosen radius.",
  },
  {
    icon: MapPin,
    title: "Clinic Appointments",
    description: "Book in-clinic consultations at verified healthcare facilities.",
  },
  {
    icon: Video,
    title: "Video Consultations",
    description: "HD video calls with chat and secure file sharing.",
  },
  {
    icon: Search,
    title: "Doctor Discovery",
    description: "Find nearby doctors by specialty, rating, fee, and distance.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Transparent pricing with Razorpay and flexible refund policies.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-blue-50 to-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Healthcare at Your <span className="text-blue-600">Doorstep</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Book home visits, clinic appointments, and video consultations with verified doctors near you.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="#our-doctors">Browse Doctors</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/become-a-doctor">Join as a Doctor</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="our-doctors" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-600">Our Doctors</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Browse all doctors</h2>
          <p className="mt-3 text-slate-600">Every doctor profile is visible here. Login is only required to book an appointment.</p>
        </div>
        <SearchDoctors autoSearchAll hideFilters />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold">Why eHosp?</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <f.icon className="h-8 w-8 text-blue-600" />
                <CardTitle className="mt-2">{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-blue-600 px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold">Ready to get started?</h2>
          <p className="mt-4 opacity-90">Create your free account and book your first consultation today.</p>
          <Button size="lg" variant="outline" className="mt-8 border-white bg-white text-blue-600 hover:bg-blue-50" asChild>
            <Link href="/register">Register as Patient</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
