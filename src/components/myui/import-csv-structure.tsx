import { FC } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ColumnCvcImport } from "@/actions/util/importCVC";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";


interface ImportCsvStructureProps {
  columns: ColumnCvcImport[];
}

const ImportCsvStructure: FC<ImportCsvStructureProps> = ({ columns }) => {
  return (
    <div className="space-y-6 m-2">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, index) => (
              <TableHead key={index}>{col.title}  {col.require?.req && <span style={{ color: "red", fontWeight: "bold" }}> *</span>} </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      </Table>

      {columns.some(col => col.require?.message || col.type?.message || col.condition?.length) && (
        <Card className="p-4">
          {columns.map((col, index) => (
            (col.require?.message || col.type?.message || col.condition?.length) && (
              <div key={index} className="mt-2">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{col.title}</AlertTitle>
                  <AlertDescription>
                    {col.require?.message && <li>{col.require.message}</li>}
                    {col.type?.message && <li>{col.type.message}</li>}
                    {col.condition?.map((cond, i) => <li key={i}>{cond.message}</li>)}
                  </AlertDescription>
                </Alert>
              </div>
            )
          ))}
        </Card>
      )}
    </div>
  );
};

export default ImportCsvStructure;