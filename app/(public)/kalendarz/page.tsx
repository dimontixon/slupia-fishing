import { getMonthAvailability } from "@/lib/availability";
import { AvailabilityCalendar } from "@/components/availability-calendar";

export const dynamic = "force-dynamic";

export default async function AvailabilityCalendarPage(props: PageProps<"/kalendarz">) {
  const params = await props.searchParams;
  const monthParam = typeof params.month === "string" ? params.month : undefined;
  const data = await getMonthAvailability(monthParam);

  return (
    <>
      <div className="bg-accent-warm">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h1 className="font-heading text-2xl font-semibold text-accent-warm-foreground">
            Kalendarz dostępności
          </h1>
          <p className="mt-1 text-accent-warm-foreground/75">
            Sprawdź, które sektory są wolne, a które zarezerwowane w danym dniu.
          </p>
        </div>
      </div>
      <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
        <AvailabilityCalendar {...data} />
      </main>
    </>
  );
}
