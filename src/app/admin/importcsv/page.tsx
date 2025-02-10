"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import ImportSheetsStructure from "@/components/myui/import-sheets-structure";
import { parseSheetFile } from "@/actions/util/importSheets";
import { useImportSheetsStore } from "@/hooks/use-import-csv";

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const { columns, setData } = useImportSheetsStore();
    const router = useRouter();
    const s = useTranslations("System");
    const e=useTranslations("Error")

    useEffect(() => {
        if(!columns || columns.length === 0 ) {
            router.back();
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!file) return;
        await parseSheetFile(file, setErrors, setPreviewData, columns);
    };

    const handleConfirm = () => {
        setData(previewData);
        router.back();
    };

    return (
        <Card className='p-4'>
            <CardTitle className="text-2xl font-bold">{s("import_data")}</CardTitle>
            <div className="container mx-auto p-6">
                <div className="m-2 border rounded-lg p-2">
                    <div>
                        <input type="file" accept=".csv,.xls,.xlsx,.ods" onChange={handleFileChange} className="mb-4" />
                        <Button onClick={handleFileUpload} disabled={!file}>{s("check")}</Button>
                        {errors.length > 0 && (
                            <div className="mt-4 p-4 bg-red-200 text-red-700 rounded">
                                <h2 className="font-bold">{e("errors")}</h2>
                                <ul className="list-disc pl-5">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    {previewData.length > 0 && (
                        <div className="">
                            <Button variant={"primary"} onClick={handleConfirm} className="">{s("confirm")}</Button>
                        </div>
                    )}
                </div>
                <ImportSheetsStructure data={previewData} columns={columns} />
            </div>
        </Card>
    );
}
