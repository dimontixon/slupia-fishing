import { prisma } from "@/lib/prisma";
import { ClientsTable, type AdminClient } from "@/components/admin/clients-table";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const clients = await prisma.client.findMany({
    include: { _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  });

  const adminClients: AdminClient[] = clients.map((client) => ({
    id: client.id,
    phone: client.phone,
    name: client.name,
    isBlocked: client.isBlocked,
    bookingsCount: client._count.bookings,
  }));

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold">Klienci</h1>
      <ClientsTable clients={adminClients} />
    </div>
  );
}
