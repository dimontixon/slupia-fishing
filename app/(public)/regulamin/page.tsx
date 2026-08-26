import { ScrollText } from "lucide-react";

const SECTIONS = [
  {
    title: "§1 Postanowienia ogólne",
    items: [
      "Teren łowiska jest własnością prywatną — wędkowanie dozwolone jest wyłącznie po opłaceniu rezerwacji wybranego sektora.",
      "Osoby przebywające na łowisku zobowiązane są do stosowania się do niniejszego regulaminu oraz poleceń właściciela i obsługi.",
      "Dzieci do lat 16 mogą przebywać na łowisku wyłącznie pod opieką osoby dorosłej.",
    ],
  },
  {
    title: "§2 Zasady wędkowania",
    items: [
      "Dozwolone jest wędkowanie na maksymalnie dwie wędki na osobę, wyposażone w haczyki bezzadziorowe.",
      "Złowione ryby należy przetrzymywać wyłącznie w miękkich, wędkarskich workach karpiowych, a wypuszczać z powrotem do wody bezpośrednio po zważeniu i zdjęciach.",
      "Zabrania się używania żywej ryby jako przynęty oraz stosowania sieci i podrywek.",
      "Podczas wyciągania ryby obowiązkowe jest korzystanie z maty karpiowej.",
    ],
  },
  {
    title: "§3 Zachowanie na łowisku",
    items: [
      "Parkowanie pojazdów dozwolone jest wyłącznie w miejscach do tego wyznaczonych.",
      "Ognisko można rozpalać tylko w miejscach specjalnie do tego przygotowanych.",
      "Prosimy o zachowanie ciszy nocnej w godzinach 22:00–6:00 oraz o pozostawienie stanowiska w czystości.",
      "Zwierzęta mogą przebywać na terenie łowiska wyłącznie na smyczy.",
    ],
  },
  {
    title: "§4 Bezpieczeństwo",
    items: [
      "Kąpiel w łowisku jest surowo zabroniona.",
      "Dzieci przebywające w pobliżu wody powinny mieć założoną kamizelkę asekuracyjną.",
      "Wędkowanie pod wpływem alkoholu lub innych środków odurzających jest zabronione.",
    ],
  },
  {
    title: "§5 Rezerwacje i płatności",
    items: [
      "Rezerwacji sektora dokonuje się przez stronę internetową łowiska, wybierając wolny termin na mapie.",
      "Anulowanie rezerwacji jest możliwe do ustalonej liczby godzin przed terminem przyjazdu — szczegóły widoczne są przy rezerwacji w zakładce „Moje rezerwacje”.",
      "Płatność za pobyt odbywa się na miejscu, zgodnie z cennikiem danego sektora.",
    ],
  },
  {
    title: "§6 Postanowienia końcowe",
    items: [
      "Nieprzestrzeganie regulaminu może skutkować usunięciem z terenu łowiska bez zwrotu kosztów rezerwacji.",
      "Właściciel łowiska nie ponosi odpowiedzialności za pozostawione mienie oraz zdarzenia losowe niezależne od obsługi.",
      "W sprawach nieuregulowanych niniejszym regulaminem decyduje właściciel łowiska.",
    ],
  },
];

export default function RulesPage() {
  return (
    <>
      <div className="bg-accent-warm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-10">
          <ScrollText className="size-7 text-accent-warm-foreground" />
          <h1 className="font-heading text-2xl font-semibold text-accent-warm-foreground">Regulamin</h1>
        </div>
      </div>

      <main className="mx-auto flex max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-2 rounded-lg border bg-card p-4 ring-1 ring-primary/10">
              <h2 className="font-heading text-lg font-medium">{section.title}</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {section.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
