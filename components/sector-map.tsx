"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Point = { x: number; y: number };

export type MapSector = {
  id: string;
  code: string;
  name: string;
  polygon: Point[];
  basePrice: string;
};

export function SectorMap({ sectors }: { sectors: MapSector[] }) {
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

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              Cena: {selected ? Number(selected.basePrice).toFixed(2) : ""} zł / 12h
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Rezerwacja — wkrótce.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
