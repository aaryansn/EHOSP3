export const APP_NAME = "eHosp";

export const CONSULTATION_TYPES = [
  { value: "clinic", label: "Clinic Visit" },
  { value: "home", label: "Home Visit" },
  { value: "video", label: "Video Consultation" },
] as const;

export const SPECIALTIES = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Orthopedic",
  "Gynecologist",
  "Neurologist",
  "Psychiatrist",
  "ENT Specialist",
  "Ophthalmologist",
] as const;

export const RADIUS_OPTIONS = [2, 5, 10, 20] as const;

export const REPORT_REASONS = [
  { value: "fraud", label: "Fraud" },
  { value: "abuse", label: "Abuse" },
  { value: "fake_information", label: "Fake Information" },
  { value: "harassment", label: "Harassment" },
  { value: "misconduct", label: "Misconduct" },
  { value: "other", label: "Other" },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search Doctors" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/become-a-doctor", label: "Join as a Doctor" },
  { href: "/report", label: "Report User" },
] as const;
