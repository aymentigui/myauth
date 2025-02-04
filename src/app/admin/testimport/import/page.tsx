// src/app/import/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useImportStore } from "../store/importStore";
import { ColumnCvcImport, parseCSV } from "@/actions/util/importCVC";
import ImportCsvStructure from "@/components/myui/import-csv-structure";

const columns : ColumnCvcImport[] = [
    {
      title: "nom",
      require: { req: true, message: "Ce champ est obligatoire" },
      type: { tp: "string", message: "Ce champ doit être une chaîne de caractères" },
      condition: [],
    },
    {
      title: "age",
      require: { req: false },
      type: { tp: "number", message: "Ce champ doit être un entier" },
      condition: [
        { cond: (val: number) => Number(val) > 0, message: "L'âge doit être supérieur à 0" },
      ],
    },
    {
      title: "date",
      require: { req: false },
      type: { tp: "date", message: "Ce champ doit être une date valide" },
      condition: [
       // { cond: (val: string) => moment(val, "YYYY-MM-DD").isAfter(moment()), message: "La date doit être supérieure à aujourd'hui" },
      ],
    },
  ];


export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { setData } = useImportStore();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = () => {
    if (!file) return;
    
    parseCSV(file, setErrors, setPreviewData, columns);
  };

  const handleConfirm = () => {
    setData(previewData);
    router.push("/admin/testimport");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Importer un fichier</h1>
      <ImportCsvStructure columns={columns} />   
      <input type="file" accept=".csv" onChange={handleFileChange} className="mb-4" />
      <Button onClick={handleFileUpload} disabled={!file}>Vérifier</Button>
      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-200 text-red-700 rounded">
          <h2 className="font-bold">Erreurs détectées :</h2>
          <ul className="list-disc pl-5">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {previewData.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mt-4">Aperçu des données</h2>
          <pre className="bg-gray-200 p-4">{JSON.stringify(previewData, null, 2)}</pre>
          <Button onClick={handleConfirm} className="mt-4">Confirmer</Button>
        </div>
      )}
    </div>
  );
}
