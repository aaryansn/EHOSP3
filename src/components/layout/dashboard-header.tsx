import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

const LogoMark = () => (
  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
    <span className="text-lg font-black">E</span>
  </div>
);

type Props = {
  portal: string;
  name?: string;
  subtitle?: React.ReactNode;
  links: { href: string; label: string }[];
  homeHref: string;
};

export function DashboardHeader({ portal, name, subtitle, links, homeHref }: Props) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-4">
          <LogoMark />
          <div>
            <Link href={homeHref} className="text-xl font-bold text-blue-600">eHosp</Link>
            <p className="text-sm text-slate-500">{portal} · {name}</p>
            {subtitle}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap gap-4 text-sm">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-slate-600 hover:text-blue-600">
                {l.label}
              </Link>
            ))}
          </nav>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
