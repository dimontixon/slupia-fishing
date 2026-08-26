import { Fish } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const SPECIES = [
  {
    name: "Karp",
    description: "Główny gatunek łowiska — okazy od kilku do kilkunastu kilogramów, aktywne przez cały sezon.",
  },
  {
    name: "Amur biały",
    description: "Silny i szybki bojownik, doceniany przez wędkarzy za widowiskowe branie.",
  },
  {
    name: "Tołpyga biała",
    description: "Duże, srebrzyste ryby żerujące głównie w toni wodnej.",
  },
  {
    name: "Lin",
    description: "Spotykany przy zarośniętych brzegach i w strefach o mulistym dnie.",
  },
  {
    name: "Leszcz",
    description: "Liczny gatunek, chętnie brany na zestawy gruntowe.",
  },
  {
    name: "Szczupak",
    description: "Drapieżnik czyhający przy trzcinach i podwodnych strukturach.",
  },
  {
    name: "Sum europejski",
    description: "Największy mieszkaniec łowiska — dla wędkarzy szukających mocnych wrażeń.",
  },
  {
    name: "Karaś",
    description: "Częsty gość w płytszych, spokojniejszych zatokach łowiska.",
  },
];

export default function AboutLakePage() {
  return (
    <>
      <div className="bg-accent-warm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-10">
          <Fish className="size-7 text-accent-warm-foreground" />
          <h1 className="font-heading text-2xl font-semibold text-accent-warm-foreground">O łowisku</h1>
        </div>
      </div>

      <main className="mx-auto flex max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
        <p className="max-w-3xl text-muted-foreground">
          Łowisko komercyjne &quot;Słupia&quot; to malownicze łowisko położone wśród spokojnej,
          wiejskiej okolicy — idealne miejsce zarówno na kilkugodzinną wyprawę, jak i dłuższy,
          wielodniowy pobyt. Woda jest systematycznie zarybiana, a poszczególne sektory różnią
          się głębokością i charakterem dna, dzięki czemu każdy wędkarz znajdzie miejsce
          dopasowane do swojego stylu łowienia.
        </p>

        <div className="space-y-3">
          <h2 className="font-heading text-lg font-medium">Gatunki ryb</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {SPECIES.map((fish) => (
              <Card key={fish.name} className="ring-primary/15">
                <CardHeader>
                  <CardTitle>{fish.name}</CardTitle>
                  <CardDescription>{fish.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
