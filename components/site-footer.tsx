import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

import { siteConfig } from "@/lib/site-config";

const NAV_LINKS = [
  { href: "/", label: "Mapa sektorów" },
  { href: "/kalendarz", label: "Kalendarz" },
  { href: "/o-lowisku", label: "O łowisku" },
  { href: "/regulamin", label: "Regulamin" },
  { href: "/kontakt", label: "Kontakt" },
];

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.48 17.52 2 11.94 2S1.87 6.48 1.87 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.41V9.91c0-2.38 1.42-3.7 3.6-3.7 1.04 0 2.13.19 2.13.19v2.34h-1.2c-1.18 0-1.55.73-1.55 1.48v1.78h2.64l-.42 2.91h-2.22V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div className="space-y-2">
          <p className="font-heading font-semibold">Łowisko Słupia</p>
          <nav className="flex flex-col gap-1 text-sm">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-primary-foreground/75 hover:text-primary-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-2 text-sm text-primary-foreground/75">
          <p className="flex items-center gap-2">
            <Phone className="size-4 shrink-0" /> {siteConfig.phone}
          </p>
          <p className="flex items-center gap-2">
            <Mail className="size-4 shrink-0" /> {siteConfig.email}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" /> {siteConfig.address}
          </p>
          <p className="flex items-center gap-2">
            <Clock className="size-4 shrink-0" /> {siteConfig.hours}
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-heading font-semibold">Śledź nas</p>
          <div className="flex gap-2">
            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground transition-colors hover:bg-primary-foreground/25"
            >
              <FacebookIcon className="size-4" />
            </a>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground transition-colors hover:bg-primary-foreground/25"
            >
              <InstagramIcon className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
