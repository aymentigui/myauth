// src/app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useImportStore } from "./store/importStore";
import { DataTable } from "./comp/DataTable";
import { useEffect } from "react";

export default function Home() {
  const { data } = useImportStore();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Tableau des Données</h1>
        <Link href="testimport/import">
          <Button>Importer</Button>
        </Link>
      </div>
      <DataTable data={data} />
    </div>
  );
}
