import { prisma } from "@/lib/prisma";
import { SectorsTable, type AdminSector } from "@/components/admin/sectors-table";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const sectors = await prisma.sector.findMany();
  sectors.sort((a, b) => Number(a.code) - Number(b.code));

  const adminSectors: AdminSector[] = sectors.map((sector) => ({
    id: sector.id,
    code: sector.code,
    name: sector.name,
    basePrice: sector.basePrice.toString(),
    isActive: sector.isActive,
    notes: sector.notes,
    polygon: sector.polygon as { x: number; y: number }[],
  }));

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold">Sektory</h1>
      <SectorsTable sectors={adminSectors} />
    </div>
  );
}
