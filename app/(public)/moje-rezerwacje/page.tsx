import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getMyBookings } from "@/lib/booking";
import { MyBookingsTable } from "@/components/my-bookings-table";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "client") {
    redirect("/logowanie");
  }

  const result = await getMyBookings();

  return (
    <main className="mx-auto flex max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold">Moje rezerwacje</h1>
      {result.ok ? (
        <MyBookingsTable bookings={result.bookings} />
      ) : (
        <p className="text-sm text-destructive">{result.error}</p>
      )}
    </main>
  );
}
