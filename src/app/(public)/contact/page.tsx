export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="mt-4 text-slate-600">
        Email: support@ehosp.com<br />
        Phone: +91 1800-XXX-XXXX<br />
        Hours: Mon–Sat, 9 AM – 6 PM IST
      </p>
    </div>
  );
}
