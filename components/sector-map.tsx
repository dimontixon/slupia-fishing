"use client";

import { useState } from "react";

import { BookingDialog } from "@/components/booking-dialog";

type Point = { x: number; y: number };

export type MapSector = {
  id: string;
  code: string;
  name: string;
  polygon: Point[];
  basePrice: string;
};

export function SectorMap({ sectors, isLoggedIn }: { sectors: MapSector[]; isLoggedIn: boolean }) {
  const [selected, setSelected] = useState<MapSector | null>(null);

  return (
    <>
      <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-lg border">
        <img
          src="/mapa.jpg"
          alt="Mapa satelitarna łowiska ze sektorami"
          className="block w-full"
        />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {sectors.map((sector) => (
            <polygon
              key={sector.id}
              points={sector.polygon.map((p) => `${p.x},${p.y}`).join(" ")}
              className="cursor-pointer fill-emerald-400/40 stroke-emerald-600 stroke-[0.3] transition-colors hover:fill-emerald-400/70"
              onClick={() => setSelected(sector)}
            >
              <title>{sector.name}</title>
            </polygon>
          ))}
        </svg>
      </div>

      <BookingDialog sector={selected} isLoggedIn={isLoggedIn} onClose={() => setSelected(null)} />
    </>
  );
}
