import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Healthcare at Your Doorstep`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Book home doctor visits, clinic appointments, and video consultations. Find trusted doctors near you.",
  keywords: ["doctor", "telemedicine", "home visit", "clinic", "healthcare"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`light ${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
