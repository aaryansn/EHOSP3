export const metadata = { title: "How It Works" };

const steps = [
  { step: 1, title: "Search", description: "Find verified doctors by specialty, location, rating, and fee." },
  { step: 2, title: "Book", description: "Choose clinic, home visit, or video consultation at an available slot." },
  { step: 3, title: "Pay Securely", description: "Pay via Razorpay with transparent fee breakdown." },
  { step: 4, title: "Consult", description: "Visit the clinic, receive a home visit, or join a video call." },
  { step: 5, title: "Review", description: "Share feedback after your completed consultation." },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">How eHosp Works</h1>
      <ol className="mt-10 space-y-8">
        {steps.map((s) => (
          <li key={s.step} className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
              {s.step}
            </span>
            <div>
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <p className="mt-1 text-slate-600">{s.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
