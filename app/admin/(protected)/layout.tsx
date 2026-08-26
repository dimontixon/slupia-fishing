import type { ReactNode } from "react";
import Link from "next/link";

import { MobileTabBar } from "@/components/admin/mobile-tab-bar";

const NAV_ITEMS = [
  { href: "/admin", label: "Sektory" },
  { href: "/admin/rezerwacje", label: "Rezerwacje" },
  { href: "/admin/klienci", label: "Klienci" },
  { href: "/admin/ustawienia", label: "Ustawienia" },
];

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="font-semibold">Łowisko Słupia — panel administratora</span>
          <nav className="hidden gap-4 text-sm md:flex">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
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
