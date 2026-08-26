import type { ReactNode } from "react";
import Link from "next/link";
import { Fish } from "lucide-react";

import { MobileTabBar } from "@/components/admin/mobile-tab-bar";

const NAV_ITEMS = [
  { href: "/admin", label: "Sektory" },
  { href: "/admin/kalendarz", label: "Kalendarz" },
  { href: "/admin/rezerwacje", label: "Rezerwacje" },
  { href: "/admin/klienci", label: "Klienci" },
  { href: "/admin/ustawienia", label: "Ustawienia" },
];

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-4 py-3">
          <span className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight">
            <Fish className="size-5 shrink-0 text-accent-warm" strokeWidth={2.25} />
            Panel administratora
          </span>
          <nav className="hidden gap-5 text-sm font-medium md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-primary-foreground/75 hover:text-primary-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-24 md:pb-8">{children}</main>
      <MobileTabBar />
    </div>
  );
}
