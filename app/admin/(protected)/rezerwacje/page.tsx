import { prisma } from "@/lib/prisma";
import { BookingStatus, type Prisma } from "@prisma/client";
import { BookingsTable, type AdminBooking } from "@/components/admin/bookings-table";
import { BookingsFilterBar } from "@/components/admin/bookings-filter-bar";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage(props: PageProps<"/admin/rezerwacje">) {
  const params = await props.searchParams;
  const sectorId = typeof params.sectorId === "string" ? params.sectorId : undefined;
  const clientId = typeof params.clientId === "string" ? params.clientId : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const from = typeof params.from === "string" ? params.from : undefined;
  const to = typeof params.to === "string" ? params.to : undefined;

  const where: Prisma.BookingWhereInput = {
    ...(sectorId ? { sectorId } : {}),
    ...(clientId ? { clientId } : {}),
    ...(status && status in BookingStatus ? { status: status as BookingStatus } : {}),
    ...(from || to
      ? {
          startAt: {
            ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
          },
        }
      : {}),
  };

  const [bookings, sectors, clients] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { sector: true, client: true },
      orderBy: { startAt: "desc" },
    }),
    prisma.sector.findMany(),
    prisma.client.findMany({ orderBy: { phone: "asc" } }),
  ]);

  // Sector codes are strings ("1".."32"), so a DB-level string sort puts
  // "10" before "2" — sort numerically instead, same fix already used for
  // the Sektory tab (app/admin/(protected)/page.tsx).
  sectors.sort((a, b) => Number(a.code) - Number(b.code));

  const adminBookings: AdminBooking[] = bookings.map((booking) => ({
    id: booking.id,
    sectorName: booking.sector.name,
    clientPhone: booking.client.phone,
    startAt: booking.startAt.toISOString(),
    endAt: booking.endAt.toISOString(),
    slotsCount: booking.slotsCount,
    totalPrice: booking.totalPrice.toString(),
    status: booking.status,
  }));

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold">Rezerwacje</h1>
      <BookingsFilterBar
        sectors={sectors.map((sector) => ({ id: sector.id, name: sector.name }))}
        clients={clients.map((client) => ({ id: client.id, phone: client.phone, name: client.name }))}
      />
      <BookingsTable bookings={adminBookings} />
    </div>
  );
}
