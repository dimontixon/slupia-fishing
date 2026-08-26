import { getMonthAvailability } from "@/lib/availability";
import { AvailabilityCalendar } from "@/components/availability-calendar";

export const dynamic = "force-dynamic";

export default async function AdminAvailabilityCalendarPage(props: PageProps<"/admin/kalendarz">) {
  const params = await props.searchParams;
  const monthParam = typeof params.month === "string" ? params.month : undefined;
  const data = await getMonthAvailability(monthParam);

  return (
    <div className="min-w-0 space-y-4">
      <h1 className="font-heading text-xl font-semibold">Kalendarz dostępności</h1>
      <AvailabilityCalendar {...data} basePath="/admin/kalendarz" />
    </div>
  );
}
