import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SectorMap, type MapSector } from "@/components/sector-map";

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
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Łowisko Komercyjne &quot;Słupia&quot;</h1>
        <p className="text-muted-foreground">
          Wybierz sektor na mapie, aby zobaczyć szczegóły i zarezerwować.
        </p>
      </div>
      <SectorMap sectors={mapSectors} isLoggedIn={isLoggedIn} />
    </main>
  );
}
