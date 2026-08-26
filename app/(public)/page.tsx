import Link from "next/link";
import { Fish, ScrollText, Phone } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SectorMap, type MapSector } from "@/components/sector-map";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const TEASERS = [
  {
    href: "/o-lowisku",
    icon: Fish,
    title: "O łowisku",
    description: "Poznaj łowisko i gatunki ryb, które można u nas złowić.",
  },
  {
    href: "/regulamin",
    icon: ScrollText,
    title: "Regulamin",
    description: "Zasady wędkowania i zachowania na łowisku.",
  },
  {
    href: "/kontakt",
    icon: Phone,
    title: "Kontakt",
    description: "Dane kontaktowe i nasze social media.",
  },
];

// Sector availability changes with every booking, so this page must always
// reflect live data rather than a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [sectors, session] = await Promise.all([
    prisma.sector.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    }),
    auth(),
  ]);
  const isLoggedIn = session?.user?.role === "client";

  const mapSectors: MapSector[] = sectors.map((sector) => ({
    id: sector.id,
    code: sector.code,
    name: sector.name,
    polygon: sector.polygon as { x: number; y: number }[],
    basePrice: sector.basePrice.toString(),
  }));

  return (
    <main className="mx-auto flex max-w-5xl flex-1 flex-col gap-10 px-4 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          {mapSectors.length} sektorów · rezerwacja online
        </span>
        <h1 className="font-heading text-3xl font-semibold">Łowisko Komercyjne &quot;Słupia&quot;</h1>
        <p className="text-muted-foreground">
          Wybierz sektor na mapie, aby zobaczyć szczegóły i zarezerwować.
        </p>
      </div>
      <SectorMap sectors={mapSectors} isLoggedIn={isLoggedIn} />
      <div className="grid gap-4 sm:grid-cols-3">
        {TEASERS.map((teaser) => (
          <Link key={teaser.href} href={teaser.href}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <teaser.icon className="size-5" />
                </div>
                <CardTitle>{teaser.title}</CardTitle>
                <CardDescription>{teaser.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
