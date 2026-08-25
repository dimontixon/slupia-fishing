import { prisma } from "@/lib/prisma";
import { BookingsTable, type AdminBooking } from "@/components/admin/bookings-table";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: { sector: true, client: true },
    orderBy: { startAt: "desc" },
  });

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
      <h1 className="text-xl font-semibold">Rezerwacje</h1>
      <BookingsTable bookings={adminBookings} />
    </div>
  );
}
