import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const sectors = await prisma.sector.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Sektory</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kod</TableHead>
            <TableHead>Nazwa</TableHead>
            <TableHead>Cena (zł / 12h)</TableHead>
            <TableHead>Aktywny</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sectors.map((sector) => (
            <TableRow key={sector.id}>
              <TableCell>{sector.code}</TableCell>
              <TableCell>{sector.name}</TableCell>
              <TableCell>{Number(sector.basePrice).toFixed(2)}</TableCell>
              <TableCell>{sector.isActive ? "Tak" : "Nie"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
