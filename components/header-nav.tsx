"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AccountNav } from "@/components/account-nav";

const NAV_LINKS = [
  { href: "/", label: "Mapa sektorów" },
  { href: "/o-lowisku", label: "O łowisku" },
  { href: "/regulamin", label: "Regulamin" },
  { href: "/kontakt", label: "Kontakt" },
];

export function HeaderNav({ phone }: { phone: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex gap-4 text-sm">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <AccountNav phone={phone} />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </div>

      {open && (
        <div className="absolute top-full right-0 z-20 mt-2 w-64 rounded-xl border bg-popover p-4 shadow-lg md:hidden">
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
            <AccountNav phone={phone} />
          </div>
        </div>
      )}
    </div>
  );
}
