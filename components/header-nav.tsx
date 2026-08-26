"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AccountNav } from "@/components/account-nav";

const NAV_LINKS = [
  { href: "/", label: "Mapa sektorów" },
  { href: "/kalendarz", label: "Kalendarz" },
  { href: "/o-lowisku", label: "O łowisku" },
  { href: "/regulamin", label: "Regulamin" },
  { href: "/kontakt", label: "Kontakt" },
];

export function HeaderNav({ phone }: { phone: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex flex-1 items-center justify-end md:justify-between">
      <nav className="hidden gap-5 text-sm font-medium md:flex">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="text-primary-foreground/75 hover:text-primary-foreground">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-4 border-l border-primary-foreground/25 pl-6 md:flex">
        <AccountNav phone={phone} />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </Button>

      {open && (
        <div className="absolute top-full right-0 z-20 mt-2 w-64 rounded-xl border bg-popover p-4 text-foreground shadow-lg md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 border-t pt-3">
            <AccountNav phone={phone} stacked />
          </div>
        </div>
      )}
    </div>
  );
}
