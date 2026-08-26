"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, CalendarDays, CalendarCheck2, Users, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Sektory", icon: LayoutGrid },
  { href: "/admin/kalendarz", label: "Kalendarz", icon: CalendarDays },
  { href: "/admin/rezerwacje", label: "Rezerwacje", icon: CalendarCheck2 },
  { href: "/admin/klienci", label: "Klienci", icon: Users },
  { href: "/admin/ustawienia", label: "Ustawienia", icon: Settings },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t bg-background md:hidden">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <tab.icon className="size-5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
