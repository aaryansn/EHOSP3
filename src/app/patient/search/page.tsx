import { SearchDoctors } from "@/components/search/search-doctors";

export const metadata = { title: "Our Doctors" };

export default function PatientSearchPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Our Doctors</h1>
      <p className="mt-2 text-slate-600">Search doctors by pincode, location, or simply browse all providers. Booking requires login.</p>
      <div className="mt-8">
        <SearchDoctors />
      </div>
    </div>
  );
}
