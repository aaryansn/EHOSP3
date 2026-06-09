import { SearchDoctors } from "@/components/search/search-doctors";

export const metadata = { title: "Our Doctors" };

export default function PublicSearchPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Our Doctors</h1>
      <p className="mt-2 text-slate-600">
        Browse all doctor profiles without logging in. Login is only required to book an appointment.
      </p>
      <div className="mt-8">
        <SearchDoctors autoSearchAll />
      </div>
    </div>
  );
}
