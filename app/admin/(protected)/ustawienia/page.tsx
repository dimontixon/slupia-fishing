import { getBookingSettingsOrDefault } from "@/lib/booking";
import { BookingSettingsForm } from "@/components/admin/booking-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getBookingSettingsOrDefault();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Ustawienia rezerwacji</h1>
      <BookingSettingsForm settings={settings} />
    </div>
  );
}
