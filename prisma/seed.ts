import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Point = { x: number; y: number };

// Approximate positions (in % of public/mapa.jpg width/height) of each
// numbered/lettered peg, eyeballed from the satellite photo of "Łowisko
// Komercyjne SŁUPIA". These are placeholder polygons meant to make the map
// clickable out of the box — refine the exact shapes later via Prisma
// Studio or the admin panel (JSON/form editing, per CLAUDE.md).
const SECTOR_CENTERS: { code: string; center: Point }[] = [
  { code: "A", center: { x: 30, y: 13 } },
  { code: "B", center: { x: 33, y: 12 } },
  { code: "C", center: { x: 37, y: 12 } },
  { code: "D", center: { x: 40, y: 13 } },
  { code: "E", center: { x: 43, y: 15 } },
  { code: "15", center: { x: 22, y: 19 } },
  { code: "16", center: { x: 21, y: 43 } },
  { code: "17", center: { x: 22, y: 46 } },
  { code: "18", center: { x: 24, y: 49 } },
  { code: "19", center: { x: 26, y: 52 } },
  { code: "20", center: { x: 28, y: 55 } },
  { code: "21", center: { x: 30, y: 58 } },
  { code: "22", center: { x: 33, y: 61 } },
  { code: "23", center: { x: 36, y: 64 } },
  { code: "24", center: { x: 39, y: 67 } },
  { code: "25", center: { x: 42, y: 70 } },
  { code: "26", center: { x: 45, y: 73 } },
  { code: "27", center: { x: 47, y: 76 } },
  { code: "28", center: { x: 50, y: 80 } },
  { code: "29", center: { x: 52, y: 83 } },
  { code: "30", center: { x: 54, y: 86 } },
  { code: "31", center: { x: 56, y: 89 } },
  { code: "32", center: { x: 58, y: 92 } },
  { code: "1", center: { x: 71, y: 68 } },
  { code: "2", center: { x: 70, y: 65 } },
  { code: "3", center: { x: 68, y: 62 } },
  { code: "4", center: { x: 66, y: 60 } },
  { code: "5", center: { x: 63, y: 57 } },
  { code: "6", center: { x: 61, y: 54 } },
  { code: "7", center: { x: 59, y: 51 } },
  { code: "8", center: { x: 57, y: 48 } },
  { code: "9", center: { x: 55, y: 46 } },
  { code: "10", center: { x: 53, y: 43 } },
  { code: "11", center: { x: 52, y: 40 } },
  { code: "12", center: { x: 51, y: 37 } },
  { code: "13", center: { x: 52, y: 33 } },
  { code: "14", center: { x: 53, y: 30 } },
];

const HALF_SIZE = 1.6;

function squarePolygon({ x, y }: Point): Point[] {
  return [
    { x: x - HALF_SIZE, y: y - HALF_SIZE },
    { x: x + HALF_SIZE, y: y - HALF_SIZE },
    { x: x + HALF_SIZE, y: y + HALF_SIZE },
    { x: x - HALF_SIZE, y: y + HALF_SIZE },
  ];
}

const DEFAULT_BASE_PRICE = 50;

async function main() {
  await prisma.bookingSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      slotStartTimes: ["12:00", "18:00"],
      slotStepHours: 12,
      minSlots: 1,
      maxSlots: 4,
      cancellationHoursBefore: 24,
      requireManualConfirmation: true,
    },
  });

  for (const { code, center } of SECTOR_CENTERS) {
    await prisma.sector.upsert({
      where: { code },
      update: {},
      create: {
        code,
        name: `Sektor ${code}`,
        polygon: squarePolygon(center),
        basePrice: DEFAULT_BASE_PRICE,
      },
    });
  }

  console.log(`Seeded ${SECTOR_CENTERS.length} sectors and default booking settings.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
