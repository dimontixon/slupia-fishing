"use client";

import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SectorEditDialog } from "@/components/admin/sector-edit-dialog";

export type AdminSector = {
  id: string;
  code: string;
  name: string;
  basePrice: string;
  isActive: boolean;
  notes: string | null;
  polygon: { x: number; y: number }[];
};

export function SectorsTable({ sectors }: { sectors: AdminSector[] }) {
  const [editing, setEditing] = useState<AdminSector | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kod</TableHead>
            <TableHead>Nazwa</TableHead>
            <TableHead>Cena (zł / 12h)</TableHead>
            <TableHead>Aktywny</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sectors.map((sector) => (
            <TableRow key={sector.id}>
              <TableCell>{sector.code}</TableCell>
              <TableCell>{sector.name}</TableCell>
              <TableCell>{Number(sector.basePrice).toFixed(2)}</TableCell>
              <TableCell>{sector.isActive ? "Tak" : "Nie"}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => setEditing(sector)}>
                  Edytuj
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <SectorEditDialog sector={editing} onClose={() => setEditing(null)} />
    </>
  );
}
